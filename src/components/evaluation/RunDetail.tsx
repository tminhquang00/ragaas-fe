import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Accordion,
    ActivityIndicator,
    Badge,
    Button,
    Chip,
    Notification,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tile,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import {
    EvalCaseResult,
    EvalDataset,
    EvalRun,
    isTerminalRunStatus,
    metricPasses,
} from '../../types';
import {
    formatCost,
    formatDate,
    formatLatency,
    formatMetricValue,
    formatRelativeDuration,
    prettyMetricName,
    statusBadgeType,
    statusLabel,
} from './evalFormat';

const POLL_INTERVAL_MS = 3000;

interface RunDetailProps {
    projectId: string;
    runId: string;
    apiClient: RAGaaSClient;
    dataset?: EvalDataset | null;
    canManage: boolean;
    onBack: () => void;
    onSetBaseline?: (run: EvalRun) => void;
    onDiff?: (run: EvalRun) => void;
}

export const RunDetail: React.FC<RunDetailProps> = ({
    projectId,
    runId,
    apiClient,
    dataset,
    canManage,
    onBack,
    onSetBaseline,
    onDiff,
}) => {
    const [run, setRun] = useState<EvalRun | null>(null);
    const [results, setResults] = useState<EvalCaseResult[]>([]);
    const [loadingRun, setLoadingRun] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [error, setError] = useState('');
    const [aborting, setAborting] = useState(false);
    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    }, []);

    const fetchResults = useCallback(async () => {
        try {
            setLoadingResults(true);
            const data = await apiClient.listEvalRunCases(projectId, runId, 0, 100);
            setResults(data);
        } catch (err) {
            console.error('Failed to load run case results:', err);
        } finally {
            setLoadingResults(false);
        }
    }, [apiClient, projectId, runId]);

    const fetchRun = useCallback(
        async (silent: boolean = false) => {
            try {
                if (!silent) setLoadingRun(true);
                const data = await apiClient.getEvalRun(projectId, runId);
                setRun(data);
                setError('');
                if (isTerminalRunStatus(data.status)) {
                    stopPolling();
                    await fetchResults();
                }
                return data;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load run');
                return null;
            } finally {
                if (!silent) setLoadingRun(false);
            }
        },
        [apiClient, projectId, runId, stopPolling, fetchResults]
    );

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            const data = await fetchRun(true);
            if (cancelled || !data) return;
            if (!isTerminalRunStatus(data.status)) {
                pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
            }
        };

        fetchRun(false).then((data) => {
            if (cancelled || !data) return;
            if (!isTerminalRunStatus(data.status)) {
                pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
            }
        });

        return () => {
            cancelled = true;
            stopPolling();
        };
    }, [fetchRun, stopPolling]);

    const handleAbort = async () => {
        if (!run) return;
        if (!window.confirm('Abort this run? Cases already running may still finish.')) return;
        setAborting(true);
        try {
            await apiClient.abortEvalRun(projectId, run.run_id);
            await fetchRun(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to abort run');
        } finally {
            setAborting(false);
        }
    };

    if (loadingRun && !run) {
        return (
            <div className="eval-loading">
                <ActivityIndicator />
                <span>Loading run…</span>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="eval-detail">
                <button className="eval-detail__back" type="button" onClick={onBack}>
                    ← Back
                </button>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}
                <p className="eval-muted">Run not found.</p>
            </div>
        );
    }

    const inProgress = !isTerminalRunStatus(run.status);
    const progressPct = run.cases_total > 0
        ? Math.round((run.cases_completed / run.cases_total) * 100)
        : 0;

    const aggregateEntries = Object.entries(run.aggregate_scores ?? {});
    const thresholds = dataset?.thresholds ?? {};

    return (
        <div className="eval-detail">
            <div className="eval-detail__header">
                <div>
                    <button className="eval-detail__back" type="button" onClick={onBack}>
                        ← Back
                    </button>
                    <h4 className="eval-detail__title" style={{ marginTop: '0.25rem' }}>
                        Run {run.run_id.slice(0, 12)}…
                    </h4>
                    <p className="eval-detail__sub">
                        Started {formatDate(run.started_at)} · {run.triggered_via} · triggered by {run.triggered_by}
                    </p>
                    {run.notes && (
                        <p className="eval-detail__sub" style={{ marginTop: '0.25rem' }}>
                            <strong>Notes:</strong> {run.notes}
                        </p>
                    )}
                </div>
                <div className="eval-detail__actions">
                    <Badge type={statusBadgeType(run.status)}>{statusLabel(run.status)}</Badge>
                    {run.pinned && <Badge type="success">Pinned</Badge>}
                    {inProgress && (
                        <>
                            <Button mode="secondary" icon="refresh" onClick={() => fetchRun(false)}>
                                Refresh
                            </Button>
                            {canManage && (
                                <Button
                                    mode="secondary"
                                    icon="close"
                                    disabled={aborting}
                                    onClick={handleAbort}
                                >
                                    Abort
                                </Button>
                            )}
                        </>
                    )}
                    {!inProgress && (
                        <>
                            {onDiff && (
                                <Button mode="secondary" icon={'connection-on' as any} onClick={() => onDiff(run)}>
                                    Compare runs
                                </Button>
                            )}
                            {canManage && onSetBaseline && (
                                <Button mode="primary" icon={'bookmark-add' as any} onClick={() => onSetBaseline(run)}>
                                    Set as baseline
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {error && (
                <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                    {error}
                </Notification>
            )}
            {inProgress && (
                <Notification type="neutral" icon="alert-info" defaultOpen>
                    Polling for updates every {POLL_INTERVAL_MS / 1000}s — {run.cases_completed} of {run.cases_total} cases done ({progressPct}%).
                </Notification>
            )}
            {run.status === 'failed' && run.error_message && (
                <Notification type="error" defaultOpen>
                    Run failed: {run.error_message}
                </Notification>
            )}

            <div className="eval-run-summary">
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Cases total</span>
                    <span className="eval-run-summary__value">{run.cases_total}</span>
                </div>
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Completed</span>
                    <span className="eval-run-summary__value">{run.cases_completed}</span>
                </div>
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Errored</span>
                    <span className="eval-run-summary__value">{run.cases_errored}</span>
                </div>
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Total cost</span>
                    <span className="eval-run-summary__value">{formatCost(run.total_cost_usd)}</span>
                </div>
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Duration</span>
                    <span className="eval-run-summary__value">
                        {formatRelativeDuration(run.started_at, run.finished_at)}
                    </span>
                </div>
                <div className="eval-run-summary__cell">
                    <span className="eval-run-summary__label">Judge LLM</span>
                    <span className="eval-run-summary__value" style={{ fontSize: '0.875rem' }}>
                        {run.judge_llm_used}
                    </span>
                </div>
            </div>

            {aggregateEntries.length > 0 && (
                <div>
                    <h6 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Aggregate scores</h6>
                    <div className="eval-metric-grid">
                        {aggregateEntries.map(([metric, value]) => {
                            const threshold = thresholds[metric];
                            const pass = threshold != null
                                ? metricPasses(metric, value, threshold)
                                : null;
                            const className = pass == null
                                ? 'eval-metric-card'
                                : pass
                                    ? 'eval-metric-card eval-metric-card--pass'
                                    : 'eval-metric-card eval-metric-card--fail';
                            return (
                                <div key={metric} className={className}>
                                    <span className="eval-metric-card__name">{prettyMetricName(metric)}</span>
                                    <span className="eval-metric-card__value">
                                        {formatMetricValue(metric, value)}
                                    </span>
                                    {threshold != null && (
                                        <span className="eval-metric-card__hint">
                                            Threshold {formatMetricValue(metric, threshold)} —{' '}
                                            {pass ? 'pass' : 'fail'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {Object.keys(run.cases_skipped_per_metric ?? {}).length > 0 && (
                <Tile background="floating">
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Cases skipped per metric
                    </strong>
                    <div className="eval-dataset-card__chips">
                        {Object.entries(run.cases_skipped_per_metric).map(([metric, count]) => (
                            <Chip key={metric} label={`${prettyMetricName(metric)}: ${count}`} />
                        ))}
                    </div>
                </Tile>
            )}

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h6 style={{ margin: 0, fontWeight: 700 }}>Per-case results</h6>
                    <Button
                        mode="tertiary"
                        icon="refresh"
                        disabled={loadingResults || inProgress}
                        onClick={fetchResults}
                    >
                        Refresh
                    </Button>
                </div>

                {inProgress && results.length === 0 && (
                    <p className="eval-muted" style={{ marginTop: '0.5rem' }}>
                        Per-case results appear once the run completes.
                    </p>
                )}

                {!inProgress && loadingResults && (
                    <div className="eval-loading">
                        <ActivityIndicator />
                        <span>Loading results…</span>
                    </div>
                )}

                {!inProgress && !loadingResults && results.length === 0 && (
                    <p className="eval-muted" style={{ marginTop: '0.5rem' }}>
                        No per-case results available. Results are retained for 90 days unless the run is pinned.
                    </p>
                )}

                {results.length > 0 && (
                    <div className="eval-table-shell" style={{ marginTop: '0.5rem' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell header>Case</TableCell>
                                    <TableCell header>Status</TableCell>
                                    <TableCell header>Latency</TableCell>
                                    <TableCell header>Cost</TableCell>
                                    <TableCell header>Retries</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result) => (
                                    <TableRow key={result.result_id}>
                                        <TableCell>
                                            <Accordion
                                                headline={
                                                    <span style={{ fontWeight: 600 }}>
                                                        {result.case_id.slice(0, 12)}…
                                                    </span>
                                                }
                                            >
                                                <CaseResultCard result={result} thresholds={thresholds} />
                                            </Accordion>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                type={
                                                    result.status === 'completed'
                                                        ? 'success'
                                                        : result.status === 'error' || result.status === 'timeout'
                                                            ? 'error'
                                                            : 'warning'
                                                }
                                            >
                                                {result.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatLatency(result.latency_ms)}</TableCell>
                                        <TableCell>{formatCost(result.cost_usd)}</TableCell>
                                        <TableCell>{result.retry_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

interface CaseResultCardProps {
    result: EvalCaseResult;
    thresholds: Record<string, number>;
}

const CaseResultCard: React.FC<CaseResultCardProps> = ({ result, thresholds }) => {
    const metricEntries = Object.entries(result.metrics ?? {});
    const skipEntries = Object.entries(result.skip_reasons ?? {});

    return (
        <div className="eval-case-result-card">
            {result.error_message && (
                <Notification type="error" defaultOpen>
                    {result.error_message}
                </Notification>
            )}

            <dl className="eval-case-result-card__row">
                <dt>Predicted answer</dt>
                <dd>{result.predicted_answer ?? '—'}</dd>
            </dl>

            {metricEntries.length > 0 && (
                <div className="eval-metric-grid">
                    {metricEntries.map(([metric, value]) => {
                        const threshold = thresholds[metric];
                        const pass = threshold != null && value != null
                            ? metricPasses(metric, value, threshold)
                            : null;
                        const className = pass == null
                            ? 'eval-metric-card'
                            : pass
                                ? 'eval-metric-card eval-metric-card--pass'
                                : 'eval-metric-card eval-metric-card--fail';
                        return (
                            <div key={metric} className={className}>
                                <span className="eval-metric-card__name">
                                    {prettyMetricName(metric)}
                                </span>
                                <span className="eval-metric-card__value">
                                    {formatMetricValue(metric, value)}
                                </span>
                                {threshold != null && value != null && (
                                    <span className="eval-metric-card__hint">
                                        {pass ? 'pass' : 'fail'} · threshold {formatMetricValue(metric, threshold)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {skipEntries.length > 0 && (
                <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Skipped metrics</strong>
                    <div className="eval-dataset-card__chips">
                        {skipEntries.map(([metric, reason]) => (
                            <Chip key={metric} label={`${prettyMetricName(metric)}: ${reason}`} />
                        ))}
                    </div>
                </div>
            )}

            {result.retrieved_chunks?.length > 0 && (
                <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Retrieved chunks</strong>
                    <div className="eval-chunk-list">
                        {result.retrieved_chunks.map((chunk) => (
                            <div className="eval-chunk-item" key={chunk.chunk_id}>
                                <div className="eval-chunk-item__head">
                                    <span>{chunk.source}</span>
                                    {chunk.score != null && <span>score {chunk.score.toFixed(3)}</span>}
                                </div>
                                <div className="eval-chunk-item__content">{chunk.content}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RunDetail;
