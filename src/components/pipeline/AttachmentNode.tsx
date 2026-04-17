import { Handle, Position, NodeProps } from '@xyflow/react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import { FrokIcon } from '../../utils/iconAdapter';

const typeIcons: Record<string, string> = {
    tool: 'Build',
    mcp_server: 'Cloud',
    sub_agent: 'SmartToy',
    worker: 'Group',
    database: 'Storage',
};

const typeColors: Record<string, string> = {
    tool: '#0288d1',
    mcp_server: '#7b1fa2',
    sub_agent: '#c62828',
    worker: '#00695c',
    database: '#ef6c00',
};

const typeLabels: Record<string, string> = {
    tool: 'Tool',
    mcp_server: 'MCP Server',
    sub_agent: 'Sub-Agent',
    worker: 'Worker',
    database: 'Database',
};

export function AttachmentNode({ data, selected }: NodeProps<PipelineNode>) {
    const { label, type, config } = data;
    const iconName = typeIcons[type] || 'Extension';
    const color = typeColors[type] || '#546e7a';
    const categoryLabel = typeLabels[type] || type;

    const previewText = config?.name || config?.profile_name || config?.database_type || '';

    return (
        <div
            className="attachment-node"
            style={{
                width: 180,
                background: 'var(--app-bg-surface, #fff)',
                border: `1.5px dashed ${selected ? '#007bc0' : color}`,
                borderRadius: 8,
                boxShadow: selected ? `0 0 0 2px ${color}40` : '0 1px 4px rgba(0,0,0,0.08)',
                padding: 10,
                transition: 'all 0.2s',
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: color, width: 8, height: 8, border: 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color, display: 'flex', fontSize: 18 }}>
                    <FrokIcon name={iconName} />
                </span>
                <strong
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--app-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                    }}
                    title={label}
                >
                    {label}
                </strong>
            </div>

            <div
                style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color,
                    fontWeight: 600,
                    marginBottom: 2,
                }}
            >
                {categoryLabel}
            </div>

            {previewText && (
                <div
                    style={{
                        fontSize: '0.65rem',
                        color: 'var(--app-text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {previewText}
                </div>
            )}
        </div>
    );
}
