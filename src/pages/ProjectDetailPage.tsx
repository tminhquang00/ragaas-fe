import { ConfigEditor } from '../components/projects';
import { PipelineEditor } from '../components/pipeline';
import './ProjectDetailPage.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    TabNavigation,
    Tab,
    Chip,
    Notification,
    Tile,
    Breadcrumbs as FrokBreadcrumbs,
    Link as FrokLink,
    Tooltip,
    Toggle,
    ProgressIndicator,
    OptionBar,
    OptionBarItem,
    Badge,
    ActivityIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../utils/iconAdapter';
import { UploadZone, DocumentList } from '../components/documents';
import { SharePointBrowser } from '../components/sharepoint';
import { DocupediaIngest } from '../components/docupedia';
import { ChatInterface } from '../components/chat';
import { WidgetEmbed } from '../components/widget';
import { MembersPanel, RoleBadge } from '../components/sharing';
import { DatabaseConnection } from '../components/database';
import { useAuth } from '../context';
import { Project, Document, SourceReference, UploadTaskStatus, PipelineConfig, StepProgress, AgentAction, ChatSession, getUserRole, hasPermission, ConnectionStatus } from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index} className="project-detail-panel">
        {value === index && children}
    </div>
);

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceReference[];
    timestamp: Date;
    attachments?: File[];
    images?: { data?: string; url?: string; mime_type: string }[];
    metadata?: {
        uploaded_files?: { filename: string; mime_type: string }[];
        [key: string]: any;
    };
}

interface UploadFile {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

export const ProjectDetailPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { apiClient, tenantId } = useAuth();

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

    // Documents source tab: 'local' | 'sharepoint' | 'docupedia'
    const [sourceTab, setSourceTab] = useState<'local' | 'sharepoint' | 'docupedia'>('local');

    // Database connection status (for badge + chat hint)
    const [dbStatus, setDbStatus] = useState<ConnectionStatus | null>(null);
    const [dbDisplayName, setDbDisplayName] = useState<string | null>(null);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [streamingContent, setStreamingContent] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    // const [sessionsLoading, setSessionsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [steps, setSteps] = useState<StepProgress[]>([]);
    const [agentAction, setAgentAction] = useState<AgentAction | null>(null);

