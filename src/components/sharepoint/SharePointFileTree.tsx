import React from 'react';
import {
    Checkbox,
    Chip,
    Tooltip,
    Button,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { SharePointFileNode, SharePointFileStatus } from '../../types';

// ── Status badge ──────────────────────────────────────────────────────────────

export type FileStatusMap = Record<string, SharePointFileStatus>;

function StatusBadge({ status }: { status: SharePointFileStatus | undefined }) {
    if (!status) return null;

    if (!status.exists) {
        return (
            <Tooltip content="File no longer exists on SharePoint">
                <Chip label="Deleted" />
            </Tooltip>
        );
    }

    if (status.changed) {
        return (
            <Tooltip content="File has been modified on SharePoint since last ingestion">
                <Chip label="Modified" />
            </Tooltip>
        );
    }

    return (
        <Tooltip content="File is up-to-date with the last ingestion">
            <Chip label="Ingested" />
        </Tooltip>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// ── File node row ─────────────────────────────────────────────────────────────

interface FileRowProps {
    node: SharePointFileNode;
    depth: number;
    selected: Set<string>;
    statusMap: FileStatusMap;
    onToggle: (id: string) => void;
}

const FileRow: React.FC<FileRowProps> = ({ node, depth, selected, statusMap, onToggle }) => {
    const id = node.id!;
    const status = statusMap[id];

    return (
        <li
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                paddingLeft: `${depth * 1.5 + 0.5}rem`,
                gap: '0.5rem',
            }}
        >
            <Checkbox
                id={`checkbox-file-${id}`}
                checked={selected.has(id)}
                onChange={() => onToggle(id)}
            />
            <FrokIcon name="Description" />
            <span style={{ flex: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                {node.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '0.5rem' }}>
                {node.size !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', minWidth: 60, textAlign: 'right' }}>
                        {formatBytes(node.size)}
                    </span>
                )}
                {node.lastModified && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', minWidth: 90, textAlign: 'right' }}>
                        {formatDate(node.lastModified)}
                    </span>
                )}
                <StatusBadge status={status} />
            </div>
        </li>
    );
};

// ── Folder node row ───────────────────────────────────────────────────────────

interface FolderRowProps {
    node: SharePointFileNode;
    depth: number;
    selected: Set<string>;
    statusMap: FileStatusMap;
    onToggle: (id: string) => void;
}

const FolderRow: React.FC<FolderRowProps> = ({ node, depth, selected, statusMap, onToggle }) => {
    const [open, setOpen] = React.useState(true);

    // Count files in this subtree for indeterminate / checked state
    const allFileIds = collectFileIds(node);
    const selectedCount = allFileIds.filter(id => selected.has(id)).length;
    const isChecked = allFileIds.length > 0 && selectedCount === allFileIds.length;
    const isIndeterminate = selectedCount > 0 && !isChecked;

    const handleFolderCheck = () => {
        if (isChecked) {
            allFileIds.forEach(id => selected.has(id) && onToggle(id));
        } else {
            allFileIds.forEach(id => !selected.has(id) && onToggle(id));
        }
    };

    return (
        <>
            <li
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.5rem',
                    paddingLeft: `${depth * 1.5 + 0.5}rem`,
                    gap: '0.25rem',
                }}
            >
                <Checkbox
                    id={`checkbox-folder-${node.name}-${depth}`}
                    checked={isChecked}
                    indeterminate={isIndeterminate}
                    onChange={handleFolderCheck}
                />
                <Button mode="integrated" onClick={() => setOpen(o => !o)} style={{ padding: '0.125rem' }}>
                    {open ? <FrokIcon name="ExpandMore" /> : <FrokIcon name="ChevronRight" />}
                </Button>
                <span style={{ display: 'flex', alignItems: 'center', minWidth: 24 }}>
                    {open ? <FrokIcon name="Folder" /> : <FrokIcon name="Folder" />}
                </span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {node.name}
                </span>
            </li>

            <div style={{ maxHeight: open ? '9999px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                {node.children && node.children.length > 0 ? (
                    <SharePointFileTree
                        nodes={node.children}
                        depth={depth + 1}
                        selected={selected}
                        statusMap={statusMap}
                        onToggle={onToggle}
                    />
                ) : (
                    <li style={{ paddingLeft: `${(depth + 1) * 1.5 + 4}rem`, listStyle: 'none' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                            Empty folder
                        </span>
                    </li>
                )}
            </div>
        </>
    );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function collectFileIds(node: SharePointFileNode): string[] {
    if (node.type === 'file') return node.id ? [node.id] : [];
    return (node.children ?? []).flatMap(collectFileIds);
}

// ── Tree component (public) ───────────────────────────────────────────────────

export interface SharePointFileTreeProps {
    /** Top-level nodes (children of the root folder returned by list-files) */
    nodes: SharePointFileNode[];
    depth?: number;
    selected: Set<string>;
    /** Map of file_id → status returned by check-status */
    statusMap: FileStatusMap;
    onToggle: (fileId: string) => void;
}

export const SharePointFileTree: React.FC<SharePointFileTreeProps> = ({
    nodes,
    depth = 0,
    selected,
    statusMap,
    onToggle,
}) => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {nodes.map((node, idx) =>
            node.type === 'folder' ? (
                <FolderRow
                    key={`${node.name}-${idx}`}
                    node={node}
                    depth={depth}
                    selected={selected}
                    statusMap={statusMap}
                    onToggle={onToggle}
                />
            ) : (
                node.id && (
                    <FileRow
                        key={node.id}
                        node={node}
                        depth={depth}
                        selected={selected}
                        statusMap={statusMap}
                        onToggle={onToggle}
                    />
                )
            )
        )}
    </ul>
);
