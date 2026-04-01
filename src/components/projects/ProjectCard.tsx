import React from 'react';
import { Tile, Tooltip, Button, ProgressIndicator } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

import { Project, ProjectStatus, getUserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
    currentUserId?: string;
    onMenuClick?: (event: React.MouseEvent<HTMLElement>, project: Project) => void;
}

const statusConfig: Record<ProjectStatus, { label: string; tone: string }> = {
    draft: { label: 'Draft', tone: 'draft' },
    active: { label: 'Active', tone: 'active' },
    archived: { label: 'Archived', tone: 'archived' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUserId, onMenuClick }) => {
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
                {/* Header */}
                <div className="project-card-header">
                    <div className="project-card-chip-row">
                        <span className={`project-badge project-badge-status project-badge-${tone}`}>
                            {label}
                        </span>
                        {roleLabel && <span className="project-badge project-badge-role">{roleLabel}</span>}
                        {project.visibility === 'public' && <span className="project-badge project-badge-public">Public</span>}
                    </div>
                    <Button
                        mode="integrated"
                        icon="options-vertical"
                        aria-label="More options"
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.stopPropagation();
                            onMenuClick?.(e, project);
                        }}
                    />
                </div>

                {/* Title & Description */}
                <h6 className="project-card-title">{project.name}</h6>
                <p className="project-card-description">
                    {project.description || 'No description'}
                </p>

                {/* Stats */}
                <div className="project-card-stats">
                    <Tooltip content="Documents">
                        <span className="project-stat">
                            <FrokIcon name="Description" style={{ fontSize: '1.1rem' }} />
                            <span>--</span>
                        </span>
                    </Tooltip>
                    <Tooltip content="Chat Sessions">
                        <span className="project-stat">
                            <FrokIcon name="Chat" style={{ fontSize: '1.1rem' }} />
                            <span>--</span>
                        </span>
                    </Tooltip>
                </div>
            </div>

            <div className="project-card-footer">
                <span className="project-card-llm">LLM: {project.config?.llm_config?.config_name || 'Not set'}</span>
                {project.status === 'draft' && (
                    <ProgressIndicator
                        className="project-card-progress"
                        type="determinate"
                        value={30}
                    />
                )}
            </div>
        </Tile>
    );
};
