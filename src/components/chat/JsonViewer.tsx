import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Collapse,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Check as CheckIcon,
    ExpandMore as ExpandMoreIcon,
    ChevronRight as ChevronRightIcon,
    DataObject as JsonIcon,
    Code as CodeIcon,
} from '@mui/icons-material';

// Utility to detect if a string is valid JSON
export const isJsonString = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    // Must start with { or [ to be a JSON object or array
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
    try {
        JSON.parse(trimmed);
        return true;
    } catch {
        return false;
    }
};

// Parse JSON safely
export const parseJson = (str: string): unknown | null => {
    try {
        return JSON.parse(str.trim());
    } catch {
        return null;
    }
};

interface JsonNodeProps {
    keyName?: string;
    value: unknown;
    depth: number;
    maxDepth: number;
    isLast: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({ keyName, value, depth, maxDepth, isLast }) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(depth < maxDepth);

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isExpandable = isObject || isArray;
    const isEmpty = isExpandable && (isArray ? value.length === 0 : Object.keys(value as object).length === 0);

    const getValueColor = (val: unknown): string => {
        if (val === null) return theme.palette.warning.main;
        if (typeof val === 'boolean') return theme.palette.info.main;
        if (typeof val === 'number') return theme.palette.success.main;
        if (typeof val === 'string') return theme.palette.error.light;
        return theme.palette.text.primary;
    };

    const renderValue = () => {
        if (value === null) return <span style={{ color: getValueColor(value) }}>null</span>;
        if (typeof value === 'boolean') return <span style={{ color: getValueColor(value) }}>{value.toString()}</span>;
        if (typeof value === 'number') return <span style={{ color: getValueColor(value) }}>{value}</span>;
        if (typeof value === 'string') return <span style={{ color: getValueColor(value) }}>"{value}"</span>;
        return null;
    };

    const renderKey = () => {
        if (keyName === undefined) return null;
        return (
            <span style={{ color: theme.palette.primary.main }}>
                "{keyName}"<span style={{ color: theme.palette.text.secondary }}>: </span>
            </span>
        );
    };

    const comma = isLast ? '' : ',';

    if (!isExpandable) {
        return (
            <Box sx={{ pl: depth * 2, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {renderKey()}{renderValue()}{comma}
            </Box>
        );
    }

    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const items = isArray ? (value as unknown[]) : Object.entries(value as object);
    const itemCount = items.length;

    if (isEmpty) {
        return (
            <Box sx={{ pl: depth * 2, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {renderKey()}<span style={{ color: theme.palette.text.secondary }}>{openBracket}{closeBracket}</span>{comma}
            </Box>
        );
    }

    return (
        <Box>
            <Box
                sx={{
                    pl: depth * 2,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                    },
                    borderRadius: 0.5,
                    py: 0.1,
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Box sx={{ width: 16, display: 'flex', alignItems: 'center', mr: 0.5 }}>
                    {isExpanded ? (
                        <ExpandMoreIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    ) : (
                        <ChevronRightIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    )}
                </Box>
                <Box>
                    {renderKey()}
                    <span style={{ color: theme.palette.text.secondary }}>{openBracket}</span>
                    {!isExpanded && (
                        <span style={{ color: theme.palette.text.disabled }}>
                            {' '}{itemCount} {isArray ? 'items' : 'keys'}{' '}
                        </span>
                    )}
                    {!isExpanded && <span style={{ color: theme.palette.text.secondary }}>{closeBracket}</span>}
                    {!isExpanded && comma}
                </Box>
            </Box>
            <Collapse in={isExpanded}>
                <Box>
                    {isArray
                        ? (value as unknown[]).map((item, idx) => (
                            <JsonNode
                                key={idx}
                                value={item}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                                isLast={idx === itemCount - 1}
                            />
                        ))
                        : Object.entries(value as object).map(([k, v], idx) => (
                            <JsonNode
                                key={k}
                                keyName={k}
                                value={v}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                                isLast={idx === itemCount - 1}
                            />
                        ))}
                </Box>
                <Box sx={{ pl: depth * 2, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <span style={{ color: theme.palette.text.secondary }}>{closeBracket}</span>{comma}
                </Box>
            </Collapse>
        </Box>
    );
};

interface JsonViewerProps {
    content: string;
    maxDepth?: number;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ content, maxDepth = 3 }) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const parsedJson = useMemo(() => parseJson(content), [content]);

    const handleCopy = async () => {
        try {
            // Pretty print the JSON when copying
            const formatted = JSON.stringify(parsedJson, null, 2);
            await navigator.clipboard.writeText(formatted);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (parsedJson === null) {
        return <Typography color="error">Invalid JSON</Typography>;
    }

    return (
        <Box
            sx={{
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                background: alpha(theme.palette.background.default, 0.6),
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 0.75,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    background: alpha(theme.palette.primary.main, 0.05),
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <JsonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={500} color="primary">
                        JSON Response
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={showRaw ? 'Tree View' : 'Raw View'}>
                        <IconButton size="small" onClick={() => setShowRaw(!showRaw)}>
                            {showRaw ? <JsonIcon sx={{ fontSize: 16 }} /> : <CodeIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
                        <IconButton size="small" onClick={handleCopy}>
                            {copied ? (
                                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                                <CopyIcon sx={{ fontSize: 16 }} />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Content */}
            <Box
                sx={{
                    p: 1.5,
                    maxHeight: 400,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.primary.main, 0.3),
                        borderRadius: 3,
                    },
                }}
            >
                {showRaw ? (
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {JSON.stringify(parsedJson, null, 2)}
                    </Box>
                ) : (
                    <JsonNode
                        value={parsedJson}
                        depth={0}
                        maxDepth={maxDepth}
                        isLast={true}
                    />
                )}
            </Box>
        </Box>
    );
};

export default JsonViewer;
