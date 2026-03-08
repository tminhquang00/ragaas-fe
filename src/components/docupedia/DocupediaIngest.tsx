import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Collapse,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Select,
    Slider,
    TextField,
    Tooltip,
    Typography,
    Chip,
} from '@mui/material';
import {
    Article as DocupediaIcon,
    FileUpload as IngestIcon,
    Key as TokenIcon,
    Link as LinkIcon,
    Visibility as ShowIcon,
    VisibilityOff as HideIcon,
} from '@mui/icons-material';

import { RAGaaSClient } from '../../services/api';
import { UploadTaskStatus } from '../../types';

// Types

interface DocupediaIngestProps {
    projectId: string;
    apiClient: RAGaaSClient;
    /** Called when ingestion task starts — feeds the task ID into the parent's polling loop */
    onIngestionStarted: (taskId: string) => void;
    /** Task status passed in from parent — updated by polling loop */
    uploadTaskStatus: UploadTaskStatus | null;
}

type ImageHandling = 'llm_describe' | 'skip';

// Component

export const DocupediaIngest: React.FC<DocupediaIngestProps> = ({
    projectId,
    apiClient,
    onIngestionStarted,
    uploadTaskStatus,
}) => {
    // Form state
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [includeChildren, setIncludeChildren] = useState(false);
    const [maxDepth, setMaxDepth] = useState<number>(3);
    const [imageHandling, setImageHandling] = useState<ImageHandling>('llm_describe');

    // Loading / error state
    const [ingesting, setIngesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ingest handler

    async function handleIngest() {
        if (!url.trim() || !token.trim()) return;
        setError(null);
        setIngesting(true);

        try {
            const response = await apiClient.syncConfluence(projectId, {
                url: url.trim(),
                token: token.trim(),
                include_children: includeChildren,
                max_depth: includeChildren ? maxDepth : undefined,
                image_handling: imageHandling,
            });

            const taskId = response.task_id;
            if (taskId) {
                onIngestionStarted(taskId);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to start ingestion');
        } finally {
            setIngesting(false);
        }
    }

    // Derived UI state
    const canIngest = url.trim().length > 0 && token.trim().length > 0 && !ingesting;

    const showProgress =
        uploadTaskStatus &&
        ['pending', 'processing'].includes(uploadTaskStatus.status);

    const progressPct =
        uploadTaskStatus && uploadTaskStatus.total_files > 0
            ? (uploadTaskStatus.processed_files / uploadTaskStatus.total_files) * 100
            : 0;

    // Render

    return (
        <Box>
            {/* Info banner */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 0,
                }}
            >
                <DocupediaIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                        Ingest from Docupedia / Confluence
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Paste a page URL and your personal access token. Pages are fetched,
                        converted to Markdown, and processed through the RAG pipeline in the
                        background.
                    </Typography>
                </Box>
            </Box>

            {/* Form */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>

                {/* URL */}
                <TextField
                    label="Docupedia / Confluence Page URL"
                    placeholder="https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LinkIcon fontSize="small" sx={{ color: 'action.active' }} />
                            </InputAdornment>
                        ),
                    }}
                    helperText="Supported: viewpage?pageId=..., spaces/.../pages/..., display/..."
                />

                {/* Token */}
                <TextField
                    label="Personal Access Token"
                    placeholder="Your Confluence PAT"
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <TokenIcon fontSize="small" sx={{ color: 'action.active' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setShowToken((v) => !v)}
                                    edge="end"
                                    aria-label={showToken ? 'Hide token' : 'Show token'}
                                >
                                    {showToken
                                        ? <HideIcon fontSize="small" />
                                        : <ShowIcon fontSize="small" />
                                    }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    helperText="Create a token at Docupedia Profile > Personal Access Tokens (Read permission)"
                />

                {/* Include children */}
                <Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeChildren}
                                onChange={(e) => setIncludeChildren(e.target.checked)}
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Include child pages recursively
                            </Typography>
                        }
                    />

                    <Collapse in={includeChildren}>
                        <Box sx={{ pl: 4, pr: 2, pt: 1 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                Max depth: <strong>{maxDepth}</strong>
                            </Typography>
                            <Slider
                                value={maxDepth}
                                onChange={(_, val) => setMaxDepth(val as number)}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                size="small"
                                valueLabelDisplay="auto"
                                aria-label="Max depth"
                            />
                        </Box>
                    </Collapse>
                </Box>

                {/* Image handling */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                        Image handling
                    </Typography>
                    <Select
                        value={imageHandling}
                        onChange={(e) => setImageHandling(e.target.value as ImageHandling)}
                        size="small"
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="llm_describe">Describe images with AI</MenuItem>
                        <MenuItem value="skip">Skip images</MenuItem>
                    </Select>
                </Box>

                {/* Action button */}
                <Box>
                    <Tooltip
                        title={
                            !url.trim() || !token.trim()
                                ? 'Enter a page URL and personal access token to continue'
                                : ''
                        }
                    >
                        <span>
                            <Button
                                variant="contained"
                                startIcon={
                                    ingesting
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <IngestIcon />
                                }
                                onClick={handleIngest}
                                disabled={!canIngest}
                            >
                                {ingesting ? 'Starting...' : 'Start Ingestion'}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Progress */}
            {showProgress && (
                <>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'background.paper',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 0,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography variant="subtitle2" color="primary">
                                Processing Docupedia Pages
                            </Typography>
                            <Chip
                                size="small"
                                label={`${uploadTaskStatus!.processed_files}/${uploadTaskStatus!.total_files} pages`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPct}
                            sx={{ height: 8, borderRadius: 0 }}
                        />
                    </Box>
                </>
            )}

            {uploadTaskStatus?.status === 'completed' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Ingestion complete —{' '}
                    {uploadTaskStatus.processed_files} page
                    {uploadTaskStatus.processed_files !== 1 ? 's' : ''} processed.
                </Alert>
            )}

            {uploadTaskStatus?.status === 'completed_with_errors' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Ingestion completed with errors —{' '}
                    {uploadTaskStatus.results.filter((r) => r.status === 'failed').length} page(s) failed.
                </Alert>
            )}

            {uploadTaskStatus?.status === 'failed' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Ingestion failed. {uploadTaskStatus.errors.join(' ')}
                </Alert>
            )}
        </Box>
    );
};
