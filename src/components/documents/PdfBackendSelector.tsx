import React, { useEffect, useState, useCallback } from 'react';
import {
    Tile,
    Chip,
    Badge,
    Notification,
    ActivityIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { RAGaaSClient } from '../../services/api';
import {
    PdfBackend,
    PdfBackendInfo,
    PdfBackendResponse,
} from '../../types';

interface PdfBackendSelectorProps {
    projectId: string;
    apiClient: RAGaaSClient;
    /** When false, the cards render as read-only (no selection allowed). */
    canEdit?: boolean;
}

const speedBadgeType = (speed: string): 'success' | 'warning' | undefined => {
    if (speed === 'fast') return 'success';
    if (speed === 'slow') return 'warning';
    return undefined;
};

const groundingLabel = (g: string): string => {
    if (g === 'element') return 'Element-level grounding';
    if (g === 'page') return 'Page-level grounding';
    return `${g} grounding`;
};

const speedIcon = (speed: string): string => (speed === 'fast' ? 'Bolt' : 'Pending');

export const PdfBackendSelector: React.FC<PdfBackendSelectorProps> = ({
    projectId,
    apiClient,
    canEdit = true,
}) => {
    const [data, setData] = useState<PdfBackendResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<PdfBackend | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchBackend = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const resp = await apiClient.getPdfBackend(projectId);
            setData(resp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PDF backend');
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        fetchBackend();
    }, [fetchBackend]);

    const handleSelect = async (backend: PdfBackend) => {
        if (!data || backend === data.pdf_backend || saving || !canEdit) return;
        setSaving(backend);
        setError('');
        setSuccess('');
        try {
            const resp = await apiClient.updatePdfBackend(projectId, backend);
            setData(resp);
            const label = resp.available_backends.find((b) => b.id === backend)?.label ?? backend;
            setSuccess(`Switched PDF backend to ${label}. Only PDFs ingested from now on will use it.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update PDF backend');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <Tile background="floating" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ActivityIndicator size="small" />
                    <span style={{ color: 'var(--app-text-secondary)' }}>
                        Loading PDF processing options…
                    </span>
                </div>
            </Tile>
        );
    }

    if (!data) {
        return error ? (
            <Notification type="error" variant="banner" defaultOpen onCloseClick={() => setError('')}>
                {error}
            </Notification>
        ) : null;
    }

    return (
        <Tile background="floating" style={{ padding: '1.25rem' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <FrokIcon name="PictureAsPdf" style={{ color: 'var(--g-blue-50)' }} />
                    <div>
                        <h6 style={{ margin: 0, fontWeight: 600 }}>PDF processing mode</h6>
                        <p
                            style={{
                                margin: '0.125rem 0 0',
                                fontSize: '0.8125rem',
                                color: 'var(--app-text-secondary)',
                            }}
                        >
                            Choose how new PDFs are parsed and chunked. Existing documents are not re-processed.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <Notification type="error" variant="banner" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                </div>
            )}

            {success && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <Notification
                        type="success"
                        variant="banner"
                        defaultOpen
                        onCloseClick={() => setSuccess('')}
                    >
                        {success}
                    </Notification>
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '0.75rem',
                }}
            >
                {data.available_backends.map((backend) => (
                    <BackendCard
                        key={backend.id}
                        backend={backend}
                        selected={backend.id === data.pdf_backend}
                        disabled={!canEdit || saving !== null}
                        loading={saving === backend.id}
                        onSelect={() => handleSelect(backend.id)}
                    />
                ))}
            </div>

            {!canEdit && (
                <p
                    style={{
                        margin: '0.75rem 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--app-text-secondary)',
                    }}
                >
                    You need editor access to change the PDF processing mode.
                </p>
            )}
        </Tile>
    );
};

interface BackendCardProps {
    backend: PdfBackendInfo;
    selected: boolean;
    disabled: boolean;
    loading: boolean;
    onSelect: () => void;
}

const BackendCard: React.FC<BackendCardProps> = ({
    backend,
    selected,
    disabled,
    loading,
    onSelect,
}) => {
    const interactive = !disabled && !selected;
    const handleActivate = () => {
        if (interactive) onSelect();
    };

    return (
        <div
            role="radio"
            tabIndex={interactive ? 0 : -1}
            aria-checked={selected}
            aria-disabled={disabled || undefined}
            onClick={handleActivate}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && interactive) {
                    e.preventDefault();
                    handleActivate();
                }
            }}
            style={{
                height: '100%',
                cursor: interactive ? 'pointer' : selected ? 'default' : 'not-allowed',
                border: selected
                    ? '2px solid var(--g-blue-50, #007bc0)'
                    : '2px solid var(--app-border, color-mix(in srgb, var(--app-text) 12%, transparent))',
                background: selected
                    ? 'color-mix(in srgb, var(--g-blue-50, #007bc0) 6%, var(--app-bg))'
                    : 'var(--app-bg)',
                opacity: disabled && !selected ? 0.55 : 1,
                transition: 'border-color 0.15s, background 0.15s',
                outline: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
                    minHeight: '180px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9375rem' }}>{backend.label}</strong>
                        {selected && (
                            <FrokIcon
                                name="CheckCircle"
                                style={{ color: 'var(--g-green-50, #00884a)' }}
                                aria-label="Currently selected"
                            />
                        )}
                    </div>
                    {loading ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <Badge type={speedBadgeType(backend.speed)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FrokIcon name={speedIcon(backend.speed)} />
                                {backend.speed}
                            </span>
                        </Badge>
                    )}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        color: 'var(--app-text-secondary)',
                        lineHeight: 1.4,
                    }}
                >
                    {backend.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: 'auto' }}>
                    <Chip label={groundingLabel(backend.visual_grounding)} />
                    <Chip
                        label={backend.table_structure ? 'Table structure' : 'No table structure'}
                    />
                </div>

                <p
                    style={{
                        margin: '0.25rem 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--app-text-secondary)',
                        fontStyle: 'italic',
                    }}
                >
                    Best for: {backend.recommended_for}
                </p>
            </div>
        </div>
    );
};
