import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Menu,
    MenuItem,
    ListItemIcon,
    Skeleton,
    Alert,
    Tabs,
    Tab,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Archive as ArchiveIcon,
    PlayArrow as ActivateIcon,
} from '@mui/icons-material';
import { ProjectCard, CreateProjectDialog } from '../components/projects';
import { ApiKeyModal } from '../components/common';
import { useAuth } from '../context';
import { Project, CreateProjectRequest } from '../types';

export const ProjectsPage: React.FC = () => {
    const theme = useTheme();
    const { apiClient } = useAuth();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [apiKeyModal, setApiKeyModal] = useState<{ open: boolean; key: string; name: string }>({
        open: false,
        key: '',
        name: '',
    });
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        if (!apiClient) return;

        try {
            setLoading(true);
            setError('');
            const response = await apiClient.listProjects(1, 50, statusFilter === 'all' ? undefined : statusFilter);
            setProjects(response.projects);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [apiClient, statusFilter]);

    const handleCreateProject = async (data: CreateProjectRequest) => {
        if (!apiClient) return;

        setCreateLoading(true);
        try {
            const response = await apiClient.createProject(data);
            setCreateDialogOpen(false);
            setApiKeyModal({
                open: true,
                key: response.api_key,
                name: response.project.name,
            });
            fetchProjects();
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUploadYaml = async (file: File) => {
        if (!apiClient) return;

        setCreateLoading(true);
        try {
            const response = await apiClient.createProjectFromConfig(file);
            setCreateDialogOpen(false);
            setApiKeyModal({
                open: true,
                key: response.api_key,
                name: response.project.name,
            });
            fetchProjects();
        } finally {
            setCreateLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, project: Project) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setSelectedProject(project);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedProject(null);
    };

    const handleActivate = async () => {
        if (!apiClient || !selectedProject) return;

        try {
            await apiClient.activateProject(selectedProject.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate project');
        }
        handleMenuClose();
    };

    const handleArchive = async () => {
        if (!apiClient || !selectedProject) return;

        try {
            await apiClient.archiveProject(selectedProject.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to archive project');
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (!apiClient || !selectedProject) return;

        if (!window.confirm(`Are you sure you want to delete "${selectedProject.name}"?`)) {
            handleMenuClose();
            return;
        }

        try {
            await apiClient.deleteProject(selectedProject.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
        }
        handleMenuClose();
    };

    const filteredProjects = projects;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Projects
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your RAG knowledge bases
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Create Project
                </Button>
            </Box>

            {/* Filters */}
            <Tabs
                value={statusFilter}
                onChange={(_, v) => setStatusFilter(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="All" value="all" />
                <Tab label="Active" value="active" />
                <Tab label="Draft" value="draft" />
                <Tab label="Archived" value="archived" />
            </Tabs>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Projects Grid */}
            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                            <Skeleton variant="rounded" height={200} />
                        </Grid>
                    ))}
                </Grid>
            ) : filteredProjects.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4,
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                    }}
                >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No projects yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first project to get started with AI-powered document Q&A
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Project
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredProjects.map((project) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.project_id}>
                            <ProjectCard project={project} onMenuClick={handleMenuClick} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                {selectedProject?.status === 'draft' && (
                    <MenuItem onClick={handleActivate}>
                        <ListItemIcon>
                            <ActivateIcon fontSize="small" />
                        </ListItemIcon>
                        Activate
                    </MenuItem>
                )}
                {selectedProject?.status === 'active' && (
                    <MenuItem onClick={handleArchive}>
                        <ListItemIcon>
                            <ArchiveIcon fontSize="small" />
                        </ListItemIcon>
                        Archive
                    </MenuItem>
                )}
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            {/* Create Project Dialog */}
            <CreateProjectDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateProject}
                onUploadYaml={handleUploadYaml}
                loading={createLoading}
            />

            {/* API Key Modal */}
            <ApiKeyModal
                open={apiKeyModal.open}
                apiKey={apiKeyModal.key}
                projectName={apiKeyModal.name}
                onClose={() => setApiKeyModal({ open: false, key: '', name: '' })}
            />
        </Box>
    );
};
