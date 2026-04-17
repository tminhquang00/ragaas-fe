import React, { useState } from 'react';
import { ContextMenu, Icon } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';
import { Project, ProjectStatus, getUserRole } from '../../types';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

interface ProjectCardProps {
    project: Project;
    currentUserId?: string;
    onActivate?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; icon: string; tone: string }> = {
    draft: { label: 'Draft', icon: 'edit', tone: 'draft' },
    active: { label: 'Active', icon: 'checkmark', tone: 'active' },
    archived: { label: 'Archived', icon: 'box-closed', tone: 'archived' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUserId, onActivate, onArchive, onDelete }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { label, icon, tone } = statusConfig[project.status];
    const userRole = currentUserId ? getUserRole(project, currentUserId) : null;
    const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : null;
    const isArchived = project.status === 'archived';

    const handleClick = () => {
        navigate(`/projects/${project.project_id}`);
    };

    return (
        <article
            className={`project-card project-card--${tone} ${menuOpen ? 'project-card--menu-open' : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            style={{ animationDelay: `${(project as any)._animIndex != null ? (project as any)._animIndex * 40 : 0}ms` }}
        >
            {/* Top accent gradient */}
            <div className={`project-card__accent project-card__accent--${tone}`} />

            <div className="project-card__body">
                {/* Header row */}
                <header className="project-card__header">
                    <div className="project-card__title-row">
                        <h3 className="project-card__title">{project.name}</h3>
                        <div className="project-card__actions" onClick={(e) => e.stopPropagation()}>
                            <ContextMenu
                                popover={{ position: 'bottom-right' }}
                                ariaOpenPopoverButtonLabel="Project options"
                                ariaClosePopoverButtonLabel="Close menu"
                                onOpenChange={setMenuOpen}
                            >
                                {project.status === 'draft' && (
                                    <ContextMenu.Item
                                        label="Activate"
                                        icon={{ iconName: 'checkmark', isUiIcon: true }}
                                        onClick={() => onActivate?.()}
                                    />
                                )}
                                {project.status === 'active' && (
                                    <ContextMenu.Item
                                        label="Archive"
                                        icon={{ iconName: 'box-closed' }}
                                        onClick={() => onArchive?.()}
                                    />
                                )}
                                <ContextMenu.Item
                                    label="Delete"
                                    icon={{ iconName: 'delete' }}
                                    onClick={() => onDelete?.()}
                                />
                            </ContextMenu>
                        </div>
                    </div>
                    <p className="project-card__description">
                        {project.description || 'No description'}
                    </p>
                </header>

                {/* Footer with meta info */}
                <footer className="project-card__footer">
                    <div className="project-card__tags">
                        <span className={`project-card__tag project-card__tag--status project-card__tag--${tone}`}>
                            <Icon iconName={icon} isUiIcon className="project-card__tag-icon" />
                            {label}
                        </span>
                        {roleLabel && (
                            <span className="project-card__tag project-card__tag--role">
                                {roleLabel}
                            </span>
                        )}
                        {project.visibility === 'public' && (
                            <span className="project-card__tag project-card__tag--public">
                                Public
                            </span>
                        )}
                    </div>
                    <PortalTooltip content={`Model: ${project.config?.llm_config?.config_name || 'Not configured'}`}>
                        <span className={`project-card__model ${isArchived ? 'project-card__model--muted' : ''}`}>
                            <FrokIcon name="Psychology" className="project-card__model-icon" />
                            <span className="project-card__model-name">
                                {project.config?.llm_config?.config_name || '—'}
                            </span>
                        </span>
                    </PortalTooltip>
                </footer>
            </div>
        </article>
    );
};
