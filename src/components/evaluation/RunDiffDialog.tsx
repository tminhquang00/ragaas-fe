import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Badge,
    Dialog,
    Dropdown,
    Notification,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { EvalDataset, EvalRun, EvalRunDiff } from '../../types';
import {
    deltaDirection,
    formatMetricValue,
    prettyMetricName,
    statusBadgeType,
    statusLabel,
} from './evalFormat';

interface RunDiffDialogProps {
    open: boolean;
    projectId: string;
    apiClient: RAGaaSClient;
    dataset: EvalDataset | null;
    candidateRun: EvalRun | null;
    runs: EvalRun[];
    onOpenChange: (open: boolean) => void;
}

const readDropdownValue = (valueOrEvent: unknown): string => {
    if (typeof valueOrEvent === 'string') return valueOrEvent;
    const maybeEvent = valueOrEvent as { target?: { value?: string } };
    return maybeEvent.target?.value ?? '';
};

export const RunDiffDialog: React.FC<RunDiffDialogProps> = ({
    open,
    projectId,
    apiClient,
    dataset,
    candidateRun,
    runs,
    onOpenChange,
}) => {
    const [baselineId, setBaselineId] = useState<string>('');
    const [candidateId, setCandidateId] = useState<string>('');
    const [diff, setDiff] = useState<EvalRunDiff | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const completedRuns = useMemo(
        () => runs.filter((run) => run.status === 'completed'),
        [runs]
    );

    useEffect(() => {
        if (!open) return;
        const defaultBaseline = dataset?.baseline_run_id || completedRuns[0]?.run_id || '';
        const defaultCandidate = candidateRun?.run_id || completedRuns[0]?.run_id || '';
        setBaselineId(defaultBaseline);
        setCandidateId(defaultCandidate);
        setDiff(null);
        setError('');
    }, [open, dataset, candidateRun, completedRuns]);

    useEffect(() => {
        if (!open) return;
        if (!baselineId || !candidateId || baselineId === candidateId) {
            setDiff(null);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const result = await apiClient.diffEvalRuns(projectId, baselineId, candidateId);
                if (!cancelled) setDiff(result);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load diff');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, projectId, apiClient, baselineId, candidateId]);

    const runOptions = useMemo(
        () =>
            completedRuns.map((run) => ({
                value: run.run_id,
                name: `${run.run_id.slice(0, 12)}… · ${new Date(run.started_at).toLocaleString()}`,
            })),
        [completedRuns]
    );

    const allMetrics = useMemo(() => {
        if (!diff) return [] as string[];
        const set = new Set<string>([
            ...Object.keys(diff.metric_deltas ?? {}),
            ...Object.keys(diff.run_a.aggregate_scores ?? {}),
            ...Object.keys(diff.run_b.aggregate_scores ?? {}),
        ]);
        return Array.from(set).sort();
    }, [diff]);

    return (
        <Dialog
            title="Compare Evaluation Runs"
            modal
            open={open}
            onClose={() => onOpenChange(false)}
            cancelLabel="Close"
            onCancel={() => onOpenChange(false)}
            confirmLabel="Done"
            onConfirm={() => onOpenChange(false)}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '600px' }}>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}
                {completedRuns.length < 2 && (
                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        At least two completed runs are required to compute a diff.
                    </Notification>
                )}

                <div className="eval-diff-grid">
                    <div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Run A (baseline)</strong>
                        <Dropdown
                            label="Baseline run"
                            value={baselineId}
                            options={runOptions}
                            disabled={loading || completedRuns.length === 0}
                            onChange={(v) => setBaselineId(readDropdownValue(v))}
                        />
                        {diff?.run_a && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <Badge type={statusBadgeType(diff.run_a.status)}>
                                    {statusLabel(diff.run_a.status)}
                                </Badge>
                                <p className="eval-muted" style={{ marginTop: '0.25rem' }}>
                                    {new Date(diff.run_a.started_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Run B (candidate)</strong>
                        <Dropdown
                            label="Candidate run"
                            value={candidateId}
                            options={runOptions}
                            disabled={loading || completedRuns.length === 0}
                            onChange={(v) => setCandidateId(readDropdownValue(v))}
                        />
                        {diff?.run_b && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <Badge type={statusBadgeType(diff.run_b.status)}>
                                    {statusLabel(diff.run_b.status)}
                                </Badge>
                                <p className="eval-muted" style={{ marginTop: '0.25rem' }}>
                                    {new Date(diff.run_b.started_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="eval-loading">
                        <ActivityIndicator />
                        <span>Loading diff…</span>
                    </div>
                )}

                {diff && allMetrics.length > 0 && (
                    <div>
                        <div className="eval-diff-row eval-diff-row--head">
                            <span>Metric</span>
                            <span>Run A</span>
                            <span>Run B</span>
                            <span>Delta</span>
                        </div>
                        {allMetrics.map((metric) => {
                            const valueA = diff.run_a.aggregate_scores?.[metric];
                            const valueB = diff.run_b.aggregate_scores?.[metric];
                            const delta = diff.metric_deltas?.[metric];
                            const direction = delta != null
                                ? deltaDirection(metric, delta)
                                : 'neutral';
                            const deltaClass =
                                direction === 'up'
                                    ? 'eval-diff-delta--up'
                                    : direction === 'down'
                                        ? 'eval-diff-delta--down'
                                        : 'eval-diff-delta--neutral';
                            return (
                                <div className="eval-diff-row" key={metric}>
                                    <span>{prettyMetricName(metric)}</span>
                                    <span>{formatMetricValue(metric, valueA)}</span>
                                    <span>{formatMetricValue(metric, valueB)}</span>
                                    <span className={deltaClass}>
                                        {delta == null
                                            ? '—'
                                            : `${delta > 0 ? '+' : ''}${formatMetricValue(metric, delta)}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {diff && allMetrics.length === 0 && (
                    <p className="eval-muted">No comparable metrics between these runs.</p>
                )}
            </div>
        </Dialog>
    );
};

export default RunDiffDialog;
