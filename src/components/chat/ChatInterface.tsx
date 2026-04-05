import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chip, Accordion, ActivityIndicator, Button, Icon, Notification } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';
import { alpha, cssVar } from '../../utils/frokTheme';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceReference, StepProgress, AgentAction, ChatSession, ImageContent } from '../../types';
import { VisualGroundingModal } from './VisualGroundingModal';
import { JsonViewer, isJsonString } from './JsonViewer';
import { ChatSessionList } from './ChatSessionList';
import './Chat.css';

// Utility to detect if content is HTML
const isHtmlString = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    // Check for common HTML patterns
    return trimmed.startsWith('<html') || 
           trimmed.startsWith('<!DOCTYPE') ||
           (trimmed.startsWith('<') && /<[a-z][\s\S]*>/i.test(trimmed));
};

// Utility to strip HTML tags and decode entities while preserving structure
const stripHtml = (html: string): string => {
    // Replace block-level elements with newlines to preserve structure
    let processed = html
        // Add double newlines for paragraph breaks
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        // Add newlines for other block elements
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '  • ')
        .replace(/<\/tr>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<h[1-6][^>]*>/gi, '')
        // Handle blockquote with indentation
        .replace(/<blockquote[^>]*>/gi, '\n    ')
        .replace(/<\/blockquote>/gi, '\n');

    // Create a temporary div to parse remaining HTML and decode entities
    const tmp = document.createElement('div');
    tmp.innerHTML = processed;
    // Get text content (this automatically handles HTML entities)
    let text = tmp.textContent || tmp.innerText || '';

    // Clean up excessive whitespace while preserving intentional line breaks
    text = text
        .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
        .replace(/[ \t]+/g, ' ')      // Collapse multiple spaces
        .replace(/^ +/gm, '')         // Remove leading spaces on lines
        .trim();

    return text;
};

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
    isLoadingSessions?: boolean;
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
            return <FrokIcon name="PictureAsPdf" style={{ fontSize: 18, color: cssVar('--g-red-50') }} />;
        case 'docx':
            return <FrokIcon name="Article" style={{ fontSize: 18, color: cssVar('--g-blue-50') }} />;
        case 'excel':
            return <FrokIcon name="TableChart" style={{ fontSize: 18, color: cssVar('--g-green-50') }} />;
        case 'confluence':
            return <FrokIcon name="Link" style={{ fontSize: 18, color: cssVar('--g-blue-50') }} />;
        default:
            return <FrokIcon name="Description" style={{ fontSize: 18, color: cssVar('--g-blue-50') }} />;
    }
};
// Memoized source citation component - prevents re-renders when parent updates
const SourceCitation: React.FC<SourceCitationProps> = React.memo(({ source, onViewVisualGrounding }) => {
    const hasStructuredGrounding = (source.elements_detail && source.elements_detail.length > 0) || false;
    const hasBoundingBoxPoints = source.bounding_box_points != null;
    const hasLegacyGrounding = source.bounding_box != null;
    const hasVisualGrounding = source.source_type === 'pdf' && (
        hasStructuredGrounding || 
        hasBoundingBoxPoints ||
        hasLegacyGrounding || 
        !!source.page_image_url ||
        (!!source.binary_hash && source.page_number !== undefined)
    );

    return (
        <div
            style={{
                padding: 12,
                background: alpha('var(--app-bg-surface)', 0.5),
                border: `1px solid ${alpha('var(--app-border)', 0.5)}`,
                cursor: hasVisualGrounding ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
            }}
            onClick={() => hasVisualGrounding && onViewVisualGrounding?.(source)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {getSourceTypeIcon(source.source_type)}
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {source.document_name}
                </span>
                {source.headings && source.headings.length > 0 && (
                    <span style={{ display: 'block', width: '100%', marginBottom: 4, fontSize: '0.75rem', color: cssVar('--g-gray-60') }}>
                        {source.headings.join(' > ')}
                    </span>
                )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {source.page_range && source.page_range.length === 2 ? (
                    <Chip
                        label={`Pages ${source.page_range[0]}-${source.page_range[1]}`}
                    />
                ) : source.page_number !== undefined && (
                    <Chip
                        label={`Page ${source.page_number + 1}`}
                    />
                )}
                {source.position && (
                    <span style={{ fontSize: '0.75rem', color: cssVar('--g-gray-60') }}>
                        {source.position}
                    </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasVisualGrounding && (
                        <PortalTooltip content="View highlighted source">
                            <span><FrokIcon name="Visibility" style={{ fontSize: 18, color: cssVar('--g-blue-50') }} /></span>
                        </PortalTooltip>
                    )}
                    {source.source_url && (
                        <PortalTooltip content="Open source document">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(source.source_url, '_blank');
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                            >
                                <FrokIcon name="Link" style={{ fontSize: 18 }} />
                            </button>
                        </PortalTooltip>
                    )}
                    <Chip label={`${Math.round(source.relevance_score * 100)}%`} />
                </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: cssVar('--g-gray-60') }}>
                "{source.excerpt}"
            </span>
        </div>
    );
});

// Memoized image attachment component with click-to-view modal
const ImageAttachment: React.FC<{ file: File }> = React.memo(({ file }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <>
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    border: `1px solid ${alpha('var(--major__enabled__default__front, #ccc)', 0.3)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => setIsModalOpen(true)}
            >
                <img
                    src={imageUrl}
                    alt={file.name}
                    style={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            </div>

            {/* Full-size image modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                        <Button
                            mode="integrated"
                            icon="close"
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                color: 'white',
                            }}
                        />
                        <img
                            src={imageUrl}
                            alt={file.name}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                        />
                        <span
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                marginTop: 8,
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.75rem',
                            }}
                        >
                            {file.name}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
});

// Memoized base64 image component
const Base64ImageAttachment: React.FC<{ image: ImageContent }> = React.memo(({ image }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Construct data URL if data is present, otherwise use url if available
    const imageUrl = image.data
        ? `data:${image.mime_type};base64,${image.data}`
        : image.url || '';

    if (!imageUrl) return null;

    return (
        <>
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    border: `1px solid ${alpha('var(--major__enabled__default__front, #ccc)', 0.3)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => setIsModalOpen(true)}
            >
                <img
                    src={imageUrl}
                    alt="Attached image"
                    style={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            </div>

            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                        <Button
                            mode="integrated"
                            icon="close"
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                color: 'white',
                            }}
                        />
                        <img
                            src={imageUrl}
                            alt="Full size attachment"
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
});

