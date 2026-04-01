import { useEffect, useState } from 'react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import { Tile, Chip, Divider, Tooltip, TextField, TextArea, Dropdown, Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

interface PipelinePropertyPanelProps {
    selectedNode: PipelineNode | null;
    onUpdateNode: (nodeId: string, data: any) => void;
    onDeleteNode?: (nodeId: string) => void;
}

// Editable Field Component
const ConfigField = ({
    label,
    value,
    onChange,
    type = 'text',
    options = []
}: {
    label: string;
    value: any;
    onChange: (val: any) => void;
    type?: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
    options?: string[];
}) => {
    if (type === 'select') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <Dropdown
                    label={label}
                    value={value || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
                    options={options.map((opt) => ({ name: opt, value: opt }))}
                />
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <TextArea
                    id={`config-textarea-${label}`}
                    label={label}
                    value={value || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                    rows={3}
                />
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <TextField
                id={`config-field-${label}`}
                label={label}
                value={value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            />
        </div>
    );
};

// Get config fields based on step type
const getConfigSchema = (type: string) => {
    switch (type) {
        case 'retrieve':
            return [
                { key: 'top_k', label: 'Top K', type: 'number' },
                { key: 'retrieval_method', label: 'Retrieval Method', type: 'select', options: ['semantic', 'hybrid', 'bm25'] },
                { key: 'filter', label: 'Filter', type: 'text' },
                { key: 'namespace_override', label: 'Namespace', type: 'text' },
                { key: 'contextualization_prompt_template', label: 'Contextualization Propmt', type: 'textarea' },
            ];
        case 'generate':
            return [
                { key: 'system_prompt', label: 'System Prompt', type: 'textarea' },
                { key: 'user_prompt_template', label: 'User Prompt Template', type: 'textarea' },
                { key: 'model_config', label: 'Model Config', type: 'select', options: ['default', 'fast', 'strong'] },
                { key: 'temperature', label: 'Temperature', type: 'number' },
                { key: 'stream', label: 'Stream', type: 'select', options: ['true', 'false'] }, // Simplified boolean
            ];
        case 'classify':
            return [
                { key: 'categories', label: 'Categories (comma separated)', type: 'text' },
                { key: 'system_prompt', label: 'System Prompt', type: 'textarea' },
            ];
        case 'route':
            return [
                { key: 'route_variable', label: 'Route Variable', type: 'text' },
                // Routes map editing is complex, maybe just JSON editor for now or simple list
            ];
        case 'transform':
            return [
                { key: 'transform_type', label: 'Type', type: 'select', options: ['passthrough', 'expand_query', 'rewrite_query', 'custom'] },
                { key: 'system_prompt', label: 'System Prompt', type: 'textarea' },
                { key: 'output_variable', label: 'Output Variable', type: 'text' },
            ];
        default:
            return [];
    }
};

export const PipelinePropertyPanel = ({ selectedNode, onUpdateNode, onDeleteNode }: PipelinePropertyPanelProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [config, setConfig] = useState<Record<string, any>>({});
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label);
            setConfig(selectedNode.data.config || {});
            setCollapsed(false); // Auto open on selection
        }
    }, [selectedNode]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        if (selectedNode) {
            onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: newConfig
            });
        }
    };

    const handleLabelChange = (newLabel: string) => {
        setLabel(newLabel);
        if (selectedNode) {
            onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                label: newLabel
            });
        }
    };

    if (!selectedNode) {
        return (
            <Tile
                style={{
                    width: collapsed ? 50 : 360,
                    transition: 'width 0.2s',
                    background: 'var(--app-bg)',
                    borderLeft: '1px solid var(--app-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2,
                    height: '100%',
                    padding: 0,
                }}
            >
                <div style={{ padding: '0.5rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <Button mode="integrated" icon={collapsed ? 'left' : 'right'} onClick={() => setCollapsed(!collapsed)} />
                </div>
                {!collapsed && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '1rem' }}>
                        <FrokIcon name="Settings" style={{ fontSize: 48, color: 'var(--app-text-secondary)' }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)', textAlign: 'center' }}>
                            Select a node to edit properties
                        </span>
                    </div>
                )}
            </Tile>
        );
    }

    const schema = getConfigSchema(selectedNode.data.type || 'transform');

    return (
        <Tile
            style={{
                width: collapsed ? 50 : 360,
                transition: 'width 0.2s',
                background: 'var(--app-bg)',
                borderLeft: '1px solid var(--app-border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 2,
                height: '100%',
                padding: 0,
            }}
        >
            {/* Header */}
            <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!collapsed && (
                    <strong style={{ fontSize: '0.875rem' }}>
                        Properties
                    </strong>
                )}
                <Button mode="integrated" icon={collapsed ? 'left' : 'right'} onClick={() => setCollapsed(!collapsed)} />
            </div>

            {!collapsed && (
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <Chip
                            label={selectedNode.data.type || 'unknown'}
                            style={{
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                fontSize: 10,
                            }}
                        />
                        <div style={{ flex: 1 }} />
                        {onDeleteNode && (
                            <Tooltip content="Delete Step">
                                <Button mode="integrated" icon="delete" onClick={() => onDeleteNode(selectedNode.id)} />
                            </Tooltip>
                        )}
                    </div>

                    <TextField
                        id="pipeline-step-name"
                        label="Step Name"
                        value={label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLabelChange(e.target.value)}
                    />

                    <Divider />
                    <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', textAlign: 'center' }}>CONFIGURATION</span>
                    <Divider />

                    {schema.length > 0 ? (
                        schema.map((field) => (
                            <ConfigField
                                key={field.key}
                                label={field.label}
                                value={config[field.key]}
                                onChange={(val) => handleConfigChange(field.key, val)}
                                type={field.type as any}
                                options={field.options as string[]}
                            />
                        ))
                    ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)', fontStyle: 'italic' }}>
                            No specific configuration for this step type yet.
                            You can add custom properties below.
                        </span>
                    )}

                    {/* JSON Fallback for advanced usage or missing schema */}
                    <div style={{ marginTop: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Raw Config (JSON)
                        </span>
                        <TextArea
                            id="pipeline-raw-config"
                            value={JSON.stringify(config, null, 2)}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setConfig(parsed);
                                    onUpdateNode(selectedNode.id, { ...selectedNode.data, config: parsed });
                                } catch {
                                    // Ignored
                                }
                            }}
                            rows={4}
                            style={{ fontFamily: 'monospace', fontSize: 12 }}
                        />
                    </div>

                </div>
            )}
        </Tile>
    );
};
