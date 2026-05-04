import React from 'react';
import { Chip } from '@bosch/react-frok';
import type { DashboardRange } from '../../types';

interface TimeRangeSelectorProps {
    value: DashboardRange;
    onChange: (range: DashboardRange) => void;
    disabled?: boolean;
}

const OPTIONS: { id: DashboardRange; label: string }[] = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
    value,
    onChange,
    disabled,
}) => {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {OPTIONS.map((opt) => (
                <Chip
                    key={opt.id}
                    label={opt.label}
                    selected={value === opt.id}
                    disabled={disabled}
                    onClick={() => onChange(opt.id)}
                />
            ))}
        </div>
    );
};
