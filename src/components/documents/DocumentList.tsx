import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Typography,
    Box,
    Tooltip,
    Skeleton,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon,
    Settings as ProcessingIcon,
} from '@mui/icons-material';
import { Document, ProcessingStatus } from '../../types';

interface DocumentListProps {
    documents: Document[];
    loading?: boolean;
    onDelete?: (documentId: string) => void;
    onRetry?: (documentId: string) => void;
    onView?: (documentId: string) => void;
}

const statusConfig: Record<ProcessingStatus, { icon: React.ReactNode; color: 'success' | 'error' | 'warning' | 'info' | 'default'; label: string }> = {
    completed: { icon: <SuccessIcon fontSize="small" />, color: 'success', label: 'Completed' },
    failed: { icon: <ErrorIcon fontSize="small" />, color: 'error', label: 'Failed' },
    pending: { icon: <PendingIcon fontSize="small" />, color: 'default', label: 'Pending' },
    processing: { icon: <ProcessingIcon fontSize="small" />, color: 'info', label: 'Processing' },
};

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    loading = false,
    onDelete,
    onRetry,
    onView,
}) => {
    const theme = useTheme();

    if (loading) {
        return (
            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Document</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Chunks</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Uploaded</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton width={200} /></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                                <TableCell><Skeleton width={40} /></TableCell>
                                <TableCell><Skeleton width={60} /></TableCell>
                                <TableCell><Skeleton width={100} /></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    if (documents.length === 0) {
        return (
            <Box
                sx={{
                    p: 6,
                    textAlign: 'center',
                    background: alpha(theme.palette.background.paper, 0.5),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No documents yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Upload documents to get started with your knowledge base
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Chunks</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Uploaded</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {documents.map((doc) => {
                        const status = statusConfig[doc.processing_status];

                        return (
                            <TableRow
                                key={doc.document_id}
                                sx={{
                                    '&:hover': {
                                        background: alpha(theme.palette.primary.main, 0.03),
                                    },
                                }}
                            >
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {doc.filename}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {doc.file_type}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        icon={status.icon as React.ReactElement}
                                        label={status.label}
                                        color={status.color}
                                        variant="outlined"
                                    />
                                    {doc.processing_error && (
                                        <Tooltip title={doc.processing_error}>
                                            <Typography
                                                variant="caption"
                                                color="error"
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                Error details
                                            </Typography>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {doc.chunks_count || '--'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {formatBytes(doc.file_size)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {formatDate(doc.upload_timestamp)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        {doc.processing_status === 'failed' && onRetry && (
                                            <Tooltip title="Retry">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRetry(doc.document_id)}
                                                >
                                                    <RefreshIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {doc.processing_status === 'completed' && onView && (
                                            <Tooltip title="View chunks">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onView(doc.document_id)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {onDelete && (
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(doc.document_id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
