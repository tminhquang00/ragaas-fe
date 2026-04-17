import { useEffect, useState } from 'react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import { PipelineBuilderMetadata, ProjectSummary } from '../../types';
import { Tile, Divider, Tooltip, TextField, TextArea, Dropdown, Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { useAuth } from '../../context';

interface PipelinePropertyPanelProps {
    selectedNode: PipelineNode | null;
    onUpdateNode: (nodeId: string, data: any) => void;
    onDeleteNode?: (nodeId: string) => void;
    metadata?: PipelineBuilderMetadata | null;
    currentProjectId?: string;
}

// ── Config field component ──

interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
    options?: string[];
    defaultValue?: any;
}

const ConfigField = ({
    label,
    value,
    onChange,
    type = 'text',
    options = [],
}: {
    label: string;
    value: any;
    onChange: (val: any) => void;
    type?: FieldDef['type'];
    options?: string[];
}) => {
    if (type === 'select') {
        return (
            <div style={{ marginBottom: '0.75rem' }}>
                <Dropdown
                    label={label}
                    value={value ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
                    options={options.map((opt) => ({ name: opt, value: opt }))}
                />
            </div>
        );
    }

    if (type === 'boolean') {
        return (
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem' }}>{label}</span>
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div style={{ marginBottom: '0.75rem' }}>
                <TextArea
                    id={`config-ta-${label}`}
                    label={label}
                    value={value ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                    rows={3}
                />
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <TextField
                id={`config-f-${label}`}
                label={label}
                value={value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(type === 'number' ? Number(e.target.value) : e.target.value)
                }
            />
        </div>
    );
};

// ── Schema per node type ──

function getConfigSchema(type: string, metadata?: PipelineBuilderMetadata | null): FieldDef[] {
    switch (type) {
        case 'retrieve':
            return [
                { key: 'retrieval_method', label: 'Retrieval Method', type: 'select', options: ['semantic', 'hybrid', 'bm25'] },
                { key: 'top_k', label: 'Top K', type: 'number', defaultValue: 20 },
                { key: 'min_score', label: 'Min Score', type: 'number', defaultValue: 0 },
                { key: 'dynamic_top_k', label: 'Dynamic Top K', type: 'boolean' },
                { key: 'iterative_retrieval', label: 'Iterative Retrieval', type: 'boolean' },
                { key: 'multi_query_retrieval', label: 'Multi-Query Retrieval', type: 'boolean' },
                { key: 'history_aware_retrieval', label: 'History-Aware Retrieval', type: 'boolean' },
                { key: 'expand_to_page', label: 'Expand to Page', type: 'boolean' },
                { key: 'max_expanded_chunks', label: 'Max Expanded Chunks', type: 'number' },
            ];
        case 'generate':
            return [
                { key: 'system_prompt', label: 'System Prompt', type: 'textarea' },
                { key: 'user_prompt_template', label: 'User Prompt Template', type: 'textarea' },
                { key: 'temperature', label: 'Temperature', type: 'number', defaultValue: 0.7 },
                { key: 'max_tokens', label: 'Max Tokens', type: 'number' },
                { key: 'include_history', label: 'Include History', type: 'boolean', defaultValue: true },
                { key: 'max_history_turns', label: 'Max History Turns', type: 'number', defaultValue: 5 },
                { key: 'output_schema', label: 'Output Schema (JSON)', type: 'textarea' },
            ];
        case 'classify':
            return [
                { key: 'categories', label: 'Categories (comma separated)', type: 'text' },
                { key: 'classification_prompt', label: 'Classification Prompt', type: 'textarea' },
            ];
        case 'transform':
            return [
                { key: 'transform_type', label: 'Transform Type', type: 'select', options: ['expand', 'rewrite', 'custom'] },
                { key: 'transform_prompt', label: 'Transform Prompt', type: 'textarea' },
            ];
        case 'route':
            return [
                { key: 'route_variable', label: 'Route Variable', type: 'text', defaultValue: 'classification' },
                { key: 'default_route', label: 'Default Route', type: 'text', defaultValue: 'default' },
            ];
        case 'agent':
            return [
                { key: 'agent_type', label: 'Agent Type', type: 'select', options: ['react'] },
                { key: 'max_iterations', label: 'Max Iterations', type: 'number', defaultValue: 10 },
                { key: 'timeout_seconds', label: 'Timeout (seconds)', type: 'number', defaultValue: 120 },
                { key: 'max_total_tokens', label: 'Max Total Tokens', type: 'number', defaultValue: 80000 },
                { key: 'supervisor_mode', label: 'Supervisor Mode', type: 'boolean' },
                { key: 'agent_system_prompt', label: 'Agent System Prompt', type: 'textarea' },
            ];
        case 'tool': {
            const toolOptions = metadata?.available_tools?.map((t) => t.name) ?? [];
            return [
                { key: 'name', label: 'Tool', type: 'select', options: toolOptions.length > 0 ? toolOptions : ['search_knowledge', 'web_search'] },
                { key: 'enabled', label: 'Enabled', type: 'boolean', defaultValue: true },
            ];
        }
        case 'mcp_server':
            return [
                { key: 'name', label: 'Server Name', type: 'text' },
                { key: 'transport', label: 'Transport', type: 'select', options: ['stdio', 'http'] },
                { key: 'command', label: 'Command (stdio)', type: 'text' },
                { key: 'url', label: 'URL (http)', type: 'text' },
                { key: 'enabled', label: 'Enabled', type: 'boolean', defaultValue: true },
            ];
        case 'sub_agent':
            return [
                { key: 'project_id', label: 'Project ID', type: 'text' },
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'keywords', label: 'Keywords (comma separated)', type: 'text' },
            ];
        case 'worker': {
            const profileOptions = metadata?.worker_profiles?.map((w) => w.name) ?? [];
            return [
                { key: 'profile_name', label: 'Worker Profile', type: 'select', options: profileOptions.length > 0 ? profileOptions : ['retrieval_worker'] },
            ];
        }
        case 'database':
            return [
                { key: 'database_type', label: 'Database Type', type: 'select', options: ['postgresql', 'mysql', 'sqlserver', 'sqlite'] },
                { key: 'enabled', label: 'Enabled', type: 'boolean' },
                { key: 'read_only', label: 'Read Only', type: 'boolean', defaultValue: true },
                { key: 'max_result_rows', label: 'Max Result Rows', type: 'number', defaultValue: 500 },
            ];
        case 'project':
            return [
                { key: 'project_id', label: 'Target Project', type: 'text' },
                { key: 'project_name', label: 'Project Name', type: 'text' },
                { key: 'include_sources', label: 'Include Source Citations', type: 'boolean', defaultValue: false },
            ];
        case 'parallel':
            return [];
        default:
            return [];
    }
}

// ── Project Node Config (searchable picker) ──

const ProjectNodeConfig = ({
    config,
    projectSummaries,
    currentProjectId,
    projectSearch,
    projectPickerOpen,
    onSearchChange,
    onPickerToggle,
    onSelectProject,
    onConfigChange,
}: {
    config: Record<string, any>;
    projectSummaries: ProjectSummary[];
    currentProjectId?: string;
    projectSearch: string;
    projectPickerOpen: boolean;
    onSearchChange: (v: string) => void;
    onPickerToggle: (v: boolean) => void;
    onSelectProject: (s: ProjectSummary) => void;
    onConfigChange: (key: string, value: any) => void;
}) => {
    const available = projectSummaries.filter(
        (p) => p.project_id !== currentProjectId && p.status === 'active'
    );
    const filtered = projectSearch
        ? available.filter(
              (p) =>
                  p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                  p.description?.toLowerCase().includes(projectSearch.toLowerCase())
          )
        : available;

    const selectedProject = available.find((p) => p.project_id === config.project_id);

    const pipelineTypeColors: Record<string, string> = {
        simple_rag: '#007bc0',
        agent: '#c62828',
        custom: '#ed6c02',
        routing: '#9c27b0',
        classify: '#9c27b0',
        agentic: '#c62828',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--app-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                    Target Project
                </span>

                {selectedProject ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.625rem',
                            border: '1px solid var(--app-primary, #007bc0)',
                            borderRadius: 2,
                            background: 'color-mix(in srgb, var(--app-primary) 6%, var(--app-bg))',
                        }}
                    >
                        <FrokIcon name="OpenInNew" style={{ color: '#00695c', fontSize: 16 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedProject.name}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--app-text-secondary)' }}>
                                {selectedProject.pipeline_type}
                            </div>
                        </div>
                        <button
                            onClick={() => onPickerToggle(!projectPickerOpen)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--app-text-secondary)',
                                padding: '2px',
                                display: 'flex',
                            }}
                        >
                            <FrokIcon name="Edit" style={{ fontSize: 14 }} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onPickerToggle(!projectPickerOpen)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.625rem',
                            border: '1px dashed var(--app-border)',
                            borderRadius: 2,
                            background: 'var(--app-bg-surface)',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            color: 'var(--app-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'inherit',
                        }}
                    >
                        <FrokIcon name="Add" style={{ fontSize: 16 }} />
                        Select a project...
                    </button>
                )}

                {projectPickerOpen && (
                    <div
                        style={{
                            marginTop: '0.375rem',
                            border: '1px solid var(--app-border)',
                            borderRadius: 2,
                            background: 'var(--app-bg)',
                            maxHeight: 240,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                    >
                        <div style={{ padding: '0.375rem' }}>
                            <input
                                type="text"
                                value={projectSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search projects..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.375rem 0.5rem',
                                    border: '1px solid var(--app-border)',
                                    borderRadius: 2,
                                    background: 'var(--app-bg)',
                                    color: 'var(--app-text)',
                                    fontSize: '0.8125rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--app-text-secondary)' }}>
                                    No matching projects
                                </div>
                            ) : (
                                filtered.map((p) => (
                                    <button
                                        key={p.project_id}
                                        onClick={() => onSelectProject(p)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.625rem',
                                            border: 'none',
                                            borderBottom: '1px solid var(--app-bg-surface)',
                                            background: p.project_id === config.project_id ? 'color-mix(in srgb, var(--app-primary) 8%, var(--app-bg))' : 'var(--app-bg)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontFamily: 'inherit',
                                            transition: 'background 100ms ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = 'var(--app-bg-surface)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.background =
                                                p.project_id === config.project_id
                                                    ? 'color-mix(in srgb, var(--app-primary) 8%, var(--app-bg))'
                                                    : 'var(--app-bg)';
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.name}
                                            </div>
                                            {p.description && (
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--app-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                                                    {p.description}
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '0.6rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '2px 6px',
                                                borderRadius: 2,
                                                border: `1px solid ${pipelineTypeColors[p.pipeline_type] || '#71767c'}`,
                                                color: pipelineTypeColors[p.pipeline_type] || '#71767c',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                marginTop: 1,
                                            }}
                                        >
                                            {p.pipeline_type}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {config.project_id && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--app-text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    ID: {config.project_id}
                </div>
            )}

            <ConfigField
                label="Include Source Citations"
                value={config.include_sources ?? false}
                onChange={(val) => onConfigChange('include_sources', val)}
                type="boolean"
            />
        </div>
    );
};

// ── Panel component ──

export const PipelinePropertyPanel = ({ selectedNode, onUpdateNode, onDeleteNode, metadata, currentProjectId }: PipelinePropertyPanelProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [config, setConfig] = useState<Record<string, any>>({});
    const [label, setLabel] = useState('');
    const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);
    const [projectSearch, setProjectSearch] = useState('');
    const [projectPickerOpen, setProjectPickerOpen] = useState(false);
    const { apiClient } = useAuth();

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label);
            setConfig(selectedNode.data.config || {});
            setCollapsed(false);
        }
    }, [selectedNode]);

    useEffect(() => {
        if (selectedNode?.data.type === 'project' && apiClient && projectSummaries.length === 0) {
            apiClient.getProjectsSummary().then(setProjectSummaries).catch(() => {});
        }
    }, [selectedNode?.data.type, apiClient]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        if (selectedNode) {
            onUpdateNode(selectedNode.id, { ...selectedNode.data, config: newConfig });
        }
    };

    const handleSelectProject = (summary: ProjectSummary) => {
        const newConfig = {
            ...config,
            project_id: summary.project_id,
            project_name: summary.name,
        };
        setConfig(newConfig);
        setProjectPickerOpen(false);
        setProjectSearch('');
        if (selectedNode) {
            const newLabel = `Project: ${summary.name}`;
            setLabel(newLabel);
            onUpdateNode(selectedNode.id, { ...selectedNode.data, label: newLabel, config: newConfig });
        }
    };

    const handleLabelChange = (newLabel: string) => {
        setLabel(newLabel);
        if (selectedNode) {
            onUpdateNode(selectedNode.id, { ...selectedNode.data, label: newLabel });
        }
    };

    if (!selectedNode) {
        return (
            <Tile
                style={{
                    width: collapsed ? 44 : 320,
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
                <div style={{ padding: '0.4rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <Button mode="integrated" icon={collapsed ? 'left' : 'right'} onClick={() => setCollapsed(!collapsed)} />
                </div>
                {!collapsed && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '0.75rem' }}>
                        <FrokIcon name="Settings" style={{ fontSize: 40, color: 'var(--app-text-secondary)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--app-text-secondary)', textAlign: 'center' }}>
                            Select a node to edit properties
                        </span>
                    </div>
                )}
            </Tile>
        );
    }

    const nodeType = selectedNode.data.type || 'transform';
    const schema = getConfigSchema(nodeType, metadata);
    const isAttachment = ['tool', 'mcp_server', 'sub_agent', 'worker', 'database'].includes(nodeType);

    return (
        <Tile
            style={{
                width: collapsed ? 44 : 320,
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
            <div style={{ padding: '0.4rem', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!collapsed && <strong style={{ fontSize: '0.8rem' }}>Properties</strong>}
                <Button mode="integrated" icon={collapsed ? 'left' : 'right'} onClick={() => setCollapsed(!collapsed)} />
            </div>

            {!collapsed && (
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <span
                            style={{
                                display: 'inline-block',
                                fontSize: '0.6rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                padding: '2px 8px',
                                borderRadius: 4,
                                border: isAttachment ? '1px dashed var(--app-text-secondary)' : '1px solid var(--app-text-secondary)',
                                fontWeight: 600,
                            }}
                        >
                            {nodeType}
                        </span>
                        <div style={{ flex: 1 }} />
                        {onDeleteNode && (
                            <Tooltip content="Delete Node">
                                <Button mode="integrated" icon="delete" onClick={() => onDeleteNode(selectedNode.id)} />
                            </Tooltip>
                        )}
                    </div>

                    <TextField
                        id="pipeline-node-name"
                        label="Name"
                        value={label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLabelChange(e.target.value)}
                    />

                    <Divider />
                    <span style={{ fontSize: '0.65rem', color: 'var(--app-text-secondary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Configuration
                    </span>
                    <Divider />

                    {nodeType === 'project' ? (
                        <ProjectNodeConfig
                            config={config}
                            projectSummaries={projectSummaries}
                            currentProjectId={currentProjectId}
                            projectSearch={projectSearch}
                            projectPickerOpen={projectPickerOpen}
                            onSearchChange={setProjectSearch}
                            onPickerToggle={setProjectPickerOpen}
                            onSelectProject={handleSelectProject}
                            onConfigChange={handleConfigChange}
                        />
                    ) : schema.length > 0 ? (
                        schema.map((field) => (
                            <ConfigField
                                key={field.key}
                                label={field.label}
                                value={config[field.key] ?? field.defaultValue}
                                onChange={(val) => handleConfigChange(field.key, val)}
                                type={field.type}
                                options={field.options}
                            />
                        ))
                    ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--app-text-secondary)', fontStyle: 'italic' }}>
                            No specific configuration for this node type.
                        </span>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--app-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
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
                                    // ignore invalid JSON while typing
                                }
                            }}
                            rows={4}
                            style={{ fontFamily: 'monospace', fontSize: 11 }}
                        />
                    </div>
                </div>
            )}
        </Tile>
    );
};
