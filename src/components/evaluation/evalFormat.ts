import { EvalRunStatus, LOWER_IS_BETTER_METRICS } from '../../types';

export const formatDate = (value?: string | null): string => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

export const formatRelativeDuration = (startedAt?: string | null, finishedAt?: string | null): string => {
    if (!startedAt) return 'n/a';
    const start = new Date(startedAt).getTime();
    if (Number.isNaN(start)) return 'n/a';
    const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
    if (Number.isNaN(end)) return 'n/a';
    const ms = Math.max(0, end - start);
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.round(seconds - minutes * 60);
    return `${minutes}m ${remSeconds}s`;
};

export const formatLatency = (latencyMs: number | null | undefined): string => {
    if (latencyMs == null || !Number.isFinite(latencyMs)) return 'n/a';
    if (latencyMs >= 1000) return `${(latencyMs / 1000).toFixed(2)}s`;
    return `${Math.round(latencyMs)}ms`;
};

export const formatCost = (cost: number | null | undefined): string => {
    if (cost == null || !Number.isFinite(cost)) return '—';
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
};

export const formatMetricValue = (metric: string, value: number | null | undefined): string => {
    if (value == null || !Number.isFinite(value)) return '—';
    if (metric.endsWith('_ms')) return formatLatency(value);
    if (metric === 'cost_usd') return formatCost(value);
    if (metric === 'error_rate') return `${(value * 100).toFixed(1)}%`;
    if (Math.abs(value) <= 1) return value.toFixed(3);
    return value.toFixed(2);
};

/** Pretty metric names: snake_case → Title Case. */
export const prettyMetricName = (metric: string): string =>
    metric
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export type RunStatusBadgeType = 'success' | 'error' | 'warning' | undefined;

export const statusBadgeType = (status: EvalRunStatus): RunStatusBadgeType => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'failed':
            return 'error';
        case 'aborted':
            return 'warning';
        case 'running':
        case 'queued':
        default:
            return undefined;
    }
};

export const statusLabel = (status: EvalRunStatus): string =>
    status.charAt(0).toUpperCase() + status.slice(1);

/**
 * Direction marker for a metric delta.
 *  - "up"      = run_b improved over run_a
 *  - "down"    = run_b regressed
 *  - "neutral" = no meaningful change
 */
export const deltaDirection = (
    metric: string,
    delta: number
): 'up' | 'down' | 'neutral' => {
    if (Math.abs(delta) < 1e-9) return 'neutral';
    const lowerIsBetter = LOWER_IS_BETTER_METRICS.has(metric);
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    return improved ? 'up' : 'down';
};
