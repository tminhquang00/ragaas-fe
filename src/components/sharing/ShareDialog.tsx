import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Alert,
    CircularProgress,
    alpha,
    useTheme,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Paper,
    Chip,
    InputAdornment,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context';

interface GraphUser {
    id: string;
    displayName: string;
    userPrincipalName: string;
    mail: string | null;
    /** NTID extracted from UPN prefix (e.g. "TQU3HC" from "tqu3hc@bosch.com") */
    ntid: string;
}

/** Call Microsoft Graph /users with $search to find people by name or UPN. */
async function searchGraphUsers(searchTerm: string, accessToken: string): Promise<GraphUser[]> {
    if (!searchTerm.trim()) return [];

    const params = new URLSearchParams({
        $search: `"displayName:${searchTerm}" OR "userPrincipalName:${searchTerm}"`,
        $select: 'id,displayName,userPrincipalName,mail',
        $top: '10',
        $orderby: 'displayName',
    });

    const res = await fetch(
        `https://graph.microsoft.com/v1.0/users?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ConsistencyLevel: 'eventual',
            },
        }
    );

    if (!res.ok) {
        throw new Error(`Graph API error: ${res.status} ${res.statusText}`);
    }

    const data: { value: { id: string; displayName: string; userPrincipalName: string; mail: string | null }[] } =
        await res.json();

    return (data.value ?? []).map((u) => ({
        ...u,
        ntid: u.userPrincipalName.split('@')[0].toUpperCase(),
    }));
}

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    onShare: (userId: string, role: 'editor' | 'viewer') => Promise<void>;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, onShare }) => {
    const theme = useTheme();
    const { getGraphToken } = useAuth();
    const useGraphSearch = import.meta.env.VITE_USE_AZURE_AD?.toLowerCase() === 'true';

    // The resolved user ID that will be sent to the API (NTID when Graph is used)
    const [selectedUserId, setSelectedUserId] = useState('');
    // The text currently shown in the search/input field
    const [inputValue, setInputValue] = useState('');
    const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Graph search state
    const [suggestions, setSuggestions] = useState<GraphUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedUserId('');
            setInputValue('');
            setRole('viewer');
            setError('');
            setSuggestions([]);
            setDropdownOpen(false);
            setSearchError('');
        }
    }, [open]);

    const runSearch = useCallback(
        async (term: string) => {
            if (term.length < 2) {
                setSuggestions([]);
                setDropdownOpen(false);
                return;
            }
            setSearching(true);
            setSearchError('');
            try {
                const token = await getGraphToken();
                if (!token) {
                    setSearchError('Could not acquire Graph token.');
                    return;
                }
                const results = await searchGraphUsers(term, token);
                setSuggestions(results);
                setDropdownOpen(results.length > 0);
            } catch (err) {
                setSearchError(err instanceof Error ? err.message : 'Search failed');
                setSuggestions([]);
                setDropdownOpen(false);
            } finally {
                setSearching(false);
            }
        },
        [getGraphToken]
    );

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setSelectedUserId(''); // Clear resolved ID when user starts typing again

        if (!useGraphSearch) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(value), 350);
    };

    const handleSelectUser = (user: GraphUser) => {
        setSelectedUserId(user.ntid);
        setInputValue(`${user.displayName} (${user.ntid})`);
        setDropdownOpen(false);
        setSuggestions([]);
    };

    const handleShare = async () => {
        // When Graph search is active, require a selection from the list
        const resolvedId = useGraphSearch ? selectedUserId : inputValue.trim();
        if (!resolvedId) {
            setError(useGraphSearch ? 'Please select a user from the search results.' : 'User ID is required');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await onShare(resolvedId, role);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to share project');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const canShare = useGraphSearch ? Boolean(selectedUserId) : Boolean(inputValue.trim());

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: alpha(theme.palette.background.paper, 0.97),
                    backdropFilter: 'blur(20px)',
                },
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonAddIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                        Share Project
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* User search / input */}
                <Box ref={containerRef} sx={{ position: 'relative' }}>
                    <TextField
                        label={useGraphSearch ? 'Search user *' : 'User ID *'}
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        fullWidth
                        autoFocus
                        placeholder={useGraphSearch ? 'Type a name or NTID…' : 'e.g. TQU3HC'}
                        autoComplete="off"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !dropdownOpen) handleShare();
                            if (e.key === 'Escape') setDropdownOpen(false);
                        }}
                        slotProps={{
                            input: {
                                startAdornment: useGraphSearch ? (
                                    <InputAdornment position="start">
                                        {searching ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <SearchIcon fontSize="small" color="action" />
                                        )}
                                    </InputAdornment>
                                ) : undefined,
                                endAdornment: selectedUserId ? (
                                    <InputAdornment position="end">
                                        <Chip
                                            size="small"
                                            label={selectedUserId}
                                            color="primary"
                                            variant="outlined"
                                            onDelete={() => {
                                                setSelectedUserId('');
                                                setInputValue('');
                                            }}
                                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                        />
                                    </InputAdornment>
                                ) : undefined,
                            },
                        }}
                    />

                    {/* Suggestions dropdown */}
                    {dropdownOpen && suggestions.length > 0 && (
                        <Paper
                            elevation={8}
                            sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1400,
                                maxHeight: 280,
                                overflowY: 'auto',
                                mt: 0.5,
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <List disablePadding>
                                {suggestions.map((user) => (
                                    <ListItem
                                        key={user.id}
                                        component="div"
                                        onClick={() => handleSelectUser(user)}
                                        sx={{
                                            cursor: 'pointer',
                                            py: 1,
                                            '&:hover': {
                                                background: alpha(theme.palette.primary.main, 0.08),
                                            },
                                        }}
                                    >
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                                                <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {user.displayName}
                                                    </Typography>
                                                    <Chip
                                                        label={user.ntid}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 18 }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {user.mail ?? user.userPrincipalName}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {searchError && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {searchError}
                        </Typography>
                    )}
                </Box>

                <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={role}
                        label="Role"
                        onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    >
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="editor">Editor</MenuItem>
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 1,
                        background: alpha(theme.palette.info.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                    }}
                >
                    <Typography variant="body2" fontWeight={600} gutterBottom color="text.primary">
                        Role descriptions:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        • <strong>Viewer</strong> — Can chat and read documents (read-only)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • <strong>Editor</strong> — Can also upload/delete documents and edit config
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleShare}
                    disabled={loading || !canShare}
                    startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                    {loading ? 'Sharing…' : 'Share'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
