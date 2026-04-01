import React, { useState, useRef, useEffect } from 'react';
import {
    Notification,
    Button,
    Chip,
    ActivityIndicator,
    ProgressIndicator,
    TextField,
    Tooltip,
    Divider,
    Tile,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

import { sharePointLoginRequest, useAzureAD } from '../../config/auth';
import { RAGaaSClient } from '../../services/api';
import {
    Document,
    SharePointFileNode,
    SharePointFileStatus,
    UploadTaskStatus,
} from '../../types';
import { FileStatusMap, SharePointFileTree } from './SharePointFileTree';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SharePointBrowserProps {
    projectId: string;
    apiClient: RAGaaSClient;
    /** Existing project documents — used to extract stored hashes for check-status */
    documents: Document[];
    /** Called when an ingestion task starts — feeds the task ID into the parent's polling loop */
    onIngestionStarted: (taskId: string) => void;
    /** Called when the ingestion task completes (passed through from parent polling) */
    uploadTaskStatus: UploadTaskStatus | null;
}

// ── Derive stored hashes from already-ingested documents ──────────────────────

function extractStoredHashes(docs: Document[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const doc of docs) {
        const meta = doc.custom_metadata as Record<string, unknown> | undefined;
        if (
            meta?.source_type === 'sharepoint' &&
            typeof meta.sharepoint_file_id === 'string' &&
            typeof meta.quick_xor_hash === 'string'
        ) {
            map[meta.sharepoint_file_id] = meta.quick_xor_hash;
        }
    }
    return map;
}

function collectAllFileIds(node: SharePointFileNode): string[] {
    if (node.type === 'file') return node.id ? [node.id] : [];
    return (node.children ?? []).flatMap(collectAllFileIds);
}

// ── Default extensions ────────────────────────────────────────────────────────

const DEFAULT_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt'];

// ── Component ─────────────────────────────────────────────────────────────────

export const SharePointBrowser: React.FC<SharePointBrowserProps> = ({
    projectId,
    apiClient,
    documents,
    onIngestionStarted,
    uploadTaskStatus,
}) => {
    const { instance: msalInstance, accounts } = useMsal();

    // ── Auth state ────────────────────────────────────────────────────────────
    const [spAccessToken, setSpAccessToken] = useState<string | null>(null);
    const [spRefreshToken, setSpRefreshToken] = useState<string | null>(null);
    const [connectedAs, setConnectedAs] = useState<string | null>(null);

    // ── Form state ────────────────────────────────────────────────────────────
    const [sharePointUrl, setSharePointUrl] = useState('');
    const [folderPath, setFolderPath] = useState('');
    const [extensions, setExtensions] = useState<string[]>(DEFAULT_EXTENSIONS);
    const [newExtension, setNewExtension] = useState('');

    // ── Tree & selection state ────────────────────────────────────────────────
    const [tree, setTree] = useState<SharePointFileNode | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [statusMap, setStatusMap] = useState<FileStatusMap>({});

    // ── Loading / error state ─────────────────────────────────────────────────
    const [browsing, setBrowsing] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [ingesting, setIngesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAzureADEnabled = useAzureAD;
    const containerRef = useRef<HTMLDivElement>(null);
    const [treeHeight, setTreeHeight] = useState(420);

    // Auto-calculate tree height based on available container space
    useEffect(() => {
        if (!containerRef.current || !tree) return;

        const updateHeight = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const headerHeight = 200; // Approximate header/form height
            const padding = 48; // Container padding
            const minHeight = 150;
            const maxHeight = 600;

            const available = viewportHeight - rect.top - headerHeight - padding;
            const newHeight = Math.max(minHeight, Math.min(maxHeight, available));
            setTreeHeight(newHeight);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [tree, spAccessToken]);

    // ── MSAL helpers ──────────────────────────────────────────────────────────

    async function acquireSpToken(): Promise<string> {
        // Try silent first
        const account = accounts[0];
        if (account) {
            try {
                const result = await msalInstance.acquireTokenSilent({
                    ...sharePointLoginRequest,
                    account,
                });
                setConnectedAs(account.username);
                return result.accessToken;
            } catch (e) {
                if (!(e instanceof InteractionRequiredAuthError)) throw e;
            }
        }
        // Fall back to popup
        const result = await msalInstance.acquireTokenPopup(sharePointLoginRequest);
        setConnectedAs(result.account?.username ?? null);
        return result.accessToken;
    }

    async function handleConnect() {
        setError(null);
        try {
            const token = await acquireSpToken();
            setSpAccessToken(token);
            setSpRefreshToken(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Authentication failed');
        }
    }

    // ── Token rotation helper ─────────────────────────────────────────────────

    function rotateTokens(tokens?: { access_token?: string; refresh_token?: string }) {
        if (!tokens) return;
        if (tokens.access_token) setSpAccessToken(tokens.access_token);
        if (tokens.refresh_token) setSpRefreshToken(tokens.refresh_token);
    }

    // ── Ensure we have a valid token before each SP call ─────────────────────

    async function ensureToken(): Promise<string> {
        if (spAccessToken) return spAccessToken;
        return acquireSpToken();
    }

    // ── Browse files ──────────────────────────────────────────────────────────

    async function handleBrowse() {
        if (!sharePointUrl.trim()) {
            setError('Please enter a SharePoint URL');
            return;
        }
        setError(null);
        setBrowsing(true);
        try {
            const token = await ensureToken();
            const res = await apiClient.listSharePointFiles(
                projectId,
                {
                    sharepoint_url: sharePointUrl.trim(),
                    folder_path: folderPath.trim() || undefined,
                    deep_level: 3,
                    supported_extensions: extensions.length ? extensions : undefined,
                },
                token,
                spRefreshToken ?? undefined
            );
            rotateTokens(res.tokens);
            setTree(res.tree);
            setSelected(new Set());
            setStatusMap({});
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('401')) {
                setSpAccessToken(null);
                setError('SharePoint token expired. Please reconnect.');
            } else {
                setError(e instanceof Error ? e.message : 'Failed to browse SharePoint');
            }
        } finally {
            setBrowsing(false);
        }
    }

    // ── Check for updates ─────────────────────────────────────────────────────

    async function handleCheckUpdates() {
        if (!tree || !sharePointUrl.trim()) return;
        const storedHashes = extractStoredHashes(documents);
        if (Object.keys(storedHashes).length === 0) {
            setError('No previously ingested SharePoint files found to check.');
            return;
        }
        setError(null);
        setCheckingStatus(true);
        try {
            const token = await ensureToken();
            const allIds = collectAllFileIds(tree).filter(id => id in storedHashes);
            if (allIds.length === 0) {
                setError('None of the browsed files have been ingested before.');
                return;
            }
            const res = await apiClient.checkSharePointStatus(
                projectId,
                {
                    sharepoint_url: sharePointUrl.trim(),
                    file_ids: allIds,
                    stored_hashes: storedHashes,
                },
                token,
                spRefreshToken ?? undefined
            );
            rotateTokens(res.tokens);
            const newMap: FileStatusMap = {};
            for (const f of res.files) newMap[f.file_id] = f as SharePointFileStatus;
            setStatusMap(newMap);

            // Auto-select changed / new files
            const changed = res.files.filter(f => f.changed).map(f => f.file_id);
            if (changed.length > 0) setSelected(new Set(changed));
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('401')) {
                setSpAccessToken(null);
                setError('SharePoint token expired. Please reconnect.');
            } else {
                setError(e instanceof Error ? e.message : 'Failed to check file status');
            }
        } finally {
            setCheckingStatus(false);
        }
    }

    // ── Ingest ────────────────────────────────────────────────────────────────

    async function handleIngest() {
        if (selected.size === 0) return;
        setError(null);
        setIngesting(true);
        try {
            const token = await ensureToken();
            const res = await apiClient.ingestSharePoint(
                projectId,
                {
                    sharepoint_url: sharePointUrl.trim(),
                    file_ids: Array.from(selected),
                },
                token,
                spRefreshToken ?? undefined
            );
            rotateTokens(res.tokens);
            onIngestionStarted(res.task_id);
            setSelected(new Set());
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('401')) {
                setSpAccessToken(null);
                setError('SharePoint token expired. Please reconnect.');
            } else {
                setError(e instanceof Error ? e.message : 'Failed to start ingestion');
            }
        } finally {
            setIngesting(false);
        }
    }

    // ── Selection helpers ─────────────────────────────────────────────────────

    function handleToggle(id: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    // ── Extension chip management ─────────────────────────────────────────────

    function addExtension() {
        const ext = newExtension.trim().toLowerCase();
        if (!ext) return;
        const normalized = ext.startsWith('.') ? ext : `.${ext}`;
        if (!extensions.includes(normalized)) {
            setExtensions(prev => [...prev, normalized]);
        }
        setNewExtension('');
    }

    function removeExtension(ext: string) {
        setExtensions(prev => prev.filter(e => e !== ext));
    }

    // ── Progress display ──────────────────────────────────────────────────────

    const showProgress =
        uploadTaskStatus &&
        ['pending', 'processing'].includes(uploadTaskStatus.status);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Tile>
            {/* ── Auth banner ─────────────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'var(--app-bg-surface)',
                    borderRadius: 8,
                }}
            >
                {spAccessToken ? (
                    <>
                        <FrokIcon name="CheckCircle" style={{ color: 'var(--app-success)' }} />
                        <span style={{ flex: 1, fontSize: '0.875rem' }}>
                            Connected{connectedAs ? ` as ${connectedAs}` : ''}
                        </span>
                        <Button
                            mode="secondary"
                            onClick={() => {
                                setSpAccessToken(null);
                                setSpRefreshToken(null);
                                setConnectedAs(null);
                                setTree(null);
                                setSelected(new Set());
                                setStatusMap({});
                            }}
                        >
                            Disconnect
                        </Button>
                    </>
                ) : (
                    <>
                        <FrokIcon name="Link" />
                        <span style={{ flex: 1, color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                            {isAzureADEnabled
                                ? 'Connect to SharePoint to browse and ingest files'
                                : 'SharePoint requires Azure AD (VITE_USE_AZURE_AD=true)'}
                        </span>
                        <Tooltip
                            content={
                                !isAzureADEnabled
                                    ? 'SharePoint requires Azure AD authentication. Set VITE_USE_AZURE_AD=true to enable.'
                                    : ''
                            }
                        >
                            <span>
                                <Button
                                    mode="primary"
                                    onClick={handleConnect}
                                    disabled={!isAzureADEnabled}
                                >
                                    <FrokIcon name="Login" /> Connect to SharePoint
                                </Button>
                            </span>
                        </Tooltip>
                    </>
                )}
            </div>

            {/* ── URL / folder / extension form ───────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <FrokIcon name="Link" style={{ marginBottom: '8px' }} />
                    <div style={{ flex: '1 1 300px', minWidth: 200 }}>
                        <TextField
                            id="sp-url"
                            label="SharePoint URL"
                            placeholder="https://contoso.sharepoint.com/sites/MySite"
                            value={sharePointUrl}
                            onChange={e => setSharePointUrl(e.target.value)}
                            disabled={!spAccessToken}
                        />
                    </div>
                    <div style={{ flex: '1 1 250px', minWidth: 180 }}>
                        <TextField
                            id="sp-folder-path"
                            label="Folder Path (optional)"
                            placeholder="Documents/ProjectA"
                            value={folderPath}
                            onChange={e => setFolderPath(e.target.value)}
                            disabled={!spAccessToken}
                        />
                    </div>
                </div>

                {/* Extension chips */}
                <div>
                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
                        File type filter
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        {extensions.map(ext => (
                            <Chip
                                key={ext}
                                label={ext}
                                buttonClose
                                onClose={() => removeExtension(ext)}
                                disabled={!spAccessToken}
                            />
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div style={{ width: 80 }}>
                                <TextField
                                    id="sp-ext-filter"
                                    value={newExtension}
                                    onChange={e => setNewExtension(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addExtension()}
                                    placeholder=".md"
                                    disabled={!spAccessToken}
                                />
                            </div>
                            <Button
                                mode="integrated"
                                onClick={addExtension}
                                disabled={!spAccessToken || !newExtension.trim()}
                            >
                                <FrokIcon name="Add" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <Button
                        mode="secondary"
                        onClick={handleBrowse}
                        disabled={!spAccessToken || browsing || !sharePointUrl.trim()}
                    >
                        {browsing ? <ActivityIndicator size="small" /> : <FrokIcon name="Search" />}
                        {browsing ? ' Browsing…' : ' Browse Files'}
                    </Button>
                </div>
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <div style={{ marginBottom: '1rem' }}>
                    <Notification type="error" defaultOpen onCloseClick={() => setError(null)}>
                        {error}
                    </Notification>
                </div>
            )}

            {/* ── File tree ───────────────────────────────────────── */}
            {tree && (
                <>
                    <Divider />
                    <div style={{ marginTop: '1rem' }}>
                        <div
                            ref={containerRef}
                            style={{
                                border: '1px solid var(--app-border)',
                                maxHeight: treeHeight,
                                overflow: 'auto',
                                background: 'var(--app-bg)',
                                marginBottom: '1rem',
                            }}
                        >
                            <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-surface)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', fontWeight: 600 }}>
                                    📂 {tree.name}
                                </span>
                            </div>
                            <SharePointFileTree
                                nodes={tree.children ?? []}
                                selected={selected}
                                statusMap={statusMap}
                                onToggle={handleToggle}
                            />
                        </div>

                        {/* ── Action bar ──────────────────────────────── */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <Button
                                mode="secondary"
                                onClick={handleCheckUpdates}
                                disabled={checkingStatus || ingesting}
                            >
                                {checkingStatus ? <ActivityIndicator size="small" /> : <FrokIcon name="CloudSync" />}
                                {checkingStatus ? ' Checking…' : ' Check for Updates'}
                            </Button>

                            <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                {selected.size > 0
                                    ? `${selected.size} file${selected.size !== 1 ? 's' : ''} selected`
                                    : 'No files selected'}
                            </span>

                            <Button
                                mode="primary"
                                onClick={handleIngest}
                                disabled={selected.size === 0 || ingesting || browsing}
                            >
                                {ingesting ? <ActivityIndicator size="small" /> : <FrokIcon name="FileUpload" />}
                                {ingesting ? ' Starting…' : ` Ingest ${selected.size > 0 ? selected.size : ''} File${selected.size !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* ── Task progress (reuses parent task status) ────────── */}
            {showProgress && (
                <div
                    style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'var(--app-bg)',
                        border: '1px solid var(--app-border)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--app-primary)', fontSize: '0.875rem' }}>
                            Processing SharePoint Files
                        </span>
                        <Chip
                            label={`${uploadTaskStatus!.processed_files}/${uploadTaskStatus!.total_files} files`}
                        />
                    </div>
                    <ProgressIndicator
                        type="determinate"
                        value={
                            uploadTaskStatus!.total_files > 0
                                ? (uploadTaskStatus!.processed_files / uploadTaskStatus!.total_files) * 100
                                : 0
                        }
                    />
                </div>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'completed' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="success" defaultOpen>
                        Ingestion complete — {uploadTaskStatus.processed_files} file
                        {uploadTaskStatus.processed_files !== 1 ? 's' : ''} processed.
                    </Notification>
                </div>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'completed_with_errors' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="warning" defaultOpen>
                        Ingestion completed with errors —{' '}
                        {uploadTaskStatus.results.filter(r => r.status === 'failed').length} file(s) failed.
                    </Notification>
                </div>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'failed' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="error" defaultOpen>
                        Ingestion failed. {uploadTaskStatus.errors.join(' ')}
                    </Notification>
                </div>
            )}
        </Tile>
    );
};
