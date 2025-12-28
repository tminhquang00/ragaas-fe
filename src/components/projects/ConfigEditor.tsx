import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    IconButton,
    Paper,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Code as CodeIcon,
    ViewList as ViewListIcon,
} from '@mui/icons-material';

interface ConfigEditorProps {
    config: Record<string, any>;
    onSave: (newConfig: Record<string, any>) => Promise<void>;
}

// Helper to determine value type
const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

// Recursive Field Renderer
const ConfigField: React.FC<{
    path: string[];
    value: any;
    label: string;
    onChange: (path: string[], newValue: any) => void;
    onDelete?: (path: string[]) => void;
    depth?: number;
}> = ({ path, value, label, onChange, onDelete, depth = 0 }) => {
    const type = getValueType(value);
    const isRoot = depth === 0;

    // String / Number
    if (type === 'string' || type === 'number' || type === 'null') {
        return (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                    fullWidth
                    label={label} // Shows schema key as label
                    value={value ?? ''}
                    type={type === 'number' ? 'number' : 'text'}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(path, type === 'number' ? Number(val) : val);
                    }}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'background.paper' }}
                />
                {onDelete && (
                    <IconButton onClick={() => onDelete(path)} size="small" color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>
        );
    }

    // Boolean
    if (type === 'boolean') {
        return (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={value}
                            onChange={(e) => onChange(path, e.target.checked)}
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">{label}</Typography>}
                />
                {onDelete && (
                    <IconButton onClick={() => onDelete(path)} size="small" color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>
        );
    }

    // Object
    if (type === 'object') {
        // Don't use accordion for root object, just render children directly if we want a cleaner look,
        // but for nested objects, accordions work well.
        const content = (
            <Box sx={{ pl: isRoot ? 0 : 0, width: '100%' }}>
                {Object.entries(value).map(([key, val]) => (
                    <ConfigField
                        key={key}
                        path={[...path, key]}
                        value={val}
                        label={key} // Pass the key as the label
                        onChange={onChange}
                        // Only allow deleting properties if we are not at root (optional rule)
                        // onDelete={onDelete} 
                        depth={depth + 1}
                    />
                ))}

                {/* Add Property Button (Simple implementation) */}
                {/* <Button startIcon={<AddIcon />} size="small" sx={{ mt: 1 }}>Add Property</Button> */}
            </Box>
        );

        if (isRoot) return content;

        return (
            <Accordion defaultExpanded elevation={0} variant="outlined" sx={{ mb: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'action.hover' }}>
                    <Typography fontWeight="medium">{label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {content}
                </AccordionDetails>
            </Accordion>
        );
    }

    // Array (Simplified: only supporting arrays of primitives or objects, not mixed for now)
    if (type === 'array') {
        return (
            <Accordion defaultExpanded elevation={0} variant="outlined" sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'action.hover' }}>
                    <Typography fontWeight="medium">{label} [{value.length}]</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {value.map((item: any, index: number) => (
                        <Box key={index} sx={{ pl: 2, borderLeft: 1, borderColor: 'divider', mb: 1 }}>
                            <ConfigField
                                path={[...path, index.toString()]}
                                value={item}
                                label={`${label}[${index}]`}
                                onChange={onChange}
                                onDelete={() => {
                                    // Handle array deletion
                                    const newArray = [...value];
                                    newArray.splice(index, 1);
                                    onChange(path, newArray);
                                }}
                                depth={depth + 1}
                            />
                        </Box>
                    ))}
                    <Button
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => {
                            const newArray = [...value, ""]; // Default to empty string
                            onChange(path, newArray);
                        }}
                    >
                        Add Item
                    </Button>
                </AccordionDetails>
            </Accordion>
        );
    }

    return null;
};

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState<Record<string, any>>(config);
    const [mode, setMode] = useState<'visual' | 'json'>('visual');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Reset local state when config prop changes (and not dirty?)
    // Actually, usually we want to respect the prop updates unless user is editing.
    // For simplicity, we initialize once or when config deeply changes.
    useEffect(() => {
        if (!dirty) {
            setLocalConfig(config);
        }
    }, [config, dirty]);

    const handleFieldChange = (path: string[], newValue: any) => {
        setDirty(true);
        setLocalConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev)); // Deep clone
            let current = next;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = newValue;
            return next;
        });
    };

    const handleJsonChange = (newJson: string) => {
        setDirty(true);
        try {
            const parsed = JSON.parse(newJson);
            setLocalConfig(parsed);
            setJsonError(null);
        } catch (e) {
            setJsonError((e as Error).message);
        }
    };

    const handleSave = async () => {
        if (jsonError) return;
        setSaving(true);
        try {
            await onSave(localConfig);
            setDirty(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.default'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">Project Configuration</Typography>
                    <Tabs
                        value={mode}
                        onChange={(_, v) => setMode(v)}
                        sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
                    >
                        <Tab icon={<ViewListIcon fontSize="small" />} iconPosition="start" label="Visual" value="visual" />
                        <Tab icon={<CodeIcon fontSize="small" />} iconPosition="start" label="JSON" value="json" />
                    </Tabs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || (mode === 'json' && !!jsonError)}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                {mode === 'visual' ? (
                    <ConfigField
                        path={[]}
                        value={localConfig}
                        label="Root"
                        onChange={handleFieldChange}
                    />
                ) : (
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            minRows={20}
                            maxRows={40}
                            value={JSON.stringify(localConfig, null, 2)}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            error={!!jsonError}
                            helperText={jsonError}
                            sx={{ fontFamily: 'monospace' }}
                            slotProps={{
                                input: {
                                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
};
