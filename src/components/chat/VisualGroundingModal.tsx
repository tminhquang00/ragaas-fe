import React, { useState, useEffect } from 'react';
import { Dialog, Chip, ActivityIndicator, Button } from '@bosch/react-frok';
import { alpha, cssVar } from '../../utils/frokTheme';
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
            modal={true}
            title={source.document_name}
            onClose={onClose}
            className="visual-grounding-dialog"
        >
            {/* Custom header with page controls and zoom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {hasMultiplePages ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Button
                                mode="integrated"
                                icon="left"
                                onClick={() => setCurrentPage(p => Math.max(minPage, p - 1))}
                                disabled={currentPage <= minPage}
                                aria-label="Previous page"
                            />
                            <span style={{ padding: '0 8px', minWidth: 60, textAlign: 'center', fontWeight: 500, fontSize: '0.75rem' }}>
                                Page {currentPage}
                            </span>
                            <Button
                                mode="integrated"
                                icon="right"
                                onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
                                disabled={currentPage >= maxPage}
                                aria-label="Next page"
                            />
                        </div>
                    ) : (
                        source.page_number !== undefined && (
                            <Chip label={`Page ${source.page_number + 1}`} />
                        )
                    )}
                    {source.source_type && (
                        <Chip label={source.source_type.toUpperCase()} />
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Button mode="integrated" icon="zoom-out" onClick={handleZoomOut} disabled={zoom <= 0.5} aria-label="Zoom out" />
                    <span style={{ margin: '0 8px', minWidth: 45, textAlign: 'center', fontSize: '0.75rem' }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button mode="integrated" icon="zoom-in" onClick={handleZoomIn} disabled={zoom >= 3} aria-label="Zoom in" />
                    <Button mode="integrated" icon="reset" onClick={handleResetZoom} aria-label="Reset zoom" />
                    {imageUrl && (
                        <Button mode="integrated" icon={"open-in-new" as any} onClick={handleOpenInNewTab} aria-label="Open in new tab" />
                    )}
                </div>
            </div>

            {/* Excerpt */}
            <div
                style={{
                    padding: 16,
                    background: alpha(cssVar('--g-blue-50'), 0.08),
                    border: `1px solid ${alpha(cssVar('--g-blue-50'), 0.25)}`,
                    borderRadius: 4,
                    marginBottom: 16,
                }}
            >
                <p style={{
                    fontStyle: 'italic',
                    color: 'inherit',
                    opacity: 0.9,
                    margin: 0,
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    letterSpacing: '0.01em',
                }}>
                    "{source.excerpt}"
                </p>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Chip label={`${Math.round(source.relevance_score * 100)}% match`} />
                    {source.position && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            {source.position}
                        </span>
                    )}
                </div>
            </div>

            {/* Image container */}
            <div
                style={{
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    minHeight: 400,
                    maxHeight: 'calc(90vh - 300px)',
                    overflow: 'auto',
                    background: alpha(cssVar('--g-gray-50'), 0.05),
                }}
            >
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0' }}>
                        <ActivityIndicator size="medium" />
                        <p style={{ marginTop: 16, color: cssVar('--g-gray-60'), fontSize: '0.875rem' }}>
                            Loading page image...
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0' }}>
                        <p style={{ color: cssVar('--g-red-50'), marginBottom: 8 }}>
                            {error}
                        </p>
                        <p style={{ color: cssVar('--g-gray-60'), fontSize: '0.875rem' }}>
                            Visual grounding may not be available for this source.
                        </p>
                        {source.source_url && (
                            <a
                                href={source.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginTop: 16, color: cssVar('--g-blue-50'), textDecoration: 'underline' }}
                            >
                                Open source document
                            </a>
                        )}
                    </div>
                )}

                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={`Page ${currentPage} of ${source.document_name}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease-in-out',
                            willChange: 'transform',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            display: loading ? 'none' : 'block',
                        }}
                    />
                )}

                {!imageUrl && !loading && !error && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0' }}>
                        <p style={{ color: cssVar('--g-gray-60'), marginBottom: 8 }}>
                            Visual grounding not available for this source.
                        </p>
                        {source.source_url && (
                            <a
                                href={source.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginTop: 16, color: cssVar('--g-blue-50'), textDecoration: 'underline' }}
                            >
                                Open source document
                            </a>
                        )}
                    </div>
                )}
            </div>
        </Dialog>
    );
};
