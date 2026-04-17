import { Handle, Position, NodeProps } from '@xyflow/react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import { FrokIcon } from '../../utils/iconAdapter';

const typeIcons: Record<string, string> = {
    retrieve: 'Search',
    classify: 'Description',
    generate: 'SmartToy',
    transform: 'Refresh',
    filter: 'FilterList',
    tool_call: 'Settings',
    parallel: 'Bolt',
    route: 'CallSplit',
    agent: 'SmartToy',
    project: 'OpenInNew',
};

const typeColors: Record<string, string> = {
    retrieve: '#007bc0',
    classify: '#9c27b0',
    generate: '#18837e',
    transform: '#ed6c02',
    filter: '#d32f2f',
    tool_call: '#0288d1',
    parallel: '#9c27b0',
    route: '#ed6c02',
    agent: '#c62828',
    project: '#00695c',
};

export function StepNode({ data, selected }: NodeProps<PipelineNode>) {
    const { label, type, config, branchKeys: explicitBranchKeys } = data;
    const icon = typeIcons[type] || 'Settings';
    const color = typeColors[type] || 'var(--app-text-secondary)';

    const branchKeys: string[] =
        explicitBranchKeys ??
        (config?.branches ? Object.keys(config.branches as Record<string, unknown>) : []);

    const hasBranches = ['route', 'parallel'].includes(type || '') && branchKeys.length > 0;

    const renderConfigPreview = () => {
        if (!config || Object.keys(config).length === 0) return null;

        const displayConfig = Object.entries(config)
            .filter(([key]) => key !== 'branches')
            .slice(0, 3);

        if (displayConfig.length === 0) return null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                {displayConfig.map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--app-text-secondary)', textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {typeof value === 'object' ? JSON.stringify(value).slice(0, 15) + '...' : String(value)}
                        </span>
                    </div>
                ))}
                {Object.keys(config).filter(k => k !== 'branches').length > 3 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--app-text-secondary)', fontStyle: 'italic' }}>
                        + {Object.keys(config).filter(k => k !== 'branches').length - 3} more...
                    </span>
                )}
            </div>
        );
    };

    const renderBranchLabels = () => {
        if (!hasBranches) return null;
        return (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                {branchKeys.map((branchKey: string) => (
                    <span
                        key={branchKey}
                        style={{
                            fontSize: '0.55rem',
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: '1px solid var(--app-border)',
                            background: 'var(--app-bg)',
                        }}
                    >
                        {branchKey}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div
            className="step-node"
            style={{
                width: hasBranches ? Math.max(200, branchKeys.length * 80) : 200,
                background: 'var(--app-bg-surface, #fff)',
                boxShadow: selected ? '0 0 0 2px #007bc0' : '0 1px 3px rgba(0,0,0,0.12)',
                border: selected ? '2px solid #007bc0' : '1px solid var(--app-border)',
                borderRadius: 6,
                transition: 'all 0.2s',
                padding: 0,
            }}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: 'var(--g-gray-45, #656a6f)', width: 10, height: 10, border: 'none' }}
            />

            <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color, display: 'flex' }}>
                        <FrokIcon name={icon} />
                    </span>
                    <strong
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                            color: 'var(--app-text)',
                        }}
                        title={label}
                    >
                        {label}
                    </strong>
                </div>

                <span
                    style={{
                        display: 'inline-block',
                        fontSize: '0.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: `1px solid ${color}`,
                        color,
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                    }}
                >
                    {type || 'unknown'}
                </span>

                <div style={{ borderTop: '1px solid var(--app-border, #e0e0e0)', margin: '0.5rem 0' }} />

                {renderConfigPreview()}
                {renderBranchLabels()}
            </div>

            {/* Dynamic Output Handles */}
            {hasBranches ? (
                branchKeys.map((branchKey: string, index: number) => (
                    <Handle
                        key={branchKey}
                        type="source"
                        position={Position.Right}
                        id={branchKey}
                        style={{
                            background: 'var(--g-yellow-85, #ffcf00)',
                            width: 10,
                            height: 10,
                            border: 'none',
                            top: `${((index + 0.5) / branchKeys.length) * 100}%`,
                        }}
                    />
                ))
            ) : (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{ background: 'var(--g-gray-45, #656a6f)', width: 10, height: 10, border: 'none' }}
                />
            )}
        </div>
    );
}
