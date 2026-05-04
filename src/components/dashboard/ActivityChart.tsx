import React, { useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Tile } from '@bosch/react-frok';
import type { DashboardActivityResponse } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ensureChartJsRegistered, resolveCssVar } from './chartSetup';
import { formatCompactNumber } from './formatters';

ensureChartJsRegistered();

type Series = 'sessions' | 'messages' | 'tokens' | 'requests';

const SERIES_META: Record<Series, { label: string; cssVar: string; fallback: string }> = {
    sessions: { label: 'Sessions', cssVar: '--g-blue-50', fallback: '#007bc0' },
    messages: { label: 'Messages', cssVar: '--g-green-50', fallback: '#00884a' },
    tokens: { label: 'Tokens', cssVar: '--g-violet-50', fallback: '#9b51e0' },
    requests: { label: 'Requests', cssVar: '--g-yellow-85', fallback: '#f59e0b' },
};

interface ActivityChartProps {
    data: DashboardActivityResponse;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const { mode } = useTheme();
    // Track theme so colors recompute when the user toggles dark mode.
    const themeKey = useRef(mode);
    useEffect(() => {
        themeKey.current = mode;
    }, [mode]);

    const formatLabel = (iso: string): string => {
        const d = new Date(iso);
        if (data.granularity === 'hour') {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const chartData = useMemo(() => {
        const labels = data.points.map((p) => formatLabel(p.timestamp));
        const series: Series[] = ['sessions', 'messages', 'tokens', 'requests'];

        return {
            labels,
            datasets: series.map((key) => {
                const meta = SERIES_META[key];
                const color = resolveCssVar(meta.cssVar, meta.fallback);
                // Tokens dwarf the other counts — give them a secondary axis.
                const yAxisID = key === 'tokens' ? 'yTokens' : 'yCounts';
                return {
                    label: meta.label,
                    data: data.points.map((p) => p[key]),
                    borderColor: color,
                    backgroundColor: color + '33',
                    fill: false,
                    tension: 0.3,
                    pointRadius: data.points.length > 30 ? 0 : 2,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                    yAxisID,
                };
            }),
        };
        // mode is intentionally a dep so colors re-resolve on theme change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, mode]);

    const options: ChartOptions<'line'> = useMemo(() => {
        const textColor = resolveCssVar('--app-text', mode === 'dark' ? '#eff1f2' : '#101112');
        const gridColor = resolveCssVar(
            '--app-border',
            mode === 'dark' ? '#43464a' : '#c1c7cc'
        );
        const mutedColor = resolveCssVar(
            '--app-text-secondary',
            mode === 'dark' ? '#8a9097' : '#71767c'
        );

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, usePointStyle: true, padding: 16 },
                },
                tooltip: {
                    backgroundColor: mode === 'dark' ? '#1a1c1d' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) =>
                            `${ctx.dataset.label}: ${formatCompactNumber(ctx.parsed.y ?? 0)}`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: mutedColor, maxRotation: 0, autoSkipPadding: 16 },
                    grid: { color: 'transparent' },
                },
                yCounts: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: mutedColor,
                        callback: (v) => formatCompactNumber(Number(v)),
                    },
                    grid: { color: gridColor },
                    beginAtZero: true,
                },
                yTokens: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: mutedColor,
                        callback: (v) => formatCompactNumber(Number(v)),
                    },
                    grid: { display: false },
                    beginAtZero: true,
                },
            },
        };
    }, [mode]);

    return (
        <Tile
            style={{
                padding: '1.5rem',
                border: '1px solid var(--app-border)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600 }}>
                    Activity over time
                </h3>
                <p
                    style={{
                        margin: 0,
                        marginTop: '0.25rem',
                        fontSize: '0.8125rem',
                        color: 'var(--app-text-secondary)',
                    }}
                >
                    {data.granularity === 'hour' ? 'Hourly' : 'Daily'} sessions, messages, tokens,
                    and requests for the selected range.
                </p>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: 280 }}>
                <Line data={chartData} options={options} />
            </div>
        </Tile>
    );
};
