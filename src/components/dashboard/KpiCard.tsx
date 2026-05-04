import React from 'react';
import { Tile } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { formatDeltaPct, formatSignedInt } from './formatters';

interface KpiCardProps {
    title: string;
    value: string;
    icon: string;
    iconColor: string;
    /** Signed numeric delta (count) — if provided, shown as "+12 vs prev" */
    delta?: number;
    /** Signed percentage delta in [-1, +∞) — if provided, shown as "+18.4%" */
    deltaPct?: number;
    /** Sub-label under the delta, e.g. "vs previous 30 days" */
    deltaLabel?: string;
    onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    icon,
    iconColor,
    delta,
    deltaPct,
    deltaLabel,
    onClick,
}) => {
    const deltaSource = deltaPct ?? delta;
    const deltaPositive = deltaSource != null && deltaSource > 0;
    const deltaNegative = deltaSource != null && deltaSource < 0;
    const deltaColor = deltaPositive
        ? 'var(--app-success)'
        : deltaNegative
            ? 'var(--app-error)'
            : 'var(--app-text-secondary)';

    return (
        <Tile
            onClick={onClick}
            style={{
                padding: '1.5rem',
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 0.2s ease',
                border: '1px solid var(--app-border)',
                minHeight: 140,
            }}
            onMouseEnter={(e) => {
                if (onClick) e.currentTarget.style.borderColor = 'var(--app-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--app-border)';
            }}
        >
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <div
                    style={{
                        width: 56,
                        height: 56,
                        background: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    <FrokIcon name={icon} style={{ fontSize: '1.5rem', color: 'white' }} />
                </div>
            </div>
            <div>
                <p
                    style={{
                        margin: 0,
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        color: 'var(--app-text-secondary)',
                    }}
                >
                    {title}
                </p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>
                    {value}
                </p>
                {deltaSource != null && (
                    <div
                        style={{
                            marginTop: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8125rem',
                        }}
                    >
                        <span style={{ color: deltaColor, fontWeight: 600 }}>
                            {deltaPct != null
                                ? formatDeltaPct(deltaPct)
                                : formatSignedInt(delta as number)}
                        </span>
                        {deltaLabel && (
                            <span style={{ color: 'var(--app-text-secondary)' }}>{deltaLabel}</span>
                        )}
                    </div>
                )}
            </div>
        </Tile>
    );
};
