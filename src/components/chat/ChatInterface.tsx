import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Avatar,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Tooltip,
    useTheme,
    alpha,
    InputAdornment,
    Modal,
    Fade,
    Backdrop,
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    SmartToy as BotIcon,
    Description as DocIcon,
    AutoAwesome as SuggestIcon,
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
    Visibility as VisibilityIcon,
    PictureAsPdf as PdfIcon,
    Article as DocxIcon,
    TableChart as ExcelIcon,
    Link as LinkIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import BuildIcon from '@mui/icons-material/Build';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceReference, StepProgress, AgentAction, ChatSession, ImageContent } from '../../types';
import { VisualGroundingModal } from './VisualGroundingModal';
import { JsonViewer, isJsonString } from './JsonViewer';
import { ChatSessionList } from './ChatSessionList';

// Represents a file that was uploaded in chat history (from backend)
interface UploadedFileInfo {
    filename: string;
    mime_type: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceReference[];
    timestamp: Date;
    attachments?: File[];
    images?: ImageContent[];
    isStreaming?: boolean;
    metadata?: {
        uploaded_files?: UploadedFileInfo[];
        [key: string]: any;
    };
}

interface ChatInterfaceProps {
    projectId: string;
    onSendMessage: (query: string, sessionId?: string, files?: File[]) => Promise<void>;
    messages: Message[];
    isLoading: boolean;
    streamingContent: string;
    suggestions?: string[];
    sessionId?: string;
    apiBaseUrl?: string;
    isStreaming?: boolean; // Controls scroll behavior: instant during streaming, smooth otherwise
    steps?: StepProgress[]; // Pipeline step progress
    agentAction?: AgentAction | null; // Current agent action

    // Session Management
    sessions?: ChatSession[];
    onSelectSession?: (sessionId: string) => void;
    onCreateSession?: () => void;
    onDeleteSession?: (sessionId: string) => void;
    onUpdateSession?: (sessionId: string, title: string) => Promise<void>;
    onSearch?: (query: string) => void;
}

// ... (skipping to render)

// Find ChatSessionList render
// ... (removed misplaced JSX)

interface SourceCitationProps {
    source: SourceReference;
    onViewVisualGrounding?: (source: SourceReference) => void;
}

const getSourceTypeIcon = (sourceType?: string) => {
    switch (sourceType) {
        case 'pdf':
            return <PdfIcon fontSize="small" color="error" />;
        case 'docx':
            return <DocxIcon fontSize="small" color="primary" />;
        case 'excel':
            return <ExcelIcon fontSize="small" color="success" />;
        case 'confluence':
            return <LinkIcon fontSize="small" color="info" />;
        default:
            return <DocIcon fontSize="small" color="primary" />;
    }
};

// Helper to get icon based on mime type for uploaded files from chat history
const getFileIconByMimeType = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
        return <PdfIcon fontSize="small" color="error" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
        return <DocxIcon fontSize="small" color="primary" />;
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        return <ExcelIcon fontSize="small" color="success" />;
    }
    if (mimeType.startsWith('image/')) {
        return <ImageIcon fontSize="small" color="info" />;
    }
    return <FileIcon fontSize="small" color="action" />;
};

// Memoized source citation component - prevents re-renders when parent updates
const SourceCitation: React.FC<SourceCitationProps> = React.memo(({ source, onViewVisualGrounding }) => {
    const theme = useTheme();
    const hasVisualGrounding = source.source_type === 'pdf' && (
        !!source.page_image_url ||
        (!!source.binary_hash && source.page_number !== undefined && !!source.bounding_box)
    );

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 1,
                background: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                cursor: hasVisualGrounding ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': hasVisualGrounding ? {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                } : {},
            }}
            onClick={() => hasVisualGrounding && onViewVisualGrounding?.(source)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {getSourceTypeIcon(source.source_type)}
                <Typography variant="body2" fontWeight={500}>
                    {source.document_name}
                </Typography>
                {source.page_number !== undefined && (
                    <Chip
                        size="small"
                        label={`Page ${source.page_number + 1}`}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                )}
                {source.position && (
                    <Typography variant="caption" color="text.secondary">
                        {source.position}
                    </Typography>
                )}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {hasVisualGrounding && (
                        <Tooltip title="View highlighted source">
                            <VisibilityIcon fontSize="small" color="primary" />
                        </Tooltip>
                    )}
                    {source.source_url && (
                        <Tooltip title="Open source document">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(source.source_url, '_blank');
                                }}
                            >
                                <LinkIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Chip
                        size="small"
                        label={`${Math.round(source.relevance_score * 100)}%`}
                        color="success"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{source.excerpt}"
            </Typography>
        </Box>
    );
});

