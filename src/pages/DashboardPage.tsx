import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Folder as ProjectIcon,
    Description as DocIcon,
    Chat as ChatIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {

    return (
        <Card
            sx={{
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                '&:hover': onClick
                    ? {
                        transform: 'translateY(-4px)',
                    }
                    : {},
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 20px ${alpha(color, 0.3)}`,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export const DashboardPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome to RAG-as-a-Service. Manage your AI-powered knowledge bases.
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Projects"
                        value="--"
                        icon={<ProjectIcon sx={{ color: 'white' }} />}
                        color={theme.palette.primary.main}
                        onClick={() => navigate('/projects')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Documents"
                        value="--"
                        icon={<DocIcon sx={{ color: 'white' }} />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Chat Sessions"
                        value="--"
                        icon={<ChatIcon sx={{ color: 'white' }} />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Active Projects"
                        value="--"
                        icon={<TrendingIcon sx={{ color: 'white' }} />}
                        color={theme.palette.warning.main}
                    />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Start
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': {
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                        }}
                        onClick={() => navigate('/projects')}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Create Your First Project
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Set up a new RAG project to start building your AI-powered knowledge base.
                                Upload documents, configure your LLM, and start chatting.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            background: alpha(theme.palette.background.paper, 0.5),
                        }}
                        onClick={() => navigate('/settings')}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Configure Settings
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Customize your tenant settings, manage API keys, and configure
                                default options for new projects.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
