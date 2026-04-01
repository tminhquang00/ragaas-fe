import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import {
    Chip,
    Button,
    ProgressIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

interface UploadFile {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

interface UploadZoneProps {
    files: UploadFile[];
    onFilesAdded: (files: File[]) => void;
    onFileRemove: (file: File) => void;
    disabled?: boolean;
    maxFiles?: number;
}

const acceptedTypes: Accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
};

export const UploadZone: React.FC<UploadZoneProps> = ({
    files,
    onFilesAdded,
    onFileRemove,
    disabled = false,
    maxFiles = 10,
}) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onFilesAdded(acceptedFiles);
        },
        [onFilesAdded]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: acceptedTypes,
        disabled,
        maxFiles: maxFiles - files.length,
    });

    const getStatusIcon = (status: UploadFile['status']) => {
        switch (status) {
            case 'success':
                return <FrokIcon name="CheckCircle" style={{ color: 'var(--app-success)' }} />;
            case 'error':
                return <FrokIcon name="Error" style={{ color: 'var(--app-error)' }} />;
            case 'uploading':
                return <FrokIcon name="Pending" style={{ color: 'var(--app-primary)' }} />;
            default:
                return <FrokIcon name="InsertDriveFile" />;
        }
    };

    const borderColor = isDragReject
        ? 'var(--app-error)'
        : isDragActive
            ? 'var(--app-primary)'
            : 'color-mix(in srgb, var(--app-primary) 30%, transparent)';

    return (
        <div>
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                style={{
                    border: `2px dashed ${borderColor}`,
                    padding: '2rem',
                    textAlign: 'center' as const,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    background: isDragActive
                        ? 'color-mix(in srgb, var(--app-primary) 5%, transparent)'
                        : 'transparent',
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                <input {...getInputProps()} />
                <FrokIcon
                    name="CloudUpload"
                    style={{
                        fontSize: '3.5rem',
                        color: isDragActive ? 'var(--app-primary)' : 'var(--app-text-secondary)',
                        marginBottom: '1rem',
                    }}
                />
                <h6 style={{ margin: '0 0 0.5rem' }}>
                    {isDragActive
                        ? 'Drop files here'
                        : 'Drag & drop files here'}
                </h6>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                    or click to browse
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip label="PDF" />
                    <Chip label="DOCX" />
                    <Chip label="XLSX" />
                    <Chip label="PPTX" />
                    <Chip label="TXT" />
                    <Chip label="MD" />
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                    {files.map((uploadFile, index) => (
                        <li
                            key={`${uploadFile.file.name}-${index}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                background: 'var(--app-bg-surface)',
                            }}
                        >
                            {getStatusIcon(uploadFile.status)}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span>{uploadFile.file.name}</span>
                                <div>
                                    <small style={{ color: 'var(--app-text-secondary)' }}>
                                        {(uploadFile.file.size / 1024).toFixed(1)} KB
                                    </small>
                                    {uploadFile.status === 'uploading' && (
                                        <ProgressIndicator
                                            type="determinate"
                                            value={uploadFile.progress || 0}
                                        />
                                    )}
                                    {uploadFile.error && (
                                        <small style={{ display: 'block', color: 'var(--app-error)' }}>
                                            {uploadFile.error}
                                        </small>
                                    )}
                                </div>
                            </div>
                            <Chip label={uploadFile.status} />
                            <Button
                                mode="integrated"
                                icon="close"
                                onClick={() => onFileRemove(uploadFile.file)}
                                disabled={uploadFile.status === 'uploading'}
                                aria-label="Remove file"
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
