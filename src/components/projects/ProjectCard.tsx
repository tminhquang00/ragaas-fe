import React from 'react';
import { Tile, Chip, Tooltip, Button, ProgressIndicator } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

import { Project, ProjectStatus, getUserRole } from '../../types';
import { useNavigate } from 'react-router-dom';
import { RoleBadge } from '../sharing';

interface ProjectCardProps {
    project: Project;
    currentUserId?: string;
    onMenuClick?: (event: React.MouseEvent<HTMLElement>, project: Project) => void;
}

const statusConfig: Record<ProjectStatus, { label: string }> = {
    draft: { label: 'Draft' },
    active: { label: 'Active' },
    archived: { label: 'Archived' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUserId, onMenuClick }) => {
    const navigate = useNavigate();
    const { label } = statusConfig[project.status];
    const userRole = currentUserId ? getUserRole(project, currentUserId) : null;

    const handleClick = () => {
        navigate(`/projects/${project.project_id}`);
    };

    return (
        <Tile
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
            }}
            className="project-card-tile"
            onClick={handleClick}
        >
            <div style={{ flex: 1, padding: '16px 16px 8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Chip label={label} />
                        {userRole && <RoleBadge role={userRole} />}
                        {project.visibility === 'public' && (
                            <Chip label="Public" />
                        )}
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
                <h6 style={{ fontWeight: 600, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.name}
                </h6>
                <p
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 40,
                        marginBottom: 16,
                        fontSize: '0.875rem',
                        color: 'var(--major__enabled__default__front-secondary, #70757a)',
                    }}
                >
                    {project.description || 'No description'}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24 }}>
                    <Tooltip content="Documents">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FrokIcon name="Description" style={{ fontSize: '1.25rem' }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--major__enabled__default__front-secondary, #70757a)' }}>
                                --
                            </span>
                        </span>
                    </Tooltip>
                    <Tooltip content="Chat Sessions">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FrokIcon name="Chat" style={{ fontSize: '1.25rem' }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--major__enabled__default__front-secondary, #70757a)' }}>
                                --
                            </span>
                        </span>
                    </Tooltip>
                </div>
            </div>

            <div style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--major__enabled__default__front-secondary, #70757a)' }}>
                        LLM: {project.config?.llm_config?.config_name || 'Not set'}
                    </span>
                </div>
                {project.status === 'draft' && (
                    <ProgressIndicator
                        type="determinate"
                        value={30}
                    />
                )}
            </div>
        </Tile>
    );
};
