import { useEffect, useState } from 'react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import {
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider
} from '@mui/material';
import {
    Settings as SettingsIcon,
    ChevronRight as ChevronRightIcon,
    ChevronLeft as ChevronLeftIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

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
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value || ''}
                    label={label}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                            {opt}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    if (type === 'textarea') {
        return (
            <TextField
                fullWidth
                label={label}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                multiline
                minRows={3}
                maxRows={10}
                size="small"
                sx={{ mb: 2 }}
            />
        );
    }

    return (
        <TextField
            fullWidth
            label={label}
            value={value || ''}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            type={type === 'number' ? 'number' : 'text'}
            size="small"
            sx={{ mb: 2 }}
        />
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

// Get step type color
const getStepTypeColor = (type: string): "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    const colorMap: Record<string, "primary" | "secondary" | "success" | "warning" | "info" | "error"> = {
        'retrieve': 'primary',
        'generate': 'success',
        'transform': 'warning',
        'parallel': 'info',
        'filter': 'secondary',
        'tool_call': 'error',
    };
    return colorMap[type] || 'primary';
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
            <Paper
                elevation={3}
                sx={{
                    width: collapsed ? 50 : 360,
                    transition: 'width 0.2s',
                    borderLeft: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2,
                    height: '100%',
                }}
            >
                <Box sx={{ p: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
                        {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Box>
                {!collapsed && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, gap: 2, opacity: 0.7 }}>
                        <SettingsIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" align="center">
                            Select a node to edit properties
                        </Typography>
                    </Box>
                )}
            </Paper>
        );
    }

    const schema = getConfigSchema(selectedNode.data.type || 'transform');

    return (
        <Paper
            elevation={3}
            sx={{
                width: collapsed ? 50 : 360,
                transition: 'width 0.2s',
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 2,
                height: '100%',
            }}
        >
            {/* Header */}
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!collapsed && (
                    <Typography variant="subtitle2" fontWeight="bold">
                        Properties
                    </Typography>
                )}
                <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
                    {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Box>

            {!collapsed && (
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                        <Chip
                            label={selectedNode.data.type}
                            size="small"
                            color={getStepTypeColor(selectedNode.data.type || 'transform')}
                            sx={{
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                fontSize: 10,
                                borderRadius: 1
                            }}
                        />
                        <Box sx={{ flex: 1 }} />
                        {onDeleteNode && (
                            <Tooltip title="Delete Step">
                                <IconButton size="small" color="error" onClick={() => onDeleteNode(selectedNode.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    <TextField
                        fullWidth
                        label="Step Name"
                        value={label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        size="small"
                    />

                    <Divider sx={{ my: 1 }}>
                        <Typography variant="caption" color="text.secondary">CONFIGURATION</Typography>
                    </Divider>

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
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No specific configuration for this step type yet.
                            You can add custom properties below.
                        </Typography>
                    )}

                    {/* JSON Fallback for advanced usage or missing schema */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Raw Config (JSON)
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            value={JSON.stringify(config, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setConfig(parsed);
                                    onUpdateNode(selectedNode.id, { ...selectedNode.data, config: parsed });
                                } catch (err) {
                                    // Ignored
                                }
                            }}
                            sx={{ fontFamily: 'monospace', fontSize: 12 }}
                        />
                    </Box>

                </Box>
            )}
        </Paper>
    );
};
