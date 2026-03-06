import React from 'react';
import {
    Box,
    Checkbox,
    Chip,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    CheckCircle as IngestedIcon,
    ChevronRight as ChevronRightIcon,
    Description as FileIcon,
    Error as DeletedIcon,
    ExpandMore as ExpandMoreIcon,
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    Warning as ModifiedIcon,
} from '@mui/icons-material';
import { SharePointFileNode, SharePointFileStatus } from '../../types';

// ── Status badge ──────────────────────────────────────────────────────────────

export type FileStatusMap = Record<string, SharePointFileStatus>;

function StatusBadge({ status }: { status: SharePointFileStatus | undefined }) {
    if (!status) return null;

    if (!status.exists) {
        return (
            <Tooltip title="File no longer exists on SharePoint">
                <Chip
                    icon={<DeletedIcon />}
                    label="Deleted"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                />
            </Tooltip>
        );
    }

    if (status.changed) {
        return (
            <Tooltip title="File has been modified on SharePoint since last ingestion">
                <Chip
                    icon={<ModifiedIcon />}
                    label="Modified"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                />
            </Tooltip>
        );
    }

    return (
        <Tooltip title="File is up-to-date with the last ingestion">
            <Chip
                icon={<IngestedIcon />}
                label="Ingested"
                size="small"
                color="success"
                variant="outlined"
                sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
            />
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
        <ListItem
            disablePadding
            sx={{ pl: depth * 3 }}
            secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
                    {node.size !== undefined && (
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
                            {formatBytes(node.size)}
                        </Typography>
                    )}
                    {node.lastModified && (
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, textAlign: 'right' }}>
                            {formatDate(node.lastModified)}
                        </Typography>
                    )}
                    <StatusBadge status={status} />
                </Box>
            }
        >
            <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                    edge="start"
                    size="small"
                    checked={selected.has(id)}
                    onChange={() => onToggle(id)}
                    disableRipple
                />
            </ListItemIcon>
            <ListItemIcon sx={{ minWidth: 32 }}>
                <FileIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>
                        {node.name}
                    </Typography>
                }
            />
        </ListItem>
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
            <ListItem disablePadding sx={{ pl: depth * 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                        edge="start"
                        size="small"
                        checked={isChecked}
                        indeterminate={isIndeterminate}
                        onChange={handleFolderCheck}
                        disableRipple
                    />
                </ListItemIcon>
                <IconButton size="small" onClick={() => setOpen(o => !o)} sx={{ mr: 0.5 }}>
                    {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
                <ListItemIcon sx={{ minWidth: 28 }}>
                    {open
                        ? <FolderOpenIcon fontSize="small" color="primary" />
                        : <FolderIcon fontSize="small" color="primary" />
                    }
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography variant="body2" fontWeight={500}>
                            {node.name}
                        </Typography>
                    }
                />
            </ListItem>

            <Collapse in={open} timeout="auto" unmountOnExit>
                {node.children && node.children.length > 0 ? (
                    <SharePointFileTree
                        nodes={node.children}
                        depth={depth + 1}
                        selected={selected}
                        statusMap={statusMap}
                        onToggle={onToggle}
                    />
                ) : (
                    <ListItem sx={{ pl: (depth + 1) * 3 + 4 }}>
                        <ListItemText
                            primary={
                                <Typography variant="caption" color="text.disabled">
                                    Empty folder
                                </Typography>
                            }
                        />
                    </ListItem>
                )}
            </Collapse>
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
    <List dense disablePadding>
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
    </List>
);
