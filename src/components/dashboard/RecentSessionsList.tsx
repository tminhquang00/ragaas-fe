import React from 'react';
import { Tile } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import type { RecentSessionSummary } from '../../types';
import { formatRelativeTime } from './formatters';

interface RecentSessionsListProps {
    sessions: RecentSessionSummary[];
    onOpen: (session: RecentSessionSummary) => void;
}

export const RecentSessionsList: React.FC<RecentSessionsListProps> = ({ sessions, onOpen }) => {
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
            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.0625rem', fontWeight: 600 }}>
                Recent sessions
            </h3>

            {sessions.length === 0 ? (
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
                    No chat activity yet.
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
                    {sessions.map((session) => (
                        <li key={session.session_id}>
                            <button
                                type="button"
                                onClick={() => onOpen(session)}
                                className="dashboard-list-row"
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
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
                                                minWidth: 0,
                                            }}
                                            title={session.title ?? 'Untitled session'}
                                        >
                                            {session.title ?? 'Untitled session'}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--app-text-secondary)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {formatRelativeTime(session.last_message_at)}
                                        </span>
                                    </div>
                                    {session.last_message_excerpt && (
                                        <p
                                            style={{
                                                margin: 0,
                                                marginBottom: '0.25rem',
                                                fontSize: '0.8125rem',
                                                color: 'var(--app-text)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {session.last_message_excerpt}
                                        </p>
                                    )}
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--app-text-secondary)',
                                            display: 'flex',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        <span>{session.project_name}</span>
                                        <span>•</span>
                                        <span>{session.message_count} msgs</span>
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
