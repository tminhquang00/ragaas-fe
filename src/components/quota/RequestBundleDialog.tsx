import React, { useState, useEffect } from 'react';
import { Dialog, Notification, TextArea, RadioButton } from '@bosch/react-frok';
import { useAuth } from '../../context';
import { BundleSize } from '../../types';

interface RequestBundleDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
}

const BUNDLE_OPTIONS: { size: BundleSize; label: string; description: string; recommended?: boolean }[] = [
    { size: 500, label: '500 requests', description: 'Small — quick experiments, prototyping' },
    { size: 1000, label: '1,000 requests', description: 'Standard — production workloads', recommended: true },
    { size: 2500, label: '2,500 requests', description: 'Large — high-volume or batch usage' },
];

export const RequestBundleDialog: React.FC<RequestBundleDialogProps> = ({ open, onClose, projectId }) => {
    const { apiClient } = useAuth();
    const [bundleSize, setBundleSize] = useState<BundleSize>(1000);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!open) {
            setBundleSize(1000);
            setMessage('');
            setError('');
            setSuccess(false);
            setLoading(false);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!apiClient) return;
        setLoading(true);
        setError('');
        try {
            await apiClient.requestExtraBundle(projectId, bundleSize, message.trim() || undefined);
            setSuccess(true);
            setTimeout(() => onClose(), 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            title="Request Extra Quota Bundle"
            modal
            open={open}
            onClose={onClose}
            onConfirm={success ? onClose : handleSubmit}
            onCancel={onClose}
            confirmLabel={loading ? 'Submitting…' : success ? 'Done' : 'Submit Request'}
            cancelLabel="Cancel"
            confirmButton={{ disabled: loading || success }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '400px' }}>
                {success && (
                    <Notification type="success" defaultOpen>
                        Request submitted — an admin will review it shortly.
                    </Notification>
                )}

                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}

                {!success && (
                    <>
                        <div>
                            <p style={{ color: 'var(--app-text-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                                Choose a bundle size to request from the admin team:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {BUNDLE_OPTIONS.map(({ size, label, description, recommended }) => (
                                    <div
                                        key={size}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            border: `1px solid ${bundleSize === size ? 'var(--app-primary)' : 'var(--app-border)'}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            background: bundleSize === size ? 'var(--supergraphic-primary)' : 'transparent',
                                            transition: 'border-color 0.15s, background 0.15s',
                                        }}
                                        onClick={() => setBundleSize(size)}
                                    >
                                        <RadioButton
                                            id={`bundle-${size}`}
                                            name="bundle-size"
                                            value={String(size)}
                                            checked={bundleSize === size}
                                            onChange={() => setBundleSize(size)}
                                        >
                                            <span style={{ fontWeight: 600 }}>{label}</span>
                                            {recommended && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--app-primary)',
                                                    fontWeight: 600,
                                                }}>
                                                    Recommended
                                                </span>
                                            )}
                                            <span style={{
                                                display: 'block',
                                                fontSize: '0.8125rem',
                                                color: 'var(--app-text-secondary)',
                                                marginTop: '0.125rem',
                                            }}>
                                                {description}
                                            </span>
                                        </RadioButton>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TextArea
                            id="request-bundle-note"
                            label="Note to admin (optional)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe why you need extra capacity…"
                            rows={3}
                            maxLength={500}
                        />
                        {message.length > 0 && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', marginTop: '-1rem' }}>
                                {message.length} / 500
                            </p>
                        )}
                    </>
                )}
            </div>
        </Dialog>
    );
};
