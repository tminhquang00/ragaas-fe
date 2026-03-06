import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    LinearProgress,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    CheckCircle as ConnectedIcon,
    Close as CloseIcon,
    CloudSync as CheckUpdatesIcon,
    FileUpload as IngestIcon,
    Link as LinkIcon,
    Login as ConnectIcon,
    Search as BrowseIcon,
} from '@mui/icons-material';
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
        <Box>
            {/* ── Auth banner ─────────────────────────────────────── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 0,
                }}
            >
                {spAccessToken ? (
                    <>
                        <ConnectedIcon color="success" />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            Connected{connectedAs ? ` as ${connectedAs}` : ''}
                        </Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
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
                        <LinkIcon color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            {isAzureADEnabled
                                ? 'Connect to SharePoint to browse and ingest files'
                                : 'SharePoint requires Azure AD (VITE_USE_AZURE_AD=true)'}
                        </Typography>
                        <Tooltip
                            title={
                                !isAzureADEnabled
                                    ? 'SharePoint requires Azure AD authentication. Set VITE_USE_AZURE_AD=true to enable.'
                                    : ''
                            }
                        >
                            <span>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<ConnectIcon />}
                                    onClick={handleConnect}
                                    disabled={!isAzureADEnabled}
                                >
                                    Connect to SharePoint
                                </Button>
                            </span>
                        </Tooltip>
                    </>
                )}
            </Box>

            {/* ── URL / folder / extension form ───────────────────── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                    label="SharePoint URL"
                    placeholder="https://contoso.sharepoint.com/sites/MySite"
                    value={sharePointUrl}
                    onChange={e => setSharePointUrl(e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!spAccessToken}
                    InputProps={{ startAdornment: <LinkIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                />
                <TextField
                    label="Folder Path (optional)"
                    placeholder="Documents/ProjectA"
                    value={folderPath}
                    onChange={e => setFolderPath(e.target.value)}
                    size="small"
                    fullWidth
                    disabled={!spAccessToken}
                    helperText="Leave empty to start from the root of Shared Documents"
                />

                {/* Extension chips */}
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        File type filter
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {extensions.map(ext => (
                            <Chip
                                key={ext}
                                label={ext}
                                size="small"
                                onDelete={() => removeExtension(ext)}
                                disabled={!spAccessToken}
                            />
                        ))}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TextField
                                value={newExtension}
                                onChange={e => setNewExtension(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addExtension()}
                                placeholder=".md"
                                size="small"
                                sx={{ width: 80 }}
                                disabled={!spAccessToken}
                            />
                            <IconButton
                                size="small"
                                onClick={addExtension}
                                disabled={!spAccessToken || !newExtension.trim()}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={browsing ? <CircularProgress size={16} /> : <BrowseIcon />}
                    onClick={handleBrowse}
                    disabled={!spAccessToken || browsing || !sharePointUrl.trim()}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    {browsing ? 'Browsing…' : 'Browse Files'}
                </Button>
            </Box>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* ── File tree ───────────────────────────────────────── */}
            {tree && (
                <>
                    <Divider sx={{ mb: 2 }} />

                    <Box
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 0,
                            maxHeight: 420,
                            overflow: 'auto',
                            bgcolor: 'background.paper',
                            mb: 2,
                        }}
                    >
                        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                📂 {tree.name}
                            </Typography>
                        </Box>
                        <SharePointFileTree
                            nodes={tree.children ?? []}
                            selected={selected}
                            statusMap={statusMap}
                            onToggle={handleToggle}
                        />
                    </Box>

                    {/* ── Action bar ──────────────────────────────── */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={checkingStatus ? <CircularProgress size={14} /> : <CheckUpdatesIcon />}
                            onClick={handleCheckUpdates}
                            disabled={checkingStatus || ingesting}
                        >
                            {checkingStatus ? 'Checking…' : 'Check for Updates'}
                        </Button>

                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                            {selected.size > 0
                                ? `${selected.size} file${selected.size !== 1 ? 's' : ''} selected`
                                : 'No files selected'}
                        </Typography>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={ingesting ? <CircularProgress size={14} color="inherit" /> : <IngestIcon />}
                            onClick={handleIngest}
                            disabled={selected.size === 0 || ingesting || browsing}
                        >
                            {ingesting ? 'Starting…' : `Ingest ${selected.size > 0 ? selected.size : ''} File${selected.size !== 1 ? 's' : ''}`}
                        </Button>
                    </Box>
                </>
            )}

            {/* ── Task progress (reuses parent task status) ────────── */}
            {showProgress && (
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="primary">
                            Processing SharePoint Files
                        </Typography>
                        <Chip
                            size="small"
                            label={`${uploadTaskStatus!.processed_files}/${uploadTaskStatus!.total_files} files`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={
                            uploadTaskStatus!.total_files > 0
                                ? (uploadTaskStatus!.processed_files / uploadTaskStatus!.total_files) * 100
                                : 0
                        }
                        sx={{ height: 8, borderRadius: 0 }}
                    />
                </Box>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'completed' && (
                <Alert
                    severity="success"
                    sx={{ mt: 2 }}
                    action={
                        <IconButton size="small" onClick={() => { /* parent clears it */ }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    Ingestion complete — {uploadTaskStatus.processed_files} file
                    {uploadTaskStatus.processed_files !== 1 ? 's' : ''} processed.
                </Alert>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'completed_with_errors' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Ingestion completed with errors —{' '}
                    {uploadTaskStatus.results.filter(r => r.status === 'failed').length} file(s) failed.
                </Alert>
            )}

            {uploadTaskStatus && uploadTaskStatus.status === 'failed' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Ingestion failed. {uploadTaskStatus.errors.join(' ')}
                </Alert>
            )}
        </Box>
    );
};
