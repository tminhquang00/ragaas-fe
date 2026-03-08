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
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
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

    // Multipage state
    // Store as 1-indexed to match PDF and API page parameter conventions.
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // Determine the valid page ranges
    const minPage = source?.page_range?.[0] ?? (source?.page_number !== undefined ? source.page_number + 1 : 1);
    const maxPage = source?.page_range?.[1] ?? (source?.page_number !== undefined ? source.page_number + 1 : 1);
    const hasMultiplePages = minPage < maxPage;

    // Build image URL using Priority sequence defined in Backend-docs
    const imageUrl = React.useMemo(() => {
        if (!source) return null;

        // 0. Use the backend-provided per-page URL if it perfectly matches
        if (source.page_image_urls?.[currentPage]) {
            const url = source.page_image_urls[currentPage];
            return url.startsWith('http') ? url : `${baseUrl}${url}`;
        }

        // 1. Primary path: hash_unique_id (most accurate — loads full elements_detail from DB)
        if (source.hash_unique_id && source.binary_hash) {
            return `${baseUrl}/api/v1/page-multi-highlight/${source.binary_hash}?page_no=${currentPage}&hash_unique_id=${source.hash_unique_id}`;
        }

        // 2. New batch processor bounding_box_points
        if (source.bounding_box_points && source.binary_hash) {
            const params = new URLSearchParams({
                page_no: currentPage.toString(),
                bbox_l: source.bounding_box_points.l.toString(),
                bbox_t: source.bounding_box_points.t.toString(),
                bbox_r: source.bounding_box_points.r.toString(),
                bbox_b: source.bounding_box_points.b.toString(),
                coord_system: source.bounding_box_points.coord_system,
                coord_origin: source.bounding_box_points.coord_origin
            });
            return `${baseUrl}/api/v1/page-highlight/${source.binary_hash}?${params.toString()}`;
        }

        // 3. elements_detail with coordinates
        if (source.binary_hash && source.elements_detail?.length) {
            return `${baseUrl}/api/v1/page-multi-highlight/${source.binary_hash}?page_no=${currentPage}`;
        }

        // 4. Legacy normalized bounding_box
        if (source.binary_hash && source.bounding_box) {
            return getApiClient().buildVisualGroundingUrl(
                source.binary_hash,
                currentPage,
                source.bounding_box
            );
        }

        // 5. Fallback first-page page_image_url
        if (source.page_image_url) {
            return source.page_image_url.startsWith('http')
                ? source.page_image_url
                : `${baseUrl}${source.page_image_url}`;
        }

        // 6. Plain page image baseline fallback
        if (source.binary_hash && source.page_number !== undefined) {
            return `${baseUrl}/api/v1/page/${source.binary_hash}?page_no=${currentPage}`;
        }

        return null; // 7. null - no grounding
    }, [source, baseUrl, currentPage]);

    // Reset state when source changes or modal opens - prevents stale image/state
    useEffect(() => {
        if (open && source) {
            setLoading(true);
            setError(null);
            setZoom(1);
            // Re-initialize to the min start page
            setCurrentPage(source?.page_range?.[0] ?? (source?.page_number !== undefined ? source.page_number + 1 : 1));
        }
    }, [open, source?.document_id, source?.page_number, source?.chunk_id]);

    // Clear loading state if imageUrl is null (e.g., failed to build URL)
    useEffect(() => {
        if (open && source && !imageUrl) {
            setLoading(false);
        }
    }, [open, source, imageUrl]);

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
                    {hasMultiplePages ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, p: 0.5, borderRadius: 1, background: alpha(theme.palette.divider, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <IconButton 
                                size="small" 
                                onClick={() => setCurrentPage(p => Math.max(minPage, p - 1))}
                                disabled={currentPage <= minPage}
                                sx={{ p: 0.5 }}
                            >
                                <PrevIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" sx={{ px: 1, minWidth: 60, textAlign: 'center', fontWeight: 500 }}>
                                Page {currentPage}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
                                disabled={currentPage >= maxPage}
                                sx={{ p: 0.5 }}
                            >
                                <NextIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        source.page_number !== undefined && (
                            <Chip
                                size="small"
                                label={`Page ${source.page_number + 1}`}
                                color="primary"
                                variant="outlined"
                            />
                        )
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
                            alt={`Page ${currentPage} of ${source.document_name}`}
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
                                borderRadius: 0,
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
