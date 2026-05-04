import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Dialog,
    Dropdown,
    Notification,
    TextField,
    Toggle,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { MCPServerConfig, MCPServerTestResult, MCPTransport } from '../../types';

const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const MASKED_SECRET = '***';

type KeyValueRow = {
    id: string;
    key: string;
    value: string;
    masked: boolean;
};

interface McpServerDialogProps {
    open: boolean;
    projectId: string;
    apiClient: RAGaaSClient;
    server?: MCPServerConfig | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

const makeRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const rowsFromRecord = (record: Record<string, string>): KeyValueRow[] => (
    Object.entries(record).map(([key, value]) => ({
        id: makeRowId(),
        key,
        value: value === MASKED_SECRET ? '' : value,
        masked: value === MASKED_SECRET,
    }))
);

const rowsToPayload = (rows: KeyValueRow[], initialKeys: string[] = []): Record<string, string> => {
    const payload: Record<string, string> = {};
    const currentKeys = new Set<string>();
    for (const row of rows) {
        const key = row.key.trim();
        if (!key) continue;
        currentKeys.add(key);
        if (row.masked && !row.value) continue;
        payload[key] = row.value;
    }
    for (const key of initialKeys) {
        if (!currentKeys.has(key)) {
            payload[key] = '';
        }
    }
    return payload;
};

const argsFromServer = (server?: MCPServerConfig | null): string[] => (
    server?.args?.length ? [...server.args] : ['']
);

const argsToPayload = (args: string[]): string[] => (
    args.map((arg) => arg.trim()).filter(Boolean)
);

const readDropdownValue = (valueOrEvent: unknown): string => {
    if (typeof valueOrEvent === 'string') return valueOrEvent;
    const maybeEvent = valueOrEvent as { target?: { value?: string } };
    return maybeEvent.target?.value ?? '';
};

interface ArgsEditorProps {
    args: string[];
    disabled: boolean;
    onChange: (args: string[]) => void;
}

const ArgsEditor: React.FC<ArgsEditorProps> = ({ args, disabled, onChange }) => {
    const updateArg = (index: number, value: string) => {
        onChange(args.map((arg, i) => (i === index ? value : arg)));
    };

    const removeArg = (index: number) => {
        const next = args.filter((_, i) => i !== index);
        onChange(next.length ? next : ['']);
    };

    return (
        <div className="mcp-list-editor">
            <div className="mcp-list-editor__header">
                <span>Arguments</span>
                <Button
                    mode="tertiary"
                    icon="add"
                    disabled={disabled}
                    onClick={() => onChange([...args, ''])}
                >
                    Add argument
                </Button>
            </div>
            {args.map((arg, index) => (
                <div className="mcp-list-editor__row" key={`${index}-${args.length}`}>
                    <TextField
                        id={`mcp-arg-${index}`}
                        value={arg}
                        placeholder="@modelcontextprotocol/server-github"
                        disabled={disabled}
                        onChange={(e) => updateArg(index, e.target.value)}
                    />
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label="Remove argument"
                        disabled={disabled || args.length === 1}
                        onClick={() => removeArg(index)}
                    />
                </div>
            ))}
        </div>
    );
};

interface KeyValueEditorProps {
    title: string;
    keyPlaceholder: string;
    valuePlaceholder: string;
    rows: KeyValueRow[];
    disabled: boolean;
    onChange: (rows: KeyValueRow[]) => void;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
    title,
    keyPlaceholder,
    valuePlaceholder,
    rows,
    disabled,
    onChange,
}) => {
    const updateRow = (id: string, update: Partial<KeyValueRow>) => {
        onChange(rows.map((row) => (row.id === id ? { ...row, ...update } : row)));
    };

    return (
        <div className="mcp-list-editor">
            <div className="mcp-list-editor__header">
                <span>{title}</span>
                <Button
                    mode="tertiary"
                    icon="add"
                    disabled={disabled}
                    onClick={() => onChange([...rows, { id: makeRowId(), key: '', value: '', masked: false }])}
                >
                    Add entry
                </Button>
            </div>
            {rows.length === 0 && (
                <p className="mcp-empty-inline">No entries configured.</p>
            )}
            {rows.map((row) => (
                <div className="mcp-key-value-row" key={row.id}>
                    <TextField
                        id={`mcp-${title.toLowerCase().replace(/\s+/g, '-')}-${row.id}-key`}
                        value={row.key}
                        placeholder={keyPlaceholder}
                        disabled={disabled || row.masked}
                        onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    />
                    <TextField
                        id={`mcp-${title.toLowerCase().replace(/\s+/g, '-')}-${row.id}-value`}
                        type="password"
                        value={row.value}
                        placeholder={row.masked ? `${MASKED_SECRET} saved, enter a new value to replace` : valuePlaceholder}
                        disabled={disabled}
                        onChange={(e) => updateRow(row.id, { value: e.target.value, masked: false })}
                    />
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label={`Remove ${row.key || 'entry'}`}
                        disabled={disabled}
                        onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
                    />
                </div>
            ))}
        </div>
    );
};

