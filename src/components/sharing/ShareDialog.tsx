import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    Notification,
    Chip,
    TextField,
    Dropdown,
    ActivityIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha } from '../../utils/frokTheme';
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
            title="Share Project"
            modal
            open={open}
            onClose={handleClose}
            onConfirm={handleShare}
            onCancel={handleClose}
            confirmLabel={loading ? 'Sharing…' : 'Share'}
            cancelLabel="Cancel"
            confirmButton={{ disabled: loading || !canShare }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}

                {/* User search / input */}
                <div ref={containerRef} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {useGraphSearch && (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {searching ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <FrokIcon name="Search" />
                                )}
                            </span>
                        )}
                        <div style={{ flex: 1 }}>
                            <TextField
                                id="share-user-input"
                                label={useGraphSearch ? 'Search user *' : 'User ID *'}
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                autoFocus
                                placeholder={useGraphSearch ? 'Type a name or NTID…' : 'e.g. TQU3HC'}
                                autoComplete="off"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !dropdownOpen) handleShare();
                                    if (e.key === 'Escape') setDropdownOpen(false);
                                }}
                            />
                        </div>
                        {selectedUserId && (
                            <Chip
                                label={selectedUserId}
                                buttonClose
                                onClose={() => {
                                    setSelectedUserId('');
                                    setInputValue('');
                                }}
                            />
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {dropdownOpen && suggestions.length > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1400,
                                maxHeight: 280,
                                overflowY: 'auto',
                                marginTop: '4px',
                                border: '1px solid var(--app-border)',
                                background: 'var(--app-bg)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                        >
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                {suggestions.map((user) => (
                                    <li
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = alpha('var(--app-primary)', 0.08);
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = '';
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: alpha('var(--app-primary)', 0.15),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FrokIcon name="Person" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                    {user.displayName}
                                                </span>
                                                <Chip label={user.ntid} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                {user.mail ?? user.userPrincipalName}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {searchError && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--app-error)', marginTop: '0.25rem', display: 'block' }}>
                            {searchError}
                        </span>
                    )}
                </div>

                <Dropdown
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    options={[
                        { name: 'Viewer', value: 'viewer' },
                        { name: 'Editor', value: 'editor' },
                    ]}
                />

                <div
                    style={{
                        padding: '1rem',
                        background: alpha('var(--app-primary)', 0.06),
                        border: `1px solid ${alpha('var(--app-primary)', 0.15)}`,
                    }}
                >
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Role descriptions:
                    </p>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        • <strong>Viewer</strong> — Can chat and read documents (read-only)
                    </p>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                        • <strong>Editor</strong> — Can also upload/delete documents and edit config
                    </p>
                </div>
            </div>
        </Dialog>
    );
};
