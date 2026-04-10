import React from 'react';
import { Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

interface QuotaBannerProps {
    isOwner: boolean;
    onClose: () => void;
    onRequestBundle: () => void;
}

export const QuotaBanner: React.FC<QuotaBannerProps> = ({ isOwner, onClose, onRequestBundle }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                marginBottom: '1rem',
                background: 'color-mix(in srgb, var(--g-yellow-50, #f5a623) 12%, var(--app-bg-surface, #eff1f2))',
                border: '1px solid var(--g-yellow-50, #f5a623)',
                borderRadius: '4px',
            }}
        >
            <FrokIcon name="Warning" style={{ color: 'var(--g-yellow-50, #f5a623)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9375rem' }}>Chat quota exhausted</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                    This project has used all its available requests. Monthly credits are added automatically each calendar month.
                </p>
                {isOwner && (
                    <div style={{ marginTop: '0.625rem' }}>
                        <Button mode="tertiary" onClick={onRequestBundle}>
                            Request Extra Bundle
                        </Button>
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    color: 'var(--app-text-secondary)',
                    flexShrink: 0,
                }}
            >
                <FrokIcon name="Close" />
            </button>
        </div>
    );
};
