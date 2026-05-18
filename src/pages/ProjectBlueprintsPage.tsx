import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Accordion,
    ActivityIndicator,
    Badge,
    Button,
    Icon,
    Layout,
    Link as FrokLink,
    Notification,
    TextArea,
    TextField,
    Toggle,
} from '@bosch/react-frok';
import { ApiKeyModal } from '../components/common';
import { useAuth } from '../context';
import { ProjectBlueprint, ProjectBlueprintParameter } from '../types';

const BLUEPRINT_PAGE_SIZE = 100;

const formatDate = (value?: string) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const stringifyValue = (value: unknown): string => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value, null, 2);
};

const getDisplayName = (blueprint: ProjectBlueprint) => blueprint.name || blueprint.blueprint_id;

const sortedBlueprints = (items: ProjectBlueprint[]) =>
    [...items].sort((a, b) => {
        const byDate = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        if (Number.isFinite(byDate) && byDate !== 0) return byDate;
        return b.version.localeCompare(a.version);
    });

interface ModalProps {
    open: boolean;
    title: string;
    wide?: boolean;
    onClose: () => void;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

const BlueprintModal: React.FC<ModalProps> = ({ open, title, wide, onClose, footer, children }) => {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(113,118,124,0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                boxSizing: 'border-box',
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{
                    background: 'var(--app-bg)',
                    color: 'var(--app-text)',
                    width: '100%',
                    maxWidth: wide ? 980 : 640,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '16px 20px 16px 24px',
                        borderBottom: '1px solid var(--app-border)',
                        flexShrink: 0,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
                    <Button mode="integrated" icon="close" onClick={onClose} aria-label="Close dialog" />
                </div>
                <div style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                    {children}
                </div>
                {footer && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                            padding: '14px 24px',
                            borderTop: '1px solid var(--app-border)',
                            flexShrink: 0,
                        }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

interface InstantiateDialogProps {
    blueprint: ProjectBlueprint | null;
    loading: boolean;
    onClose: () => void;
    onSubmit: (
        blueprint: ProjectBlueprint,
        request: { project_name: string; description?: string; parameters: Record<string, unknown> }
    ) => Promise<void>;
}

const InstantiateDialog: React.FC<InstantiateDialogProps> = ({ blueprint, loading, onClose, onSubmit }) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [parameterValues, setParameterValues] = useState<Record<string, unknown>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!blueprint) return;
        const defaults: Record<string, unknown> = {};
        blueprint.manifest.parameters.forEach((parameter) => {
            defaults[parameter.name] = parameter.type === 'object' || parameter.type === 'array'
                ? stringifyValue(parameter.default)
                : parameter.default ?? (parameter.type === 'boolean' ? false : '');
        });
        setProjectName(getDisplayName(blueprint));
        setDescription(blueprint.description ?? '');
        setParameterValues(defaults);
        setFieldErrors({});
        setSubmitError('');
    }, [blueprint]);

