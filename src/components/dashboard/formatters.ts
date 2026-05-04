// Display formatters shared across dashboard components.

const COMPACT_NUMBER = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const FULL_NUMBER = new Intl.NumberFormat('en-US');

const PCT = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
});

export function formatCompactNumber(value: number): string {
    if (!Number.isFinite(value)) return '—';
    if (Math.abs(value) < 1000) return FULL_NUMBER.format(value);
    return COMPACT_NUMBER.format(value);
}

export function formatFullNumber(value: number): string {
    if (!Number.isFinite(value)) return '—';
    return FULL_NUMBER.format(value);
}

export function formatDeltaPct(pct: number): string {
    if (!Number.isFinite(pct)) return '—';
    return PCT.format(pct);
}

export function formatSignedInt(value: number): string {
    if (!Number.isFinite(value)) return '—';
    if (value === 0) return '0';
    return (value > 0 ? '+' : '') + FULL_NUMBER.format(value);
}

export function formatRelativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const sec = Math.round(diffMs / 1000);
    if (sec < 60) return 'just now';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const days = Math.round(hr / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.round(days / 7)}w ago`;
    return new Date(iso).toLocaleDateString();
}

export function formatLatency(ms: number | null): string {
    if (ms == null || !Number.isFinite(ms)) return '—';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}

const TOKEN_METRIC: Record<string, (v: number) => string> = {
    sessions: formatCompactNumber,
    messages: formatCompactNumber,
    tokens: formatCompactNumber,
    requests: formatCompactNumber,
};

export function formatMetric(metric: string, value: number): string {
    const fn = TOKEN_METRIC[metric] ?? formatCompactNumber;
    return fn(value);
}
