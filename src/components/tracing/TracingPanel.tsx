import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Accordion,
    ActivityIndicator,
    Button,
    Chip,
    FormField,
    Notification,
    TextField,
    Tile,
} from '@bosch/react-frok';
import { JsonViewer } from '../chat';
import { ApiHttpError } from '../../services/api';
import type { RAGaaSClient } from '../../services/api';
import type { PipelineTraceResponse, ProcessingEvent, StepTrace, TracePayloads } from '../../types';
import './TracingPanel.css';

interface TracingPanelProps {
    apiClient: RAGaaSClient;
    projectId: string;
    selectedTraceId?: string;
    onSelectedTraceIdChange?: (traceId: string) => void;
}

type TraceErrorState = {
    type: 'not-found' | 'forbidden' | 'mismatch' | 'fetch-failed' | 'validation';
    message: string;
};

const SLOW_STEP_THRESHOLD_MS = 2000;

const normalizeTraceId = (traceId: string) => traceId.trim();

const formatLatency = (latencyMs: number) => {
    if (!Number.isFinite(latencyMs)) return 'n/a';
    if (latencyMs >= 1000) return `${(latencyMs / 1000).toFixed(2)}s`;
    return `${Math.round(latencyMs)}ms`;
};

const formatSize = (value: number) => {
    if (!Number.isFinite(value)) return 'n/a';
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${value} B`;
};

const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const stringifyJson = (value: unknown) => JSON.stringify(value ?? null, null, 2);

const payloadTitle = (key: string) =>
    key
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const getExtraPayloadEntries = (payloads: TracePayloads) => {
    const knownPayloadKeys = new Set(['query', 'rendered_prompt', 'llm_response', 'retrieved_chunks', 'step_io']);
    return Object.entries(payloads).filter(([key, value]) => !knownPayloadKeys.has(key) && value !== undefined);
};

const getStepError = (trace: PipelineTraceResponse) =>
    trace.steps.find((step) => step.status === 'error' && step.error)?.error;

const getErrorState = (error: unknown): TraceErrorState => {
    if (error instanceof ApiHttpError) {
        if (error.status === 404) {
            return {
                type: 'not-found',
                message: 'Trace not found or expired.',
            };
        }
        if (error.status === 403) {
            return {
                type: 'forbidden',
                message: 'You do not have access to this trace.',
            };
        }
    }

    return {
        type: 'fetch-failed',
        message: error instanceof Error ? error.message : 'Failed to fetch trace.',
    };
};

const TraceStatusChip: React.FC<{ status: PipelineTraceResponse['status'] | StepTrace['status'] }> = ({ status }) => (
    <Chip
        label={status === 'ok' ? 'OK' : 'Error'}
        className={`trace-status-chip trace-status-chip--${status}`}
    />
);

const TraceSummaryItem: React.FC<{ label: string; value: React.ReactNode; emphasized?: boolean }> = ({
    label,
    value,
    emphasized = false,
}) => (
    <Tile background="floating" className="trace-summary-card">
        <span className="trace-summary-label">{label}</span>
        <span className={emphasized ? 'trace-summary-value trace-summary-value--emphasized' : 'trace-summary-value'}>
            {value || 'n/a'}
        </span>
    </Tile>
);

const TraceStepTimeline: React.FC<{ steps: StepTrace[] }> = ({ steps }) => (
    <div className="trace-step-timeline">
        {steps.map((step, index) => {
            const isSlow = step.latency_ms >= SLOW_STEP_THRESHOLD_MS;

            return (
                <div key={`${step.name}-${index}`} className={`trace-step trace-step--${step.status}`}>
                    <div className="trace-step-marker" aria-hidden="true">
                        {index + 1}
                    </div>
                    <div className="trace-step-content">
                        <div className="trace-step-header">
                            <div>
                                <h4 className="trace-step-title">{step.name}</h4>
                                <p className="trace-step-type">{step.type}</p>
                            </div>
                            <div className="trace-step-meta">
                                <TraceStatusChip status={step.status} />
                                <span className={isSlow ? 'trace-step-latency trace-step-latency--slow' : 'trace-step-latency'}>
                                    {formatLatency(step.latency_ms)}
                                </span>
                            </div>
                        </div>
                        <div className="trace-step-sizes">
                            <span>Input {formatSize(step.input_size)}</span>
                            <span>Output {formatSize(step.output_size)}</span>
                        </div>
                        {step.error && (
                            <Notification type="error" variant="text" defaultOpen className="trace-step-error">
                                <strong>{step.error.type}</strong>: {step.error.message}
                            </Notification>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

const PayloadSection: React.FC<{ title: string; value: unknown; defaultOpen?: boolean }> = ({
    title,
    value,
    defaultOpen = false,
}) => (
    <Accordion headline={title} size="small" defaultOpen={defaultOpen}>
        <JsonViewer content={stringifyJson(value)} maxDepth={2} />
    </Accordion>
);

const TraceProcessingEvents: React.FC<{ events: ProcessingEvent[] }> = ({ events }) => {
    if (!events.length) {
        return <p className="trace-muted-text">No live processing events were recorded for this trace.</p>;
    }

    return (
        <div className="trace-processing-events">
            {events.map((event, index) => {
                const isNestedTool = Boolean(event.parent_step && (event.type === 'tool_start' || event.type === 'tool_end'));
                const metadataEntries = Object.keys(event.metadata ?? {});
                const eventTitle = event.name || event.message || event.type;

                return (
                    <div
                        key={event.event_id || `${event.type}-${event.timestamp}-${index}`}
                        className={isNestedTool ? 'trace-processing-event trace-processing-event--nested' : 'trace-processing-event'}
                    >
                        <div className="trace-processing-event-header">
                            <div className="trace-processing-event-title">
                                <Chip label={event.type.replace('_', ' ')} className="trace-event-type-chip" />
                                <strong>{eventTitle}</strong>
                            </div>
                            <div className="trace-processing-event-meta">
                                {event.status && <span>{event.status}</span>}
                                {typeof event.duration_ms === 'number' && <span>{formatLatency(event.duration_ms)}</span>}
                                <span>{formatDateTime(event.timestamp)}</span>
                            </div>
                        </div>

                        {event.parent_step && (
                            <p className="trace-processing-parent">Under step: {event.parent_step}</p>
                        )}

                        {(event.input_summary || event.output_summary || event.message) && (
                            <div className="trace-processing-summaries">
                                {event.message && <p>{event.message}</p>}
                                {event.input_summary && <p><strong>Input:</strong> {event.input_summary}</p>}
                                {event.output_summary && <p><strong>Output:</strong> {event.output_summary}</p>}
                            </div>
                        )}

                        {metadataEntries.length > 0 && (
                            <Accordion headline="Event metadata" size="small">
                                <JsonViewer content={stringifyJson(event.metadata)} maxDepth={1} />
                            </Accordion>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const TracingPanel: React.FC<TracingPanelProps> = ({
    apiClient,
    projectId,
    selectedTraceId,
    onSelectedTraceIdChange,
}) => {
    const [traceIdInput, setTraceIdInput] = useState(selectedTraceId ?? '');
    const [trace, setTrace] = useState<PipelineTraceResponse | null>(null);
    const [lastLoadedTraceId, setLastLoadedTraceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<TraceErrorState | null>(null);
    const [copied, setCopied] = useState(false);

    const slowestStep = useMemo(() => {
        if (!trace?.steps.length) return null;
        return trace.steps.reduce((slowest, step) =>
            step.latency_ms > slowest.latency_ms ? step : slowest
        );
    }, [trace]);

    const fetchTrace = useCallback(async (traceId: string) => {
        const normalizedTraceId = normalizeTraceId(traceId);
        if (!normalizedTraceId) {
            setError({ type: 'validation', message: 'Enter a trace ID to search.' });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setCopied(false);
            const nextTrace = await apiClient.getPipelineTrace(normalizedTraceId);

            if (nextTrace.project_id !== projectId) {
                setTrace(null);
                setLastLoadedTraceId(null);
                setError({
                    type: 'mismatch',
                    message: 'This trace belongs to a different project.',
                });
                return;
            }

            setTrace(nextTrace);
            setLastLoadedTraceId(normalizedTraceId);
            setTraceIdInput(normalizedTraceId);
            onSelectedTraceIdChange?.(normalizedTraceId);
        } catch (err) {
            setTrace(null);
            setLastLoadedTraceId(null);
            setError(getErrorState(err));
        } finally {
            setLoading(false);
        }
    }, [apiClient, onSelectedTraceIdChange, projectId]);

    useEffect(() => {
        if (!selectedTraceId) return;

        const normalizedTraceId = normalizeTraceId(selectedTraceId);
        setTraceIdInput(normalizedTraceId);

        if (normalizedTraceId && normalizedTraceId !== lastLoadedTraceId) {
            void fetchTrace(normalizedTraceId);
        }
    }, [fetchTrace, lastLoadedTraceId, selectedTraceId]);

    const handleSearch = () => {
        void fetchTrace(traceIdInput);
    };

    const handleRetry = () => {
        void fetchTrace(traceIdInput);
    };

    const handleCopyTraceId = async () => {
        if (!trace?.trace_id) return;

        try {
            await navigator.clipboard.writeText(trace.trace_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy trace ID:', err);
        }
    };

    const failedStepError = trace ? getStepError(trace) : null;

    return (
        <div className="tracing-panel">
            <Tile background="floating" className="trace-search-card">
                <div>
                    <h3 className="trace-panel-title">Pipeline tracing</h3>
                    <p className="trace-panel-description">
                        Paste a trace ID to inspect pipeline latency, failed steps, and captured debug payloads.
                    </p>
                </div>

                <div className="trace-search-row">
                    <FormField fieldType="text" className="trace-search-field">
                        <TextField
                            id="trace-id-search"
                            label="Trace ID"
                            value={traceIdInput}
                            onChange={(event) => setTraceIdInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                    </FormField>
                    <Button mode="primary" onClick={handleSearch} disabled={loading}>
                        {loading ? 'Loading...' : 'Load trace'}
                    </Button>
                </div>
            </Tile>

            {loading && (
                <div className="trace-loading-state">
                    <div className="trace-loading">
                        <ActivityIndicator />
                        <span>Loading trace details...</span>
                    </div>
                    <div className="trace-summary-grid" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Tile key={index} background="floating" className="trace-summary-card trace-skeleton-card">
                                <span className="trace-skeleton-line trace-skeleton-line--short" />
                                <span className="trace-skeleton-line" />
                            </Tile>
                        ))}
                    </div>
                    <Tile background="floating" className="trace-section-card trace-skeleton-card" aria-hidden="true">
                        <span className="trace-skeleton-line trace-skeleton-line--title" />
                        {Array.from({ length: 3 }).map((_, index) => (
                            <span key={index} className="trace-skeleton-row" />
                        ))}
                    </Tile>
                </div>
            )}

            {error && !loading && (
                <Notification
                    type={error.type === 'forbidden' || error.type === 'fetch-failed' ? 'error' : 'warning'}
                    variant="banner"
                    open={true}
                    className="trace-notification"
                >
                    <div className="trace-notification-content">
                        <span>{error.message}</span>
                        {error.type === 'fetch-failed' && (
                            <Button mode="tertiary" onClick={handleRetry}>
                                Retry
                            </Button>
                        )}
                    </div>
                </Notification>
            )}

            {!trace && !loading && !error && (
                <Notification type="neutral" variant="banner" open={true} className="trace-notification">
                    Search for a trace ID or use View trace from an assistant message.
                </Notification>
            )}

            {trace && !loading && (
                <div className="trace-detail">
                    <Tile background="floating" className="trace-id-card">
                        <div className="trace-id-content">
                            <span className="trace-summary-label">Trace ID</span>
                            <code className="trace-code">{trace.trace_id}</code>
                        </div>
                        <Button mode="secondary" onClick={handleCopyTraceId}>
                            {copied ? 'Copied' : 'Copy trace ID'}
                        </Button>
                    </Tile>

                    <div className="trace-summary-grid">
                        <TraceSummaryItem
                            label="Status"
                            value={<TraceStatusChip status={trace.status} />}
                            emphasized
                        />
                        <TraceSummaryItem
                            label="Total latency"
                            value={formatLatency(trace.total_latency_ms)}
                            emphasized
                        />
                        <TraceSummaryItem label="Pipeline type" value={trace.pipeline_type} />
                        <TraceSummaryItem label="Execution mode" value={trace.execution_mode} />
                        <TraceSummaryItem label="Project ID" value={trace.project_id} />
                        <TraceSummaryItem label="Session ID" value={trace.session_id || 'n/a'} />
                        <TraceSummaryItem label="Created" value={formatDateTime(trace.created_at)} />
                        <TraceSummaryItem label="Query log ID" value={trace.query_log_id || 'n/a'} />
                    </div>

                    {slowestStep && (
                        <Tile background="floating" className="trace-performance-card">
                            <h3 className="trace-section-title">Performance</h3>
                            <p>
                                Slowest step: <strong>{slowestStep.name}</strong> at{' '}
                                <strong>{formatLatency(slowestStep.latency_ms)}</strong> of{' '}
                                <strong>{formatLatency(trace.total_latency_ms)}</strong> total latency.
                            </p>
                        </Tile>
                    )}

                    {trace.status === 'error' && (
                        <Notification type="error" variant="banner" open={true} className="trace-notification">
                            <div className="trace-error-panel">
                                {trace.error && (
                                    <p>
                                        <strong>{trace.error.type}</strong>: {trace.error.message}
                                    </p>
                                )}
                                {failedStepError && (
                                    <p>
                                        Failed step: <strong>{failedStepError.type}</strong>: {failedStepError.message}
                                    </p>
                                )}
                            </div>
                        </Notification>
                    )}

                    <Tile background="floating" className="trace-section-card">
                        <h3 className="trace-section-title">Step timeline</h3>
                        {trace.steps.length > 0 ? (
                            <TraceStepTimeline steps={trace.steps} />
                        ) : (
                            <p className="trace-muted-text">No step data was recorded for this trace.</p>
                        )}
                    </Tile>

                    <Tile background="floating" className="trace-section-card">
                        <h3 className="trace-section-title">Processing events</h3>
                        <TraceProcessingEvents events={trace.processing_events ?? []} />
                    </Tile>

                    <Tile background="floating" className="trace-section-card">
                        <h3 className="trace-section-title">Payloads</h3>
                        {trace.payloads ? (
                            <div className="trace-payload-list">
                                {'query' in trace.payloads && (
                                    <PayloadSection title="Query" value={trace.payloads.query} defaultOpen />
                                )}
                                {'rendered_prompt' in trace.payloads && (
                                    <PayloadSection title="Rendered prompt" value={trace.payloads.rendered_prompt} />
                                )}
                                {'llm_response' in trace.payloads && (
                                    <PayloadSection title="LLM response" value={trace.payloads.llm_response} />
                                )}
                                {'retrieved_chunks' in trace.payloads && (
                                    <PayloadSection title="Retrieved chunks" value={trace.payloads.retrieved_chunks ?? []} />
                                )}
                                {'step_io' in trace.payloads && (
                                    <PayloadSection title="Step input and output" value={trace.payloads.step_io ?? {}} />
                                )}
                                {getExtraPayloadEntries(trace.payloads).map(([key, value]) => (
                                    <PayloadSection key={key} title={payloadTitle(key)} value={value} />
                                ))}
                            </div>
                        ) : (
                            <Notification type="neutral" variant="text" defaultOpen>
                                Payloads were not captured for this run.
                            </Notification>
                        )}
                    </Tile>
                </div>
            )}
        </div>
    );
};

export default TracingPanel;
