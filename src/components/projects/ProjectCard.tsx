import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
    LinearProgress,
} from '@mui/material';
import {
    MoreVert as MoreIcon,
    Description as DocIcon,
    Chat as ChatIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { Project, ProjectStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
    onMenuClick?: (event: React.MouseEvent<HTMLElement>, project: Project) => void;
}

const statusConfig: Record<ProjectStatus, { color: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
    draft: { color: 'warning', label: 'Draft' },
    active: { color: 'success', label: 'Active' },
    archived: { color: 'default', label: 'Archived' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onMenuClick }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { color, label } = statusConfig[project.status];

    const handleClick = () => {
        navigate(`/projects/${project.project_id}`);
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                },
            }}
            onClick={handleClick}
        >
            <CardContent sx={{ flex: 1, pb: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                        size="small"
                        label={label}
                        color={color}
                        icon={<CircleIcon sx={{ fontSize: '8px !important' }} />}
                        sx={{
                            '& .MuiChip-icon': {
                                ml: 1,
                            },
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuClick?.(e, project);
                        }}
                    >
                        <MoreIcon />
                    </IconButton>
                </Box>

                {/* Title & Description */}
                <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                    {project.name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 40,
                        mb: 2,
                    }}
                >
                    {project.description || 'No description'}
                </Typography>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Tooltip title="Documents">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DocIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                --
                            </Typography>
                        </Box>
                    </Tooltip>
                    <Tooltip title="Chat Sessions">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ChatIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                --
                            </Typography>
                        </Box>
                    </Tooltip>
                </Box>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            LLM: {project.config?.llm_config?.config_name || 'Not set'}
                        </Typography>
                    </Box>
                    {project.status === 'draft' && (
                        <LinearProgress
                            variant="determinate"
                            value={30}
                            sx={{ height: 4, borderRadius: 2 }}
                        />
                    )}
                </Box>
            </CardActions>
        </Card>
    );
};