    const buildParameters = (): Record<string, unknown> | null => {
        if (!blueprint) return null;
        const errors: Record<string, string> = {};
        const parameters: Record<string, unknown> = {};

        blueprint.manifest.parameters.forEach((parameter) => {
            const value = parameterValues[parameter.name];

            if (!parameter.editable) {
                parameters[parameter.name] = parameter.default ?? null;
                return;
            }

            if (parameter.required && parameter.type !== 'boolean' && String(value ?? '').trim() === '') {
                errors[parameter.name] = 'This parameter is required';
                return;
            }

            try {
                parameters[parameter.name] = coerceParameterValue(parameter, value);
            } catch (error) {
                errors[parameter.name] = error instanceof Error ? error.message : 'Invalid parameter value';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length > 0 ? null : parameters;
    };

    const handleSubmit = async () => {
        if (!blueprint) return;
        if (!projectName.trim()) {
            setFieldErrors({ project_name: 'Project name is required' });
            return;
        }

        const parameters = buildParameters();
        if (!parameters) return;

        setSubmitting(true);
        setSubmitError('');
        try {
            await onSubmit(blueprint, {
                project_name: projectName.trim(),
                description: description.trim() || undefined,
                parameters,
            });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to instantiate blueprint');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BlueprintModal
            open={!!blueprint || loading}
            title={blueprint ? `Instantiate ${getDisplayName(blueprint)}` : 'Loading blueprint'}
            onClose={onClose}
            footer={
                <>
                    <Button mode="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button mode="primary" onClick={handleSubmit} disabled={loading || submitting || !projectName.trim()}>
                        {submitting ? 'Instantiating...' : 'Instantiate'}
                    </Button>
                </>
            }
        >
            {loading || !blueprint ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <ActivityIndicator size="large" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
                    <div
                        style={{
                            padding: 16,
                            border: '1px solid var(--app-border)',
                            background: 'color-mix(in srgb, var(--app-primary) 6%, var(--app-bg))',
                        }}
                    >
                        <p style={{ margin: '0 0 0.35rem', fontWeight: 700 }}>
                            {blueprint.blueprint_id}@{blueprint.version}
                        </p>
                        <p style={{ margin: 0, color: 'var(--app-text-secondary)' }}>
                            {blueprint.description || 'No description provided.'}
                        </p>
                    </div>

                    {submitError && (
                        <Notification type="error" defaultOpen>
                            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>
                                {submitError}
                            </pre>
                        </Notification>
                    )}

                    <TextField
                        id="blueprint-project-name"
                        label="Project name"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        required
                    />
                    {fieldErrors.project_name && (
                        <p style={{ margin: '-12px 0 0', color: 'var(--app-error)', fontSize: '0.8125rem' }}>
                            {fieldErrors.project_name}
                        </p>
                    )}

                    <TextArea
                        id="blueprint-project-description"
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                    />

                    <div>
                        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Parameters</h3>
                        {blueprint.manifest.parameters.filter((parameter) => parameter.editable).length === 0 ? (
                            <p style={{ margin: 0, color: 'var(--app-text-secondary)' }}>
                                This blueprint has no editable parameters.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {blueprint.manifest.parameters
                                    .filter((parameter) => parameter.editable)
                                    .map((parameter) => (
                                        <ParameterField
                                            key={parameter.name}
                                            parameter={parameter}
                                            value={parameterValues[parameter.name]}
                                            error={fieldErrors[parameter.name]}
                                            onChange={(value) => {
                                                setParameterValues((prev) => ({ ...prev, [parameter.name]: value }));
                                                setFieldErrors((prev) => ({ ...prev, [parameter.name]: '' }));
                                            }}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BlueprintModal>
    );
};

const coerceParameterValue = (parameter: ProjectBlueprintParameter, value: unknown): unknown => {
    if (parameter.type === 'string') return String(value ?? '');
    if (parameter.type === 'boolean') return Boolean(value);

    if (parameter.type === 'integer' || parameter.type === 'number') {
        if (String(value ?? '').trim() === '') return null;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) throw new Error('Enter a valid number');
        if (parameter.type === 'integer' && !Number.isInteger(parsed)) {
            throw new Error('Enter a whole number');
        }
        return parsed;
    }

    if (parameter.type === 'object' || parameter.type === 'array') {
        const text = String(value ?? '').trim();
        if (!text) return parameter.type === 'array' ? [] : {};
        const parsed = JSON.parse(text);
        if (parameter.type === 'array' && !Array.isArray(parsed)) {
            throw new Error('Enter a JSON array');
        }
        if (parameter.type === 'object' && (Array.isArray(parsed) || parsed === null || typeof parsed !== 'object')) {
            throw new Error('Enter a JSON object');
        }
        return parsed;
    }

    return value;
};

interface ParameterFieldProps {
    parameter: ProjectBlueprintParameter;
    value: unknown;
    error?: string;
    onChange: (value: unknown) => void;
}

const ParameterField: React.FC<ParameterFieldProps> = ({ parameter, value, error, onChange }) => {
    const label = `${parameter.name}${parameter.required ? ' *' : ''}`;
    const helper = parameter.description;
    const stringValue = stringifyValue(value);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {parameter.type === 'boolean' ? (
                <Toggle
                    id={`blueprint-param-${parameter.name}`}
                    leftLabel={label}
                    checked={Boolean(value)}
                    onChange={(event) => onChange(event.target.checked)}
                />
            ) : parameter.type === 'object' || parameter.type === 'array' || stringValue.includes('\n') ? (
                <TextArea
                    id={`blueprint-param-${parameter.name}`}
                    label={label}
                    value={stringValue}
                    onChange={(event) => onChange(event.target.value)}
                    rows={parameter.type === 'object' || parameter.type === 'array' ? 7 : 4}
                    required={parameter.required}
                />
            ) : (
                <TextField
                    id={`blueprint-param-${parameter.name}`}
                    label={label}
                    type="text"
                    value={stringValue}
                    onChange={(event) => onChange(event.target.value)}
                    required={parameter.required}
                />
            )}
            {helper && (
                <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '0.8125rem' }}>
                    {helper}
                </p>
            )}
            {error && (
                <p style={{ margin: 0, color: 'var(--app-error)', fontSize: '0.8125rem' }}>
                    {error}
                </p>
            )}
        </div>
    );
};

interface SourceDialogProps {
    blueprint: ProjectBlueprint | null;
    loading: boolean;
    onClose: () => void;
}

const SourceDialog: React.FC<SourceDialogProps> = ({ blueprint, loading, onClose }) => (
    <BlueprintModal
        open={!!blueprint || loading}
        title={blueprint ? `Source: ${blueprint.blueprint_id}@${blueprint.version}` : 'Loading source'}
        wide
        onClose={onClose}
        footer={<Button mode="secondary" onClick={onClose}>Close</Button>}
    >
        {loading || !blueprint ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <ActivityIndicator size="large" />
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                        color: 'var(--app-text-secondary)',
                        fontSize: '0.8125rem',
                    }}
                >
                    <span>Signature: <strong style={{ color: 'var(--app-text)' }}>{blueprint.signature}</strong></span>
                    <span>Entrypoint: <strong style={{ color: 'var(--app-text)' }}>{blueprint.manifest.entrypoint}</strong></span>
                    <span>Published by: <strong style={{ color: 'var(--app-text)' }}>{blueprint.published_by || 'Unknown'}</strong></span>
                </div>
                {blueprint.source_files.map((sourceFile) => (
                    <div key={`${sourceFile.path}:${sourceFile.sha256}`} style={{ border: '1px solid var(--app-border)' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                padding: '10px 12px',
                                background: 'var(--app-bg-surface)',
                                borderBottom: '1px solid var(--app-border)',
                                fontSize: '0.8125rem',
                            }}
                        >
                            <strong>{sourceFile.path}</strong>
                            <span style={{ color: 'var(--app-text-secondary)' }}>sha256: {sourceFile.sha256}</span>
                        </div>
                        <pre
                            style={{
                                margin: 0,
                                padding: 12,
                                overflowX: 'auto',
                                whiteSpace: 'pre',
                                fontSize: '0.8125rem',
                                lineHeight: 1.5,
                                background: 'var(--app-bg)',
                            }}
                        >
                            {sourceFile.content || 'No source content returned.'}
                        </pre>
                    </div>
                ))}
            </div>
        )}
    </BlueprintModal>
);

interface BlueprintCardProps {
    blueprint: ProjectBlueprint;
    history: ProjectBlueprint[];
    onInstantiate: (blueprint: ProjectBlueprint) => void;
    onViewSource: (blueprint: ProjectBlueprint) => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({ blueprint, history, onInstantiate, onViewSource }) => {
    const active = blueprint.status === 'active';

    return (
        <div
            style={{
                border: '1px solid var(--app-border)',
                background: 'var(--app-bg)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 300,
            }}
        >
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>
                            {getDisplayName(blueprint)}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '0.8125rem' }}>
                            {blueprint.blueprint_id}@{blueprint.version}
                        </p>
                    </div>
                    <Badge type={active ? 'success' : 'warning'}>
                        {blueprint.status}
                    </Badge>
                </div>

                <p style={{ margin: 0, color: 'var(--app-text-secondary)', lineHeight: 1.5, flex: 1 }}>
                    {blueprint.description || 'No description provided.'}
                </p>

                {!active && blueprint.disabled_reason && (
                    <Notification type="warning" defaultOpen>
                        {blueprint.disabled_reason}
                    </Notification>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 10,
                        fontSize: '0.8125rem',
                    }}
                >
                    <MetaItem label="Parameters" value={`${blueprint.manifest.parameters.length}`} />
                    <MetaItem label="Published" value={formatDate(blueprint.published_at)} />
                    <MetaItem label="Entrypoint" value={blueprint.manifest.entrypoint} />
                    <MetaItem label="Scope" value={blueprint.scope} />
                </div>

                {history.length > 0 && (
                    <Accordion headline={`Version history (${history.length})`} size="small">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}>
                            {history.map((item) => (
                                <div
                                    key={`${item.blueprint_id}:${item.version}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: '8px 0',
                                        borderBottom: '1px solid var(--app-border)',
                                    }}
                                >
                                    <div>
                                        <strong>{item.version}</strong>
                                        <p style={{ margin: '2px 0 0', color: 'var(--app-text-secondary)', fontSize: '0.75rem' }}>
                                            {formatDate(item.published_at)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Button mode="tertiary" onClick={() => onViewSource(item)}>
                                            Source
                                        </Button>
                                        <Button
                                            mode="secondary"
                                            disabled={item.status !== 'active'}
                                            onClick={() => onInstantiate(item)}
                                        >
                                            Instantiate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Accordion>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    padding: 16,
                    borderTop: '1px solid var(--app-border)',
                    background: 'var(--app-bg-surface)',
                }}
            >
                <Button mode="secondary" onClick={() => onViewSource(blueprint)}>
                    View source
                </Button>
                <Button mode="primary" disabled={!active} onClick={() => onInstantiate(blueprint)}>
                    Instantiate
                </Button>
            </div>
        </div>
    );
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', color: 'var(--app-text-secondary)', fontSize: '0.75rem' }}>{label}</p>
        <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
);

export const ProjectBlueprintsPage: React.FC = () => {
    const { apiClient, tenantId } = useAuth();
    const navigate = useNavigate();

    const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [instantiateLoading, setInstantiateLoading] = useState(false);
    const [sourceLoading, setSourceLoading] = useState(false);
    const [instantiateBlueprint, setInstantiateBlueprint] = useState<ProjectBlueprint | null>(null);
    const [sourceBlueprint, setSourceBlueprint] = useState<ProjectBlueprint | null>(null);
    const [apiKeyModal, setApiKeyModal] = useState<{ open: boolean; key: string; name: string; projectId: string }>({
        open: false,
        key: '',
        name: '',
        projectId: '',
    });

    const fetchBlueprints = useCallback(async () => {
        if (!apiClient) return;
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.listProjectBlueprints({ page: 1, page_size: BLUEPRINT_PAGE_SIZE });
            setBlueprints(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project blueprints');
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        fetchBlueprints();
    }, [fetchBlueprints]);

    const groups = useMemo(() => {
        const byId = new Map<string, ProjectBlueprint[]>();
        blueprints.forEach((blueprint) => {
            byId.set(blueprint.blueprint_id, [...(byId.get(blueprint.blueprint_id) ?? []), blueprint]);
        });

        return Array.from(byId.entries()).map(([id, versions]) => {
            const sorted = sortedBlueprints(versions);
            const primary = sorted.find((item) => item.status === 'active') ?? sorted[0];
            return {
                id,
                primary,
                history: sorted.filter((item) => item !== primary),
            };
        }).sort((a, b) => getDisplayName(a.primary).localeCompare(getDisplayName(b.primary)));
    }, [blueprints]);

    const loadFreshBlueprint = async (blueprint: ProjectBlueprint) => {
        if (!apiClient) return blueprint;
        return apiClient.getProjectBlueprint(blueprint.blueprint_id, blueprint.version);
    };

    const handleInstantiateStart = async (blueprint: ProjectBlueprint) => {
        setError('');
        setInstantiateLoading(true);
        try {
            setInstantiateBlueprint(await loadFreshBlueprint(blueprint));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Blueprint not found');
        } finally {
            setInstantiateLoading(false);
        }
    };

    const handleSourceOpen = async (blueprint: ProjectBlueprint) => {
        setError('');
        setSourceLoading(true);
        try {
            setSourceBlueprint(await loadFreshBlueprint(blueprint));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load blueprint source');
        } finally {
            setSourceLoading(false);
        }
    };

    const handleInstantiate = async (
        blueprint: ProjectBlueprint,
        request: { project_name: string; description?: string; parameters: Record<string, unknown> }
    ) => {
        if (!apiClient) return;
        const response = await apiClient.instantiateProjectBlueprint(blueprint.blueprint_id, blueprint.version, request);
        setInstantiateBlueprint(null);
        await fetchBlueprints();

        if (response.api_key) {
            setApiKeyModal({
                open: true,
                key: response.api_key,
                name: response.project.name,
                projectId: response.project.project_id,
            });
        } else {
            navigate(`/projects/${response.project.project_id}`);
        }
    };

    return (
        <Layout fullWidth className="projects-page">
            <div className="projects-hero">
                <div className="projects-hero__content">
                    <h4 className="projects-hero__title">Project Blueprints</h4>
                    <p className="projects-hero__subtitle">
                        Instantiate projects from tenant-published Python blueprints.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button mode="secondary" icon="refresh" onClick={fetchBlueprints} disabled={loading}>
                        Refresh
                    </Button>
                    <Button mode="primary" icon="folder" onClick={() => navigate('/projects')}>
                        Projects
                    </Button>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'flex-start',
                    padding: 16,
                    border: '1px solid var(--app-border)',
                    background: 'var(--app-bg-surface)',
                    marginBottom: 20,
                }}
            >
                <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Publish a new blueprint</p>
                    <p style={{ margin: 0, color: 'var(--app-text-secondary)' }}>
                        Publishing is CLI-only in v1. Use your current tenant id: <strong>{tenantId}</strong>
                    </p>
                    <pre
                        style={{
                            margin: '12px 0 0',
                            padding: 12,
                            overflowX: 'auto',
                            background: 'var(--app-bg)',
                            border: '1px solid var(--app-border)',
                            fontSize: '0.8125rem',
                        }}
                    >
                        python scripts/babbage_project.py publish ./my_project{'\n'}
                        {'  '}--api-base-url &lt;BASE_URL&gt;{'\n'}
                        {'  '}--user-id {tenantId}
                    </pre>
                </div>
                <FrokLink href="../docs/extensibility/projects-as-code.md" target="_blank" rel="noreferrer">
                    SDK docs
                </FrokLink>
            </div>

            {error && (
                <div className="projects-page-error">
                    <Notification type="error" variant="banner" open={!!error} onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                </div>
            )}

            {loading ? (
                <div className="projects-page-loading">
                    <ActivityIndicator size="large" />
                </div>
            ) : groups.length === 0 ? (
                <div className="projects-page-empty">
                    <Icon iconName="document-add" className="projects-page-empty__icon" />
                    <h6 className="projects-page-empty-title">No blueprints published yet</h6>
                    <p className="projects-page-empty-description">
                        Author a project.py with the Project-as-Code SDK, publish it with the CLI, then refresh this library.
                    </p>
                    <Button mode="secondary" icon="refresh" onClick={fetchBlueprints}>
                        Refresh Library
                    </Button>
                </div>
            ) : (
                <div className="projects-grid">
                    {groups.map((group) => (
                        <BlueprintCard
                            key={group.id}
                            blueprint={group.primary}
                            history={group.history}
                            onInstantiate={handleInstantiateStart}
                            onViewSource={handleSourceOpen}
                        />
                    ))}
                </div>
            )}

            <InstantiateDialog
                blueprint={instantiateBlueprint}
                loading={instantiateLoading}
                onClose={() => setInstantiateBlueprint(null)}
                onSubmit={handleInstantiate}
            />
            <SourceDialog
                blueprint={sourceBlueprint}
                loading={sourceLoading}
                onClose={() => setSourceBlueprint(null)}
            />
            <ApiKeyModal
                open={apiKeyModal.open}
                apiKey={apiKeyModal.key}
                projectName={apiKeyModal.name}
                onClose={() => {
                    const projectId = apiKeyModal.projectId;
                    setApiKeyModal({ open: false, key: '', name: '', projectId: '' });
                    if (projectId) navigate(`/projects/${projectId}`);
                }}
            />
        </Layout>
    );
};
