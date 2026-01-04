import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    ListItemIcon,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreIcon,
    Chat as ChatIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
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
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSession, setEditingSession] = useState<{ id: string; title: string } | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuSessionId, setMenuSessionId] = useState<string | null>(null);

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
        setAnchorEl(event.currentTarget);
        setMenuSessionId(sessionId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Chat History
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={onCreateSession}
                    >
                        New Chat
                    </Button>
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
                    }}
                />
            </Box>

            <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
                {Object.entries(groupedSessions).map(([label, groupSessions]) => (
                    <React.Fragment key={label}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ px: 2, py: 1, display: 'block', fontWeight: 600 }}
                        >
                            {label}
                        </Typography>
                        {groupSessions.map((session) => (
                            <ListItem
                                key={session.session_id}
                                disablePadding
                                sx={{ mb: 0.5 }}
                            >
                                <ListItemButton
                                    selected={session.session_id === currentSessionId}
                                    onClick={() => onSelectSession(session.session_id)}
                                    sx={{
                                        borderRadius: 1,
                                        '&.Mui-selected': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <ChatIcon fontSize="small" color={session.session_id === currentSessionId ? 'primary' : 'disabled'} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={session.title || 'Untitled Session'}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            noWrap: true,
                                            fontWeight: session.session_id === currentSessionId ? 500 : 400,
                                        }}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, session.session_id)}
                                            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                        >
                                            <MoreIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </React.Fragment>
                ))}
            </List>

            {/* Menu for Edit/Delete */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Rename</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Rename Dialog */}
            <Dialog open={!!editingSession} onClose={() => setEditingSession(null)}>
                <DialogTitle>Rename Chat</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Chat Title"
                        fullWidth
                        variant="outlined"
                        value={editingSession?.title || ''}
                        onChange={(e) => setEditingSession(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingSession(null)}>Cancel</Button>
                    <Button onClick={handleSaveTitle} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
