import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Tabs,
    Tab,
    Alert,
    useTheme,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import { CreateProjectRequest } from '../../types';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => Promise<void>;
    onUploadYaml?: (file: File) => Promise<void>;
    loading?: boolean;
}

// Available LLM options (should come from API in a real app)
const llmOptions = [
    { value: 'azure-4.1', label: 'Azure GPT-4.1' },
    { value: 'azure-4o', label: 'Azure GPT-4o' },
    { value: 'azure-4o-mini', label: 'Azure GPT-4o Mini' },
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
    open,
    onClose,
    onSubmit,
    onUploadYaml,
    loading = false,
}) => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [llmModel, setLlmModel] = useState('azure-4.1');
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(5);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [yamlFile, setYamlFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setError('');
        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                config: {
                    llm_config: {
                        config_name: llmModel,
                        temperature,
                    },
                    retrieval_config: {
                        retrieval_method: 'semantic',
                        top_k: topK,
                        similarity_threshold: 0.7,
                    },
                    system_prompt: systemPrompt || undefined,
                } as any,
            });
            handleReset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        }
    };

    const handleYamlUpload = async () => {
        if (!yamlFile || !onUploadYaml) return;

        setError('');
        try {
            await onUploadYaml(yamlFile);
            handleReset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project from YAML');
        }
    };

    const handleReset = () => {
        setName('');
        setDescription('');
        setLlmModel('azure-4.1');
        setTemperature(0.7);
        setTopK(5);
        setSystemPrompt('');
        setYamlFile(null);
        setError('');
        setTab(0);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                },
            }}
        >
            <DialogTitle>
                <Typography variant="h5" fontWeight={600}>
                    Create New Project
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Manual Setup" icon={<AddIcon />} iconPosition="start" />
                    <Tab label="Upload YAML" icon={<UploadIcon />} iconPosition="start" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {tab === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Project Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            fullWidth
                            autoFocus
                            placeholder="My RAG Project"
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="A document Q&A system for..."
                        />

                        <Accordion
                            sx={{
                                background: 'transparent',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={500}>Advanced Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>LLM Model</InputLabel>
                                    <Select
                                        value={llmModel}
                                        label="LLM Model"
                                        onChange={(e) => setLlmModel(e.target.value)}
                                    >
                                        {llmOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box>
                                    <Typography gutterBottom>Temperature: {temperature}</Typography>
                                    <Slider
                                        value={temperature}
                                        onChange={(_, v) => setTemperature(v as number)}
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        marks={[
                                            { value: 0, label: '0' },
                                            { value: 1, label: '1' },
                                            { value: 2, label: '2' },
                                        ]}
                                        valueLabelDisplay="auto"
                                    />
                                </Box>

                                <Box>
                                    <Typography gutterBottom>Top K Results: {topK}</Typography>
                                    <Slider
                                        value={topK}
                                        onChange={(_, v) => setTopK(v as number)}
                                        min={1}
                                        max={20}
                                        step={1}
                                        marks={[
                                            { value: 1, label: '1' },
                                            { value: 10, label: '10' },
                                            { value: 20, label: '20' },
                                        ]}
                                        valueLabelDisplay="auto"
                                    />
                                </Box>

                                <TextField
                                    label="System Prompt"
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="You are a helpful assistant that answers questions based on the provided documents..."
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <input
                            type="file"
                            accept=".yaml,.yml"
                            style={{ display: 'none' }}
                            id="yaml-upload"
                            onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="yaml-upload">
                            <Box
                                sx={{
                                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        background: alpha(theme.palette.primary.main, 0.05),
                                    },
                                }}
                            >
                                <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
                                <Typography variant="body1" gutterBottom>
                                    {yamlFile ? yamlFile.name : 'Click to upload YAML configuration'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supported: .yaml, .yml
                                </Typography>
                            </Box>
                        </label>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={tab === 0 ? handleSubmit : handleYamlUpload}
                    disabled={loading || (tab === 0 ? !name.trim() : !yamlFile)}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Creating...' : 'Create Project'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
