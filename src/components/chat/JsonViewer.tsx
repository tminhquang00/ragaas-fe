import React, { useState, useMemo } from 'react';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';
import './JsonViewer.css';

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
    const [isExpanded, setIsExpanded] = useState(depth < maxDepth);

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isExpandable = isObject || isArray;
    const isEmpty = isExpandable && (isArray ? value.length === 0 : Object.keys(value as object).length === 0);

    const getValueClass = (val: unknown): string => {
        if (val === null) return 'json-null';
        if (typeof val === 'boolean') return 'json-boolean';
        if (typeof val === 'number') return 'json-number';
        if (typeof val === 'string') return 'json-string';
        return '';
    };

    const renderValue = () => {
        if (value === null) return <span className={getValueClass(value)}>null</span>;
        if (typeof value === 'boolean') return <span className={getValueClass(value)}>{value.toString()}</span>;
        if (typeof value === 'number') return <span className={getValueClass(value)}>{value}</span>;
        if (typeof value === 'string') return <span className={getValueClass(value)}>"{value}"</span>;
        return null;
    };

    const renderKey = () => {
        if (keyName === undefined) return null;
        return (
            <>
                <span className="json-key">"{keyName}"</span>
                <span className="json-colon">:</span>{' '}
            </>
        );
    };

    const comma = isLast ? '' : ',';
    const indent = depth * 14;

    if (!isExpandable) {
        return (
            <div className="json-node-line" style={{ paddingLeft: indent }}>
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
            <div className="json-node-line" style={{ paddingLeft: indent }}>
                {renderKey()}<span className="json-bracket">{openBracket}{closeBracket}</span>{comma}
            </div>
        );
    }

    return (
        <div className="json-node-expandable">
            <div
                className="json-node-header"
                style={{ paddingLeft: indent }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="json-node-toggle">
                    <FrokIcon name={isExpanded ? "ExpandMore" : "ChevronRight"} />
                </span>
                <span>
                    {renderKey()}
                    <span className="json-bracket">{openBracket}</span>
                    {!isExpanded && (
                        <span className="json-node-count">
                            {itemCount} {isArray ? 'items' : 'keys'}
                        </span>
                    )}
                    {!isExpanded && <span className="json-bracket">{closeBracket}</span>}
                    {!isExpanded && comma}
                </span>
            </div>
            <div className={`json-node-children ${isExpanded ? 'expanded' : ''}`}>
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
                <div className="json-node-line" style={{ paddingLeft: indent }}>
                    <span className="json-bracket">{closeBracket}</span>{comma}
                </div>
            </div>
        </div>
    );
};

interface JsonViewerProps {
    content: string;
    maxDepth?: number;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ content, maxDepth = 2 }) => {
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const parsedJson = useMemo(() => parseJson(content), [content]);

    const handleCopy = async () => {
        try {
            const formatted = JSON.stringify(parsedJson, null, 2);
            await navigator.clipboard.writeText(formatted);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (parsedJson === null) {
        return <span className="json-viewer-error">Invalid JSON</span>;
    }

    return (
        <div className="json-viewer-container">
            {/* Header */}
            <div className="json-viewer-header">
                <div className="json-viewer-title">
                    <FrokIcon name="DataObject" style={{ fontSize: 18 }} />
                    <span>JSON Response</span>
                </div>
                <div className="json-viewer-actions">
                    <PortalTooltip content={showRaw ? 'Tree View' : 'Raw View'}>
                        <button
                            className="json-viewer-btn"
                            onClick={() => setShowRaw(!showRaw)}
                            aria-label={showRaw ? 'Switch to tree view' : 'Switch to raw view'}
                        >
                            <FrokIcon name={showRaw ? "AccountTree" : "Code"} style={{ fontSize: 18 }} />
                        </button>
                    </PortalTooltip>
                    <PortalTooltip content={copied ? 'Copied!' : 'Copy JSON'}>
                        <button
                            className="json-viewer-btn"
                            onClick={handleCopy}
                            aria-label="Copy JSON"
                        >
                            <FrokIcon
                                name={copied ? "Check" : "ContentCopy"}
                                style={{ fontSize: 18, color: copied ? '#00884a' : undefined }}
                            />
                        </button>
                    </PortalTooltip>
                </div>
            </div>

            {/* Content */}
            <div className="json-viewer-content">
                {showRaw ? (
                    <pre className="json-viewer-raw">
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
