import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    Pagination,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Storage as StorageIcon,
    Key as KeyIcon,
    Link as FkIcon,
    History as HistoryIcon,
    ExpandLess,
} from '@mui/icons-material';
import { RAGaaSClient } from '../../services/api';
import {
    DatabaseType,
    ConnectionStatus,
    DatabaseConnectionResponse,
    ConnectionTestResult,
    IntrospectResponse,
    QueryAuditEntry,
    AuditLogResponse,
} from '../../types';

const DB_TYPE_LABELS: Record<DatabaseType, string> = {
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    sqlserver: 'SQL Server',
    sqlite: 'SQLite',
};

const DB_TYPE_PLACEHOLDERS: Record<DatabaseType, string> = {
    postgresql: 'postgresql://user:pass@host:5432/dbname',
    mysql: 'mysql://user:pass@host:3306/dbname',
    sqlserver: 'mssql://user:pass@host:1433/dbname',
    sqlite: 'sqlite:///path/to/database.db',
};

const STATUS_COLORS: Record<ConnectionStatus, 'success' | 'error' | 'warning' | 'default'> = {
    connected: 'success',
    disconnected: 'default',
    error: 'error',
    pending: 'warning',
};

function maskConnectionString(cs: string): string {
    // Replace everything between :// and @ with user:***
    return cs.replace(/(:\/{2}[^:]+):([^@]+)@/, '$1:***@');
}

function timeAgo(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
    projectId: string;
    apiClient: RAGaaSClient;
    /** Called when DB conn status changes so parent can show the badge */
    onStatusChange?: (status: ConnectionStatus | null) => void;
    /** Called with display name when connected */
    onDisplayNameChange?: (name: string | null) => void;
}

