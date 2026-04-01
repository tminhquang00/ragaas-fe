import React, { useState, useEffect } from 'react';
import { Skeleton } from '@mui/material';
import {
    Button,
    TabNavigation,
    Tab,
    Notification,
    Popover,
} from '@bosch/react-frok';
import { FrokIcon } from '../utils/iconAdapter';
import { ProjectCard, CreateProjectDialog } from '../components/projects';
import { ApiKeyModal } from '../components/common';
import { useAuth } from '../context';
import { Project, CreateProjectRequest, getUserRole } from '../types';

export const ProjectsPage: React.FC = () => {
    const { apiClient, tenantId } = useAuth();

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

        const role = getUserRole(selectedProject, tenantId);
        if (role !== 'owner') {
            setError('Only the project owner can delete this project.');
            handleMenuClose();
            return;
        }

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
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                        Projects
                    </h4>
                    <p style={{ color: 'var(--app-text-secondary)' }}>
                        Manage your RAG knowledge bases
                    </p>
                </div>
                <Button
                    mode="primary"
                    icon="add"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Create Project
                </Button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--app-border)' }}>
                <TabNavigation
                    selectedValue={statusFilter}
                    onTabSelect={(_ev, data) => setStatusFilter(data.value as string)}
                >
                    <Tab value="all">All</Tab>
                    <Tab value="active">Active</Tab>
                    <Tab value="draft">Draft</Tab>
                    <Tab value="archived">Archived</Tab>
                </TabNavigation>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Notification
                        type="error"
                        variant="banner"
                        open={!!error}
                        onCloseClick={() => setError('')}
                    >
                        {error}
                    </Notification>
                </div>
            )}

            {/* Projects Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={200} />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        border: `1px dashed var(--app-border)`,
                    }}
                >
                    <h6 style={{ color: 'var(--app-text-secondary)', marginBottom: '0.5rem' }}>
                        No projects yet
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Create your first project to get started with AI-powered document Q&A
                    </p>
                    <Button
                        mode="primary"
                        icon="add"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Project
                    </Button>
                </div>
            ) : (
                (() => {
                    const myProjects = filteredProjects.filter(
                        (p) => p.owner_id === tenantId || p.tenant_id === tenantId
                    );
                    const sharedProjects = filteredProjects.filter(
                        (p) =>
                            p.owner_id !== tenantId &&
                            p.tenant_id !== tenantId &&
                            (p.visibility === 'public' || p.members?.some((m) => m.user_id === tenantId))
                    );
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* My Projects */}
                            <div>
                                {sharedProjects.length > 0 && (
                                    <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--app-text-secondary)' }}>
                                        My Projects
                                    </p>
                                )}
                                {myProjects.length === 0 && sharedProjects.length > 0 ? (
                                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>No owned projects.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {myProjects.map((project) => (
                                            <ProjectCard key={project.project_id} project={project} currentUserId={tenantId} onMenuClick={handleMenuClick} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Shared with me */}
                            {sharedProjects.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--app-text-secondary)' }}>
                                        Shared with me
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {sharedProjects.map((project) => (
                                            <ProjectCard key={project.project_id} project={project} currentUserId={tenantId} onMenuClick={handleMenuClick} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()
            )}

            {/* Context Menu */}
            <Popover
                open={Boolean(menuAnchor)}
                trigger={<span ref={(el) => { if (menuAnchor && el) el.style.display = 'none'; }} />}
                position="bottom-left"
                onOutsideClick={handleMenuClose}
                onCloseKeyPressed={handleMenuClose}
                isPopoverArrowMissing
                style={menuAnchor ? {
                    position: 'fixed',
                    left: menuAnchor.getBoundingClientRect().left,
                    top: menuAnchor.getBoundingClientRect().bottom,
                    zIndex: 1300,
                } : undefined}
            >
                <div style={{ minWidth: 160, padding: '0.5rem 0' }}>
                    {selectedProject?.status === 'draft' && (
                        <div
                            onClick={handleActivate}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                            role="menuitem"
                        >
                            <FrokIcon name="PlayArrow" />
                            <span>Activate</span>
                        </div>
                    )}
                    {selectedProject?.status === 'active' && (
                        <div
                            onClick={handleArchive}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                            role="menuitem"
                        >
                            <FrokIcon name="Archive" />
                            <span>Archive</span>
                        </div>
                    )}
                    <div
                        onClick={handleDelete}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--app-error)' }}
                        role="menuitem"
                    >
                        <FrokIcon name="Delete" />
                        <span>Delete</span>
                    </div>
                </div>
            </Popover>

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
        </div>
    );
};
