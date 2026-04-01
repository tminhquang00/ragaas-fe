import React, { useState } from 'react';
import {
    Slider,
} from '@mui/material';
import {
    Dialog,
    TextField,
    TextArea,
    Accordion,
    Dropdown,
    TabNavigation,
    Tab,
    Notification,
    ActivityIndicator,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha } from '../../utils/frokTheme';
import { CreateProjectRequest } from '../../types';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => Promise<void>;
    onUploadYaml?: (file: File) => Promise<void>;
    loading?: boolean;
}

// Available LLM options from configuration
const AVAILABLE_MODELS = [
    {
        "name": "default",
        "provider": "azure_openai",
        "model_name": "gpt-5-mini",
        "temperature": 1,
        "max_tokens": 4096,
        "description": "Default LLM config - aliases to GPT-5 Mini"
    },
    {
        "name": "gpt-4.1-mini",
        "provider": "azure_openai",
        "model_name": "gpt-4.1-mini",
        "temperature": 0.7,
        "max_tokens": 4096,
        "description": "GPT-4.1 Mini - Fast and cost-effective"
    },
    {
        "name": "gpt-4o-mini",
        "provider": "azure_openai",
        "model_name": "gpt-4o-mini",
        "temperature": 0.7,
        "max_tokens": 4096,
        "description": "GPT-4o Mini - Multimodal capable"
    },
    {
        "name": "gpt-5",
        "provider": "azure_openai",
        "model_name": "gpt-5",
        "temperature": 0.7,
        "max_tokens": 8192,
        "description": "GPT-5 - Most capable model"
    },
    {
        "name": "gpt-5-mini",
        "provider": "azure_openai",
        "model_name": "gpt-5-mini",
        "temperature": 0.7,
        "max_tokens": 4096,
        "description": "GPT-5 Mini - Balanced performance"
    },
    {
        "name": "gpt-5-nano",
        "provider": "azure_openai",
        "model_name": "gpt-5-nano",
        "temperature": 0.7,
        "max_tokens": 2048,
        "description": "GPT-5 Nano - Lightweight and fast"
    },
    {
        "name": "gpt-5.1",
        "provider": "azure_openai",
        "model_name": "gpt-5.1",
        "temperature": 0.7,
        "max_tokens": 8192,
        "description": "GPT-5.1 - Latest model"
    },
    {
        "name": "gptbot-4o",
        "provider": "azure_openai",
        "model_name": "gpt-4o",
        "temperature": 0.7,
        "max_tokens": 4096,
        "description": "GPT-4o - Fast and capable"
    },
    {
        "name": "model-router-2",
        "provider": "azure_openai",
        "model_name": "model-router",
        "temperature": 0.7,
        "max_tokens": 4096,
        "description": "Model Router - Automatic model selection"
    }
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
    open,
    onClose,
    onSubmit,
    onUploadYaml,
    loading = false,
}) => {
    const [tab, setTab] = useState<string>('manual');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [llmModel, setLlmModel] = useState('gpt-5-mini');
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
        setLlmModel('gpt-5-mini');
        setTemperature(0.7);
        setTopK(5);
        setSystemPrompt('');
        setYamlFile(null);
        setError('');
        setTab('manual');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleModelChange = (modelName: string) => {
        setLlmModel(modelName);
        const modelConfig = AVAILABLE_MODELS.find(m => m.model_name === modelName);
        if (modelConfig) {
            setTemperature(modelConfig.temperature);
        }
    };

    return (
        <Dialog
            title="Create New Project"
            modal={true}
            open={open}
            onClose={handleClose}
            onConfirm={tab === 'manual' ? handleSubmit : handleYamlUpload}
            onCancel={handleClose}
            confirmLabel={loading ? 'Creating...' : 'Create Project'}
            cancelLabel="Cancel"
            confirmButton={{ disabled: loading || (tab === 'manual' ? !name.trim() : !yamlFile) }}
            cancelButton={{ disabled: loading }}
        >
            <div style={{ minWidth: 400 }}>
                <TabNavigation
                    selectedValue={tab}
                    onTabSelect={(_ev, data) => setTab(data.value as string)}
                >
                    <Tab value="manual" icon={{ iconName: 'add' }}>Manual Setup</Tab>
                    <Tab value="yaml" icon={{ iconName: 'upload' }}>Upload YAML</Tab>
                </TabNavigation>

                <div style={{ marginTop: 16 }}>
                    {error && (
                        <Notification type="error" defaultOpen>
                            {error}
                        </Notification>
                    )}

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                            <ActivityIndicator size="small" />
                        </div>
                    )}

                    {tab === 'manual' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <TextField
                                id="project-name"
                                label="Project Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                                placeholder="My RAG Project"
                            />

                            <TextArea
                                id="project-description"
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                placeholder="A document Q&A system for..."
                            />

                            <Accordion headline="Advanced Settings">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 0' }}>
                                    <Dropdown
                                        label="LLM Model"
                                        value={llmModel}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        options={AVAILABLE_MODELS.map((model) => ({
                                            name: model.description,
                                            value: model.model_name,
                                        }))}
                                    />

                                    <div>
                                        <p style={{ marginBottom: 8 }}>Temperature: {temperature}</p>
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
                                    </div>

                                    <div>
                                        <p style={{ marginBottom: 8 }}>Top K Results: {topK}</p>
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
                                    </div>

                                    <TextArea
                                        id="project-system-prompt"
                                        label="System Prompt"
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        rows={4}
                                        placeholder="You are a helpful assistant that answers questions based on the provided documents..."
                                    />
                                </div>
                            </Accordion>
                        </div>
                    ) : (
                        <div style={{ padding: '16px 0' }}>
                            <input
                                type="file"
                                accept=".yaml,.yml"
                                style={{ display: 'none' }}
                                id="yaml-upload"
                                onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="yaml-upload">
                                <div
                                    style={{
                                        border: `2px dashed ${alpha('var(--g-blue-50, #007bc0)', 0.3)}`,
                                        padding: 32,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <FrokIcon name="Upload" style={{ fontSize: 48, marginBottom: 16 }} />
                                    <p style={{ marginBottom: 4 }}>
                                        {yamlFile ? yamlFile.name : 'Click to upload YAML configuration'}
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--major__enabled__default__front-secondary, #70757a)' }}>
                                        Supported: .yaml, .yml
                                    </span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
