import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Tooltip,
    Alert,
    Skeleton,
    Divider,
    alpha,
    useTheme,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Person as PersonIcon,
    PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { ProjectMemberResponse, ProjectRole } from '../../types';
import { ShareDialog } from './ShareDialog';

// ── Role badge colours ────────────────────────────────────────────────────────
const ROLE_COLORS: Record<ProjectRole, string> = {
    owner: '#7c3aed',
    editor: '#2563eb',
    viewer: '#6b7280',
};

const ROLE_LABEL: Record<ProjectRole, string> = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer',
};

interface RoleBadgeProps {
    role: ProjectRole;
}
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => (
    <Chip
        label={ROLE_LABEL[role]}
        size="small"
        sx={{
            bgcolor: alpha(ROLE_COLORS[role], 0.12),
            color: ROLE_COLORS[role],
            fontWeight: 600,
            borderRadius: 1,
            fontSize: '0.72rem',
        }}
    />
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
    const theme = useTheme();
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
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Team Members
                </Typography>
                {isOwner && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setShareOpen(true)}
                    >
                        Share
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Member list */}
            <Box
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <Box key={i} sx={{ px: 2, py: 1.5 }}>
                            <Skeleton variant="text" width="60%" />
                        </Box>
                    ))
                ) : members.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No members yet. Share this project with your team.
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {members.map((member, idx) => (
                            <React.Fragment key={member.user_id}>
                                {idx > 0 && <Divider component="li" />}
                                <ListItem
                                    sx={{
                                        py: 1.5,
                                        '&:hover': {
                                            background: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                    secondaryAction={
                                        isOwner && member.role !== 'owner' ? (
                                            <Tooltip title="Remove access">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={removingId === member.user_id}
                                                        onClick={() => handleRevoke(member.user_id)}
                                                    >
                                                        <PersonRemoveIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        ) : undefined
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <PersonIcon fontSize="small" color="action" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {member.user_id}
                                                </Typography>
                                                <RoleBadge role={member.role} />
                                            </Box>
                                        }
                                        secondary={
                                            member.added_at
                                                ? `Added ${formatDate(member.added_at)}${member.added_by ? ` by ${member.added_by}` : ''}`
                                                : undefined
                                        }
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>

            <ShareDialog
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                onShare={handleShare}
            />
        </Box>
    );
};
