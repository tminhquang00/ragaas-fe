import React, { useState, useEffect, useCallback } from 'react';
import { Tile, Button, Notification, ActivityIndicator } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { useAuth } from '../../context';
import { QuotaStatus } from '../../types';
import { RequestBundleDialog } from './RequestBundleDialog';

interface QuotaStatusWidgetProps {
    projectId: string;
    isOwner: boolean;
}

function getNextRefillDate(lastMonthlyCredit: string | null): string {
    const base = lastMonthlyCredit ? new Date(lastMonthlyCredit) : new Date();
    const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    return next.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export const QuotaStatusWidget: React.FC<QuotaStatusWidgetProps> = ({ projectId, isOwner }) => {
    const { apiClient } = useAuth();
    const [quota, setQuota] = useState<QuotaStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchQuota = useCallback(async () => {
        if (!apiClient) return;
        try {
            setLoading(true);
            const status = await apiClient.getQuotaStatus(projectId);
            setQuota(status);
            setFetchError('');
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Failed to load quota');
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        fetchQuota();
    }, [fetchQuota]);

    const usagePct = quota ? Math.min(Math.round((quota.used_count / quota.total_allocated) * 100), 100) : 0;
    const isExhausted = quota ? quota.remaining === 0 : false;
    const isLow = quota ? quota.remaining > 0 && quota.remaining < 50 : false;

    let progressColor = 'var(--g-green-50)';
    if (isExhausted) progressColor = 'var(--bosch-red-50)';
    else if (usagePct >= 80) progressColor = 'var(--g-yellow-50)';

    return (
        <>
            <Tile background="floating" className="overview-card overview-card--wide">
                <div className="overview-card-header">
                    <FrokIcon name="DataUsage" className="overview-card-icon" />
                    <h6 className="overview-card-title">Quota Usage</h6>
                    {!loading && (
                        <Button
                            mode="integrated"
                            icon="refresh"
                            aria-label="Refresh quota"
                            onClick={fetchQuota}
                            style={{ marginLeft: 'auto' }}
                        />
                    )}
                </div>

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                        <ActivityIndicator />
                    </div>
                )}

                {!loading && fetchError && (
                    <p style={{ color: 'var(--bosch-red-50)', fontSize: '0.875rem' }}>{fetchError}</p>
                )}

                {!loading && quota && (
                    <div className="overview-card-content">
                        {isExhausted && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <Notification type="warning" defaultOpen>
                                    Quota exhausted — chat responses are unavailable until the next monthly credit.
                                </Notification>
                            </div>
                        )}
                        {isLow && !isExhausted && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <Notification type="neutral" icon="alert-warning" defaultOpen>
                                    Running low — only {quota.remaining} requests remaining.
                                </Notification>
                            </div>
                        )}

                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--app-text-secondary)' }}>Used</span>
                                <span style={{ fontWeight: 600 }}>
                                    {quota.used_count.toLocaleString()} / {quota.total_allocated.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--app-border)', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${usagePct}%`,
                                        background: progressColor,
                                        borderRadius: '3px',
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="overview-stat-row">
                            <span className="overview-stat-label">Remaining</span>
                            <span
                                className="overview-stat-value overview-stat-highlight"
                                style={{ color: isExhausted ? 'var(--bosch-red-50)' : isLow ? 'var(--g-yellow-50)' : undefined }}
                            >
                                {quota.remaining.toLocaleString()}
                            </span>
                        </div>

                        <div className="overview-stat-row">
                            <span className="overview-stat-label">Next monthly refill</span>
                            <span className="overview-stat-value">
                                {getNextRefillDate(quota.last_monthly_credit)}
                            </span>
                        </div>

                        <div className="overview-stat-row">
                            <span className="overview-stat-label">Credits received</span>
                            <span className="overview-stat-value">{quota.months_credited} month{quota.months_credited !== 1 ? 's' : ''}</span>
                        </div>

                        {isOwner && (
                            <div style={{ marginTop: '1rem' }}>
                                <Button mode="tertiary" onClick={() => setDialogOpen(true)}>
                                    Request Extra Bundle
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Tile>

            {isOwner && (
                <RequestBundleDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    projectId={projectId}
                />
            )}
        </>
    );
};
