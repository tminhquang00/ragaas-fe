import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Button,
    TabNavigation,
    Tab,
    Notification,
    ActivityIndicator,
    Layout,
    Icon,
} from '@bosch/react-frok';
import { ProjectCard, CreateProjectDialog } from '../components/projects';
import { ApiKeyModal, PaginationControls } from '../components/common';
import { useAuth } from '../context';
import { Project, CreateProjectRequest, CreateFromTemplateRequest, getUserRole } from '../types';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);

    const pageSize = 20;

    const fetchProjects = useCallback(async (nextPage: number = page) => {
        if (!apiClient) return;

        try {
            setLoading(true);
            setError('');
            const response = await apiClient.listProjects(nextPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
            setProjects(response.projects);
            setTotalProjects(response.total);
            setPage(response.page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [apiClient, page, statusFilter]);

    useEffect(() => {
        fetchProjects(page);
    }, [fetchProjects, page]);

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

    const handleCreateFromTemplate = async (request: CreateFromTemplateRequest) => {
        if (!apiClient) return;

        setCreateLoading(true);
        try {
            const response = await apiClient.createProjectFromTemplate(request);
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

    const handleActivate = async (project: Project) => {
        if (!apiClient) return;
        try {
            await apiClient.activateProject(project.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate project');
        }
    };

    const handleArchive = async (project: Project) => {
        if (!apiClient) return;
        try {
            await apiClient.archiveProject(project.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to archive project');
        }
    };

    const handleDelete = async (project: Project) => {
        if (!apiClient) return;
        const role = getUserRole(project, tenantId);
        if (role !== 'owner') {
            setError('Only the project owner can delete this project.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) return;
        try {
            await apiClient.deleteProject(project.project_id);
            fetchProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
        }
    };

    const statusCounts = useMemo(() => {
        const counts = { all: projects.length, active: 0, draft: 0, archived: 0 };
        projects.forEach((p) => {
            if (p.status === 'active') counts.active++;
            else if (p.status === 'draft') counts.draft++;
            else if (p.status === 'archived') counts.archived++;
        });
        return counts;
    }, [projects]);

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
        );
    }, [projects, searchQuery]);

    const addAnimIndex = (list: Project[]) =>
        list.map((p, i) => ({ ...p, _animIndex: i }));

    return (
        <Layout fullWidth className="projects-page">
            {/* Hero header */}
            <div className="projects-hero">
                <div className="projects-hero__content">
                    <h4 className="projects-hero__title">Projects</h4>
                    <p className="projects-hero__subtitle">
                        Manage your AI agent workflows
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

            {/* Stats bar */}
            {!loading && projects.length > 0 && (
                <div className="projects-stats">
                    <div className="projects-stats__item">
                        <span className="projects-stats__value">{statusCounts.all}</span>
                        <span className="projects-stats__label">Total</span>
                    </div>
                    <div className="projects-stats__divider" />
                    <div className="projects-stats__item projects-stats__item--active">
                        <span className="projects-stats__value">{statusCounts.active}</span>
                        <span className="projects-stats__label">Active</span>
                    </div>
                    <div className="projects-stats__divider" />
                    <div className="projects-stats__item projects-stats__item--draft">
                        <span className="projects-stats__value">{statusCounts.draft}</span>
                        <span className="projects-stats__label">Draft</span>
                    </div>
                    <div className="projects-stats__divider" />
                    <div className="projects-stats__item projects-stats__item--archived">
                        <span className="projects-stats__value">{statusCounts.archived}</span>
                        <span className="projects-stats__label">Archived</span>
                    </div>
                </div>
            )}

            {/* Filter bar: tabs + search */}
            <div className="projects-filterbar">
                <TabNavigation
                    selectedValue={statusFilter}
                    onTabSelect={(_ev, data) => {
                        setStatusFilter(data.value as string);
                        setPage(1);
                    }}
                >
                    <Tab value="all">All</Tab>
                    <Tab value="active">Active</Tab>
                    <Tab value="draft">Draft</Tab>
                    <Tab value="archived">Archived</Tab>
                </TabNavigation>

                <div className="projects-search">
                    <Icon iconName="search" isUiIcon className="projects-search__icon" />
                    <input
                        type="text"
                        className="projects-search__input"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="projects-search__clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            <Icon iconName="close" isUiIcon />
                        </button>
                    )}
                </div>
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
                    {searchQuery ? (
                        <>
                            <Icon iconName="search" className="projects-page-empty__icon" />
                            <h6 className="projects-page-empty-title">No matching projects</h6>
                            <p className="projects-page-empty-description">
                                No projects match "{searchQuery}". Try a different search term.
                            </p>
                            <Button mode="secondary" onClick={() => setSearchQuery('')}>
                                Clear Search
                            </Button>
                        </>
                    ) : (
                        <>
                            <Icon iconName="folder-open" className="projects-page-empty__icon" />
                            <h6 className="projects-page-empty-title">No projects yet</h6>
                            <p className="projects-page-empty-description">
                                Create your first project to start automating workflows with AI agents
                            </p>
                            <Button
                                mode="primary"
                                icon="add"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Create Project
                            </Button>
                        </>
                    )}
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
                                    <span className="projects-section-count">{myProjects.length}</span>
                                </div>
                                {myProjects.length === 0 && sharedProjects.length > 0 ? (
                                    <p className="projects-empty-owned">No owned projects.</p>
                                ) : (
                                    <div className="projects-grid">
                                        {addAnimIndex(myProjects).map((project) => (
                                            <ProjectCard
                                                key={project.project_id}
                                                project={project}
                                                currentUserId={tenantId}
                                                onActivate={() => handleActivate(project)}
                                                onArchive={() => handleArchive(project)}
                                                onDelete={() => handleDelete(project)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Shared with me */}
                            {sharedProjects.length > 0 && (
                                <div>
                                    <div className="projects-section-header">
                                        <p className="projects-section-title">Shared with me</p>
                                        <span className="projects-section-count">{sharedProjects.length}</span>
                                    </div>
                                    <div className="projects-grid">
                                        {addAnimIndex(sharedProjects).map((project) => (
                                            <ProjectCard
                                                key={project.project_id}
                                                project={project}
                                                currentUserId={tenantId}
                                                onActivate={() => handleActivate(project)}
                                                onArchive={() => handleArchive(project)}
                                                onDelete={() => handleDelete(project)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()
            )}

            {!loading && filteredProjects.length > 0 && (
                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={totalProjects}
                    onPageChange={setPage}
                    disabled={loading}
                    label="projects"
                />
            )}

            {/* Create Project Dialog */}
            <CreateProjectDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateProject}
                onUploadYaml={handleUploadYaml}
                onCreateFromTemplate={handleCreateFromTemplate}
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
