import React, { useEffect, useState } from 'react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import {
    TextField,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
} from '@mui/material';

interface PipelinePropertyPanelProps {
    selectedNode: PipelineNode | null;
    onUpdateNode: (nodeId: string, data: any) => void;
}

export const PipelinePropertyPanel = ({ selectedNode, onUpdateNode }: PipelinePropertyPanelProps) => {
    const [config, setConfig] = useState<Record<string, any>>({});
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label);
            setConfig(selectedNode.data.config || {});
        }
    }, [selectedNode]);

    if (!selectedNode) {
        return (
            <Box
                sx={{
                    width: 320,
                    borderLeft: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Select a node to edit its configuration.
                </Typography>
            </Box>
        );
    }

    const handleChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onUpdateNode(selectedNode.id, {
            ...selectedNode.data,
            config: newConfig,
        });
    };

    const handleLabelChange = (newLabel: string) => {
        setLabel(newLabel);
        onUpdateNode(selectedNode.id, {
            ...selectedNode.data,
            label: newLabel
        });
    }

    return (
        <Box
            sx={{
                width: 320,
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Step Configuration
                </Typography>
                <TextField
                    size="small"
                    fullWidth
                    label="Step Name"
                    value={label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'text.disabled' }}>
                    {selectedNode.data.type} Settings
                </Typography>

                {/* Dynamic Fields based on Type */}
                {selectedNode.data.type === 'retrieve' && (
                    <>
                        <TextField
                            label="Top K"
                            type="number"
                            size="small"
                            fullWidth
                            value={config.top_k || 5}
                            onChange={(e) => handleChange('top_k', parseInt(e.target.value))}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Method</InputLabel>
                            <Select
                                value={config.method || 'semantic'}
                                label="Method"
                                onChange={(e) => handleChange('method', e.target.value)}
                            >
                                <MenuItem value="semantic">Semantic</MenuItem>
                                <MenuItem value="hybrid">Hybrid</MenuItem>
                                <MenuItem value="bm25">BM25</MenuItem>
                            </Select>
                        </FormControl>
                    </>
                )}

                {selectedNode.data.type === 'generate' && (
                    <>
                        <TextField
                            label="Temperature"
                            type="number"
                            inputProps={{ step: 0.1, min: 0, max: 1 }}
                            size="small"
                            fullWidth
                            value={config.temperature ?? 0.7}
                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                        />
                        <TextField
                            label="Model"
                            size="small"
                            fullWidth
                            value={config.model || 'gpt-4o'}
                            onChange={(e) => handleChange('model', e.target.value)}
                        />
                    </>
                )}

                {selectedNode.data.type === 'transform' && (
                    <TextField
                        label="Prompt Template"
                        multiline
                        rows={6}
                        size="small"
                        fullWidth
                        value={config.prompt || ''}
                        onChange={(e) => handleChange('prompt', e.target.value)}
                        placeholder="Enter prompt template..."
                    />
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, overflow: 'auto' }}>
                    <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: 10, m: 0 }}>
                        {JSON.stringify(config, null, 2)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
