import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Notification,
    Badge,
    Chip,
    ActivityIndicator,
    Dialog,
    TextArea,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    OptionBar,
    OptionBarItem,
} from '@bosch/react-frok';
import { useAuth } from '../context';
import { Project, QuotaRequest, QuotaRequestStatus } from '../types';

// ─── Admin Review Dialog ──────────────────────────────────────────────────────

interface AdminReviewDialogProps {
    open: boolean;
    action: 'approve' | 'reject';
    requestId: string;
    projectId: string;
    bundleSize: number;
    onConfirm: (note?: string) => Promise<void>;
    onCancel: () => void;
}

const AdminReviewDialog: React.FC<AdminReviewDialogProps> = ({
    open, action, projectId, bundleSize, onConfirm, onCancel,
}) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) { setNote(''); setError(''); setLoading(false); }
    }, [open]);

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            await onConfirm(note.trim() || undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            title={action === 'approve' ? `Approve +${(bundleSize ?? 0).toLocaleString()} requests` : 'Reject quota request'}
            modal
            open={open}
            onClose={onCancel}
            onConfirm={handleConfirm}
            onCancel={onCancel}
            confirmLabel={loading ? (action === 'approve' ? 'Approving…' : 'Rejecting…') : (action === 'approve' ? 'Approve' : 'Reject')}
            cancelLabel="Cancel"
            confirmButton={{ disabled: loading }}
            variant={action === 'reject' ? 'warning' : undefined}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '360px' }}>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}
                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                    {action === 'approve'
                        ? `This will credit ${(bundleSize ?? 0).toLocaleString()} extra requests to project ${projectId}.`
                        : `The user will be notified their request was rejected.`}
                </p>
                <TextArea
                    label={`Note to user (optional)`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                        action === 'approve'
                            ? 'e.g. Approved for user study. Come back if you need more.'
                            : 'e.g. Please provide more justification for this request.'
                    }
                    rows={3}
                    maxLength={500}
                />
            </div>
        </Dialog>
    );
};

// ─── Admin Page ───────────────────────────────────────────────────────────────

type RequestStatusFilter = 'all' | QuotaRequestStatus;

