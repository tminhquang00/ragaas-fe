import { Handle, Position, NodeProps } from '@xyflow/react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import { Tile, Chip, Divider } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

const typeIcons: Record<string, React.ReactElement> = {
    retrieve: <FrokIcon name="Search" />,
    classify: <FrokIcon name="Description" />,
    generate: <FrokIcon name="SmartToy" />,
    transform: <FrokIcon name="Refresh" />,
    filter: <FrokIcon name="FilterList" />,
    tool_call: <FrokIcon name="Settings" />,
    parallel: <FrokIcon name="Bolt" />,
    route: <FrokIcon name="CallSplit" />,
    agent: <FrokIcon name="SmartToy" />,
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
    agent: '#d32f2f',
    default: 'var(--app-text-secondary)',
};

export function StepNode({ data, selected }: NodeProps<PipelineNode>) {
    const { label, type, config, branchKeys = [] } = data;
    const icon = typeIcons[type || 'default'] || <FrokIcon name="Settings" />;
    const color = typeColors[type || 'default'] || typeColors.default;

    // Check if this is a routing/parallel node with branches
    const hasBranches = ['route', 'parallel'].includes(type || '') && branchKeys.length > 0;

    // Helper to format config for display
    const renderConfigPreview = () => {
        if (!config || Object.keys(config).length === 0) return null;

        // Filter out branches from display (too complex)
        const displayConfig = Object.entries(config)
            .filter(([key]) => key !== 'branches')
            .slice(0, 3);

        if (displayConfig.length === 0) return null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                {displayConfig.map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', textTransform: 'capitalize' }}>
                            {key.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {typeof value === 'object' ? JSON.stringify(value).slice(0, 15) + '...' : String(value)}
                        </span>
                    </div>
                ))}
                {Object.keys(config).filter(k => k !== 'branches').length > 3 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--app-text-secondary)', fontStyle: 'italic' }}>
                        + {Object.keys(config).filter(k => k !== 'branches').length - 3} more...
                    </span>
                )}
            </div>
        );
    };

    // Render branch labels for route/parallel nodes
    const renderBranchLabels = () => {
        if (!hasBranches) return null;

        return (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                {branchKeys.map((branchKey: string) => (
                    <Chip
                        key={branchKey}
                        label={branchKey}
                        style={{ fontSize: '0.55rem' }}
                    />
                ))}
            </div>
        );
    };

    return (
        <Tile
            style={{
                width: hasBranches ? Math.max(200, branchKeys.length * 80) : 200,
                background: 'var(--app-bg-surface)',
                boxShadow: selected ? '0 0 0 2px #007bc0' : '0 1px 3px rgba(0,0,0,0.12)',
                border: selected ? '1px solid #007bc0' : '1px solid var(--app-border)',
                transition: 'all 0.2s ease-in-out',
                padding: 0,
            }}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: 'var(--g-gray-45, #656a6f)', width: 10, height: 10, border: 'none' }}
            />

            <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color, display: 'flex' }}>
                            {icon}
                        </span>
                        <strong style={{ width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontSize: '0.875rem', color: 'var(--app-text)' }} title={label}>
                            {label}
                        </strong>
                    </div>
                </div>

                <Chip
                    label={type || 'unknown'}
                    style={{
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        width: '100%',
                        marginBottom: '0.5rem',
                        borderColor: color,
                    }}
                />

                <Divider />

                {/* Config Preview */}
                {renderConfigPreview()}

                {/* Branch Labels for Route/Parallel */}
                {renderBranchLabels()}

            </div>

            {/* Dynamic Output Handles for branches, or single handle for normal steps */}
            {hasBranches ? (
                branchKeys.map((branchKey: string, index: number) => {
                    return (
                        <Handle
                            key={branchKey}
                            type="source"
                            position={Position.Bottom}
                            id={branchKey}
                            style={{
                                background: 'var(--g-yellow-85, #ffcf00)',
                                width: 10,
                                height: 10,
                                border: 'none',
                                left: `${(index + 0.5) / branchKeys.length * 100}%`,
                            }}
                        />
                    );
                })
            ) : (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    style={{ background: 'var(--g-gray-45, #656a6f)', width: 10, height: 10, border: 'none' }}
                />
            )}
        </Tile>
    );
}

