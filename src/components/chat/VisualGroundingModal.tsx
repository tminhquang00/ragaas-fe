import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    Chip,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Close as CloseIcon,
    OpenInNew as OpenInNewIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { getApiClient } from '../../services/api';
import { SourceReference } from '../../types';

interface VisualGroundingModalProps {
    open: boolean;
    onClose: () => void;
    source: SourceReference | null;
    baseUrl?: string;
}

export const VisualGroundingModal: React.FC<VisualGroundingModalProps> = ({
    open,
    onClose,
    source,
    baseUrl = '',
}) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const imageUrl = React.useMemo(() => {
        if (!source) return null;

        if (source.page_image_url) {
            return source.page_image_url.startsWith('http')
                ? source.page_image_url
                : `${baseUrl}${source.page_image_url}`;
        }

        if (source.binary_hash && source.page_number !== undefined && source.bounding_box) {
            try {
                // binary_hash is used for retrieving the page image
                // And page_number is 0-indexed (based on the UI display), so we add 1 for the API
                return getApiClient().buildVisualGroundingUrl(
                    source.binary_hash,
                    source.page_number + 1,
                    source.bounding_box
                );
            } catch (error) {
                console.error('Failed to build visual grounding URL:', error);
                return null;
            }
        }

        return null;
    }, [source, baseUrl]);

    // Reset state when source changes or modal opens - prevents stale image/state
    useEffect(() => {
        if (open && source) {
            setLoading(true);
            setError(null);
            setZoom(1);
        }
    }, [open, source?.document_id, source?.page_number]);

    if (!source) return null;

    const handleImageLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleImageError = () => {
        setLoading(false);
        setError('Failed to load page image');
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setZoom(1);
    };

    const handleOpenInNewTab = () => {
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    background: theme.palette.background.paper,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {source.document_name}
                    </Typography>
                    {source.page_number !== undefined && (
                        <Chip
                            size="small"
                            label={`Page ${source.page_number + 1}`}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {source.source_type && (
                        <Chip
                            size="small"
                            label={source.source_type.toUpperCase()}
                            variant="outlined"
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                        <ZoomOutIcon />
                    </IconButton>
                    <Typography variant="caption" sx={{ mx: 1, minWidth: 45, textAlign: 'center' }}>
                        {Math.round(zoom * 100)}%
                    </Typography>
                    <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 3}>
                        <ZoomInIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleResetZoom}>
                        <ResetIcon />
                    </IconButton>
                    {imageUrl && (
                        <IconButton size="small" onClick={handleOpenInNewTab}>
                            <OpenInNewIcon />
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                {/* Excerpt */}
                <Box
                    sx={{
                        p: 2,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{source.excerpt}"
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            size="small"
                            label={`${Math.round(source.relevance_score * 100)}% match`}
                            color="success"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        {source.position && (
                            <Typography variant="caption" color="text.secondary">
                                {source.position}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Image container */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        minHeight: 400,
                        maxHeight: 'calc(90vh - 200px)',
                        overflow: 'auto',
                        background: alpha(theme.palette.grey[500], 0.05),
                    }}
                >
                    {loading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                            <CircularProgress size={48} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Loading page image...
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                            <Typography variant="body1" color="error" gutterBottom>
                                {error}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Visual grounding may not be available for this source.
                            </Typography>
                            {source.source_url && (
                                <Typography
                                    component="a"
                                    href={source.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 2, color: 'primary.main', textDecoration: 'underline' }}
                                >
                                    Open source document
                                </Typography>
                            )}
                        </Box>
                    )}

                    {imageUrl && (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={`Page ${(source.page_number ?? 0) + 1} of ${source.document_name}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            sx={{
                                maxWidth: '100%',
                                height: 'auto',
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center',
                                transition: 'transform 0.2s ease-in-out',
                                willChange: 'transform', // GPU acceleration for smooth zoom
                                boxShadow: theme.shadows[4],
                                borderRadius: 1,
                                display: loading ? 'none' : 'block',
                            }}
                        />
                    )}

                    {!imageUrl && !loading && !error && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Visual grounding not available for this source.
                            </Typography>
                            {source.source_url && (
                                <Typography
                                    component="a"
                                    href={source.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 2, color: 'primary.main', textDecoration: 'underline' }}
                                >
                                    Open source document
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};