export const AdminPage: React.FC = () => {
    const { apiClient, isAdmin } = useAuth();

    // Projects section
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsTotal, setProjectsTotal] = useState(0);
    const [projectsPage, setProjectsPage] = useState(1);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState('');
    const PAGE_SIZE = 20;

    // Quota requests section
    const [requests, setRequests] = useState<QuotaRequest[]>([]);
    const [requestsTotal, setRequestsTotal] = useState(0);
    const [requestsPage, setRequestsPage] = useState(1);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState('');
    const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>('pending');
    const REQUESTS_PAGE_SIZE = 10;

    // Review dialog state
    const [reviewDialog, setReviewDialog] = useState<{
        open: boolean;
        action: 'approve' | 'reject';
        request: QuotaRequest;
    } | null>(null);

    const fetchProjects = useCallback(async (page: number) => {
        if (!apiClient) return;
        setProjectsLoading(true);
        setProjectsError('');
        try {
            const res = await apiClient.adminListProjects({ page, page_size: PAGE_SIZE });
            setProjects(res.projects);
            setProjectsTotal(res.total);
        } catch (err) {
            setProjectsError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setProjectsLoading(false);
        }
    }, [apiClient]);

    const fetchRequests = useCallback(async (page: number, filter: RequestStatusFilter) => {
        if (!apiClient) return;
        setRequestsLoading(true);
        setRequestsError('');
        try {
            const res = await apiClient.adminListQuotaRequests({
                page,
                page_size: REQUESTS_PAGE_SIZE,
                status: filter === 'all' ? undefined : filter,
            });
            setRequests(res.requests);
            setRequestsTotal(res.total);
        } catch (err) {
            setRequestsError(err instanceof Error ? err.message : 'Failed to load quota requests');
        } finally {
            setRequestsLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        if (isAdmin) {
            fetchProjects(projectsPage);
        }
    }, [isAdmin, projectsPage, fetchProjects]);

    useEffect(() => {
        if (isAdmin) {
            fetchRequests(requestsPage, statusFilter);
        }
    }, [isAdmin, requestsPage, statusFilter, fetchRequests]);

    const handleApprove = async (req: QuotaRequest) => {
        setReviewDialog({ open: true, action: 'approve', request: req });
    };

    const handleReject = async (req: QuotaRequest) => {
        setReviewDialog({ open: true, action: 'reject', request: req });
    };

    const handleReviewConfirm = async (note?: string) => {
        if (!reviewDialog || !apiClient) return;
        const { action, request } = reviewDialog;
        if (action === 'approve') {
            await apiClient.adminApproveQuotaRequest(request.request_id, note);
        } else {
            await apiClient.adminRejectQuotaRequest(request.request_id, note);
        }
        setReviewDialog(null);
        // Refresh both sections
        await Promise.all([
            fetchProjects(projectsPage),
            fetchRequests(requestsPage, statusFilter),
        ]);
    };

    if (!isAdmin) {
        return (
            <div style={{ padding: '2rem' }}>
                <Notification type="error" defaultOpen>
                    Access denied — you do not have admin privileges.
                </Notification>
            </div>
        );
    }

    const totalProjectPages = Math.ceil(projectsTotal / PAGE_SIZE);
    const totalRequestPages = Math.ceil(requestsTotal / REQUESTS_PAGE_SIZE);

    const requestStatusBadge = (status: QuotaRequestStatus) => {
        if (status === 'pending') return <Badge type="warning">Pending</Badge>;
        if (status === 'approved') return <Badge type="success">Approved</Badge>;
        return <Badge>Rejected</Badge>;
    };

    return (
        <div className="admin-page" style={{ padding: '0 0 3rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Admin Dashboard</h4>
            <p style={{ color: 'var(--app-text-secondary)', marginBottom: '2rem' }}>
                Manage all platform projects and review quota bundle requests.
            </p>

            {/* ── Section A: All Projects ──────────────────────────────── */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>All Projects</h5>
                    {!projectsLoading && (
                        <Badge>{projectsTotal.toLocaleString()} total</Badge>
                    )}
                    <Button
                        mode="integrated"
                        icon="refresh"
                        aria-label="Refresh projects"
                        onClick={() => fetchProjects(projectsPage)}
                        style={{ marginLeft: 'auto' }}
                    />
                </div>

                {projectsLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <ActivityIndicator />
                    </div>
                )}

                {projectsError && (
                    <Notification type="error" defaultOpen onCloseClick={() => setProjectsError('')}>
                        {projectsError}
                    </Notification>
                )}

                {!projectsLoading && !projectsError && (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell header>Project Name</TableCell>
                                    <TableCell header>Tenant</TableCell>
                                    <TableCell header>Status</TableCell>
                                    <TableCell header>Quota Used</TableCell>
                                    <TableCell header>Remaining</TableCell>
                                    <TableCell header>Allocated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projects.map((proj) => {
                                    const rawQuota = (proj as Project & { request_quota?: { used_count: number; total_allocated: number; remaining?: number } }).request_quota;
                                    const quota = rawQuota ? {
                                        ...rawQuota,
                                        remaining: rawQuota.remaining ?? (rawQuota.total_allocated - rawQuota.used_count),
                                    } : undefined;
                                    const isExhausted = quota && quota.remaining === 0;
                                    return (
                                        <TableRow key={proj.project_id}>
                                            <TableCell secondary>{proj.name}</TableCell>
                                            <TableCell>{proj.tenant_id}</TableCell>
                                            <TableCell>
                                                <Badge type={
                                                    proj.status === 'active' ? 'success' :
                                                    proj.status === 'draft' ? 'warning' : undefined
                                                }>
                                                    {proj.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {quota ? `${quota.used_count.toLocaleString()} / ${quota.total_allocated.toLocaleString()}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {quota ? (
                                                    <span style={{ color: isExhausted ? 'var(--bosch-red-50)' : undefined, fontWeight: isExhausted ? 700 : undefined }}>
                                                        {quota.remaining.toLocaleString()}
                                                    </span>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {quota ? quota.total_allocated.toLocaleString() : '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {projects.length === 0 && (
                                    <TableRow>
                                        <TableCell>No projects found.</TableCell>
                                        <TableCell>{''}</TableCell>
                                        <TableCell>{''}</TableCell>
                                        <TableCell>{''}</TableCell>
                                        <TableCell>{''}</TableCell>
                                        <TableCell>{''}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {totalProjectPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                                <Button
                                    mode="secondary"
                                    icon="left"
                                    disabled={projectsPage === 1}
                                    onClick={() => setProjectsPage((p) => Math.max(1, p - 1))}
                                >
                                    Prev
                                </Button>
                                <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                                    Page {projectsPage} of {totalProjectPages}
                                </span>
                                <Button
                                    mode="secondary"
                                    icon="right"
                                    disabled={projectsPage >= totalProjectPages}
                                    onClick={() => setProjectsPage((p) => Math.min(totalProjectPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--app-border)', marginBottom: '2rem' }} />

            {/* ── Section B: Quota Requests ────────────────────────────── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Quota Requests</h5>
                    {!requestsLoading && (
                        <Badge type={statusFilter === 'pending' && requestsTotal > 0 ? 'warning' : undefined}>
                            {requestsTotal.toLocaleString()} {statusFilter !== 'all' ? statusFilter : ''}
                        </Badge>
                    )}
                    <Button
                        mode="integrated"
                        icon="refresh"
                        aria-label="Refresh requests"
                        onClick={() => fetchRequests(requestsPage, statusFilter)}
                        style={{ marginLeft: 'auto' }}
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <OptionBar
                        selectedValue={statusFilter}
                        onOptionSelect={(_e, data) => {
                            if (data.value) {
                                setStatusFilter(data.value as RequestStatusFilter);
                                setRequestsPage(1);
                            }
                        }}
                        name="quota-status-filter"
                    >
                        <OptionBarItem value="pending" label="Pending" />
                        <OptionBarItem value="approved" label="Approved" />
                        <OptionBarItem value="rejected" label="Rejected" />
                        <OptionBarItem value="all" label="All" />
                    </OptionBar>
                </div>

                {requestsLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <ActivityIndicator />
                    </div>
                )}

                {requestsError && (
                    <Notification type="error" defaultOpen onCloseClick={() => setRequestsError('')}>
                        {requestsError}
                    </Notification>
                )}

                {!requestsLoading && !requestsError && requests.length === 0 && (
                    <p style={{ color: 'var(--app-text-secondary)', fontStyle: 'italic' }}>
                        No {statusFilter !== 'all' ? statusFilter : ''} quota requests found.
                    </p>
                )}

                {!requestsLoading && !requestsError && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {requests.map((req) => (
                            <div
                                key={req.request_id}
                                style={{
                                    padding: '1.25rem',
                                    border: '1px solid var(--app-border)',
                                    borderRadius: '4px',
                                    background: 'var(--app-bg-surface, #eff1f2)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600 }}>{req.project_id}</span>
                                            <Chip label={`+${req.bundle_size.toLocaleString()} requests`} />
                                            {requestStatusBadge(req.status)}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--app-text-secondary)' }}>
                                            Requested by <strong>{req.requested_by}</strong> · {new Date(req.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {req.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button mode="primary" onClick={() => handleApprove(req)}>
                                                Approve
                                            </Button>
                                            <Button mode="secondary" onClick={() => handleReject(req)}>
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {req.user_message && (
                                    <blockquote style={{
                                        margin: '0.75rem 0',
                                        padding: '0.5rem 0.75rem',
                                        borderLeft: '3px solid var(--app-primary)',
                                        color: 'var(--app-text-secondary)',
                                        fontSize: '0.875rem',
                                        background: 'transparent',
                                    }}>
                                        "{req.user_message}"
                                    </blockquote>
                                )}

                                {req.status !== 'pending' && (
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--app-text-secondary)', marginTop: '0.5rem' }}>
                                        {req.status === 'approved' ? 'Approved' : 'Rejected'} by <strong>{req.resolved_by}</strong>
                                        {req.resolved_at && ` · ${new Date(req.resolved_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
                                        {req.admin_note && (
                                            <span> — <em>"{req.admin_note}"</em></span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {totalRequestPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            mode="secondary"
                            icon="left"
                            disabled={requestsPage === 1}
                            onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </Button>
                        <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                            Page {requestsPage} of {totalRequestPages}
                        </span>
                        <Button
                            mode="secondary"
                            icon="right"
                            disabled={requestsPage >= totalRequestPages}
                            onClick={() => setRequestsPage((p) => Math.min(totalRequestPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Review dialog */}
            {reviewDialog && (
                <AdminReviewDialog
                    open={reviewDialog.open}
                    action={reviewDialog.action}
                    requestId={reviewDialog.request.request_id}
                    projectId={reviewDialog.request.project_id}
                    bundleSize={reviewDialog.request.bundle_size}
                    onConfirm={handleReviewConfirm}
                    onCancel={() => setReviewDialog(null)}
                />
            )}
        </div>
    );
};
