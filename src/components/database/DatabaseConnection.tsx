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
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
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
    Info as InfoIcon,
    Lock as LockIcon,
    Cloud as CloudIcon,
} from '@mui/icons-material';
import { RAGaaSClient } from '../../services/api';
import {
    DatabaseType,
    AuthType,
    ConnectionStatus,
    DatabaseConnectionResponse,
    ConnectionTestResult,
    IntrospectResponse,
    QueryAuditEntry,
    AuditLogResponse,
} from '../../types';

// ── Constants ──────────────────────────────────────────────────────────────

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

/** Auth modes that require SQL Server */
const AZURE_AUTH_MODES: AuthType[] = ['service_principal', 'app_service_principal'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
    projectId: string;
    apiClient: RAGaaSClient;
    /** Called when DB conn status changes so parent can show the badge */
    onStatusChange?: (status: ConnectionStatus | null) => void;
    /** Called with display name when connected */
    onDisplayNameChange?: (name: string | null) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const DatabaseConnection: React.FC<Props> = ({
    projectId,
    apiClient,
    onStatusChange,
    onDisplayNameChange,
}) => {
    // ── Feature flag ──
    const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);

    // ── Platform app availability ──
    const [appSpAvailable, setAppSpAvailable] = useState<boolean | null>(null);

    // ── Existing connection ──
    const [existingConn, setExistingConn] = useState<DatabaseConnectionResponse | null>(null);

    // ── Form: common fields ──
    const [dbType, setDbType] = useState<DatabaseType>('postgresql');
    const [authType, setAuthType] = useState<AuthType>('connection_string');
    const [displayName, setDisplayName] = useState('');

    // ── Form: connection_string fields ──
    const [connString, setConnString] = useState('');
    const [connStringMasked, setConnStringMasked] = useState(false);

    // ── Form: service_principal / app_service_principal fields ──
    const [azureServer, setAzureServer] = useState('');
    const [azureDatabase, setAzureDatabase] = useState('');
    const [azureTenantId, setAzureTenantId] = useState('');
    const [azureClientId, setAzureClientId] = useState('');
    const [azureClientSecret, setAzureClientSecret] = useState('');
    const [clientSecretMasked, setClientSecretMasked] = useState(false);

    // ── Form: advanced settings ──
    const [includeTables, setIncludeTables] = useState('');
    const [excludeTables, setExcludeTables] = useState('');
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

    // ── Populate form from existing connection ──
    const populateFormFromConn = useCallback((conn: DatabaseConnectionResponse) => {
        setDbType(conn.database_type);
        setAuthType(conn.auth_type ?? 'connection_string');
        setDisplayName(conn.display_name || '');
        setIncludeTables((conn.include_tables ?? []).join(', '));
        setExcludeTables((conn.exclude_tables ?? []).join(', '));
        setMaxRows(conn.max_result_rows);
        setQueryTimeout(conn.query_timeout_seconds);

        // Secrets are never returned — just mark as masked
        setConnString('');
        setConnStringMasked(conn.auth_type === 'connection_string' || !conn.auth_type);
        setAzureClientSecret('');
        setClientSecretMasked(conn.auth_type === 'service_principal');

        // Non-secret Azure fields are safe to restore
        // (backend currently doesn't return them, so leave blank — server known from display_name)
        setAzureServer('');
        setAzureDatabase('');
        setAzureTenantId('');
        setAzureClientId('');
    }, []);

    // ── Load existing connection on mount ──
    const loadConnection = useCallback(async () => {
        try {
            const conn = await apiClient.getDatabaseConnection(projectId);
            setExistingConn(conn);
            setFeatureEnabled(true);
            populateFormFromConn(conn);
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
    }, [apiClient, projectId, onStatusChange, onDisplayNameChange, populateFormFromConn]);

    useEffect(() => {
        loadConnection();
    }, [loadConnection]);

    // ── Probe platform app availability (after feature flag resolves) ──
    useEffect(() => {
        if (featureEnabled !== true) return;
        apiClient.checkAppServicePrincipalAvailable(projectId).then(setAppSpAvailable);
    }, [featureEnabled, apiClient, projectId]);

    // ── When DB type changes away from SQL Server, reset Azure auth modes ──
    const handleDbTypeChange = (newType: DatabaseType) => {
        setDbType(newType);
        setTestResult(null);
        if (newType !== 'sqlserver' && AZURE_AUTH_MODES.includes(authType)) {
            setAuthType('connection_string');
        }
    };

    // ── When auth type changes ──
    const handleAuthTypeChange = (newAuth: AuthType) => {
        setAuthType(newAuth);
        setTestResult(null);
        setFormError('');
        // SQL Server is required for Azure modes — auto-lock
        if (AZURE_AUTH_MODES.includes(newAuth)) {
            setDbType('sqlserver');
        }
    };

    // ── Build test payload based on auth mode ──
    const buildTestPayload = () => {
        if (authType === 'connection_string') {
            return { database_type: dbType, auth_type: authType, connection_string: connString };
        }
        if (authType === 'service_principal') {
            return {
                database_type: dbType,
                auth_type: authType,
                azure_server: azureServer,
                azure_database: azureDatabase,
                azure_tenant_id: azureTenantId,
                azure_client_id: azureClientId,
                azure_client_secret: azureClientSecret,
            };
        }
        // app_service_principal
        return {
            database_type: dbType,
            auth_type: authType,
            azure_server: azureServer,
            azure_database: azureDatabase,
        };
    };

    // ── Validate form before test / save ──
    const validateForm = (): string => {
        if (authType === 'connection_string') {
            if (!connString && !connStringMasked) return 'Connection string is required.';
        } else if (authType === 'service_principal') {
            if (!azureServer) return 'Azure server is required.';
            if (!azureDatabase) return 'Azure database is required.';
            if (!azureTenantId) return 'Tenant ID is required.';
            if (!azureClientId) return 'Client ID is required.';
            if (!azureClientSecret && !clientSecretMasked) return 'Client secret is required.';
        } else {
            if (!azureServer) return 'Azure server is required.';
            if (!azureDatabase) return 'Azure database is required.';
        }
        return '';
    };

    // ── Test connection ──
    const handleTest = async () => {
        const err = validateForm();
        if (err && !(authType === 'connection_string' && connStringMasked && existingConn)) {
            setFormError(err);
            return;
        }
        setFormError('');
        setTesting(true);
        setTestResult(null);
        try {
            const result = await apiClient.testDatabaseConnection(projectId, buildTestPayload());
            setTestResult(result);
        } catch (e) {
            setTestResult({
                success: false,
                message: e instanceof Error ? e.message : 'Test failed',
                latency_ms: 0,
                tables_found: null,
            });
        } finally {
            setTesting(false);
        }
    };

    // ── Save connection ──
    const handleSave = async () => {
        const err = validateForm();
        if (err && !(authType === 'connection_string' && connStringMasked && existingConn)) {
            setFormError(err);
            return;
        }
        setFormError('');
        setSaving(true);
        setSaveSuccess(false);
        try {
            const includeArr = includeTables.split(',').map((t) => t.trim()).filter(Boolean);
            const excludeArr = excludeTables.split(',').map((t) => t.trim()).filter(Boolean);

            const basePayload = {
                database_type: dbType,
                auth_type: authType,
                display_name: displayName || undefined,
                include_tables: includeArr.length > 0 ? includeArr : null,
                exclude_tables: excludeArr.length > 0 ? excludeArr : null,
                max_result_rows: maxRows,
                query_timeout_seconds: queryTimeout,
            };

            let payload: Record<string, unknown> = { ...basePayload };
            if (authType === 'connection_string') {
                if (connString) payload.connection_string = connString;
            } else if (authType === 'service_principal') {
                payload.azure_server = azureServer;
                payload.azure_database = azureDatabase;
                payload.azure_tenant_id = azureTenantId;
                payload.azure_client_id = azureClientId;
                if (azureClientSecret) payload.azure_client_secret = azureClientSecret;
            } else {
                payload.azure_server = azureServer;
                payload.azure_database = azureDatabase;
            }

            const result = await apiClient.saveDatabaseConnection(projectId, payload as any);
            setExistingConn(result);

            // Security: clear secrets from state
            setConnString('');
            setConnStringMasked(authType === 'connection_string');
            setAzureClientSecret('');
            setClientSecretMasked(authType === 'service_principal');

            setSaveSuccess(true);
            onStatusChange?.(result.status);
            onDisplayNameChange?.(result.display_name);

            // Trigger schema introspection display
            await handleRefreshSchema(false);
        } catch (e) {
            setFormError(e instanceof Error ? e.message : 'Failed to save connection');
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
            setAzureClientSecret('');
            setClientSecretMasked(false);
            setDisplayName('');
            setTestResult(null);
            setSaveSuccess(false);
            setDeleteDialogOpen(false);
            onStatusChange?.(null);
            onDisplayNameChange?.(null);
        } catch (e) {
            setFormError(e instanceof Error ? e.message : 'Failed to delete connection');
            setDeleteDialogOpen(false);
        } finally {
            setDeleting(false);
        }
    };

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

    // ── Loading / feature-disabled states ──
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
    const isAzureMode = AZURE_AUTH_MODES.includes(authType);
    const isSqlServer = dbType === 'sqlserver';

    // ── Render ────────────────────────────────────────────────────────────────
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
                    {existingConn.auth_type === 'app_service_principal' && (
                        <Chip
                            icon={<CloudIcon />}
                            label="Platform App"
                            color="info"
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
            )}

            {/* ── Success notice ── */}
            {saveSuccess && (
                <Alert severity="success" onClose={() => setSaveSuccess(false)}>
                    Database connection saved successfully!
                    {authType === 'connection_string' && ' The connection string has been cleared from this form for security.'}
                    {authType === 'service_principal' && ' The client secret has been cleared from this form for security.'}
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
                            disabled={isAzureMode}
                            onChange={(e) => handleDbTypeChange(e.target.value as DatabaseType)}
                        >
                            {(Object.keys(DB_TYPE_LABELS) as DatabaseType[]).map((t) => (
                                <MenuItem key={t} value={t}>{DB_TYPE_LABELS[t]}</MenuItem>
                            ))}
                        </Select>
                        {isAzureMode && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
                                Locked to SQL Server for Azure authentication modes.
                            </Typography>
                        )}
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

                    {/* ── Authentication Mode ── */}
                    <Box>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                                Authentication Mode
                            </FormLabel>
                            <RadioGroup
                                value={authType}
                                onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
                            >
                                {/* Connection String — always available */}
                                <FormControlLabel
                                    value="connection_string"
                                    control={<Radio size="small" />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LockIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="body2">Connection String</Typography>
                                        </Box>
                                    }
                                />

                                {/* Service Principal — SQL Server only */}
                                {(isSqlServer || authType === 'service_principal') && (
                                    <FormControlLabel
                                        value="service_principal"
                                        control={<Radio size="small" />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <KeyIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">My Azure App (Service Principal)</Typography>
                                                <Chip label="SQL Server" size="small" variant="outlined" sx={{ ml: 0.5 }} />
                                            </Box>
                                        }
                                    />
                                )}

                                {/* Platform App — SQL Server only, availability-gated */}
                                {(isSqlServer || authType === 'app_service_principal') && (
                                    <Tooltip
                                        title={
                                            appSpAvailable === false
                                                ? 'Not available on this platform — contact your administrator.'
                                                : appSpAvailable === null
                                                ? 'Checking platform configuration…'
                                                : ''
                                        }
                                        disableHoverListener={appSpAvailable === true}
                                    >
                                        <span>
                                            <FormControlLabel
                                                value="app_service_principal"
                                                control={<Radio size="small" />}
                                                disabled={appSpAvailable !== true}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CloudIcon sx={{ fontSize: 16, color: appSpAvailable === true ? 'info.main' : 'inherit' }} />
                                                        <Typography variant="body2">
                                                            Platform App
                                                        </Typography>
                                                        <Chip
                                                            label={
                                                                appSpAvailable === null ? 'Checking…' :
                                                                appSpAvailable === false ? 'Unavailable' :
                                                                'Zero Credentials'
                                                            }
                                                            color={appSpAvailable === true ? 'success' : 'default'}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ ml: 0.5 }}
                                                        />
                                                        <Chip label="SQL Server" size="small" variant="outlined" sx={{ ml: 0.5 }} />
                                                    </Box>
                                                }
                                            />
                                        </span>
                                    </Tooltip>
                                )}
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* ── Platform App banner ── */}
                    {authType === 'app_service_principal' && appSpAvailable === true && (
                        <Alert severity="info" icon={<InfoIcon />}>
                            This platform's app registration will be used — no credentials required from
                            you. Just provide the server and database name.
                        </Alert>
                    )}

                    {/* ── connection_string fields ── */}
                    {authType === 'connection_string' && (
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
                                        ? 'A connection string is already saved. Enter a new one to replace it.'
                                        : 'Encrypted at rest. Never returned by the API after saving.'
                                }
                            />
                            <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                                Your connection string contains credentials. Treat it like a password.
                            </Alert>
                        </Box>
                    )}

                    {/* ── Azure Server + Database (shared between SP and App SP) ── */}
                    {isAzureMode && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Azure Server"
                                size="small"
                                fullWidth
                                placeholder="myserver.database.windows.net"
                                value={azureServer}
                                onChange={(e) => { setAzureServer(e.target.value); setTestResult(null); }}
                                helperText="e.g. myserver.database.windows.net"
                            />
                            <TextField
                                label="Azure Database"
                                size="small"
                                fullWidth
                                placeholder="MyDatabaseName"
                                value={azureDatabase}
                                onChange={(e) => { setAzureDatabase(e.target.value); setTestResult(null); }}
                            />
                        </Box>
                    )}

                    {/* ── service_principal-only fields ── */}
                    {authType === 'service_principal' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Divider>
                                <Typography variant="caption" color="text.secondary">Your Azure AD App Credentials</Typography>
                            </Divider>
                            <TextField
                                label="Tenant ID"
                                size="small"
                                fullWidth
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                value={azureTenantId}
                                onChange={(e) => { setAzureTenantId(e.target.value); setTestResult(null); }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Client ID (Application ID)"
                                    size="small"
                                    fullWidth
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    value={azureClientId}
                                    onChange={(e) => { setAzureClientId(e.target.value); setTestResult(null); }}
                                />
                                <TextField
                                    label="Client Secret"
                                    size="small"
                                    fullWidth
                                    type="password"
                                    placeholder={clientSecretMasked && existingConn ? '••••••••• (saved)' : 'your-client-secret'}
                                    value={azureClientSecret}
                                    onChange={(e) => {
                                        setAzureClientSecret(e.target.value);
                                        setClientSecretMasked(false);
                                        setTestResult(null);
                                    }}
                                    helperText={
                                        clientSecretMasked && existingConn
                                            ? 'A secret is saved. Enter a new one to rotate it.'
                                            : 'Encrypted at rest. Never returned by the API.'
                                    }
                                />
                            </Box>
                        </Box>
                    )}

                    {/* ── Advanced Settings ── */}
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
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Include Tables (comma-separated)"
                                        size="small"
                                        fullWidth
                                        placeholder="orders, customers, products"
                                        value={includeTables}
                                        onChange={(e) => setIncludeTables(e.target.value)}
                                        helperText="Allowlist — leave empty to allow all tables."
                                    />
                                    <TextField
                                        label="Exclude Tables (comma-separated)"
                                        size="small"
                                        fullWidth
                                        placeholder="logs, audit_trail"
                                        value={excludeTables}
                                        onChange={(e) => setExcludeTables(e.target.value)}
                                        helperText="Blocklist — tables to hide from the agent."
                                    />
                                </Box>
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
