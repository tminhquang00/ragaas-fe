import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Badge,
    Button,
    Chip,
    Dialog,
    Notification,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toggle,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { MCPServerConfig } from '../../types';
import { FrokIcon } from '../../utils/iconAdapter';
import { PaginationControls } from '../common';
import { McpServerDialog } from './McpServerDialog';
import './McpServersPanel.css';

interface McpServersPanelProps {
    projectId: string;
    apiClient: RAGaaSClient;
    canManage: boolean;
}

const formatDate = (value?: string | null) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
};

const getSecretKeys = (server: MCPServerConfig): string[] => {
    const source = server.transport === 'stdio' ? server.env : server.headers;
    return Object.keys(source ?? {});
};

export const McpServersPanel: React.FC<McpServersPanelProps> = ({
    projectId,
    apiClient,
    canManage,
}) => {
    const [servers, setServers] = useState<MCPServerConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<MCPServerConfig | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MCPServerConfig | null>(null);
    const [actionServerName, setActionServerName] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const pageSize = 20;

    const loadServers = useCallback(async (nextPage: number = 1) => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.listMcpServers(projectId, nextPage, pageSize);
            setServers(data.servers);
            setPage(data.page);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load MCP servers');
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        loadServers(1);
    }, [loadServers]);

    const openCreateDialog = () => {
        setEditingServer(null);
        setDialogOpen(true);
    };

    const openEditDialog = (server: MCPServerConfig) => {
        setEditingServer(server);
        setDialogOpen(true);
    };

    const handleSaved = async () => {
        setSuccess('MCP server configuration saved.');
        await loadServers(1);
    };

    const handleToggle = async (server: MCPServerConfig, enabled: boolean) => {
        if (!canManage) return;
        setActionServerName(server.name);
        setError('');
        try {
            const updated = await apiClient.patchMcpServer(projectId, server.name, { enabled });
            setServers((prev) => prev.map((item) => (item.name === server.name ? updated : item)));
            setSuccess(`${server.name} ${enabled ? 'enabled' : 'disabled'}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update MCP server');
        } finally {
            setActionServerName(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionServerName(deleteTarget.name);
        setError('');
        try {
            await apiClient.deleteMcpServer(projectId, deleteTarget.name);
            setSuccess(`${deleteTarget.name} deleted.`);
            setDeleteTarget(null);
            await loadServers(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete MCP server');
        } finally {
            setActionServerName(null);
        }
    };

    if (loading) {
        return (
            <div className="mcp-loading">
                <ActivityIndicator />
                <span>Loading MCP servers...</span>
            </div>
        );
    }

    return (
        <div className="mcp-panel">
            <div className="mcp-panel__header">
                <div>
                    <div className="mcp-panel__title-row">
                        <FrokIcon name="Extension" className="mcp-panel__title-icon" />
                        <h3 className="mcp-panel__title">MCP Servers</h3>
                    </div>
                    <p className="mcp-panel__subtitle">
                        Add external tools that agent pipelines can use for this project.
                    </p>
                </div>
                <div className="mcp-panel__actions">
                    <Button mode="secondary" icon="refresh" onClick={() => loadServers(page)} disabled={Boolean(actionServerName)}>
                        Refresh
                    </Button>
                    {canManage && (
                        <Button mode="primary" icon="add" onClick={openCreateDialog}>
                            Add MCP Server
                        </Button>
                    )}
                </div>
            </div>

            {!canManage && (
                <Notification type="neutral" defaultOpen>
                    You can view MCP servers for this project, but only the project owner or a platform admin can manage them.
                </Notification>
            )}

            <Notification type="warning" defaultOpen>
                stdio MCP servers run as subprocesses on the API host. For multi-tenant deployments, prefer trusted remote http servers.
            </Notification>

            {error && (
                <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                    {error}
                </Notification>
            )}

            {success && (
                <Notification type="success" defaultOpen onCloseClick={() => setSuccess('')}>
                    {success}
                </Notification>
            )}

            <div className="mcp-table-shell">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell header>Server</TableCell>
                            <TableCell header>Transport</TableCell>
                            <TableCell header>Secrets</TableCell>
                            <TableCell header>Last updated</TableCell>
                            <TableCell header>Status</TableCell>
                            <TableCell header align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {servers.length === 0 ? (
                            <TableRow>
                                <TableCell>
                                    <div className="mcp-empty-state">
                                        <FrokIcon name="Extension" />
                                        <strong>No MCP servers configured</strong>
                                        <span>Connect GitHub, internal APIs, or trusted tool servers when this project needs agent tools.</span>
                                    </div>
                                </TableCell>
                                <TableCell />
                                <TableCell />
                                <TableCell />
                                <TableCell />
                                <TableCell />
                            </TableRow>
                        ) : (
                            servers.map((server) => {
                                const secretKeys = getSecretKeys(server);
                                const isBusy = actionServerName === server.name;
                                return (
                                    <TableRow key={server.name}>
                                        <TableCell>
                                            <div className="mcp-server-name">
                                                <strong>{server.name}</strong>
                                                {server.transport === 'stdio' && server.command && (
                                                    <span>{server.command}</span>
                                                )}
                                                {server.transport === 'http' && server.url && (
                                                    <span>{server.url}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={server.transport} />
                                        </TableCell>
                                        <TableCell>
                                            {secretKeys.length > 0 ? (
                                                <div className="mcp-secret-list">
                                                    {secretKeys.map((key) => (
                                                        <Chip label={`${key}: ***`} key={key} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="mcp-muted">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="mcp-muted">{formatDate(server.updated_at ?? server.created_at)}</span>
                                        </TableCell>
                                        <TableCell>
                                            {canManage ? (
                                                <Toggle
                                                    id={`mcp-enabled-${server.name}`}
                                                    checked={server.enabled}
                                                    disabled={isBusy}
                                                    rightLabel={server.enabled ? 'Enabled' : 'Disabled'}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggle(server, e.target.checked)}
                                                />
                                            ) : (
                                                <Badge type={server.enabled ? 'success' : undefined}>
                                                    {server.enabled ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <div className="mcp-row-actions">
                                                {isBusy && <ActivityIndicator size="small" />}
                                                {canManage ? (
                                                    <>
                                                        <Button
                                                            mode="tertiary"
                                                            icon="edit"
                                                            disabled={isBusy}
                                                            onClick={() => openEditDialog(server)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            mode="tertiary"
                                                            icon="delete"
                                                            disabled={isBusy}
                                                            onClick={() => setDeleteTarget(server)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="mcp-muted">Read only</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationControls
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={loadServers}
                disabled={loading || Boolean(actionServerName)}
                label="servers"
            />

            <McpServerDialog
                open={dialogOpen}
                projectId={projectId}
                apiClient={apiClient}
                server={editingServer}
                onOpenChange={setDialogOpen}
                onSaved={handleSaved}
            />

            <Dialog
                title="Delete MCP Server?"
                variant="warning"
                modal
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmButton={{ disabled: Boolean(actionServerName) }}
            >
                {deleteTarget && (
                    <span>
                        This will permanently remove <strong>{deleteTarget.name}</strong> from this project. The agent will no longer load tools from this MCP server.
                    </span>
                )}
            </Dialog>
        </div>
    );
};

export default McpServersPanel;
