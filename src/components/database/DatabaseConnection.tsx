import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField,
    Dropdown,
    Button,
    Chip,
    Notification,
    Accordion,
    Divider,
    Tooltip,
    Dialog,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    ActivityIndicator,
    RadioButton,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
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
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <ActivityIndicator />
            </div>
        );
    }

    if (featureEnabled === false) {
        return (
            <Notification type="neutral" defaultOpen>
                <FrokIcon name="Storage" /> SQL Agent is not enabled on this platform. Contact your administrator.
            </Notification>
        );
    }

    const isConnected = existingConn?.status === 'connected';
    const isAzureMode = AZURE_AUTH_MODES.includes(authType);
    const isSqlServer = dbType === 'sqlserver';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Status banner ── */}
            {existingConn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FrokIcon name="Storage" />
                    <h3 style={{ fontWeight: 600, margin: 0 }}>
                        {existingConn.display_name || 'Database Connection'}
                    </h3>
                    <Chip
                        label={existingConn.status.charAt(0).toUpperCase() + existingConn.status.slice(1)}
                    />
                    {existingConn.table_count != null && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                            {existingConn.table_count} tables
                        </span>
                    )}
                    {existingConn.auth_type === 'app_service_principal' && (
                        <Chip label="Platform App" />
                    )}
                </div>
            )}

            {/* ── Success notice ── */}
            {saveSuccess && (
                <Notification type="success" defaultOpen onCloseClick={() => setSaveSuccess(false)}>
                    Database connection saved successfully!
                    {authType === 'connection_string' && ' The connection string has been cleared from this form for security.'}
                    {authType === 'service_principal' && ' The client secret has been cleared from this form for security.'}
                </Notification>
            )}

            {/* ── Error ── */}
            {formError && (
                <Notification type="error" defaultOpen onCloseClick={() => setFormError('')}>
                    {formError}
                </Notification>
            )}

            {/* ── Connection Form ── */}
            <div style={{ border: '1px solid var(--app-border)', padding: '1.5rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>
                    Connection Details
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Database Type */}
                    <Dropdown
                        label="Database Type"
                        value={dbType}
                        disabled={isAzureMode}
                        onChange={(e) => handleDbTypeChange(e.target.value as DatabaseType)}
                        options={(Object.keys(DB_TYPE_LABELS) as DatabaseType[]).map((t) => ({
                            name: DB_TYPE_LABELS[t],
                            value: t,
                        }))}
                    />
                    {isAzureMode && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', marginTop: '-0.75rem' }}>
                            Locked to SQL Server for Azure authentication modes.
                        </span>
                    )}

                    {/* Display Name */}
                    <TextField
                        id="db-display-name"
                        label="Display Name"
                        placeholder="e.g. Sales Database"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />

                    {/* ── Authentication Mode ── */}
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                            Authentication Mode
                        </p>
                        <div
                            role="radiogroup"
                            aria-label="Authentication Mode"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            {/* Connection String — always available */}
                            <RadioButton
                                name="authType"
                                id="auth-connection-string"
                                value="connection_string"
                                checked={authType === 'connection_string'}
                                onChange={() => handleAuthTypeChange('connection_string')}
                                label={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <FrokIcon name="Lock" />
                                        <span>Connection String</span>
                                    </span>
                                }
                            />

                            {/* Service Principal — SQL Server only */}
                            {(isSqlServer || authType === 'service_principal') && (
                                <RadioButton
                                    name="authType"
                                    id="auth-service-principal"
                                    value="service_principal"
                                    checked={authType === 'service_principal'}
                                    onChange={() => handleAuthTypeChange('service_principal')}
                                    label={
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <FrokIcon name="Key" />
                                            <span>My Azure App (Service Principal)</span>
                                            <Chip label="SQL Server" />
                                        </span>
                                    }
                                />
                            )}

                            {/* Platform App — SQL Server only, availability-gated */}
                            {(isSqlServer || authType === 'app_service_principal') && (
                                <Tooltip
                                    content={
                                        appSpAvailable === false
                                            ? 'Not available on this platform — contact your administrator.'
                                            : appSpAvailable === null
                                            ? 'Checking platform configuration…'
                                            : ''
                                    }
                                >
                                    <span style={{ display: 'inline-block' }}>
                                        <RadioButton
                                            name="authType"
                                            id="auth-app-service-principal"
                                            value="app_service_principal"
                                            checked={authType === 'app_service_principal'}
                                            disabled={appSpAvailable !== true}
                                            onChange={() => handleAuthTypeChange('app_service_principal')}
                                            label={
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <FrokIcon name="Cloud" />
                                                    <span>Platform App</span>
                                                    <Chip
                                                        label={
                                                            appSpAvailable === null ? 'Checking…' :
                                                            appSpAvailable === false ? 'Unavailable' :
                                                            'Zero Credentials'
                                                        }
                                                    />
                                                    <Chip label="SQL Server" />
                                                </span>
                                            }
                                        />
                                    </span>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* ── Platform App banner ── */}
                    {authType === 'app_service_principal' && appSpAvailable === true && (
                        <Notification type="neutral" defaultOpen>
                            This platform's app registration will be used — no credentials required from
                            you. Just provide the server and database name.
                        </Notification>
                    )}

                    {/* ── connection_string fields ── */}
                    {authType === 'connection_string' && (
                        <div>
                            <TextField
                                id="db-conn-string"
                                label="Connection String"
                                type="password"
                                placeholder={DB_TYPE_PLACEHOLDERS[dbType]}
                                value={connString}
                                onChange={(e) => {
                                    setConnString(e.target.value);
                                    setConnStringMasked(false);
                                    setTestResult(null);
                                }}
                            />
                            <div style={{ marginTop: '0.5rem' }}>
                                <Notification type="warning" defaultOpen>
                                    Your connection string contains credentials. Treat it like a password.
                                </Notification>
                            </div>
                        </div>
                    )}

                    {/* ── Azure Server + Database (shared between SP and App SP) ── */}
                    {isAzureMode && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <TextField
                                    id="db-azure-server"
                                    label="Azure Server"
                                    placeholder="myserver.database.windows.net"
                                    value={azureServer}
                                    onChange={(e) => { setAzureServer(e.target.value); setTestResult(null); }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <TextField
                                    id="db-azure-database"
                                    label="Azure Database"
                                    placeholder="MyDatabaseName"
                                    value={azureDatabase}
                                    onChange={(e) => { setAzureDatabase(e.target.value); setTestResult(null); }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── service_principal-only fields ── */}
                    {authType === 'service_principal' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Divider />
                            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', textAlign: 'center' }}>Your Azure AD App Credentials</span>
                            <TextField
                                id="db-azure-tenant-id"
                                label="Tenant ID"
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                value={azureTenantId}
                                onChange={(e) => { setAzureTenantId(e.target.value); setTestResult(null); }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-azure-client-id"
                                        label="Client ID (Application ID)"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        value={azureClientId}
                                        onChange={(e) => { setAzureClientId(e.target.value); setTestResult(null); }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-azure-client-secret"
                                        label="Client Secret"
                                        type="password"
                                        placeholder={clientSecretMasked && existingConn ? '••••••••• (saved)' : 'your-client-secret'}
                                        value={azureClientSecret}
                                        onChange={(e) => {
                                            setAzureClientSecret(e.target.value);
                                            setClientSecretMasked(false);
                                            setTestResult(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Advanced Settings ── */}
                    <Accordion headline="Advanced Settings">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-include-tables"
                                        label="Include Tables (comma-separated)"
                                        placeholder="orders, customers, products"
                                        value={includeTables}
                                        onChange={(e) => setIncludeTables(e.target.value)}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-exclude-tables"
                                        label="Exclude Tables (comma-separated)"
                                        placeholder="logs, audit_trail"
                                        value={excludeTables}
                                        onChange={(e) => setExcludeTables(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-max-rows"
                                        label="Max Result Rows"
                                        value={String(maxRows)}
                                        onChange={(e) => setMaxRows(Number(e.target.value))}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <TextField
                                        id="db-query-timeout"
                                        label="Query Timeout (sec)"
                                        value={String(queryTimeout)}
                                        onChange={(e) => setQueryTimeout(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </Accordion>

                    {/* Test Result */}
                    {testResult && (
                        <Notification type={testResult.success ? 'success' : 'error'} defaultOpen>
                            {testResult.message}
                            {testResult.success && (
                                <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    {testResult.tables_found != null && `${testResult.tables_found} tables found · `}
                                    {testResult.latency_ms}ms latency
                                </span>
                            )}
                        </Notification>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button
                            mode="secondary"
                            onClick={handleTest}
                            disabled={testing || saving}
                        >
                            {testing ? <ActivityIndicator size="small" /> : <FrokIcon name="CheckCircle" />}
                            {' '}Test Connection
                        </Button>
                        <Button
                            mode="primary"
                            onClick={handleSave}
                            disabled={saving || testing}
                        >
                            {saving && <ActivityIndicator size="small" />}
                            {existingConn ? ' Update Connection' : ' Save Connection'}
                        </Button>
                        {existingConn && (
                            <Tooltip content="Remove the database connection and all cached schema data">
                                <Button
                                    mode="secondary"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <FrokIcon name="Delete" /> Delete Connection
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Schema Explorer ── */}
            {(schema || isConnected) && (
                <div style={{ border: '1px solid var(--app-border)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h4 style={{ fontWeight: 600, margin: 0 }}>
                                Schema
                                {schema && ` (${schema.table_count} table${schema.table_count !== 1 ? 's' : ''})`}
                            </h4>
                            {schema && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                    Last refreshed: {timeAgo(schema.introspected_at)}
                                </span>
                            )}
                        </div>
                        <Button
                            mode="secondary"
                            onClick={() => handleRefreshSchema(true)}
                            disabled={introspecting}
                        >
                            {introspecting ? <ActivityIndicator size="small" /> : <FrokIcon name="Refresh" />}
                            {' '}Refresh Schema
                        </Button>
                    </div>

                    {schema ? (
                        schema.tables.map((table) => (
                            <Accordion key={table.table_name} headline={
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FrokIcon name="Storage" />
                                    <strong>{table.table_name}</strong>
                                    <Chip label={`${table.columns.length} col${table.columns.length !== 1 ? 's' : ''}`} />
                                    {table.row_count_estimate != null && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                            ~{table.row_count_estimate.toLocaleString()} rows
                                        </span>
                                    )}
                                </span>
                            }>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell header>Column</TableCell>
                                            <TableCell header>Type</TableCell>
                                            <TableCell header>Flags</TableCell>
                                            <TableCell header>Nullable</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {table.columns.map((col) => (
                                            <TableRow key={col.name}>
                                                <TableCell>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {col.is_primary_key && (
                                                            <Tooltip content="Primary Key">
                                                                <span><FrokIcon name="Key" /></span>
                                                            </Tooltip>
                                                        )}
                                                        {col.is_foreign_key && (
                                                            <Tooltip content={`FK → ${col.foreign_key_target}`}>
                                                                <span><FrokIcon name="Link" /></span>
                                                            </Tooltip>
                                                        )}
                                                        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                            {col.name}
                                                        </span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                                                        {col.data_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {col.is_primary_key && <Chip label="PK" />}
                                                    {col.is_foreign_key && <Chip label="FK" />}
                                                </TableCell>
                                                <TableCell>
                                                    <span style={{ color: col.nullable ? 'var(--app-text-secondary)' : 'var(--app-text)' }}>
                                                        {col.nullable ? 'Yes' : 'No'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Accordion>
                        ))
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                            <Button
                                mode="secondary"
                                onClick={() => handleRefreshSchema(true)}
                                disabled={introspecting}
                            >
                                {introspecting ? <ActivityIndicator size="small" /> : <FrokIcon name="Refresh" />}
                                {' '}Load Schema
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Audit Log ── */}
            {isConnected && (
                <div style={{ border: '1px solid var(--app-border)', padding: '1.5rem' }}>
                    <Accordion headline={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FrokIcon name="History" />
                            <strong>SQL Query History</strong>
                            {auditTotal > 0 && <Chip label={String(auditTotal)} />}
                        </span>
                    } defaultOpen={auditOpen} onOpenChange={(isOpen) => setAuditOpen(isOpen)}>
                        <Divider />
                        {auditLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                                <ActivityIndicator size="small" />
                            </div>
                        ) : auditEntries.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--app-text-secondary)', padding: '1.5rem', fontSize: '0.875rem' }}>
                                No SQL queries have been executed yet.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                                {auditEntries.map((entry, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid var(--app-border)',
                                            borderLeft: `4px solid ${entry.query_valid ? 'var(--app-success)' : 'var(--app-error)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                                {new Date(entry.generated_at).toLocaleString()}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {entry.row_count != null && <Chip label={`${entry.row_count} rows`} />}
                                                {entry.execution_time_ms != null && <Chip label={`${entry.execution_time_ms}ms`} />}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            <em>"{entry.user_query}"</em>
                                        </p>
                                        <pre
                                            style={{
                                                background: 'var(--app-bg-surface)',
                                                padding: '0.5rem',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all',
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                margin: 0,
                                            }}
                                        >
                                            {entry.sql_query}
                                        </pre>
                                        {entry.error_message && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <Notification type="error" defaultOpen>
                                                    {entry.error_message}
                                                </Notification>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {auditTotal > AUDIT_LIMIT && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                        <Button
                                            mode="integrated"
                                            icon="arrow-left"
                                            onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                                            disabled={auditPage === 1}
                                            aria-label="Previous page"
                                        />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                                            Page {auditPage} of {Math.ceil(auditTotal / AUDIT_LIMIT)}
                                        </span>
                                        <Button
                                            mode="integrated"
                                            icon="arrow-right"
                                            onClick={() => setAuditPage(p => Math.min(Math.ceil(auditTotal / AUDIT_LIMIT), p + 1))}
                                            disabled={auditPage >= Math.ceil(auditTotal / AUDIT_LIMIT)}
                                            aria-label="Next page"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </Accordion>
                </div>
            )}

            {/* ── Delete confirmation dialog ── */}
            <Dialog
                title="Delete Database Connection?"
                modal
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                onCancel={() => setDeleteDialogOpen(false)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="warning"
                confirmButton={{ disabled: deleting }}
            >
                This will permanently remove the database connection and all cached schema data for this project. This action cannot be undone.
            </Dialog>
        </div>
    );
};

export default DatabaseConnection;
