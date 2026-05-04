import React from 'react';
import { Tile, Chip } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import type { RecentProjectSummary } from '../../types';
import { formatCompactNumber, formatRelativeTime } from './formatters';

interface RecentProjectsListProps {
    projects: RecentProjectSummary[];
    onOpen: (projectId: string) => void;
    onSeeAll: () => void;
}

const STATUS_VARIANT: Record<RecentProjectSummary['status'], string> = {
    active: 'var(--app-success)',
    draft: 'var(--app-text-secondary)',
    archived: 'var(--app-warning)',
};

export const RecentProjectsList: React.FC<RecentProjectsListProps> = ({
    projects,
    onOpen,
    onSeeAll,
}) => {
    return (
        <Tile
            style={{
                padding: '1.5rem',
                border: '1px solid var(--app-border)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                }}
            >
                <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600 }}>
                    Recent projects
                </h3>
                <button
                    onClick={onSeeAll}
                    type="button"
                    className="dashboard-link-button"
                >
                    See all
                </button>
            </div>

            {projects.length === 0 ? (
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--app-text-secondary)',
                        fontSize: '0.875rem',
                    }}
                >
                    No projects yet.
                </div>
            ) : (
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    {projects.map((project) => (
                        <li key={project.project_id}>
                            <button
                                type="button"
                                onClick={() => onOpen(project.project_id)}
                                className="dashboard-list-row"
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                fontSize: '0.9375rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {project.name}
                                        </span>
                                        <Chip
                                            label={project.status}
                                            // Lightly tint the chip with the status color via inline style
                                            style={{
                                                color: STATUS_VARIANT[project.status],
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--app-text-secondary)',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span>{project.pipeline_type}</span>
                                        <span>•</span>
                                        <span>
                                            {formatCompactNumber(project.document_count)} docs
                                        </span>
                                        <span>•</span>
                                        <span>Updated {formatRelativeTime(project.updated_at)}</span>
                                    </div>
                                </div>
                                <FrokIcon
                                    name="ChevronRight"
                                    style={{ color: 'var(--app-text-secondary)' }}
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Tile>
    );
};
