import React, { useState, useMemo } from 'react';
import { Tooltip } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha, cssVar } from '../../utils/frokTheme';

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

const VALUE_COLORS = {
    null: cssVar('--g-yellow-85'),
    boolean: cssVar('--g-blue-50'),
    number: cssVar('--g-green-50'),
    string: cssVar('--g-red-50'),
    key: cssVar('--g-blue-50'),
    bracket: 'var(--major__enabled__default__front, #333)',
    disabled: cssVar('--g-gray-50'),
    secondary: cssVar('--g-gray-60'),
};

const JsonNode: React.FC<JsonNodeProps> = ({ keyName, value, depth, maxDepth, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(depth < maxDepth);

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isExpandable = isObject || isArray;
    const isEmpty = isExpandable && (isArray ? value.length === 0 : Object.keys(value as object).length === 0);

    const getValueColor = (val: unknown): string => {
        if (val === null) return VALUE_COLORS.null;
        if (typeof val === 'boolean') return VALUE_COLORS.boolean;
        if (typeof val === 'number') return VALUE_COLORS.number;
        if (typeof val === 'string') return VALUE_COLORS.string;
        return VALUE_COLORS.secondary;
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
            <span style={{ color: VALUE_COLORS.key }}>
                "{keyName}"<span style={{ color: VALUE_COLORS.secondary }}>: </span>
            </span>
        );
    };

    const comma = isLast ? '' : ',';

    if (!isExpandable) {
        return (
            <div style={{ paddingLeft: depth * 16, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {renderKey()}{renderValue()}{comma}
            </div>
        );
    }

    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const items = isArray ? (value as unknown[]) : Object.entries(value as object);
    const itemCount = items.length;

    if (isEmpty) {
        return (
            <div style={{ paddingLeft: depth * 16, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {renderKey()}<span style={{ color: VALUE_COLORS.bracket }}>{openBracket}{closeBracket}</span>{comma}
            </div>
        );
    }

    return (
        <div>
            <div
                style={{
                    paddingLeft: depth * 16,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '1px 0',
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span style={{ width: 16, display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                    {isExpanded ? (
                        <FrokIcon name="ExpandMore" style={{ fontSize: 14, color: VALUE_COLORS.secondary }} />
                    ) : (
                        <FrokIcon name="ChevronRight" style={{ fontSize: 14, color: VALUE_COLORS.secondary }} />
                    )}
                </span>
                <span>
                    {renderKey()}
                    <span style={{ color: VALUE_COLORS.bracket }}>{openBracket}</span>
                    {!isExpanded && (
                        <span style={{ color: VALUE_COLORS.disabled }}>
                            {' '}{itemCount} {isArray ? 'items' : 'keys'}{' '}
                        </span>
                    )}
                    {!isExpanded && <span style={{ color: VALUE_COLORS.bracket }}>{closeBracket}</span>}
                    {!isExpanded && comma}
                </span>
            </div>
            <div style={{
                maxHeight: isExpanded ? '2000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
            }}>
                <div>
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
                </div>
                <div style={{ paddingLeft: depth * 16, fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <span style={{ color: VALUE_COLORS.bracket }}>{closeBracket}</span>{comma}
                </div>
            </div>
        </div>
    );
};

interface JsonViewerProps {
    content: string;
    maxDepth?: number;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ content, maxDepth = 3 }) => {
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
        return <span style={{ color: cssVar('--g-red-50') }}>Invalid JSON</span>;
    }

    return (
        <div
            style={{
                border: `1px solid ${alpha('var(--app-border)', 0.3)}`,
                background: alpha('var(--app-bg-surface)', 0.6),
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderBottom: `1px solid ${alpha('var(--major__enabled__default__front, #ccc)', 0.3)}`,
                    background: alpha(cssVar('--g-blue-50'), 0.05),
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FrokIcon name="Code" style={{ fontSize: 16, color: cssVar('--g-blue-50') }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: cssVar('--g-blue-50') }}>
                        JSON Response
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tooltip content={showRaw ? 'Tree View' : 'Raw View'}>
                        <button
                            onClick={() => setShowRaw(!showRaw)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <FrokIcon name="Code" style={{ fontSize: 16 }} />
                        </button>
                    </Tooltip>
                    <Tooltip content={copied ? 'Copied!' : 'Copy JSON'}>
                        <button
                            onClick={handleCopy}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {copied ? (
                                <FrokIcon name="Check" style={{ fontSize: 16, color: cssVar('--g-green-50') }} />
                            ) : (
                                <FrokIcon name="ContentCopy" style={{ fontSize: 16 }} />
                            )}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    padding: 12,
                    maxHeight: 400,
                    overflowY: 'auto',
                }}
            >
                {showRaw ? (
                    <pre
                        style={{
                            margin: 0,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {JSON.stringify(parsedJson, null, 2)}
                    </pre>
                ) : (
                    <JsonNode
                        value={parsedJson}
                        depth={0}
                        maxDepth={maxDepth}
                        isLast={true}
                    />
                )}
            </div>
        </div>
    );
};

export default JsonViewer;
