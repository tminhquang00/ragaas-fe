import { ConfigEditor } from '../components/projects';
import { PipelineEditor } from '../components/pipeline';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Chip,
    IconButton,
    Alert,
    Skeleton,
    Card,
    CardContent,
    Grid,
    useTheme,

    Breadcrumbs,
    Link,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    PlayArrow as ActivateIcon,
    Archive as ArchiveIcon,
    Refresh as RefreshIcon,
    Circle as CircleIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { UploadZone, DocumentList } from '../components/documents';
import { ChatInterface } from '../components/chat';
import { WidgetEmbed } from '../components/widget';
import { useAuth } from '../context';
import { Project, Document, SourceReference, UploadTaskStatus } from '../types';
import { PipelineConfig } from '../types/config';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceReference[];
    timestamp: Date;
    attachments?: File[];
}

interface UploadFile {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

export const ProjectDetailPage: React.FC = () => {
    useTheme();
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { apiClient } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState(0);

    // Document upload state
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
    const [uploadTaskStatus, setUploadTaskStatus] = useState<UploadTaskStatus | null>(null);
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [streamingContent, setStreamingContent] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Pipeline State
    const [pendingPipelineConfig, setPendingPipelineConfig] = useState<PipelineConfig | null>(null);
    const [pipelineDirty, setPipelineDirty] = useState(false);

    const fetchProject = useCallback(async () => {
        if (!apiClient || !projectId) return;

        try {
            setLoading(true);
            const proj = await apiClient.getProject(projectId);
            setProject(proj);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId]);

    const fetchDocuments = useCallback(async () => {
        if (!apiClient || !projectId) return;

        try {
            const response = await apiClient.listDocuments(projectId);
            setDocuments(response.documents);
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        fetchProject();
        fetchDocuments();
    }, [fetchProject, fetchDocuments]);

    // Poll for document status
    useEffect(() => {
        const processingDocs = documents.filter(
            (d) => d.processing_status === 'pending' || d.processing_status === 'processing'
        );

        if (processingDocs.length === 0) return;

        const interval = setInterval(() => {
            fetchDocuments();
        }, 3000);

        return () => clearInterval(interval);
    }, [documents, fetchDocuments]);

    const handleActivate = async () => {
        if (!apiClient || !projectId) return;

        try {
            const updated = await apiClient.activateProject(projectId);
            setProject(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate project');
        }
    };

    const handleArchive = async () => {
        if (!apiClient || !projectId) return;

        try {
            const updated = await apiClient.archiveProject(projectId);
            setProject(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to archive project');
        }
    };

    const handleUpdateProjectConfig = async (newConfig: Record<string, any>) => {
        if (!apiClient || !projectId) return;

        try {
            // Optimistic update could go here, but let's wait for server
            const updated = await apiClient.updateProject(projectId, { config: newConfig as any });
            setProject(updated);
            // Show success message (could add a snackbar later)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project configuration');
            throw err; // Re-throw to let the component know it failed
        }
    };

    const handleSavePipeline = async () => {
        if (!apiClient || !projectId || !project || !pendingPipelineConfig) return;

        try {
            const updatedConfig = {
                ...project.config,
                pipeline_config: pendingPipelineConfig,
            };
            const updated = await apiClient.updateProject(projectId, { config: updatedConfig });
            setProject(updated);
            setPipelineDirty(false);
            setPendingPipelineConfig(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save pipeline');
        }
    };

    // Poll for upload task status
    const pollUploadTaskStatus = useCallback(async (taskId: string) => {
        if (!apiClient || !projectId) return;

        try {
            const status = await apiClient.getUploadTaskStatus(projectId, taskId);
            setUploadTaskStatus(status);

            // Update individual file statuses based on task results
            if (status.results && status.results.length > 0) {
                setUploadFiles(prev => prev.map((f, idx) => {
                    const result = status.results[idx];
                    if (!result) return f;
                    return {
                        ...f,
                        status: result.status === 'success' ? 'success' : 'error',
                        error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
                    };
                }));
            }

            // Stop polling if task is complete
            if (['completed', 'completed_with_errors', 'failed'].includes(status.status)) {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
                setUploadTaskId(null);
                fetchDocuments();
            }
        } catch (err) {
            console.error('Failed to poll task status:', err);
        }
    }, [apiClient, projectId, fetchDocuments]);

    // Start polling when task ID is set
    useEffect(() => {
        if (uploadTaskId && apiClient && projectId) {
            // Initial poll
            pollUploadTaskStatus(uploadTaskId);
            // Set up interval polling
            pollingIntervalRef.current = setInterval(() => {
                pollUploadTaskStatus(uploadTaskId);
            }, 2500);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [uploadTaskId, apiClient, projectId, pollUploadTaskStatus]);

    const handleFilesAdded = async (files: File[]) => {
        if (!apiClient || !projectId) return;

        const newUploadFiles: UploadFile[] = files.map((file) => ({
            file,
            status: 'pending' as const,
        }));

        setUploadFiles((prev) => [...prev, ...newUploadFiles]);
        setUploadTaskStatus(null);

        // Mark all files as uploading
        setUploadFiles((prev) =>
            prev.map((f) =>
                newUploadFiles.some((nf) => nf.file === f.file)
                    ? { ...f, status: 'uploading' as const }
                    : f
            )
        );

        try {
            // Use batch upload API
            const response = await apiClient.uploadDocuments(projectId, files);
            setUploadTaskId(response.task_id);
        } catch (err) {
            // Mark all new files as error
            setUploadFiles((prev) =>
                prev.map((f) =>
                    newUploadFiles.some((nf) => nf.file === f.file)
                        ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' }
                        : f
                )
            );
        }
    };

    const handleFileRemove = (file: File) => {
        setUploadFiles((prev) => prev.filter((f) => f.file !== file));
    };

    const handleDocumentDelete = async (documentId: string) => {
        if (!apiClient || !projectId) return;

        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await apiClient.deleteDocument(projectId, documentId);
            fetchDocuments();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete document');
        }
    };

    const handleSendMessage = async (query: string, sid?: string, files?: File[]) => {
        if (!apiClient || !projectId) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date(),
            attachments: files,
        };
        setMessages((prev) => [...prev, userMessage]);
        setChatLoading(true);
        setStreamingContent('');
        setSuggestions([]);

        try {
            // Process files and images
            const processedFiles: { filename: string; data: string; mime_type?: string }[] = [];
            const processedImages: { data: string; mime_type: string }[] = [];

            if (files && files.length > 0) {
                for (const file of files) {
                    const base64Data = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result as string;
                            // Remove data URL prefix (e.g., "data:image/png;base64,")
                            const base64 = result.split(',')[1];
                            resolve(base64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    // Check if file is an image
                    if (file.type.startsWith('image/')) {
                        processedImages.push({
                            data: base64Data,
                            mime_type: file.type,
                        });
                    } else {
                        processedFiles.push({
                            filename: file.name,
                            data: base64Data,
                            mime_type: file.type,
                        });
                    }
                }
            }

            let fullContent = '';
            const sources: SourceReference[] = [];
            let newSessionId = sid;

            const chatRequest: {
                query: string;
                session_id?: string;
                files?: { filename: string; data: string; mime_type?: string }[];
                images?: { data: string; mime_type: string }[];
            } = {
                query,
                session_id: sid,
            };

            if (processedFiles.length > 0) {
                chatRequest.files = processedFiles;
            }

            if (processedImages.length > 0) {
                chatRequest.images = processedImages;
            }

            for await (const chunk of apiClient.streamChat(projectId, chatRequest)) {
                switch (chunk.type) {
                    case 'content':
                        fullContent += chunk.data;
                        setStreamingContent(fullContent);
                        break;
                    case 'source':
                        // Source data is in chunk.data as a JSON string - parse it first
                        let sourceData: Record<string, unknown> | null = null;

                        // Always try to parse from chunk.data first (contains full source reference)
                        if (chunk.data) {
                            try {
                                sourceData = typeof chunk.data === 'string'
                                    ? JSON.parse(chunk.data)
                                    : chunk.data as Record<string, unknown>;
                            } catch (e) {
                                console.warn('Failed to parse source data:', chunk.data, e);
                            }
                        }

                        // Fallback to metadata only if data parsing failed and metadata has more than just document_id
                        if (!sourceData && chunk.metadata && Object.keys(chunk.metadata).length > 1) {
                            sourceData = chunk.metadata as Record<string, unknown>;
                        }

                        if (sourceData) {
                            console.log('Parsed source:', sourceData);
                            const sourceRef: SourceReference = {
                                document_id: String(sourceData.document_id || ''),
                                document_name: String(sourceData.document_name || sourceData.source_doc_name || 'Unknown'),
                                chunk_id: String(sourceData.chunk_id || ''),
                                excerpt: String(sourceData.excerpt || sourceData.content || ''),
                                relevance_score: Number(sourceData.relevance_score || sourceData.score || 0),
                                position: sourceData.position as string | undefined,
                                // Visual grounding fields
                                source_type: (sourceData.source_type as SourceReference['source_type']) || undefined,
                                page_number: sourceData.page_number !== undefined && sourceData.page_number !== null
                                    ? Number(sourceData.page_number) : undefined,
                                bounding_box: sourceData.bounding_box as SourceReference['bounding_box'],
                                page_image_url: sourceData.page_image_url as string | undefined,
                                source_url: sourceData.source_url as string | undefined,
                                // Document-specific fields
                                section: sourceData.section as string | undefined,
                                sheet_name: sourceData.sheet_name as string | undefined,
                                cell_range: sourceData.cell_range as string | undefined,
                                binary_hash: sourceData.binary_hash as string | undefined,
                            };
                            sources.push(sourceRef);
                        }
                        break;
                    case 'complete':
                        if (chunk.metadata?.session_id) {
                            newSessionId = chunk.metadata.session_id as string;
                        }
                        if (chunk.metadata?.next_suggestions) {
                            setSuggestions(chunk.metadata.next_suggestions as string[]);
                        }
                        break;
                }
            }

            // Add assistant message
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                sources,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent('');
            setSessionId(newSessionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Chat failed');
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={400} height={24} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    Project not found
                </Typography>
                <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
                    Back to Projects
                </Button>
            </Box>
        );
    }

    const statusColor = {
        draft: 'warning',
        active: 'success',
        archived: 'default',
    }[project.status] as 'warning' | 'success' | 'default';

    return (
        <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/projects');
                    }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    Projects
                </Link>
                <Typography color="text.primary">{project.name}</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/projects')}>
                        <BackIcon />
                    </IconButton>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" fontWeight={700}>
                                {project.name}
                            </Typography>
                            <Chip
                                size="small"
                                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                color={statusColor}
                                icon={<CircleIcon sx={{ fontSize: '8px !important' }} />}
                            />
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {project.description || 'No description'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => { fetchProject(); fetchDocuments(); }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    {project.status === 'draft' && (
                        <Button
                            variant="contained"
                            startIcon={<ActivateIcon />}
                            onClick={handleActivate}
                        >
                            Activate
                        </Button>
                    )}
                    {project.status === 'active' && (
                        <Button
                            variant="outlined"
                            startIcon={<ArchiveIcon />}
                            onClick={handleArchive}
                        >
                            Archive
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Activation Notice */}
            {project.status === 'draft' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    This project is in draft mode. Upload documents and activate it to enable chat functionality.
                </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Overview" />
                    <Tab label="Documents" />
                    <Tab label="Chat" disabled={project.status !== 'active'} />
                    <Tab label="Pipeline" />
                    <Tab label="Widget" disabled={project.status !== 'active'} />
                    <Tab label="Settings" />
                </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tab} index={0}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Configuration
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">LLM Model</Typography>
                                        <Typography variant="body2">{project.config?.llm_config?.config_name || 'Not set'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Temperature</Typography>
                                        <Typography variant="body2">{project.config?.llm_config?.temperature || 0.7}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Top K</Typography>
                                        <Typography variant="body2">{project.config?.retrieval_config?.top_k || 5}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Pipeline Type</Typography>
                                        <Typography variant="body2">{project.config?.pipeline_config?.type || 'simple_rag'}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Statistics
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Documents</Typography>
                                        <Typography variant="body2">{documents.length}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Total Chunks</Typography>
                                        <Typography variant="body2">
                                            {documents.reduce((sum, d) => sum + (d.chunks_count || 0), 0)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Created</Typography>
                                        <Typography variant="body2">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                                        <Typography variant="body2">
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={tab} index={1}>
                {/* Task Progress Display */}
                {uploadTaskStatus && ['pending', 'processing'].includes(uploadTaskStatus.status) && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" color="primary">
                                Processing Documents
                            </Typography>
                            <Chip
                                size="small"
                                label={`${uploadTaskStatus.processed_files}/${uploadTaskStatus.total_files} files`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={(uploadTaskStatus.processed_files / uploadTaskStatus.total_files) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}

                <UploadZone
                    files={uploadFiles}
                    onFilesAdded={handleFilesAdded}
                    onFileRemove={handleFileRemove}
                />
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Uploaded Documents
                    </Typography>
                    <DocumentList
                        documents={documents}
                        onDelete={handleDocumentDelete}
                    />
                </Box>
            </TabPanel>

            {/* Chat Tab */}
            <TabPanel value={tab} index={2}>
                <Card sx={{ height: 'calc(100vh - 350px)' }}>
                    <ChatInterface
                        projectId={projectId!}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={chatLoading}
                        streamingContent={streamingContent}
                        suggestions={suggestions}
                        sessionId={sessionId}
                        apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
                    />
                </Card>
            </TabPanel>

            {/* Pipeline Tab */}
            <TabPanel value={tab} index={3}>
                <Box sx={{ height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSavePipeline}
                            disabled={!pipelineDirty}
                        >
                            Save Pipeline
                        </Button>
                    </Box>
                    <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                        {project && project.config && (
                            <PipelineEditor
                                initialConfig={project.config.pipeline_config || { type: 'simple_rag', steps: [], chat_history_config: { include_history: true, max_history_turns: 3 } }}
                                onConfigChange={(newConfig) => {
                                    setPendingPipelineConfig(newConfig);
                                    setPipelineDirty(true);
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </TabPanel>

            {/* Widget Tab */}
            <TabPanel value={tab} index={4}>
                {project && apiClient && (
                    <WidgetEmbed
                        projectId={projectId!}
                        apiClient={apiClient}
                        projectName={project.name}
                    />
                )}
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tab} index={5}>
                {project && project.config && (
                    <ConfigEditor
                        config={project.config}
                        onSave={handleUpdateProjectConfig}
                    />
                )}
            </TabPanel>
        </Box>
    );
};
