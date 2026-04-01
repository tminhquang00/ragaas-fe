import React, { useState, useEffect } from 'react';
import {
    Button,
    TabNavigation,
    Tab,
    Notification,
    Popover,
    ActivityIndicator,
    Layout,
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
        <Layout>
            {/* Header */}
            <div className="projects-page-header">
                <div>
                    <h4 className="projects-page-title">
                        Projects
                    </h4>
                    <p className="projects-page-subtitle">
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
            <div className="projects-page-filters">
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
                <div className="projects-page-error">
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
                <div className="projects-page-loading">
                    <ActivityIndicator size="large" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="projects-page-empty">
                    <h6 className="projects-page-empty-title">
                        No projects yet
                    </h6>
                    <p className="projects-page-empty-description">
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
                        <div className="projects-sections">
                            {/* My Projects */}
                            <div>
                                <div className="projects-section-header">
                                    <p className="projects-section-title">My Projects</p>
                                    <p className="projects-section-count">{myProjects.length}</p>
                                </div>
                                {myProjects.length === 0 && sharedProjects.length > 0 ? (
                                    <p className="projects-empty-owned">No owned projects.</p>
                                ) : (
                                    <div className="projects-grid">
                                        {myProjects.map((project) => (
                                            <ProjectCard key={project.project_id} project={project} currentUserId={tenantId} onMenuClick={handleMenuClick} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Shared with me */}
                            {sharedProjects.length > 0 && (
                                <div>
                                    <div className="projects-section-header">
                                        <p className="projects-section-title">Shared with me</p>
                                        <p className="projects-section-count">{sharedProjects.length}</p>
                                    </div>
                                    <div className="projects-grid">
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
                <div className="project-actions-menu" role="menu" aria-label="Project actions">
                    {selectedProject?.status === 'draft' && (
                        <div
                            onClick={handleActivate}
                            className="project-action-item"
                            role="menuitem"
                        >
                            <FrokIcon name="PlayArrow" />
                            <span>Activate</span>
                        </div>
                    )}
                    {selectedProject?.status === 'active' && (
                        <div
                            onClick={handleArchive}
                            className="project-action-item"
                            role="menuitem"
                        >
                            <FrokIcon name="Archive" />
                            <span>Archive</span>
                        </div>
                    )}
                    <div
                        onClick={handleDelete}
                        className="project-action-item project-action-item-danger"
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
        </Layout>
    );
};
