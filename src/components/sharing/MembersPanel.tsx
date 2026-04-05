import React, { useEffect, useState } from 'react';
import {
    Button,
    Notification,
    Divider,
    ActivityIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';

import { ProjectMemberResponse, ProjectRole } from '../../types';
import { ShareDialog } from './ShareDialog';

// ── Role badge colours ────────────────────────────────────────────────────────
const ROLE_LABEL: Record<ProjectRole, string> = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer',
};

interface RoleBadgeProps {
    role: ProjectRole;
}
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'var(--app-bg-surface, #eff1f2)',
            border: '1px solid var(--app-border, #c1c7cc)',
            color: 'var(--app-text-secondary, #71767c)',
        }}
    >
        {ROLE_LABEL[role]}
    </span>
);

// ── MembersPanel ─────────────────────────────────────────────────────────────

interface MembersPanelProps {
    projectId: string;
    isOwner: boolean;
    onShare: (userId: string, role: 'editor' | 'viewer') => Promise<void>;
    onRevoke: (userId: string) => Promise<void>;
    /** Pass a function to fetch the current member list on mount / after mutations */
    fetchMembers: (projectId: string) => Promise<ProjectMemberResponse[]>;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({
    projectId,
    isOwner,
    onShare,
    onRevoke,
    fetchMembers,
}) => {
    const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const loadMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchMembers(projectId);
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const handleShare = async (userId: string, role: 'editor' | 'viewer') => {
        await onShare(userId, role);
        await loadMembers();
    };

    const handleRevoke = async (userId: string) => {
        setRemovingId(userId);
        try {
            await onRevoke(userId);
            await loadMembers();
        } finally {
            setRemovingId(null);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600, margin: 0 }}>Team Members</h3>
                {isOwner && (
                    <Button mode="secondary" onClick={() => setShareOpen(true)}>
                        <FrokIcon name="PersonAdd" /> Share
                    </Button>
                )}
            </div>

            {error && (
                <div style={{ marginBottom: '1rem' }}>
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                </div>
            )}

            {/* Member list */}
            <div
                style={{
                    border: '1px solid var(--app-border)',
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <ActivityIndicator size="medium" />
                    </div>
                ) : members.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                            No members yet. Share this project with your team.
                        </p>
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {members.map((member, idx) => (
                            <React.Fragment key={member.user_id}>
                                {idx > 0 && <Divider />}
                                <li
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', minWidth: 28 }}>
                                        <FrokIcon name="Person" />
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                {member.user_id}
                                            </span>
                                            <RoleBadge role={member.role} />
                                        </div>
                                        {member.added_at && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                                Added {formatDate(member.added_at)}{member.added_by ? ` by ${member.added_by}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {isOwner && member.role !== 'owner' && (
                                        <PortalTooltip content="Remove access">
                                            <Button
                                                mode="integrated"
                                                disabled={removingId === member.user_id}
                                                onClick={() => handleRevoke(member.user_id)}
                                            >
                                                <FrokIcon name="PersonRemove" />
                                            </Button>
                                        </PortalTooltip>
                                    )}
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                )}
            </div>

            <ShareDialog
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                onShare={handleShare}
            />
        </div>
    );
};
