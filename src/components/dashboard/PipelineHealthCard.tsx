import React from 'react';
import { Tile } from '@bosch/react-frok';
import type { PipelineHealthResponse } from '../../types';
import { formatCompactNumber, formatLatency } from './formatters';

interface PipelineHealthCardProps {
    data: PipelineHealthResponse;
}

interface MetricProps {
    label: string;
    value: string;
    color?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>{label}</span>
        <span
            style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                lineHeight: 1.1,
                color: color ?? 'var(--app-text)',
            }}
        >
            {value}
        </span>
    </div>
);

export const PipelineHealthCard: React.FC<PipelineHealthCardProps> = ({ data }) => {
    const isEmpty = data.total_queries === 0;
    const errorPct = data.error_rate * 100;
    const errorColor =
        data.error_rate === 0
            ? 'var(--app-success)'
            : data.error_rate < 0.05
                ? 'var(--app-warning)'
                : 'var(--app-error)';

    return (
        <Tile
            style={{
                padding: '1.5rem',
                border: '1px solid var(--app-border)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    gap: '1rem',
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600 }}>
                        Pipeline health
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            marginTop: '0.25rem',
                            fontSize: '0.8125rem',
                            color: 'var(--app-text-secondary)',
                        }}
                    >
                        Last {data.window_hours} hours
                    </p>
                </div>
            </div>

            {isEmpty ? (
                <div
                    style={{
                        padding: '1rem 0',
                        color: 'var(--app-text-secondary)',
                        fontSize: '0.875rem',
                    }}
                >
                    No activity yet.
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    <Metric label="Queries" value={formatCompactNumber(data.total_queries)} />
                    <Metric
                        label="Success"
                        value={formatCompactNumber(data.successful_queries)}
                        color="var(--app-success)"
                    />
                    <Metric
                        label="Errors"
                        value={`${formatCompactNumber(data.failed_queries)} (${errorPct.toFixed(2)}%)`}
                        color={errorColor}
                    />
                    <Metric label="Avg latency" value={formatLatency(data.avg_latency_ms)} />
                    <Metric label="p50" value={formatLatency(data.p50_latency_ms)} />
                    <Metric label="p95" value={formatLatency(data.p95_latency_ms)} />
                </div>
            )}
        </Tile>
    );
};
