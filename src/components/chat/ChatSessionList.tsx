import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Dialog, Popover } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha, cssVar } from '../../utils/frokTheme';
import { ChatSession } from '../../types';

interface ChatSessionListProps {
    sessions: ChatSession[];
    currentSessionId?: string;
    onSelectSession: (sessionId: string) => void;
    onCreateSession: () => void;
    onDeleteSession: (sessionId: string) => void;
    onUpdateSession: (sessionId: string, title: string) => Promise<void>;
    onSearch?: (query: string) => void;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
    sessions,
    currentSessionId,
    onSelectSession,
    onCreateSession,
    onDeleteSession,
    onUpdateSession,
    onSearch,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSession, setEditingSession] = useState<{ id: string; title: string } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuSessionId, setMenuSessionId] = useState<string | null>(null);
    const menuTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (onSearch) {
            const timer = setTimeout(() => {
                onSearch(searchQuery);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, onSearch]);

    const filteredSessions = onSearch
        ? sessions
        : sessions.filter(session =>
            (session.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
        event.stopPropagation();
        menuTriggerRef.current = event.currentTarget as HTMLButtonElement;
        setMenuSessionId(sessionId);
        setMenuOpen(true);
    };

    const handleMenuClose = () => {
        setMenuOpen(false);
        setMenuSessionId(null);
    };

    const handleEditClick = () => {
        if (menuSessionId) {
            const session = sessions.find(s => s.session_id === menuSessionId);
            if (session) {
                setEditingSession({ id: session.session_id, title: session.title || 'Untitled Session' });
            }
        }
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        if (menuSessionId) {
            onDeleteSession(menuSessionId);
        }
        handleMenuClose();
    };

    const handleSaveTitle = async () => {
        if (editingSession && editingSession.title.trim()) {
            await onUpdateSession(editingSession.id, editingSession.title.trim());
            setEditingSession(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Group sessions by date
    const groupedSessions = filteredSessions.reduce((groups, session) => {
        const dateLabel = formatDate(session.updated_at);
        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        groups[dateLabel].push(session);
        return groups;
    }, {} as Record<string, ChatSession[]>);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--major__enabled__default__front, #e0e0e0)' }}>
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>
                        Chat History
                    </h3>
                    <Button
                        mode="primary"
                        icon="add"
                        label="New Chat"
                        onClick={onCreateSession}
                    />
                </div>
                <TextField
                    id="session-search"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
            </div>

            <ul style={{ flex: 1, overflowY: 'auto', padding: '0 8px', margin: 0, listStyle: 'none' }}>
                {Object.entries(groupedSessions).map(([label, groupSessions]) => (
                    <React.Fragment key={label}>
                        <li style={{ padding: '8px 16px', fontWeight: 600, fontSize: '0.75rem', color: 'var(--minor__enabled__default__front, #666)' }}>
                            {label}
                        </li>
                        {groupSessions.map((session) => {
                            const isSelected = session.session_id === currentSessionId;
                            return (
                                <li
                                    key={session.session_id}
                                    style={{ marginBottom: 4 }}
                                >
                                    <div
                                        onClick={() => onSelectSession(session.session_id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            background: isSelected ? alpha(cssVar('--g-blue-50'), 0.1) : 'transparent',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = alpha(cssVar('--g-blue-50'), 0.05); }}
                                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <span style={{ minWidth: 24, display: 'flex', alignItems: 'center' }}>
                                            <FrokIcon
                                                name="Chat"
                                                style={{
                                                    fontSize: 18,
                                                    color: isSelected ? cssVar('--g-blue-50') : 'var(--minor__enabled__default__front, #999)',
                                                }}
                                            />
                                        </span>
                                        <span
                                            style={{
                                                flex: 1,
                                                fontSize: '0.875rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: isSelected ? 500 : 400,
                                                marginLeft: 8,
                                            }}
                                        >
                                            {session.title || 'Untitled Session'}
                                        </span>
                                        <button
                                            onClick={(e) => handleMenuOpen(e, session.session_id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: 0.6,
                                                padding: 4,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <FrokIcon name="MoreVert" style={{ fontSize: 18 }} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </React.Fragment>
                ))}
            </ul>

            {/* Context Menu via Popover */}
            {menuOpen && menuTriggerRef.current && (
                <Popover
                    open={menuOpen}
                    trigger={<span ref={menuTriggerRef as React.RefObject<HTMLSpanElement>} />}
                    position="bottom-right"
                    onOutsideClick={handleMenuClose}
                    onCloseKeyPressed={handleMenuClose}
                >
                    <div style={{ minWidth: 150, padding: '4px 0' }}>
                        <div
                            onClick={handleEditClick}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = alpha(cssVar('--g-blue-50'), 0.05); }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <FrokIcon name="Edit" style={{ fontSize: 18 }} />
                            <span style={{ fontSize: '0.875rem' }}>Rename</span>
                        </div>
                        <div
                            onClick={handleDeleteClick}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', cursor: 'pointer', color: cssVar('--g-red-50') }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = alpha(cssVar('--g-red-50'), 0.05); }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <FrokIcon name="Delete" style={{ fontSize: 18 }} />
                            <span style={{ fontSize: '0.875rem' }}>Delete</span>
                        </div>
                    </div>
                </Popover>
            )}

            {/* Rename Dialog */}
            <Dialog
                open={!!editingSession}
                modal={true}
                title="Rename Chat"
                onClose={() => setEditingSession(null)}
                onConfirm={handleSaveTitle}
                confirmLabel="Save"
                onCancel={() => setEditingSession(null)}
                cancelLabel="Cancel"
            >
                <TextField
                    id="session-title-edit"
                    autoFocus
                    label="Chat Title"
                    value={editingSession?.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSession(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
            </Dialog>
        </div>
    );
};