export const DatabaseConnection: React.FC<Props> = ({
    projectId,
    apiClient,
    onStatusChange,
    onDisplayNameChange,
}) => {
    // ── Feature flag ──
    const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);

    // ── Existing connection ──
    const [existingConn, setExistingConn] = useState<DatabaseConnectionResponse | null>(null);

    // ── Form state ──
    const [dbType, setDbType] = useState<DatabaseType>('postgresql');
    const [displayName, setDisplayName] = useState('');
    const [connString, setConnString] = useState('');
    const [connStringMasked, setConnStringMasked] = useState(false);
    const [includeTables, setIncludeTables] = useState('');
    const [maxRows, setMaxRows] = useState(500);
    const [queryTimeout, setQueryTimeout] = useState(30);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ── Action states ──
    const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ── Schema ──
    const [schema, setSchema] = useState<IntrospectResponse | null>(null);
    const [introspecting, setIntrospecting] = useState(false);

    // ── Audit log ──
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditEntries, setAuditEntries] = useState<QueryAuditEntry[]>([]);
    const [auditTotal, setAuditTotal] = useState(0);
    const [auditPage, setAuditPage] = useState(1);
    const [auditLoading, setAuditLoading] = useState(false);
    const AUDIT_LIMIT = 10;

    // ── Load existing connection on mount ──
    const loadConnection = useCallback(async () => {
        try {
            const conn = await apiClient.getDatabaseConnection(projectId);
            setExistingConn(conn);
            setFeatureEnabled(true);
            setDbType(conn.database_type);
            setDisplayName(conn.display_name || '');
            setConnString('');
            setConnStringMasked(true);
            setIncludeTables((conn.include_tables ?? []).join(', '));
            setMaxRows(conn.max_result_rows);
            setQueryTimeout(conn.query_timeout_seconds);
            onStatusChange?.(conn.status);
            onDisplayNameChange?.(conn.display_name);
        } catch (err: any) {
            if (err?.message?.includes('403') || String(err).includes('403')) {
                setFeatureEnabled(false);
            } else {
                // 404 = no connection configured yet
                setFeatureEnabled(true);
                setExistingConn(null);
            }
        }
    }, [apiClient, projectId, onStatusChange, onDisplayNameChange]);

    useEffect(() => {
        loadConnection();
    }, [loadConnection]);

    // ── Load audit log ──
    const loadAuditLog = useCallback(async (page = 1) => {
        setAuditLoading(true);
        try {
            const res: AuditLogResponse = await apiClient.getQueryAuditLog(projectId, {
                limit: AUDIT_LIMIT,
                offset: (page - 1) * AUDIT_LIMIT,
            });
            setAuditEntries(res.entries);
            setAuditTotal(res.total);
        } catch {
            // silently fail
        } finally {
            setAuditLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        if (auditOpen) loadAuditLog(auditPage);
    }, [auditOpen, auditPage, loadAuditLog]);

    // ── Test connection ──
    const handleTest = async () => {
        if (!connString) { setFormError('Connection string is required to test.'); return; }
        setFormError('');
        setTesting(true);
        setTestResult(null);
        try {
            const result = await apiClient.testDatabaseConnection(projectId, {
                database_type: dbType,
                connection_string: connString,
            });
            setTestResult(result);
        } catch (err) {
            setTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Test failed',
                latency_ms: 0,
                tables_found: null,
            });
        } finally {
            setTesting(false);
        }
    };

    // ── Save connection ──
    const handleSave = async () => {
        if (!connString) { setFormError('Connection string is required to save.'); return; }
        setFormError('');
        setSaving(true);
        setSaveSuccess(false);
        try {
            const includeArr = includeTables
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const result = await apiClient.saveDatabaseConnection(projectId, {
                database_type: dbType,
                connection_string: connString,
                display_name: displayName || undefined,
                include_tables: includeArr.length > 0 ? includeArr : null,
                max_result_rows: maxRows,
                query_timeout_seconds: queryTimeout,
            });

            setExistingConn(result);
            // Clear connection string from state — security
            setConnString('');
            setConnStringMasked(true);
            setSaveSuccess(true);
            onStatusChange?.(result.status);
            onDisplayNameChange?.(result.display_name);

            // Trigger schema introspection display
            await handleRefreshSchema(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save connection');
        } finally {
            setSaving(false);
        }
    };

    // ── Refresh schema ──
    const handleRefreshSchema = async (showSpinner = true) => {
        if (showSpinner) setIntrospecting(true);
        try {
            const s = await apiClient.introspectSchema(projectId);
            setSchema(s);
        } catch {
            // silently fail
        } finally {
            if (showSpinner) setIntrospecting(false);
        }
    };

    // ── Delete connection ──
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await apiClient.deleteDatabaseConnection(projectId);
            setExistingConn(null);
            setSchema(null);
            setConnString('');
            setConnStringMasked(false);
            setDisplayName('');
            setTestResult(null);
            setSaveSuccess(false);
            setDeleteDialogOpen(false);
            onStatusChange?.(null);
            onDisplayNameChange?.(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to delete connection');
            setDeleteDialogOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    // ── Feature flag disabled ──
    if (featureEnabled === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (featureEnabled === false) {
        return (
            <Alert severity="info" icon={<StorageIcon />}>
                SQL Agent is not enabled on this platform. Contact your administrator.
            </Alert>
        );
    }

    const isConnected = existingConn?.status === 'connected';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* ── Status banner ── */}
            {existingConn && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StorageIcon color={existingConn.status === 'connected' ? 'success' : 'disabled'} />
                    <Typography variant="h6" fontWeight={600}>
                        {existingConn.display_name || 'Database Connection'}
                    </Typography>
                    <Chip
                        label={existingConn.status.charAt(0).toUpperCase() + existingConn.status.slice(1)}
                        color={STATUS_COLORS[existingConn.status]}
                        size="small"
                    />
                    {existingConn.table_count != null && (
                        <Typography variant="body2" color="text.secondary">
                            {existingConn.table_count} tables
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── Success notice ── */}
            {saveSuccess && (
                <Alert severity="success" onClose={() => setSaveSuccess(false)}>
                    Database connection saved successfully! The connection string has been cleared from this form for security.
                </Alert>
            )}

            {/* ── Error ── */}
            {formError && (
                <Alert severity="error" onClose={() => setFormError('')}>
                    {formError}
                </Alert>
            )}

            {/* ── Connection Form ── */}
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Connection Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Database Type */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="db-type-label">Database Type</InputLabel>
                        <Select
                            labelId="db-type-label"
                            label="Database Type"
                            value={dbType}
                            onChange={(e) => {
                                setDbType(e.target.value as DatabaseType);
                                setTestResult(null);
                            }}
                        >
                            {(Object.keys(DB_TYPE_LABELS) as DatabaseType[]).map((t) => (
                                <MenuItem key={t} value={t}>{DB_TYPE_LABELS[t]}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Display Name */}
                    <TextField
                        label="Display Name"
                        size="small"
                        fullWidth
                        placeholder="e.g. Sales Database"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />

                    {/* Connection String */}
                    <Box>
                        <TextField
                            label="Connection String"
                            size="small"
                            fullWidth
                            type="password"
                            placeholder={DB_TYPE_PLACEHOLDERS[dbType]}
                            value={connString}
                            onChange={(e) => {
                                setConnString(e.target.value);
                                setConnStringMasked(false);
                                setTestResult(null);
                            }}
                            helperText={
                                connStringMasked && existingConn
                                    ? `Current: ${maskConnectionString(
                                          existingConn.database_type + '://user:pass@host/db'
                                      )} — enter a new string to change`
                                    : 'Encrypted at rest. Never returned by the API after saving.'
                            }
                        />
                        <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                            Your connection string contains credentials. Treat it like a password.
                        </Alert>
                    </Box>

                    {/* Advanced Settings */}
                    <Box>
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => setShowAdvanced((p) => !p)}
                            endIcon={showAdvanced ? <ExpandLess /> : <ExpandMoreIcon />}
                            sx={{ mb: 1 }}
                        >
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                        </Button>
                        <Collapse in={showAdvanced}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <TextField
                                    label="Include Tables (comma-separated, blank = all)"
                                    size="small"
                                    fullWidth
                                    placeholder="orders, customers, products"
                                    value={includeTables}
                                    onChange={(e) => setIncludeTables(e.target.value)}
                                    helperText="Leave empty to allow access to all tables."
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Max Result Rows"
                                        size="small"
                                        type="number"
                                        inputProps={{ min: 1, max: 5000 }}
                                        value={maxRows}
                                        onChange={(e) => setMaxRows(Number(e.target.value))}
                                        helperText="1–5000 (default 500)"
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="Query Timeout (sec)"
                                        size="small"
                                        type="number"
                                        inputProps={{ min: 5, max: 120 }}
                                        value={queryTimeout}
                                        onChange={(e) => setQueryTimeout(Number(e.target.value))}
                                        helperText="5–120 (default 30)"
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            </Box>
                        </Collapse>
                    </Box>

                    {/* Test Result */}
                    {testResult && (
                        <Alert
                            severity={testResult.success ? 'success' : 'error'}
                            icon={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                        >
                            {testResult.message}
                            {testResult.success && (
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                    {testResult.tables_found != null && `${testResult.tables_found} tables found · `}
                                    {testResult.latency_ms}ms latency
                                </Typography>
                            )}
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleTest}
                            disabled={testing || saving}
                            startIcon={testing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                        >
                            Test Connection
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving || testing}
                            startIcon={saving ? <CircularProgress size={16} /> : undefined}
                        >
                            {existingConn ? 'Update Connection' : 'Save Connection'}
                        </Button>
                        {existingConn && (
                            <Tooltip title="Remove the database connection and all cached schema data">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    startIcon={<DeleteIcon />}
                                >
                                    Delete Connection
                                </Button>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* ── Schema Explorer ── */}
            {(schema || isConnected) && (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Schema
                                {schema && ` (${schema.table_count} table${schema.table_count !== 1 ? 's' : ''})`}
                            </Typography>
                            {schema && (
                                <Typography variant="caption" color="text.secondary">
                                    Last refreshed: {timeAgo(schema.introspected_at)}
                                </Typography>
                            )}
                        </Box>
                        <Button
                            size="small"
                            startIcon={introspecting ? <CircularProgress size={14} /> : <RefreshIcon />}
                            onClick={() => handleRefreshSchema(true)}
                            disabled={introspecting}
                        >
                            Refresh Schema
                        </Button>
                    </Box>

                    {schema ? (
                        schema.tables.map((table) => (
                            <Accordion key={table.table_name} disableGutters sx={{ '&:before': { display: 'none' }, border: 1, borderColor: 'divider', mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <StorageIcon fontSize="small" color="primary" />
                                        <Typography fontWeight={600}>{table.table_name}</Typography>
                                        <Chip size="small" label={`${table.columns.length} col${table.columns.length !== 1 ? 's' : ''}`} variant="outlined" />
                                        {table.row_count_estimate != null && (
                                            <Typography variant="caption" color="text.secondary">
                                                ~{table.row_count_estimate.toLocaleString()} rows
                                            </Typography>
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                <TableCell sx={{ fontWeight: 600 }}>Column</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Flags</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Nullable</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {table.columns.map((col) => (
                                                <TableRow key={col.name} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {col.is_primary_key && (
                                                                <Tooltip title="Primary Key">
                                                                    <KeyIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                                                </Tooltip>
                                                            )}
                                                            {col.is_foreign_key && (
                                                                <Tooltip title={`FK → ${col.foreign_key_target}`}>
                                                                    <FkIcon sx={{ fontSize: 14, color: 'info.main' }} />
                                                                </Tooltip>
                                                            )}
                                                            <Typography variant="body2" fontFamily="monospace">
                                                                {col.name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                                                            {col.data_type}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {col.is_primary_key && <Chip label="PK" size="small" color="warning" variant="outlined" sx={{ mr: 0.5 }} />}
                                                        {col.is_foreign_key && <Chip label="FK" size="small" color="info" variant="outlined" />}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color={col.nullable ? 'text.secondary' : 'text.primary'}>
                                                            {col.nullable ? 'Yes' : 'No'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleRefreshSchema(true)}
                                startIcon={introspecting ? <CircularProgress size={16} /> : <RefreshIcon />}
                                disabled={introspecting}
                            >
                                Load Schema
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            {/* ── Audit Log ── */}
            {isConnected && (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => setAuditOpen((p) => !p)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon color="action" />
                            <Typography variant="subtitle1" fontWeight={600}>
                                SQL Query History
                            </Typography>
                            {auditTotal > 0 && (
                                <Chip size="small" label={auditTotal} variant="outlined" />
                            )}
                        </Box>
                        <IconButton size="small">
                            {auditOpen ? <ExpandLess /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>

                    <Collapse in={auditOpen}>
                        <Divider sx={{ my: 2 }} />
                        {auditLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : auditEntries.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                No SQL queries have been executed yet.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {auditEntries.map((entry, i) => (
                                    <Paper
                                        key={i}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            borderLeft: 4,
                                            borderColor: entry.query_valid ? 'success.main' : 'error.main',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(entry.generated_at).toLocaleString()}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {entry.row_count != null && (
                                                    <Chip size="small" label={`${entry.row_count} rows`} color="default" variant="outlined" />
                                                )}
                                                {entry.execution_time_ms != null && (
                                                    <Chip size="small" label={`${entry.execution_time_ms}ms`} color="default" variant="outlined" />
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" gutterBottom>
                                            <em>"{entry.user_query}"</em>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontFamily="monospace"
                                            sx={{
                                                bgcolor: 'action.hover',
                                                p: 0.75,
                                                borderRadius: 1,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {entry.sql_query}
                                        </Typography>
                                        {entry.error_message && (
                                            <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                                                {entry.error_message}
                                            </Alert>
                                        )}
                                    </Paper>
                                ))}
                                {auditTotal > AUDIT_LIMIT && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                                        <Pagination
                                            count={Math.ceil(auditTotal / AUDIT_LIMIT)}
                                            page={auditPage}
                                            onChange={(_, p) => setAuditPage(p)}
                                            size="small"
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Collapse>
                </Paper>
            )}

            {/* ── Delete confirmation dialog ── */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Database Connection?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently remove the database connection and all cached schema data for this project. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DatabaseConnection;