export const McpServerDialog: React.FC<McpServerDialogProps> = ({
    open,
    projectId,
    apiClient,
    server,
    onOpenChange,
    onSaved,
}) => {
    const isEditing = Boolean(server);
    const [name, setName] = useState('');
    const [transport, setTransport] = useState<MCPTransport>('stdio');
    const [command, setCommand] = useState('');
    const [url, setUrl] = useState('');
    const [args, setArgs] = useState<string[]>(['']);
    const [envRows, setEnvRows] = useState<KeyValueRow[]>([]);
    const [headerRows, setHeaderRows] = useState<KeyValueRow[]>([]);
    const [initialEnvKeys, setInitialEnvKeys] = useState<string[]>([]);
    const [initialHeaderKeys, setInitialHeaderKeys] = useState<string[]>([]);
    const [enabled, setEnabled] = useState(true);
    const [error, setError] = useState('');
    const [saveWarning, setSaveWarning] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<MCPServerTestResult | null>(null);
    const [dirtySinceTest, setDirtySinceTest] = useState(true);

    useEffect(() => {
        if (!open) return;
        setName(server?.name ?? '');
        setTransport(server?.transport ?? 'stdio');
        setCommand(server?.command ?? '');
        setUrl(server?.url ?? '');
        setArgs(argsFromServer(server));
        setEnvRows(rowsFromRecord(server?.env ?? {}));
        setHeaderRows(rowsFromRecord(server?.headers ?? {}));
        setInitialEnvKeys(Object.keys(server?.env ?? {}));
        setInitialHeaderKeys(Object.keys(server?.headers ?? {}));
        setEnabled(server?.enabled ?? true);
        setError('');
        setSaveWarning(false);
        setSaving(false);
        setTesting(false);
        setTestResult(null);
        setDirtySinceTest(true);
    }, [open, server]);

    const transportOptions = useMemo(() => [
        { name: 'stdio', value: 'stdio' },
        { name: 'http', value: 'http' },
    ], []);

    const markDirty = () => {
        setDirtySinceTest(true);
        setSaveWarning(false);
        setTestResult(null);
    };

    const validate = (): string => {
        const trimmedName = name.trim();
        if (!trimmedName) return 'Server name is required.';
        if (!NAME_PATTERN.test(trimmedName)) {
            return 'Server name may only contain letters, numbers, underscores, and hyphens.';
        }
        if (transport === 'stdio' && !command.trim()) {
            return 'Command is required for stdio MCP servers.';
        }
        if (transport === 'http') {
            try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    return 'URL must start with http:// or https://.';
                }
            } catch {
                return 'A valid URL is required for http MCP servers.';
            }
        }
        return '';
    };

    const buildPayload = (): MCPServerConfig => ({
        name: name.trim(),
        transport,
        command: transport === 'stdio' ? command.trim() : null,
        args: transport === 'stdio' ? argsToPayload(args) : [],
        env: transport === 'stdio' ? rowsToPayload(envRows, initialEnvKeys) : {},
        url: transport === 'http' ? url.trim() : null,
        headers: transport === 'http' ? rowsToPayload(headerRows, initialHeaderKeys) : {},
        enabled,
    });

    const handleTest = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setTesting(true);
        setTestResult(null);
        try {
            const result = await apiClient.testMcpServer(projectId, buildPayload());
            setTestResult(result);
            setDirtySinceTest(false);
            setSaveWarning(false);
        } catch (err) {
            setTestResult({
                success: false,
                server_name: name.trim(),
                transport,
                latency_ms: 0,
                tool_count: 0,
                tools: [],
                error_type: 'unknown_error',
                error: err instanceof Error ? err.message : 'MCP server test failed',
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (dirtySinceTest && !saveWarning) {
            setSaveWarning(true);
            return;
        }

        setError('');
        setSaving(true);
        try {
            const payload = buildPayload();
            if (isEditing && server) {
                await apiClient.updateMcpServer(projectId, server.name, payload);
            } else {
                await apiClient.createMcpServer(projectId, payload);
            }
            onSaved();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save MCP server');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            title={isEditing ? `Edit MCP Server: ${server?.name}` : 'Add MCP Server'}
            modal
            open={open}
            onClose={() => onOpenChange(false)}
            className="mcp-dialog"
            cancelLabel="Cancel"
            onCancel={() => onOpenChange(false)}
            optionalLabel={testing ? 'Testing...' : 'Test Connection'}
            optionalButton={{ disabled: saving || testing }}
            onOption={handleTest}
            confirmLabel={saving ? 'Saving...' : saveWarning ? 'Save Untested Config' : isEditing ? 'Save Changes' : 'Create Server'}
            confirmButton={{ disabled: saving || testing }}
            onConfirm={handleSave}
        >
            <div className="mcp-dialog__body">
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}
                {saveWarning && (
                    <Notification type="warning" defaultOpen onCloseClick={() => setSaveWarning(false)}>
                        This configuration has not been tested. Click save again to store it anyway.
                    </Notification>
                )}
                {transport === 'stdio' && (
                    <Notification type="warning" defaultOpen>
                        stdio MCP servers execute the configured command on the backend host. Only configure trusted MCP servers and packages.
                    </Notification>
                )}

                <div className="mcp-form-grid">
                    <div className="mcp-field-stack">
                        <TextField
                            id="mcp-server-name"
                            label="Server name"
                            value={name}
                            placeholder="github"
                            disabled={isEditing}
                            onChange={(e) => {
                                setName(e.target.value);
                                markDirty();
                            }}
                        />
                        <span className="mcp-field-hint">Letters, numbers, underscores, and hyphens only.</span>
                    </div>
                    <Dropdown
                        label="Transport"
                        value={transport}
                        disabled={saving || testing}
                        options={transportOptions}
                        onChange={(value) => {
                            setTransport(readDropdownValue(value) as MCPTransport);
                            markDirty();
                        }}
                    />
                </div>

                <div className="mcp-toggle-row">
                    <Toggle
                        id="mcp-server-enabled"
                        leftLabel="Enabled"
                        checked={enabled}
                        disabled={saving || testing}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setEnabled(e.target.checked);
                            markDirty();
                        }}
                    />
                </div>

                {transport === 'stdio' ? (
                    <div className="mcp-form-stack">
                        <TextField
                            id="mcp-stdio-command"
                            label="Command"
                            value={command}
                            placeholder="npx"
                            disabled={saving || testing}
                            onChange={(e) => {
                                setCommand(e.target.value);
                                markDirty();
                            }}
                        />
                        <ArgsEditor
                            args={args}
                            disabled={saving || testing}
                            onChange={(nextArgs) => {
                                setArgs(nextArgs);
                                markDirty();
                            }}
                        />
                        <KeyValueEditor
                            title="Environment variables"
                            keyPlaceholder="GITHUB_TOKEN"
                            valuePlaceholder="secret value"
                            rows={envRows}
                            disabled={saving || testing}
                            onChange={(rows) => {
                                setEnvRows(rows);
                                markDirty();
                            }}
                        />
                    </div>
                ) : (
                    <div className="mcp-form-stack">
                        <TextField
                            id="mcp-http-url"
                            label="URL"
                            type="text"
                            value={url}
                            placeholder="https://mcp.example.com/mcp"
                            disabled={saving || testing}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                markDirty();
                            }}
                        />
                        <KeyValueEditor
                            title="Headers"
                            keyPlaceholder="Authorization"
                            valuePlaceholder="Bearer secret"
                            rows={headerRows}
                            disabled={saving || testing}
                            onChange={(rows) => {
                                setHeaderRows(rows);
                                markDirty();
                            }}
                        />
                    </div>
                )}

                {testResult && (
                    <Notification type={testResult.success ? 'success' : 'error'} defaultOpen>
                        {testResult.success ? (
                            <div className="mcp-test-result">
                                <strong>Connection successful.</strong>
                                <span>{testResult.latency_ms}ms latency · {testResult.tool_count} tools</span>
                                {testResult.tools.length > 0 && (
                                    <div className="mcp-tool-list">
                                        {testResult.tools.map((tool) => (
                                            <span className="mcp-tool-pill" key={tool.name}>
                                                {tool.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mcp-test-result">
                                <strong>{testResult.error_type || 'Test failed'}</strong>
                                <span>{testResult.error || 'MCP server test failed.'}</span>
                            </div>
                        )}
                    </Notification>
                )}
            </div>
        </Dialog>
    );
};

export default McpServerDialog;