    // Refs for throttling streaming updates
    const streamingBufferRef = useRef('');
    const rafIdRef = useRef<number | null>(null);

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
            const msg = err instanceof Error ? err.message : 'Failed to load project';
            if (msg.includes('do not have access') || msg.includes('403')) {
                navigate('/projects');
                return;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId, navigate]);

    const fetchDocuments = useCallback(async () => {
        if (!apiClient || !projectId) return;

        try {
            const response = await apiClient.listDocuments(projectId);
            setDocuments(response.documents);
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
    }, [apiClient, projectId]);

    const fetchSessions = useCallback(async () => {
        if (!apiClient || !projectId) return;
        try {
            // setSessionsLoading(true);
            const data = await apiClient.getSessions(projectId);
            setSessions(data.sessions);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            // setSessionsLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        fetchProject();
        fetchDocuments();
    }, [fetchProject, fetchDocuments]);

    // Fetch sessions when chat tab is active
    useEffect(() => {
        if (tab === 2) {
            fetchSessions();
        }
    }, [tab, fetchSessions]);

    // Load messages when sessionId changes
    useEffect(() => {
        const loadSessionMessages = async () => {
            if (!sessionId) {
                setMessages([]);
                return;
            }

            if (!apiClient || !projectId) return;

            try {
                setChatLoading(true);
                const msgs = await apiClient.getSessionMessages(projectId, sessionId);

                // Convert backend messages to frontend format
                const chatMsgs: ChatMessage[] = msgs.messages.map(m => ({
                    id: m.message_id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                    // Note: Basic message retrieval might not include full source details 
                    // dependent on backend implementation. Assuming basic content for now.
                    sources: m.metadata?.sources as SourceReference[] | undefined,
                    images: m.images,
                    // Pass through metadata to display uploaded files in chat history
                    metadata: m.metadata,
                }));
                setMessages(chatMsgs);
            } catch (err) {
                console.error('Failed to load session messages:', err);
                // Fallback to empty if failed
                setMessages([]);
            } finally {
                setChatLoading(false);
            }
        };

        if (tab === 2) {
            loadSessionMessages();
        }
    }, [sessionId, apiClient, projectId, tab]);

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

    const handleCreateSession = useCallback(() => {
        setSessionId(undefined); // Clears current session, backend creates new one on first message
        setMessages([]);
        setSteps([]);
        setSuggestions([]);
    }, []);

    const handleSelectSession = useCallback((sid: string) => {
        setSessionId(sid);
    }, []);

    const handleDeleteSession = useCallback(async (sid: string) => {
        if (!apiClient || !projectId) return;
        try {
            await apiClient.deleteSession(projectId, sid);
            if (sessionId === sid) {
                handleCreateSession();
            }
            fetchSessions();
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    }, [apiClient, projectId, sessionId, handleCreateSession, fetchSessions]);

    const handleUpdateSession = useCallback(async (sid: string, title: string) => {
        if (!apiClient || !projectId) return;
        try {
            await apiClient.updateSession(projectId, sid, { title });
            fetchSessions();
        } catch (err) {
            console.error('Failed to update session:', err);
        }
    }, [apiClient, projectId, fetchSessions]);

    const handleSearchSessions = useCallback(async (query: string) => {
        if (!apiClient || !projectId) return;
        if (!query.trim()) {
            fetchSessions();
            return;
        }

        try {
            const result = await apiClient.searchSessions(projectId, query);
            setSessions(result.sessions);
        } catch (err) {
            console.error('Failed to search sessions:', err);
        }
    }, [apiClient, projectId, fetchSessions]);


    const handleSendMessage = async (query: string, sid?: string, files?: File[]) => {
        if (!apiClient || !projectId) return;

        // ... (userMessage creation)
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
        setSteps([]);
        setAgentAction(null);

        try {
            // ... (file processing)
            const processedFiles: { filename: string; data: string; mime_type?: string }[] = [];
            const processedImages: { data: string; mime_type: string }[] = [];

            if (files && files.length > 0) {
                for (const file of files) {
                    const base64Data = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result as string;
                            const base64 = result.split(',')[1];
                            resolve(base64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

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
            // Use current sessionId if not explicitly provided
            let newSessionId = sid || sessionId;

            const chatRequest: {
                query: string;
                session_id?: string;
                files?: { filename: string; data: string; mime_type?: string }[];
                images?: { data: string; mime_type: string }[];
            } = {
                query,
                session_id: newSessionId,
            };

            if (processedFiles.length > 0) {
                chatRequest.files = processedFiles;
            }

            if (processedImages.length > 0) {
                chatRequest.images = processedImages;
            }

            // ... (raf setup)
            const scheduleUpdate = () => {
                if (rafIdRef.current === null) {
                    rafIdRef.current = requestAnimationFrame(() => {
                        setStreamingContent(streamingBufferRef.current);
                        rafIdRef.current = null;
                    });
                }
            };


            setIsStreaming(true);
            streamingBufferRef.current = '';

            for await (const chunk of apiClient.streamChat(projectId, chatRequest)) {
                // Check for error chunk type - cast to any to handle potential type mismatches
                if ((chunk as any).type === 'error') {
                    const errorMsg = typeof chunk.data === 'string' ? chunk.data : (chunk.data as any)?.message || 'Unknown error';
                    throw new Error(errorMsg);
                }

                // Handle different chunk types
                switch (chunk.type) {
                    case 'content':
                        fullContent += chunk.data;
                        streamingBufferRef.current = fullContent;
                        scheduleUpdate();
                        break;
                    case 'source':
                        // ... (source parsing unchanged)
                        let sourceData: Record<string, unknown> | null = null;
                        if (chunk.data) {
                            try {
                                sourceData = typeof chunk.data === 'string'
                                    ? JSON.parse(chunk.data)
                                    : chunk.data as Record<string, unknown>;
                            } catch (e) {
                                // Removed console.warn as per instruction
                            }
                        }
                        // Fallback to metadata if data parsing failed or was empty, 
                        // but only if metadata looks like a source (has document_id)
                        if (!sourceData && chunk.metadata && chunk.metadata.document_id) {
                            sourceData = chunk.metadata as Record<string, unknown>;
                        }

                        if (sourceData) {
                            const sourceRef: SourceReference = {
                                document_id: String(sourceData.document_id || ''),
                                document_name: String(sourceData.document_name || sourceData.source_doc_name || 'Unknown'),
                                chunk_id: String(sourceData.chunk_id || ''),
                                excerpt: String(sourceData.excerpt || sourceData.content || ''),
                                relevance_score: Number(sourceData.relevance_score || sourceData.score || 0),
                                position: sourceData.position as string | undefined,
                                source_type: (sourceData.source_type as SourceReference['source_type']) || undefined,
                                page_number: sourceData.page_number !== undefined && sourceData.page_number !== null
                                    ? Number(sourceData.page_number) : undefined,
                                bounding_box: sourceData.bounding_box as SourceReference['bounding_box'],
                                page_image_url: sourceData.page_image_url as string | undefined,
                                source_url: sourceData.source_url as string | undefined,
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
                        setAgentAction(null);
                        break;
                    case 'step_start':
                        // ...
                        const stepData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
                        if (stepData) {
                            setSteps(prev => [...prev, {
                                name: stepData.name || 'Unknown step',
                                step_type: stepData.step_type || 'unknown',
                                status: 'running',
                            }]);
                        }
                        break;
                    case 'step_end':
                        // ...
                        const endData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
                        if (endData) {
                            setSteps(prev => prev.map(s =>
                                s.name === endData.name
                                    ? { ...s, status: endData.status === 'error' ? 'error' : 'completed', duration_ms: endData.duration_ms }
                                    : s
                            ));
                        }
                        break;
                    case 'agent_action':
                        // ...
                        const actionData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
                        if (actionData) {
                            setAgentAction({
                                step: actionData.step || '',
                                action: actionData.action || '',
                                tool: actionData.tool,
                                input: actionData.input,
                            });
                        }
                        break;
                    case 'error':
                        // ...
                        const errorData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
                        const errorMessage = errorData?.message || errorData?.error || 'An error occurred';
                        setError(errorMessage);
                        setSteps(prev => prev.map(s =>
                            s.status === 'running' ? { ...s, status: 'error' } : s
                        ));
                        break;
                }
            }

            // ... (finalize)
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            setIsStreaming(false);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                sources,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent('');

            // Only update session ID if it changed
            if (newSessionId && newSessionId !== sessionId) {
                setSessionId(newSessionId);
                fetchSessions(); // Refresh list to show new session
            }
            // Also refresh sessions if we just added a message to an existing session, 
            // to update the timestamp/summary if needed? 
            // Usually mostly needed on creation.

            setSteps([]);
            setAgentAction(null);
        } catch (err) {
            // ... (error handling)
            setIsStreaming(false);
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            setError(err instanceof Error ? err.message : 'Chat failed');
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                <ActivityIndicator size="large" />
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h6 style={{ color: 'var(--app-text-secondary)' }}>
                    Project not found
                </h6>
                <Button mode="tertiary" onClick={() => navigate('/projects')} style={{ marginTop: '1rem' }}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    const statusColor = {
        draft: 'warning',
        active: 'success',
        archived: undefined,
    }[project.status] as 'warning' | 'success' | undefined;

    const userRole = getUserRole(project, tenantId);
    const isOwner = userRole === 'owner';
    const isEditorOrAbove = hasPermission(project, tenantId, 'editor');

    return (
        <div className="project-detail-page">
            {/* Breadcrumbs */}
            <div style={{ marginBottom: '1rem' }}>
                <FrokBreadcrumbs>
                    <FrokLink
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            navigate('/projects');
                        }}
                    >
                        Projects
                    </FrokLink>
                    <FrokLink href="#">{project.name}</FrokLink>
                </FrokBreadcrumbs>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button mode="integrated" icon="left" aria-label="Back" onClick={() => navigate('/projects')} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h4 style={{ fontWeight: 700, margin: 0 }}>
                                {project.name}
                            </h4>
                            <Badge type={statusColor}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Badge>
                            {userRole && <RoleBadge role={userRole} />}
                        </div>
                        <p style={{ color: 'var(--app-text-secondary)', marginTop: '0.25rem' }}>
                            {project.description || 'No description'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Tooltip content="Refresh">
                        <Button mode="integrated" icon="refresh" aria-label="Refresh" onClick={() => { fetchProject(); fetchDocuments(); }} />
                    </Tooltip>
                    {project.status === 'draft' && isEditorOrAbove && (
                        <Button
                            mode="primary"
                            icon="play"
                            onClick={handleActivate}
                        >
                            Activate
                        </Button>
                    )}
                    {project.status === 'active' && isEditorOrAbove && (
                        <Button
                            mode="secondary"
                            icon={"archive" as any}
                            onClick={handleArchive}
                        >
                            Archive
                        </Button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Notification type="error" variant="banner" open={!!error} onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                </div>
            )}

            {/* Activation Notice */}
            {project.status === 'draft' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        This project is in draft mode. Upload documents and activate it to enable chat functionality.
                    </Notification>
                </div>
            )}

            {/* Tabs */}
            <div className="project-detail-tabs">
                <TabNavigation
                    selectedValue={tab}
                    onTabSelect={(_ev, data) => setTab(data.value as number)}
                >
                    <Tab value={0}>Overview</Tab>
                    <Tab value={1}>Documents</Tab>
                    <Tab value={2} disabled={project.status !== 'active'}>Chat</Tab>
                    <Tab value={3}>Pipeline</Tab>
                    <Tab value={4} disabled={project.status !== 'active'}>Widget</Tab>
                    <Tab value={5}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <FrokIcon name="Storage" />
                            Database
                            {dbStatus === 'connected' && (
                                <Badge type="success">Connected</Badge>
                            )}
                        </span>
                    </Tab>
                    <Tab value={6}>Settings</Tab>
                    <Tab value={7}>Members</Tab>
                </TabNavigation>
            </div>

            {/* Overview Tab */}
            <TabPanel value={tab} index={0}>
                <div className="project-overview-grid">
                    <Tile>
                            <h6 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                                Configuration
                            </h6>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>LLM Model</span>
                                    <span style={{ fontSize: '0.875rem' }}>{project.config?.llm_config?.config_name || 'Not set'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Temperature</span>
                                    <span style={{ fontSize: '0.875rem' }}>{project.config?.llm_config?.temperature || 0.7}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Top K</span>
                                    <span style={{ fontSize: '0.875rem' }}>{project.config?.retrieval_config?.top_k || 5}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Pipeline Type</span>
                                    <span style={{ fontSize: '0.875rem' }}>{project.config?.pipeline_config?.type || 'simple_rag'}</span>
                                </div>
                            </div>
                        </Tile>
                        <Tile>
                            <h6 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                                Statistics
                            </h6>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Documents</span>
                                    <span style={{ fontSize: '0.875rem' }}>{documents.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Total Chunks</span>
                                    <span style={{ fontSize: '0.875rem' }}>
                                        {documents.reduce((sum, d) => sum + (d.chunks_count || 0), 0)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Created</span>
                                    <span style={{ fontSize: '0.875rem' }}>
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>Last Updated</span>
                                    <span style={{ fontSize: '0.875rem' }}>
                                        {new Date(project.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Tile>
                </div>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={tab} index={1}>
                {/* Source toggle */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <OptionBar
                        selectedValue={sourceTab}
                        onOptionSelect={(_e, data) => { if (data.value) setSourceTab(data.value as 'local' | 'sharepoint' | 'docupedia'); }}
                        name="document-source"
                    >
                        <OptionBarItem value="local" icon="folder-open" label="Local Upload" />
                        <OptionBarItem value="sharepoint" icon="link" label="SharePoint" />
                        <OptionBarItem value="docupedia" icon="document-text" label="Docupedia" />
                    </OptionBar>
                </div>

                {sourceTab === 'local' && (
                    <>
                        {/* Task Progress Display (local uploads) */}
                        {uploadTaskStatus && ['pending', 'processing'].includes(uploadTaskStatus.status) && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--app-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--app-primary)', fontSize: '0.875rem' }}>
                                        Processing Documents
                                    </span>
                                    <Chip label={`${uploadTaskStatus.processed_files}/${uploadTaskStatus.total_files} files`} />
                                </div>
                                <ProgressIndicator
                                    type="determinate"
                                    value={(uploadTaskStatus.processed_files / uploadTaskStatus.total_files) * 100}
                                />
                            </div>
                        )}
                        {isEditorOrAbove && (
                            <UploadZone
                                files={uploadFiles}
                                onFilesAdded={handleFilesAdded}
                                onFileRemove={handleFileRemove}
                            />
                        )}
                    </>
                )}

                {sourceTab === 'sharepoint' && apiClient && (
                    <SharePointBrowser
                        projectId={projectId!}
                        apiClient={apiClient}
                        documents={documents}
                        onIngestionStarted={(taskId) => {
                            setUploadTaskId(taskId);
                            setUploadTaskStatus(null);
                        }}
                        uploadTaskStatus={uploadTaskStatus}
                    />
                )}

                {sourceTab === 'docupedia' && apiClient && (
                    <DocupediaIngest
                        projectId={projectId!}
                        apiClient={apiClient}
                        onIngestionStarted={(taskId) => {
                            setUploadTaskId(taskId);
                            setUploadTaskStatus(null);
                        }}
                        uploadTaskStatus={uploadTaskStatus}
                    />
                )}

                {/* Uploaded Documents list — always visible regardless of source tab */}
                <div style={{ marginTop: '2rem' }}>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                        Uploaded Documents
                    </h6>
                    <DocumentList
                        documents={documents}
                        onDelete={isEditorOrAbove ? handleDocumentDelete : undefined}
                    />
                </div>
            </TabPanel>

            {/* Chat Tab */}
            <TabPanel value={tab} index={2}>
                {dbStatus === 'connected' && dbDisplayName && (
                    <div style={{ marginBottom: '1rem' }}>
                        <Notification type="neutral" icon={"database" as any} defaultOpen>
                            Database connected — you can ask questions about your <strong>{dbDisplayName}</strong>.
                        </Notification>
                    </div>
                )}
                <Tile link={undefined} className="project-chat-tile" style={{ height: 'calc(100vh - 350px)' }}>
                    <ChatInterface
                        projectId={projectId!}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={chatLoading}
                        streamingContent={streamingContent}
                        suggestions={suggestions}
                        sessionId={sessionId}
                        apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
                        isStreaming={isStreaming}
                        steps={steps}
                        agentAction={agentAction}
                        sessions={sessions}
                        onSelectSession={handleSelectSession}
                        onCreateSession={handleCreateSession}
                        onDeleteSession={handleDeleteSession}
                        onUpdateSession={handleUpdateSession}
                        onSearch={handleSearchSessions}
                    />
                </Tile>
            </TabPanel>

            {/* Pipeline Tab */}
            <TabPanel value={tab} index={3}>
                <div className="project-pipeline-layout" style={{ height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        {isEditorOrAbove && (
                            <Button
                                mode="primary"
                                icon="save"
                                onClick={handleSavePipeline}
                                disabled={!pipelineDirty}
                            >
                                Save Pipeline
                            </Button>
                        )}
                    </div>
                    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        {project && project.config && (
                            <PipelineEditor
                                initialConfig={project.config.pipeline_config || { type: 'simple_rag', steps: [], chat_history_config: { include_history: true, max_history_turns: 3 } }}
                                onConfigChange={(newConfig) => {
                                    setPendingPipelineConfig(newConfig);
                                    setPipelineDirty(true);
                                }}
                            />
                        )}
                    </div>
                </div>
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

            {/* Database Tab */}
            <TabPanel value={tab} index={5}>
                {apiClient && (
                    <DatabaseConnection
                        projectId={projectId!}
                        apiClient={apiClient}
                        onStatusChange={(s) => setDbStatus(s)}
                        onDisplayNameChange={(n) => setDbDisplayName(n)}
                    />
                )}
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tab} index={6}>
                {project && project.config && (
                    <ConfigEditor
                        config={project.config}
                        onSave={isEditorOrAbove ? handleUpdateProjectConfig : async () => { setError('Insufficient permissions. Required role: editor'); }}
                    />
                )}
            </TabPanel>

            {/* Members Tab */}
            <TabPanel value={tab} index={7}>
                {apiClient && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Visibility Toggle — owner only */}
                        <Tile>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {project.visibility === 'public'
                                        ? <FrokIcon name="Public" style={{ color: '#059669' }} />
                                        : <FrokIcon name="Lock" style={{ color: 'var(--app-text-secondary)' }} />
                                    }
                                    <div>
                                        <p style={{ fontWeight: 600 }}>
                                            {project.visibility === 'public' ? 'Public project' : 'Private project'}
                                        </p>
                                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                                            {project.visibility === 'public'
                                                ? 'Any authenticated user can view and chat with this project.'
                                                : 'Only the owner and explicitly added members can access this project.'}
                                        </p>
                                    </div>
                                </div>
                                <Tooltip content={isOwner ? '' : 'Only the project owner can change visibility'}>
                                    <span>
                                        <Toggle
                                            id="visibility-toggle"
                                            rightLabel="Make public"
                                            checked={project.visibility === 'public'}
                                            disabled={!isOwner}
                                            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newVisibility = e.target.checked ? 'public' : 'private';
                                                try {
                                                    const updated = await apiClient.setVisibility(projectId!, newVisibility);
                                                    setProject(updated);
                                                } catch (err) {
                                                    setError(err instanceof Error ? err.message : 'Failed to update visibility');
                                                }
                                            }}
                                        />
                                    </span>
                                </Tooltip>
                            </div>
                        </Tile>

                        <MembersPanel
                            projectId={projectId!}
                            isOwner={isOwner}
                            onShare={async (userId, role) => {
                                await apiClient.shareProject(projectId!, { user_id: userId, role });
                            }}
                            onRevoke={async (userId) => {
                                await apiClient.revokeMember(projectId!, userId);
                            }}
                            fetchMembers={(pid) => apiClient.listMembers(pid)}
                        />
                    </div>
                )}
            </TabPanel>
        </div>
    );
};