// Memoized markdown renderer - prevents re-parsing on parent re-renders
const MarkdownRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p style={{ marginBottom: 8, marginTop: 0, lineHeight: 1.6 }}>
                        {children}
                    </p>
                ),
                h1: ({ children }) => (
                    <h2 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: '1.25rem' }}>
                        {children}
                    </h2>
                ),
                h2: ({ children }) => (
                    <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: '1.1rem' }}>
                        {children}
                    </h3>
                ),
                h3: ({ children }) => (
                    <h4 style={{ fontWeight: 600, marginTop: 12, marginBottom: 4, fontSize: '1rem' }}>
                        {children}
                    </h4>
                ),
                ul: ({ children }) => (
                    <ul style={{ paddingLeft: 16, margin: '8px 0' }}>
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol style={{ paddingLeft: 16, margin: '8px 0' }}>
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li style={{ marginBottom: 4, lineHeight: 1.6 }}>
                        {children}
                    </li>
                ),
                code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                        <code
                            style={{
                                padding: '2px 6px',
                                background: alpha('var(--major__enabled__default__front, #ccc)', 0.05),
                                fontFamily: 'monospace',
                                fontSize: '0.9em',
                            }}
                        >
                            {children}
                        </code>
                    ) : (
                        <pre
                            style={{
                                padding: 16,
                                margin: '8px 0',
                                background: alpha('var(--app-bg-surface)', 0.8),
                                border: `1px solid ${alpha('var(--app-border)', 0.3)}`,
                                overflow: 'auto',
                            }}
                        >
                            <code className={className} {...props} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                                {children}
                            </code>
                        </pre>
                    );
                },
                blockquote: ({ children }) => (
                    <blockquote
                        style={{
                            paddingLeft: 16,
                            padding: '4px 0 4px 16px',
                            margin: '8px 0',
                            borderLeft: `3px solid ${cssVar('--g-blue-50')}`,
                            background: alpha('var(--major__enabled__default__front, #ccc)', 0.02),
                            fontStyle: 'italic',
                        }}
                    >
                        {children}
                    </blockquote>
                ),
                a: ({ children, href }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: cssVar('--g-blue-50'),
                            textDecoration: 'underline',
                        }}
                    >
                        {children}
                    </a>
                ),
                table: ({ children }) => (
                    <table
                        style={{
                            width: '100%',
                            margin: '8px 0',
                            borderCollapse: 'collapse',
                        }}
                    >
                        {children}
                    </table>
                ),
                th: ({ children }) => (
                    <th style={{
                        border: `1px solid ${alpha('var(--major__enabled__default__front, #ccc)', 0.3)}`,
                        padding: 8,
                        textAlign: 'left',
                        background: alpha('var(--major__enabled__default__front, #ccc)', 0.05),
                        fontWeight: 600,
                    }}>
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td style={{
                        border: `1px solid ${alpha('var(--major__enabled__default__front, #ccc)', 0.3)}`,
                        padding: 8,
                        textAlign: 'left',
                    }}>
                        {children}
                    </td>
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
    isLoadingSessions = false,
}) => {
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
        <div className="chat-container ragaas-chat-root">
            <div
                {...getRootProps()}
                className="chat-main"
            >
                <input {...getInputProps()} />

                {/* Drag overlay */}
                {isDragActive && (
                    <div className="chat-drag-overlay">
                        <FrokIcon name="CloudUpload" className="chat-drag-overlay-icon" />
                        <h3 className="chat-drag-overlay-title">
                            Drop files to attach
                        </h3>
                        <p className="chat-drag-overlay-subtitle">
                            PDF, Word, Excel, PowerPoint, CSV, TXT, Markdown, HTML, RTF, or Images
                        </p>
                    </div>
                )}

                {/* Floating history button — overlay, no layout impact */}
                {onSelectSession && !isSidebarOpen && (
                    <Button
                        mode="secondary"
                        icon="history"
                        onClick={() => setIsSidebarOpen(true)}
                        className="chat-history-btn"
                        title="Show chat history"
                    />
                )}

                {/* Messages Area */}
                <div className="chat-messages">
                    {messages.length === 0 && !streamingContent && (
                        <div className="chat-empty-state">
                            <div className="chat-empty-icon">
                                <FrokIcon name="Chat" style={{ fontSize: 40, color: 'white' }} />
                            </div>
                            <h3 className="chat-empty-title">
                                Ask me anything about your documents
                            </h3>
                            <p className="chat-empty-subtitle">
                                I'll search through your knowledge base to find answers
                            </p>
                            <div className="chat-empty-tip-box">
                                <span className="chat-empty-tip">
                                    💡 Tip: Drag and drop files to include them in your question
                                </span>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message-wrapper ${message.role}`}
                        >
                            <div className={`message-avatar ${message.role}`}>
                                {message.role === 'user'
                                    ? <FrokIcon name="Person" style={{ fontSize: 18, color: 'white' }} />
                                    : <FrokIcon name="Chat" style={{ fontSize: 18, color: 'white' }} />
                                }
                            </div>

                            <div className={`message-bubble ${message.role}`}>
                                {/* Attached files and images for user messages */}
                                {((message.attachments && message.attachments.length > 0) ||
                                    (message.images && message.images.length > 0) ||
                                    (message.metadata?.uploaded_files && message.metadata.uploaded_files.length > 0)) && (
                                        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                                                        label={file.name}
                                                    />
                                                );
                                            })}

                                            {/* Render Uploaded Files from Chat History (from backend metadata) */}
                                            {message.metadata?.uploaded_files?.map((file, idx) => (
                                                <Chip
                                                    key={`history-file-${idx}`}
                                                    label={file.filename}
                                                />
                                            ))}
                                        </div>
                                    )}

                                {/* Message content with markdown for assistant, plain text for user */}
                                {message.role === 'assistant' ? (
                                    isJsonString(message.content) ? (
                                        <JsonViewer content={message.content} />
                                    ) : isHtmlString(message.content) ? (
                                        <div className="html-content-wrapper">
                                            <Notification
                                                type="neutral"
                                                icon="document"
                                                defaultOpen
                                                className="html-content-notification"
                                            >
                                                <div className="html-content-inner">
                                                    <div className="html-content-header">
                                                        <span className="html-content-title">HTML Content</span>
                                                        <span className="html-content-badge">Rendered as text</span>
                                                    </div>
                                                    <p className="html-content-body">
                                                        {stripHtml(message.content)}
                                                    </p>
                                                </div>
                                            </Notification>
                                        </div>
                                    ) : (
                                        <MarkdownRenderer content={message.content} />
                                    )
                                ) : (
                                    <p className="message-content">
                                        {message.content}
                                    </p>
                                )}

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                    <Accordion
                                        headline={`📄 ${message.sources.length} Source${message.sources.length > 1 ? 's' : ''}`}
                                        size="small"
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {message.sources.map((source, idx) => (
                                                <SourceCitation
                                                    key={idx}
                                                    source={source}
                                                    onViewVisualGrounding={handleOpenVisualGrounding}
                                                />
                                            ))}
                                        </div>
                                    </Accordion>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pipeline Progress */}
                    {(isLoading || steps.length > 0) && (
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: cssVar('--g-green-50'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    color: 'white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                <FrokIcon name="Chat" style={{ fontSize: 18, color: 'white' }} />
                            </div>
                            <div style={{ flex: 1, maxWidth: '75%' }}>
                                {/* Step Progress */}
                                {steps.length > 0 && (
                                    <div
                                        style={{
                                            padding: 12,
                                            marginBottom: 8,
                                            background: alpha('var(--app-bg-surface)', 0.6),
                                            border: `1px solid ${alpha('var(--app-border)', 0.3)}`,
                                        }}
                                    >
                                        <span style={{ fontSize: '0.75rem', color: cssVar('--g-gray-60'), display: 'block', marginBottom: 8 }}>
                                            Pipeline Progress
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {steps.map((step, idx) => (
                                                <div
                                                    key={`${step.name}-${idx}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        padding: '2px 0',
                                                    }}
                                                >
                                                    {step.status === 'completed' && (
                                                        <FrokIcon name="CheckCircle" style={{ fontSize: 16, color: cssVar('--g-green-50') }} />
                                                    )}
                                                    {step.status === 'running' && (
                                                        <ActivityIndicator size="small" />
                                                    )}
                                                    {step.status === 'error' && (
                                                        <FrokIcon name="Error" style={{ fontSize: 16, color: cssVar('--g-red-50') }} />
                                                    )}
                                                    {step.status === 'pending' && (
                                                        <FrokIcon name="Pending" style={{ fontSize: 16, color: cssVar('--g-gray-50') }} />
                                                    )}
                                                    <span
                                                        style={{
                                                            color: step.status === 'pending' ? cssVar('--g-gray-50') : 'inherit',
                                                            flex: 1,
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {step.name}
                                                    </span>
                                                    {step.duration_ms !== undefined && (
                                                        <span style={{ fontSize: '0.75rem', color: cssVar('--g-gray-60') }}>
                                                            {step.duration_ms.toFixed(0)}ms
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Agent Action Indicator */}
                                {agentAction && (
                                    <div
                                        style={{
                                            padding: 12,
                                            marginBottom: 8,
                                            background: alpha(cssVar('--g-blue-50'), 0.08),
                                            border: `1px solid ${alpha(cssVar('--g-blue-50'), 0.2)}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FrokIcon name="Build" style={{ fontSize: 16, color: cssVar('--g-blue-50') }} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: cssVar('--g-blue-50') }}>
                                                {agentAction.action === 'tool_call' ? 'Calling: ' : 'Agent: '}
                                                {agentAction.tool || agentAction.action}
                                            </span>
                                        </div>
                                        {agentAction.input && (
                                            <span
                                                style={{
                                                    display: 'block',
                                                    marginTop: 4,
                                                    paddingLeft: 24,
                                                    fontStyle: 'italic',
                                                    fontSize: '0.75rem',
                                                    color: cssVar('--g-gray-60'),
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {agentAction.input}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Streaming content or general loading */}
                                {streamingContent ? (
                                    <div
                                        style={{
                                            padding: 16,
                                            background: alpha('var(--app-bg-surface)', 0.8),
                                            border: `1px solid ${alpha('var(--app-border)', 0.2)}`,
                                        }}
                                    >
                                        {isHtmlString(streamingContent) ? (
                                            <div className="html-content-wrapper">
                                                <Notification
                                                    type="neutral"
                                                    icon="document"
                                                    defaultOpen
                                                    className="html-content-notification"
                                                >
                                                    <div className="html-content-inner">
                                                        <div className="html-content-header">
                                                            <span className="html-content-title">HTML Content</span>
                                                            <span className="html-content-badge">Rendered as text</span>
                                                        </div>
                                                        <p className="html-content-body">
                                                            {stripHtml(streamingContent)}
                                                        </p>
                                                    </div>
                                                </Notification>
                                            </div>
                                        ) : (
                                            <MarkdownRenderer content={streamingContent} />
                                        )}
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: 8,
                                                height: 16,
                                                background: cssVar('--g-blue-50'),
                                                marginLeft: 4,
                                                animation: 'blink 1s infinite',
                                            }}
                                        />
                                        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
                                    </div>
                                ) : isLoading && steps.length === 0 && !agentAction ? (
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" />
                                        <span style={{ fontSize: '0.875rem', color: cssVar('--g-gray-60') }}>
                                            Thinking...
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    {attachedFiles.length > 0 && (
                        <div className="chat-attached-files">
                            {attachedFiles.map((file, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${file.name} (${formatFileSize(file.size)})`}
                                    buttonClose
                                    onClose={() => removeFile(idx)}
                                />
                            ))}
                        </div>
                    )}

                    {suggestions.length > 0 && messages.length > 0 && !isLoading && (
                        <div className="chat-suggestions">
                            {suggestions.map((suggestion, idx) => (
                                <Chip
                                    key={idx}
                                    label={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="chat-input-row">
                        <button
                            type="button"
                            className="chat-input-btn chat-input-btn--upload"
                            onClick={open}
                            disabled={isLoading}
                            aria-label="Attach file"
                        >
                            <Icon iconName="upload" />
                        </button>
                        <input
                            type="text"
                            id="chat-input"
                            placeholder="Ask anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            ref={inputRef}
                            className="chat-input-field"
                        />
                        <button
                            type="button"
                            className="chat-input-btn chat-input-btn--send"
                            onClick={handleSend}
                            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                            aria-label="Send message"
                        >
                            <Icon iconName="forward-right" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Session Sidebar */}
            {onSelectSession && isSidebarOpen && onCreateSession && onDeleteSession && onUpdateSession && (
                <div className="chat-sidebar">
                    <button
                        className="chat-sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        title="Close chat history"
                        aria-label="Close chat history"
                    >
                        <Icon iconName="close" isUiIcon style={{ fontSize: '14px' }} />
                    </button>
                    <ChatSessionList
                        sessions={sessions}
                        currentSessionId={sessionId}
                        onSelectSession={onSelectSession}
                        onCreateSession={onCreateSession}
                        onDeleteSession={onDeleteSession}
                        onUpdateSession={onUpdateSession}
                        onSearch={onSearch}
                        isLoading={isLoadingSessions}
                    />
                </div>
            )}

            {/* Visual Grounding Modal */}
            <VisualGroundingModal
                open={isVisualGroundingOpen}
                onClose={handleCloseVisualGrounding}
                source={visualGroundingSource}
                baseUrl={apiBaseUrl}
            />
        </div>
    );
};
