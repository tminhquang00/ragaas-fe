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
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
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
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceReference } from '../../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceReference[];
    timestamp: Date;
    attachments?: File[];
    isStreaming?: boolean;
}

interface ChatInterfaceProps {
    projectId: string;
    onSendMessage: (query: string, sessionId?: string, files?: File[]) => Promise<void>;
    messages: Message[];
    isLoading: boolean;
    streamingContent: string;
    suggestions?: string[];
    sessionId?: string;
}

const SourceCitation: React.FC<{ source: SourceReference }> = ({ source }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 1,
                background: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <DocIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500}>
                    {source.document_name}
                </Typography>
                {source.position && (
                    <Typography variant="caption" color="text.secondary">
                        {source.position}
                    </Typography>
                )}
                <Chip
                    size="small"
                    label={`${Math.round(source.relevance_score * 100)}%`}
                    color="success"
                    sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{source.excerpt}"
            </Typography>
        </Box>
    );
};

// Markdown renderer component with custom styling
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
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
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    projectId: _projectId,
    onSendMessage,
    messages,
    isLoading,
    streamingContent,
    suggestions = [],
    sessionId,
}) => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

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
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
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
            {...getRootProps()}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 200px)',
                position: 'relative',
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
                        PDF, Word, TXT, Markdown, or Images
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
                            {/* Attached files for user messages */}
                            {message.attachments && message.attachments.length > 0 && (
                                <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {message.attachments.map((file, idx) => (
                                        <Chip
                                            key={idx}
                                            icon={<FileIcon />}
                                            label={file.name}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Message content with markdown for assistant, plain text for user */}
                            {message.role === 'assistant' ? (
                                <MarkdownRenderer content={message.content} />
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
                                            <SourceCitation key={idx} source={source} />
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            )}
                        </Paper>
                    </Box>
                ))}

                {/* Streaming Response */}
                {streamingContent && (
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
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                maxWidth: '75%',
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
                    </Box>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            }}
                        >
                            <BotIcon />
                        </Avatar>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                                Thinking...
                            </Typography>
                        </Box>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* Suggestions */}
            {suggestions.length > 0 && messages.length > 0 && (
                <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {suggestions.map((suggestion, idx) => (
                        <Chip
                            key={idx}
                            label={suggestion}
                            size="small"
                            icon={<SuggestIcon />}
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{ cursor: 'pointer' }}
                            variant="outlined"
                        />
                    ))}
                </Box>
            )}

            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <List dense sx={{ py: 0 }}>
                        {attachedFiles.map((file, index) => (
                            <ListItem
                                key={`${file.name}-${index}`}
                                sx={{
                                    py: 0.5,
                                    px: 1,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    background: alpha(theme.palette.primary.main, 0.1),
                                }}
                                secondaryAction={
                                    <IconButton edge="end" size="small" onClick={() => removeFile(index)}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <FileIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={formatFileSize(file.size)}
                                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* Input Area */}
            <Box
                sx={{
                    p: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    background: alpha(theme.palette.background.paper, 0.5),
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={attachedFiles.length > 0 ? "Add a message about the files..." : "Ask a question..."}
                    inputRef={inputRef}
                    disabled={isLoading}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title="Attach files">
                                    <IconButton size="small" onClick={open}>
                                        <AttachIcon color={attachedFiles.length > 0 ? 'primary' : 'inherit'} />
                                    </IconButton>
                                </Tooltip>
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                        },
                    }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                    Drop files here or click 📎 to attach • Supports PDF, Word, TXT, MD, Images
                </Typography>
            </Box>
        </Box>
    );
};
