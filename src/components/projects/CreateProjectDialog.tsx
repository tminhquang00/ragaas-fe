import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    Slider,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
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

    const dialogContent = (
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
            className="create-project-dialog"
        >
            <div className="create-project-dialog-content">
                <TabNavigation
                    selectedValue={tab}
                    onTabSelect={(_ev, data) => setTab(data.value as string)}
                >
                    <Tab value="manual" icon={{ iconName: 'add' }}>Manual Setup</Tab>
                    <Tab value="yaml" icon={{ iconName: 'upload' }}>Upload YAML</Tab>
                </TabNavigation>

                <div className="create-project-form-area">
                    {error && (
                        <Notification type="error" defaultOpen style={{ marginBottom: 16 }}>
                            {error}
                        </Notification>
                    )}

                    {loading && (
                        <div className="create-project-loading">
                            <ActivityIndicator size="small" />
                        </div>
                    )}

                    {tab === 'manual' ? (
                        <div className="create-project-form">
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
                                rows={3}
                                placeholder="A document Q&A system for..."
                            />

                            <Accordion headline="Advanced Settings" size="small">
                                <div className="create-project-advanced">
                                    <Dropdown
                                        label="LLM Model"
                                        value={llmModel}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        options={AVAILABLE_MODELS.map((model) => ({
                                            name: model.description,
                                            value: model.model_name,
                                        }))}
                                    />

                                    <div className="create-project-slider-field">
                                        <label className="create-project-slider-label">
                                            Temperature: <strong>{temperature}</strong>
                                        </label>
                                        <Slider
                                            labelLeft="0"
                                            labelRight="2"
                                            tooltip
                                            input={{
                                                min: 0,
                                                max: 2,
                                                step: 0.1,
                                                value: temperature,
                                                onChange: (e) => setTemperature(Number(e.target.value)),
                                            }}
                                        />
                                    </div>

                                    <div className="create-project-slider-field">
                                        <label className="create-project-slider-label">
                                            Top K Results: <strong>{topK}</strong>
                                        </label>
                                        <Slider
                                            labelLeft="1"
                                            labelRight="20"
                                            tooltip
                                            input={{
                                                min: 1,
                                                max: 20,
                                                step: 1,
                                                value: topK,
                                                onChange: (e) => setTopK(Number(e.target.value)),
                                            }}
                                        />
                                    </div>

                                    <TextArea
                                        id="project-system-prompt"
                                        label="System Prompt"
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        rows={3}
                                        placeholder="You are a helpful assistant that answers questions based on the provided documents..."
                                    />
                                </div>
                            </Accordion>
                        </div>
                    ) : (
                        <div className="create-project-upload-area">
                            <input
                                type="file"
                                accept=".yaml,.yml"
                                className="create-project-file-input"
                                id="yaml-upload"
                                onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="yaml-upload" className="create-project-upload-label">
                                <div className={`create-project-dropzone ${yamlFile ? 'has-file' : ''}`}>
                                    <FrokIcon name="Upload" className="create-project-upload-icon" />
                                    <p className="create-project-upload-text">
                                        {yamlFile ? yamlFile.name : 'Click to upload YAML configuration'}
                                    </p>
                                    <span className="create-project-upload-hint">
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

    // Use portal to render dialog at document body level to avoid parent container clipping
    return createPortal(dialogContent, document.body);
};
