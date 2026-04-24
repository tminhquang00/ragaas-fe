import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Badge,
    Button,
    ActivityIndicator,
} from '@bosch/react-frok';
import { Document, ProcessingStatus } from '../../types';

interface DocumentListProps {
    documents: Document[];
    loading?: boolean;
    onDelete?: (documentId: string) => void;
    onRetry?: (documentId: string) => void;
    onView?: (documentId: string) => void;
}

const statusConfig: Record<ProcessingStatus, { type?: 'success' | 'warning' | 'error'; label: string }> = {
    completed: { type: 'success', label: 'Completed' },
    failed: { type: 'error', label: 'Failed' },
    pending: { label: 'Pending' },
    processing: { type: 'warning', label: 'Processing' },
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
    if (loading) {
        return (
            <div style={{ overflow: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell header>Document</TableCell>
                            <TableCell header>Status</TableCell>
                            <TableCell header>Chunks</TableCell>
                            <TableCell header>Size</TableCell>
                            <TableCell header>Uploaded</TableCell>
                            <TableCell header style={{ textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                <ActivityIndicator size="medium" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div
                style={{
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px dashed var(--app-border)',
                }}
            >
                <h6 style={{ margin: '0 0 0.5rem', color: 'var(--app-text-secondary)' }}>
                    No documents yet
                </h6>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                    Upload documents to provide context for your AI agents
                </p>
            </div>
        );
    }

    return (
        <div style={{ overflow: 'auto' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell header>Document</TableCell>
                        <TableCell header>Status</TableCell>
                        <TableCell header>Chunks</TableCell>
                        <TableCell header>Size</TableCell>
                        <TableCell header>Uploaded</TableCell>
                        <TableCell header style={{ textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {documents.map((doc) => {
                        const status = statusConfig[doc.processing_status];

                        return (
                            <TableRow key={doc.document_id}>
                                <TableCell>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{doc.filename}</span>
                                        <br />
                                        <small style={{ color: 'var(--app-text-secondary)' }}>{doc.file_type}</small>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge label={status.label} type={status.type} />
                                    {doc.processing_error && (
                                        <Tooltip content={doc.processing_error}>
                                            <small
                                                style={{ display: 'block', marginTop: '0.25rem', color: 'var(--app-error)', cursor: 'help' }}
                                            >
                                                Error details
                                            </small>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {doc.chunks_count || '--'}
                                </TableCell>
                                <TableCell>
                                    {formatBytes(doc.file_size)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(doc.upload_timestamp)}
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                        {doc.processing_status === 'failed' && onRetry && (
                                            <Tooltip content="Retry">
                                                <Button
                                                    mode="integrated"
                                                    icon="refresh"
                                                    onClick={() => onRetry(doc.document_id)}
                                                    aria-label="Retry"
                                                />
                                            </Tooltip>
                                        )}
                                        {doc.processing_status === 'completed' && onView && (
                                            <Tooltip content="View chunks">
                                                <Button
                                                    mode="integrated"
                                                    icon={"view" as any}
                                                    onClick={() => onView(doc.document_id)}
                                                    aria-label="View chunks"
                                                />
                                            </Tooltip>
                                        )}
                                        {onDelete && (
                                            <Tooltip content="Delete">
                                                <Button
                                                    mode="integrated"
                                                    icon="delete"
                                                    onClick={() => onDelete(doc.document_id)}
                                                    aria-label="Delete"
                                                />
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
