import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import {
    Box,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    useTheme,
    alpha,
    Chip,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    Close as CloseIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

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
    const theme = useTheme();

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
                return <SuccessIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'uploading':
                return <PendingIcon color="primary" />;
            default:
                return <FileIcon color="action" />;
        }
    };

    const getStatusColor = (status: UploadFile['status']) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'uploading':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            {/* Drop Zone */}
            <Box
                {...getRootProps()}
                sx={{
                    border: `2px dashed ${isDragReject
                            ? theme.palette.error.main
                            : isDragActive
                                ? theme.palette.primary.main
                                : alpha(theme.palette.primary.main, 0.3)
                        }`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    background: isDragActive
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                    opacity: disabled ? 0.6 : 1,
                    '&:hover': !disabled
                        ? {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.05),
                        }
                        : {},
                }}
            >
                <input {...getInputProps()} />
                <UploadIcon
                    sx={{
                        fontSize: 56,
                        color: isDragActive ? 'primary.main' : 'action.active',
                        mb: 2,
                    }}
                />
                <Typography variant="h6" gutterBottom>
                    {isDragActive
                        ? 'Drop files here'
                        : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    or click to browse
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip label="PDF" size="small" variant="outlined" />
                    <Chip label="DOCX" size="small" variant="outlined" />
                    <Chip label="TXT" size="small" variant="outlined" />
                    <Chip label="MD" size="small" variant="outlined" />
                </Box>
            </Box>

            {/* File List */}
            {files.length > 0 && (
                <List sx={{ mt: 2 }}>
                    {files.map((uploadFile, index) => (
                        <ListItem
                            key={`${uploadFile.file.name}-${index}`}
                            sx={{
                                background: alpha(theme.palette.background.paper, 0.5),
                                borderRadius: 1,
                                mb: 1,
                            }}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    onClick={() => onFileRemove(uploadFile.file)}
                                    disabled={uploadFile.status === 'uploading'}
                                >
                                    <CloseIcon />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>{getStatusIcon(uploadFile.status)}</ListItemIcon>
                            <ListItemText
                                primary={uploadFile.file.name}
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {(uploadFile.file.size / 1024).toFixed(1)} KB
                                        </Typography>
                                        {uploadFile.status === 'uploading' && (
                                            <LinearProgress
                                                variant="determinate"
                                                value={uploadFile.progress || 0}
                                                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                            />
                                        )}
                                        {uploadFile.error && (
                                            <Typography variant="caption" color="error">
                                                {uploadFile.error}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            <Chip
                                size="small"
                                label={uploadFile.status}
                                color={getStatusColor(uploadFile.status) as any}
                                sx={{ ml: 2 }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};
