import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Tile, Chip } from '@bosch/react-frok';
import type { TopProjectsMetric, TopProjectsResponse } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ensureChartJsRegistered, resolveCssVar } from './chartSetup';
import { formatCompactNumber } from './formatters';

ensureChartJsRegistered();

const METRIC_OPTIONS: { id: TopProjectsMetric; label: string }[] = [
    { id: 'sessions', label: 'Sessions' },
    { id: 'messages', label: 'Messages' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'requests', label: 'Requests' },
];

interface TopProjectsChartProps {
    data: TopProjectsResponse;
    metric: TopProjectsMetric;
    onMetricChange: (metric: TopProjectsMetric) => void;
    onProjectClick?: (projectId: string) => void;
}

export const TopProjectsChart: React.FC<TopProjectsChartProps> = ({
    data,
    metric,
    onMetricChange,
    onProjectClick,
}) => {
    const { mode } = useTheme();

    const chartData = useMemo(() => {
        const color = resolveCssVar('--g-blue-50', '#007bc0');
        return {
            labels: data.projects.map((p) => p.name),
            datasets: [
                {
                    label: metric,
                    data: data.projects.map((p) => p.value),
                    backgroundColor: color,
                    borderRadius: 4,
                    barThickness: 18,
                },
            ],
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, metric, mode]);

    const options: ChartOptions<'bar'> = useMemo(() => {
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
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: mode === 'dark' ? '#1a1c1d' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            const project = data.projects[ctx.dataIndex];
                            const share = (project.share_of_total * 100).toFixed(1);
                            return `${formatCompactNumber(ctx.parsed.x ?? 0)}  •  ${share}%`;
                        },
                    },
                },
            },
            onClick: (_evt, elements) => {
                if (!onProjectClick || elements.length === 0) return;
                const idx = elements[0].index;
                const project = data.projects[idx];
                if (project) onProjectClick(project.project_id);
            },
            scales: {
                x: {
                    ticks: {
                        color: mutedColor,
                        callback: (v) => formatCompactNumber(Number(v)),
                    },
                    grid: { color: gridColor },
                    beginAtZero: true,
                },
                y: {
                    ticks: { color: textColor, autoSkip: false },
                    grid: { color: 'transparent' },
                },
            },
        };
    }, [data, mode, onProjectClick]);

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
                    Top projects
                </h3>
                <p
                    style={{
                        margin: 0,
                        marginTop: '0.25rem',
                        marginBottom: '0.75rem',
                        fontSize: '0.8125rem',
                        color: 'var(--app-text-secondary)',
                    }}
                >
                    Ranked by selected metric. Click a bar to open the project.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {METRIC_OPTIONS.map((opt) => (
                        <Chip
                            key={opt.id}
                            label={opt.label}
                            selected={metric === opt.id}
                            onClick={() => onMetricChange(opt.id)}
                        />
                    ))}
                </div>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: 280 }}>
                {data.projects.length === 0 ? (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--app-text-secondary)',
                            fontSize: '0.875rem',
                        }}
                    >
                        No project activity in this range yet.
                    </div>
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>
        </Tile>
    );
};