// Memoized image attachment component with click-to-view modal
const ImageAttachment: React.FC<{ file: File }> = React.memo(({ file }) => {
    const theme = useTheme();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'scale(1.02)',
                        '& .image-overlay': {
                            opacity: 1,
                        },
                    },
                }}
                onClick={() => setIsModalOpen(true)}
            >
                <Box
                    component="img"
                    src={imageUrl}
                    alt={file.name}
                    sx={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
                <Box
                    className="image-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: alpha(theme.palette.common.black, 0.5),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    <ImageIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
            </Box>

            {/* Full-size image modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 300,
                        sx: { backgroundColor: alpha(theme.palette.common.black, 0.85) },
                    },
                }}
            >
                <Fade in={isModalOpen}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            outline: 'none',
                        }}
                    >
                        <IconButton
                            onClick={() => setIsModalOpen(false)}
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                color: 'white',
                                background: alpha(theme.palette.common.white, 0.1),
                                '&:hover': {
                                    background: alpha(theme.palette.common.white, 0.2),
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={file.name}
                            sx={{
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 2,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'center',
                                mt: 1,
                                color: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            {file.name}
                        </Typography>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
});

// Memoized base64 image component
const Base64ImageAttachment: React.FC<{ image: ImageContent }> = React.memo(({ image }) => {
    const theme = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Construct data URL if data is present, otherwise use url if available
    const imageUrl = image.data
        ? `data:${image.mime_type};base64,${image.data}`
        : image.url || '';

    if (!imageUrl) return null;

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'scale(1.02)',
                        '& .image-overlay': {
                            opacity: 1,
                        },
                    },
                }}
                onClick={() => setIsModalOpen(true)}
            >
                <Box
                    component="img"
                    src={imageUrl}
                    alt="Attached image"
                    sx={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
                <Box
                    className="image-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: alpha(theme.palette.common.black, 0.5),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    <ImageIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
            </Box>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 300,
                        sx: { backgroundColor: alpha(theme.palette.common.black, 0.85) },
                    },
                }}
            >
                <Fade in={isModalOpen}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            outline: 'none',
                        }}
                    >
                        <IconButton
                            onClick={() => setIsModalOpen(false)}
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                color: 'white',
                                background: alpha(theme.palette.common.white, 0.1),
                                '&:hover': {
                                    background: alpha(theme.palette.common.white, 0.2),
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={imageUrl}
                            alt="Full size attachment"
                            sx={{
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 2,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                            }}
                        />
                    </Box>
                </Fade>
            </Modal>
        </>
    );
});

// Memoized markdown renderer - prevents re-parsing on parent re-renders
const MarkdownRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
    const theme = useTheme();

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Custom styling for markdown elements
                p: ({ children }) => (
                    <Typography variant="body1" sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
                        {children}
                    </Typography>
                ),
                h1: ({ children }) => (
                    <Typography variant="h5" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                        {children}
                    </Typography>
                ),
                h2: ({ children }) => (
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                        {children}
                    </Typography>
                ),
                h3: ({ children }) => (
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1.5, mb: 0.5 }}>
                        {children}
                    </Typography>
                ),
                ul: ({ children }) => (
                    <Box component="ul" sx={{ pl: 2, my: 1 }}>
                        {children}
                    </Box>
                ),
                ol: ({ children }) => (
                    <Box component="ol" sx={{ pl: 2, my: 1 }}>
                        {children}
                    </Box>
                ),
                li: ({ children }) => (
                    <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
                        {children}
                    </Typography>
                ),
                code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                        <Box
                            component="code"
                            sx={{
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5,
                                background: alpha(theme.palette.primary.main, 0.15),
                                fontFamily: 'monospace',
                                fontSize: '0.9em',
                            }}
                        >
                            {children}
                        </Box>
                    ) : (
                        <Box
                            component="pre"
                            sx={{
                                p: 2,
                                my: 1,
                                borderRadius: 1,
                                background: alpha(theme.palette.background.default, 0.8),
                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                overflow: 'auto',
                                '& code': {
                                    fontFamily: 'monospace',
                                    fontSize: '0.85em',
                                },
                            }}
                        >
                            <code className={className} {...props}>
                                {children}
                            </code>
                        </Box>
                    );
                },
                blockquote: ({ children }) => (
                    <Box
                        component="blockquote"
                        sx={{
                            pl: 2,
                            py: 0.5,
                            my: 1,
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            background: alpha(theme.palette.primary.main, 0.05),
                            fontStyle: 'italic',
                        }}
                    >
                        {children}
                    </Box>
                ),
                a: ({ children, href }) => (
                    <Typography
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            '&:hover': { color: 'primary.light' },
                        }}
                    >
                        {children}
                    </Typography>
                ),
                table: ({ children }) => (
                    <Box
                        component="table"
                        sx={{
                            width: '100%',
                            my: 1,
                            borderCollapse: 'collapse',
                            '& th, & td': {
                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                p: 1,
                                textAlign: 'left',
                            },
                            '& th': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                fontWeight: 600,
                            },
                        }}
                    >
                        {children}
                    </Box>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
});

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    projectId: _projectId,
    onSendMessage,
    messages,
    isLoading,
    streamingContent,
    suggestions = [],
    sessionId,
    apiBaseUrl = '',
    isStreaming = false,
    steps = [],
    agentAction = null,
    sessions = [],
    onSelectSession,
    onCreateSession,
    onDeleteSession,
    onUpdateSession,
    onSearch,
}) => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Visual grounding modal state
    const [visualGroundingSource, setVisualGroundingSource] = useState<SourceReference | null>(null);
    const [isVisualGroundingOpen, setIsVisualGroundingOpen] = useState(false);

    const handleOpenVisualGrounding = (source: SourceReference) => {
        setVisualGroundingSource(source);
        setIsVisualGroundingOpen(true);
    };

    const handleCloseVisualGrounding = () => {
        setIsVisualGroundingOpen(false);
    };

    // Use instant scroll during streaming to avoid animation queue-up, smooth otherwise
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isStreaming ? 'instant' : 'smooth'
        });
    }, [isStreaming]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent, scrollToBottom]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setAttachedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'text/markdown': ['.md'],
            'text/html': ['.html', '.htm'],
            'application/rtf': ['.rtf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
    });

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

        const query = input.trim();
        const files = [...attachedFiles];
        setInput('');
        setAttachedFiles([]);
        await onSendMessage(query, sessionId, files.length > 0 ? files : undefined);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        inputRef.current?.focus();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                maxHeight: 'calc(100vh - 200px)',
                position: 'relative',
                flexDirection: 'row',
                overflow: 'hidden',
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Box
                {...getRootProps()}
                sx={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <input {...getInputProps()} />

                {/* Drag overlay */}
                {isDragActive && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: alpha(theme.palette.primary.main, 0.1),
                            border: `2px dashed ${theme.palette.primary.main}`,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" color="primary">
                            Drop files to attach
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            PDF, Word, Excel, PowerPoint, CSV, TXT, Markdown, HTML, RTF, or Images
                        </Typography>
                    </Box>
                )}

                {/* Messages Area */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {messages.length === 0 && !streamingContent && (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                opacity: 0.7,
                            }}
                        >
                            <BotIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                            <Typography variant="h6" color="text.secondary">
                                Ask me anything about your documents
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                I'll search through your knowledge base to find answers
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                                💡 Tip: Drag and drop files to include them in your question
                            </Typography>
                        </Box>
                    )}

                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'flex-start',
                                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    background:
                                        message.role === 'user'
                                            ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                                            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                }}
                            >
                                {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                            </Avatar>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    maxWidth: '75%',
                                    background:
                                        message.role === 'user'
                                            ? alpha(theme.palette.secondary.main, 0.1)
                                            : alpha(theme.palette.background.paper, 0.8),
                                    borderRadius: 2,
                                    borderTopRightRadius: message.role === 'user' ? 0 : 16,
                                    borderTopLeftRadius: message.role === 'assistant' ? 0 : 16,
                                }}
                            >
                                {/* Attached files and images for user messages */}
                                {((message.attachments && message.attachments.length > 0) ||
                                    (message.images && message.images.length > 0) ||
                                    (message.metadata?.uploaded_files && message.metadata.uploaded_files.length > 0)) && (
                                        <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {/* Render Base64 Images from History/State */}
                                            {message.images?.map((image, idx) => (
                                                <Base64ImageAttachment key={`bs64-${idx}`} image={image} />
                                            ))}

                                            {/* Render File Attachments (from current session - File objects) */}
                                            {message.attachments?.map((file, idx) => {
                                                const isImage = file.type.startsWith('image/');
                                                if (isImage) {
                                                    return (
                                                        <ImageAttachment key={idx} file={file} />
                                                    );
                                                }
                                                return (
                                                    <Chip
                                                        key={idx}
                                                        icon={<FileIcon />}
                                                        label={file.name}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                );
                                            })}

                                            {/* Render Uploaded Files from Chat History (from backend metadata) */}
                                            {message.metadata?.uploaded_files?.map((file, idx) => (
                                                <Chip
                                                    key={`history-file-${idx}`}
                                                    icon={getFileIconByMimeType(file.mime_type)}
                                                    label={file.filename}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        '& .MuiChip-icon': {
                                                            marginLeft: '8px',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                {/* Message content with markdown for assistant, plain text for user */}
                                {message.role === 'assistant' ? (
                                    isJsonString(message.content) ? (
                                        <JsonViewer content={message.content} />
                                    ) : (
                                        <MarkdownRenderer content={message.content} />
                                    )
                                ) : (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {message.content}
                                    </Typography>
                                )}

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                    <Accordion
                                        sx={{
                                            mt: 2,
                                            background: 'transparent',
                                            boxShadow: 'none',
                                            '&:before': { display: 'none' },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{ px: 0, minHeight: 'auto' }}
                                        >
                                            <Typography variant="body2" color="primary" fontWeight={500}>
                                                📄 {message.sources.length} Source{message.sources.length > 1 ? 's' : ''}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {message.sources.map((source, idx) => (
                                                <SourceCitation
                                                    key={idx}
                                                    source={source}
                                                    onViewVisualGrounding={handleOpenVisualGrounding}
                                                />
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </Paper>
                        </Box>
                    ))}

                    {/* Pipeline Progress */}
                    {(isLoading || steps.length > 0) && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                }}
                            >
                                <BotIcon />
                            </Avatar>
                            <Box sx={{ flex: 1, maxWidth: '75%' }}>
                                {/* Step Progress */}
                                {steps.length > 0 && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            mb: 1,
                                            background: alpha(theme.palette.background.paper, 0.6),
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            Pipeline Progress
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {steps.map((step, idx) => (
                                                <Box
                                                    key={`${step.name}-${idx}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        py: 0.25,
                                                    }}
                                                >
                                                    {step.status === 'completed' && (
                                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                    )}
                                                    {step.status === 'running' && (
                                                        <CircularProgress size={14} thickness={4} />
                                                    )}
                                                    {step.status === 'error' && (
                                                        <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                                    )}
                                                    {step.status === 'pending' && (
                                                        <PendingIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: step.status === 'pending' ? 'text.disabled' : 'text.primary',
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {step.name}
                                                    </Typography>
                                                    {step.duration_ms !== undefined && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {step.duration_ms.toFixed(0)}ms
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Paper>
                                )}

                                {/* Agent Action Indicator */}
                                {agentAction && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            mb: 1,
                                            background: alpha(theme.palette.info.main, 0.08),
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BuildIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                            <Typography variant="body2" fontWeight={500} color="info.main">
                                                {agentAction.action === 'tool_call' ? 'Calling: ' : 'Agent: '}
                                                {agentAction.tool || agentAction.action}
                                            </Typography>
                                        </Box>
                                        {agentAction.input && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    pl: 3,
                                                    fontStyle: 'italic',
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {agentAction.input}
                                            </Typography>
                                        )}
                                    </Paper>
                                )}

                                {/* Streaming content or general loading */}
                                {streamingContent ? (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            background: alpha(theme.palette.background.paper, 0.8),
                                            borderRadius: 2,
                                            borderTopLeftRadius: 0,
                                        }}
                                    >
                                        <MarkdownRenderer content={streamingContent} />
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-block',
                                                width: 8,
                                                height: 16,
                                                background: theme.palette.primary.main,
                                                ml: 0.5,
                                                animation: 'blink 1s infinite',
                                                '@keyframes blink': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0 },
                                                },
                                            }}
                                        />
                                    </Paper>
                                ) : isLoading && steps.length === 0 && !agentAction ? (
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="body2" color="text.secondary">
                                            Thinking...
                                        </Typography>
                                    </Box>
                                ) : null}
                            </Box>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    {attachedFiles.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                            {attachedFiles.map((file, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${file.name} (${formatFileSize(file.size)})`}
                                    onDelete={() => removeFile(idx)}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}

                    {suggestions.length > 0 && messages.length > 0 && !isLoading && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
                            {suggestions.map((suggestion, idx) => (
                                <Chip
                                    key={idx}
                                    icon={<SuggestIcon fontSize="small" />}
                                    label={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    variant="outlined"
                                    clickable
                                    color="primary"
                                    sx={{
                                        borderColor: alpha(theme.palette.primary.main, 0.5),
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            color="primary"
                            onClick={open}
                            disabled={isLoading}
                        >
                            <AttachIcon />
                        </IconButton>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            inputRef={inputRef}
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: theme.palette.background.paper,
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            color="primary"
                                            onClick={handleSend}
                                            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
            </Box>

            {/* Session Sidebar */}
            {sessions.length > 0 && (
                <Box
                    sx={{
                        width: isSidebarOpen ? 300 : 0,
                        transition: 'width 0.3s ease',
                        borderLeft: isSidebarOpen ? `1px solid ${theme.palette.divider}` : 'none',
                        position: 'relative',
                        bgcolor: 'background.paper',
                    }}
                >
                    <IconButton
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        size="small"
                        sx={{
                            position: 'absolute',
                            left: -12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        {isSidebarOpen ? <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', fontSize: 16 }} /> : <ExpandMoreIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />}
                    </IconButton>

                    {isSidebarOpen && onSelectSession && onCreateSession && onDeleteSession && onUpdateSession && (
                        <ChatSessionList
                            sessions={sessions}
                            currentSessionId={sessionId}
                            onSelectSession={onSelectSession}
                            onCreateSession={onCreateSession}
                            onDeleteSession={onDeleteSession}
                            onUpdateSession={onUpdateSession}
                            onSearch={onSearch}
                        />
                    )}
                </Box>
            )}

            {/* Visual Grounding Modal */}
            <VisualGroundingModal
                open={isVisualGroundingOpen}
                onClose={handleCloseVisualGrounding}
                source={visualGroundingSource}
                baseUrl={apiBaseUrl}
            />
        </Box>
    );
};
