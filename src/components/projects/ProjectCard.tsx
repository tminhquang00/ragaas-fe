import React from 'react';
import { Tile, Tooltip, ContextMenu } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

import { Project, ProjectStatus, getUserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
    currentUserId?: string;
    onActivate?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; tone: string }> = {
    draft: { label: 'Draft', tone: 'draft' },
    active: { label: 'Active', tone: 'active' },
    archived: { label: 'Archived', tone: 'archived' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUserId, onActivate, onArchive, onDelete }) => {
    const navigate = useNavigate();
    const { label, tone } = statusConfig[project.status];
    const userRole = currentUserId ? getUserRole(project, currentUserId) : null;
    const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : null;

    const handleClick = () => {
        navigate(`/projects/${project.project_id}`);
    };

    return (
        <Tile
            className={`project-card-tile project-card-${tone}`}
            onClick={handleClick}
        >
            <div className="project-card-body">
                {/* Title row + menu trigger */}
                <div className="project-card-header">
                    <h6 className="project-card-title">{project.name}</h6>
                    {/* Stop propagation so menu click doesn't navigate */}
                    <div className="project-card-menu-wrap" onClick={(e) => e.stopPropagation()}>
                        <ContextMenu
                            popover={{ position: 'bottom-right' }}
                            ariaOpenPopoverButtonLabel="More options"
                            ariaClosePopoverButtonLabel="Close options"
                        >
                            {project.status === 'draft' && (
                                <ContextMenu.Item label="Activate" onClick={() => onActivate?.()} />
                            )}
                            {project.status === 'active' && (
                                <ContextMenu.Item label="Archive" onClick={() => onArchive?.()} />
                            )}
                            <ContextMenu.Item label="Delete" onClick={() => onDelete?.()} />
                        </ContextMenu>
                    </div>
                </div>

                {/* Description */}
                <p className="project-card-description">
                    {project.description || 'No description'}
                </p>
            </div>

            {/* Footer: badges left, LLM right */}
            <div className="project-card-footer">
                <div className="project-card-chip-row">
                    <span className={`project-badge project-badge-status project-badge-${tone}`}>
                        {label}
                    </span>
                    {roleLabel && <span className="project-badge project-badge-role">{roleLabel}</span>}
                    {project.visibility === 'public' && <span className="project-badge project-badge-public">Public</span>}
                </div>
                <Tooltip content="LLM model">
                    <span className="project-card-llm">
                        <FrokIcon name="Psychology" style={{ fontSize: '0.85rem', flexShrink: 0 }} />
                        {project.config?.llm_config?.config_name || '—'}
                    </span>
                </Tooltip>
            </div>
        </Tile>
    );
};
