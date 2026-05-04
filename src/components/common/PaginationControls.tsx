import React from 'react';
import { PageIndicator } from '@bosch/react-frok';

interface PaginationControlsProps {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    label?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    page,
    pageSize,
    total,
    onPageChange,
    disabled = false,
    label = 'items',
}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (total <= pageSize) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginTop: '1rem',
                flexWrap: 'wrap',
            }}
        >
            <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                Showing {start}-{end} of {total} {label}
            </span>
            <div style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : undefined }}>
                <PageIndicator
                    pages={totalPages}
                    numbered
                    disabled={disabled}
                    selected={Math.min(page, totalPages)}
                    onPageSelect={(event) => {
                        const nextPage = Number(event.currentTarget.dataset.index);
                        if (Number.isFinite(nextPage) && nextPage >= 1) {
                            onPageChange(nextPage);
                        }
                    }}
                />
            </div>
        </div>
    );
};
