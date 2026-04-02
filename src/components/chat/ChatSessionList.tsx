import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Dialog, Popover } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { cssVar } from '../../utils/frokTheme';
import { ChatSession } from '../../types';
import './Chat.css';

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
        <div className="session-list-container">
            <div className="chat-sidebar-header">
                <div className="chat-sidebar-title">
                    <h3>
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

            <div className="session-list">
                {Object.entries(groupedSessions).map(([label, groupSessions]) => (
                    <React.Fragment key={label}>
                        <div className="session-list-group-label">
                            {label}
                        </div>
                        {groupSessions.map((session) => {
                            const isSelected = session.session_id === currentSessionId;
                            return (
                                <div
                                    key={session.session_id}
                                    className={`session-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => onSelectSession(session.session_id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onSelectSession(session.session_id); }}
                                >
                                    <span className="session-item-icon">
                                        <FrokIcon
                                            name="Chat"
                                            style={{
                                                fontSize: 18,
                                                color: isSelected ? cssVar('--g-blue-50') : cssVar('--g-gray-50'),
                                            }}
                                        />
                                    </span>
                                    <span className="session-item-title">
                                        {session.title || 'Untitled Session'}
                                    </span>
                                    <button
                                        className="session-item-menu"
                                        onClick={(e) => handleMenuOpen(e, session.session_id)}
                                        aria-label="Session options"
                                        type="button"
                                    >
                                            <FrokIcon name="MoreVert" style={{ fontSize: 18 }} />
                                        </button>
                                    </div>
                                );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Context Menu via Popover */}
            {menuOpen && menuTriggerRef.current && (
                <Popover
                    open={menuOpen}
                    trigger={<span ref={menuTriggerRef as React.RefObject<HTMLSpanElement>} />}
                    position="bottom-right"
                    onOutsideClick={handleMenuClose}
                    onCloseKeyPressed={handleMenuClose}
                >
                    <div className="chat-context-menu">
                        <div
                            className="chat-context-menu-item"
                            onClick={handleEditClick}
                        >
                            <FrokIcon name="Edit" style={{ fontSize: 18 }} />
                            <span>Rename</span>
                        </div>
                        <div
                            className="chat-context-menu-item delete"
                            onClick={handleDeleteClick}
                        >
                            <FrokIcon name="Delete" style={{ fontSize: 18 }} />
                            <span>Delete</span>
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
