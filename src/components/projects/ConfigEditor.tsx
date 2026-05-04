import React, { useState, useEffect } from 'react';
import {
    TextField,
    TextArea,
    Toggle,
    Accordion,
    Button,
    TabNavigation,
    Tab,
    Dropdown,
    Notification,
    ActivityIndicator,
} from '@bosch/react-frok';
import './ConfigEditor.css';
import { RAGaaSClient } from '../../services/api';
import { LLMModelInfo, LLMModelsResponse } from '../../types';

interface ConfigEditorProps {
    config: Record<string, any>;
    onSave: (newConfig: Record<string, any>) => Promise<void>;
    projectId?: string;
    apiClient?: RAGaaSClient;
}

// Helper to determine value type
const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

const readDropdownValue = (valueOrEvent: unknown): string => {
    if (typeof valueOrEvent === 'string') return valueOrEvent;
    const maybeEvent = valueOrEvent as { target?: { value?: string } };
    return maybeEvent.target?.value ?? '';
};

const getPlatformDefault = (
    llmModels: LLMModelsResponse,
    field: 'config_name' | 'weak_llm_config_name'
): string | null | undefined => {
    if (field === 'config_name') {
        return llmModels.platform_defaults?.config_name
            ?? llmModels.platform_default_config_name
            ?? llmModels.default_config_name;
    }

    return llmModels.platform_defaults?.weak_llm_config_name
        ?? llmModels.platform_default_weak_llm_config_name
        ?? llmModels.default_weak_llm_config_name;
};

const getModelDisplayName = (model: LLMModelInfo): string => (
    model.display_name
    ?? model.label
    ?? model.model_name
    ?? model.config_name
);

const buildModelOptionLabel = (
    model: LLMModelInfo,
    llmModels: LLMModelsResponse,
    field: 'config_name' | 'weak_llm_config_name'
): string => {
    const markers: string[] = [];
    const defaultName = getPlatformDefault(llmModels, field);

    if (field === 'config_name' && (model.is_current || model.config_name === llmModels.config_name)) {
        markers.push('current');
    }
    if (field === 'weak_llm_config_name' && (model.is_current_weak || model.config_name === llmModels.weak_llm_config_name)) {
        markers.push('current weak');
    }
    if (model.is_default || (field === 'weak_llm_config_name' && model.is_default_weak) || model.config_name === defaultName) {
        markers.push('default');
    }

    const metadata = [model.provider, model.model_name].filter(Boolean).join(' / ');
    const suffix = [metadata, markers.length ? markers.join(', ') : null].filter(Boolean).join(' - ');
    return suffix ? `${getModelDisplayName(model)} (${suffix})` : getModelDisplayName(model);
};

const getModelOptions = (
    llmModels: LLMModelsResponse,
    field: 'config_name' | 'weak_llm_config_name',
    selectedValue: string
) => {
    const options = llmModels.available_models.map((model) => ({
        name: buildModelOptionLabel(model, llmModels, field),
        value: model.config_name,
    }));

    if (selectedValue && !options.some((option) => option.value === selectedValue)) {
        options.unshift({
            name: `${selectedValue} (current, unavailable)`,
            value: selectedValue,
        });
    }

    return options;
};

// Recursive Field Renderer
const ConfigField: React.FC<{
    path: string[];
    value: any;
    label: string;
    onChange: (path: string[], newValue: any) => void;
    onDelete?: (path: string[]) => void;
    depth?: number;
    llmModels?: LLMModelsResponse | null;
    llmModelsLoading?: boolean;
}> = ({ path, value, label, onChange, onDelete, depth = 0, llmModels, llmModelsLoading = false }) => {
    const type = getValueType(value);
    const isRoot = depth === 0;
    const llmModelField = path.length === 2
        && path[0] === 'llm_config'
        && (path[1] === 'config_name' || path[1] === 'weak_llm_config_name')
        ? path[1] as 'config_name' | 'weak_llm_config_name'
        : null;

    // String / Number
    if (type === 'string' || type === 'number' || type === 'null') {
        if (llmModelField && llmModels?.available_models?.length) {
            const selectedValue = String(value || (llmModelField === 'config_name'
                ? llmModels.config_name
                : llmModels.weak_llm_config_name) || '');

            return (
                <div className="config-field-row config-llm-model-row">
                    <div className="config-llm-model-control">
                        <Dropdown
                            id={`config-field-${path.join('-')}`}
                            label={llmModelField === 'config_name' ? 'LLM model' : 'Weak LLM model'}
                            value={selectedValue}
                            options={getModelOptions(llmModels, llmModelField, selectedValue)}
                            onChange={(selected) => onChange(path, readDropdownValue(selected))}
                        />
                        <span className="config-field-hint">
                            Platform default: {getPlatformDefault(llmModels, llmModelField) || 'Not configured'}
                        </span>
                    </div>
                    {onDelete && (
                        <Button
                            mode="integrated"
                            icon="delete"
                            aria-label="Delete"
                            onClick={() => onDelete(path)}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="config-field-row">
                <TextField
                    id={`config-field-${path.join('-')}`}
                    label={label}
                    value={value ?? ''}
                    disabled={!!llmModelField && llmModelsLoading}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(path, type === 'number' ? Number(val) : val);
                    }}
                />
                {onDelete && (
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label="Delete"
                        onClick={() => onDelete(path)}
                    />
                )}
            </div>
        );
    }

    // Boolean
    if (type === 'boolean') {
        return (
            <div className="config-field-toggle">
                <Toggle
                    id={`toggle-${path.join('-')}`}
                    leftLabel={label}
                    checked={value}
                    onChange={(e) => onChange(path, (e.target as HTMLInputElement).checked)}
                />
                {onDelete && (
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label="Delete"
                        onClick={() => onDelete(path)}
                    />
                )}
            </div>
        );
    }

    // Object
    if (type === 'object') {
        const content = (
            <div className="config-field-group">
                {Object.entries(value).map(([key, val]) => (
                    <ConfigField
                        key={key}
                        path={[...path, key]}
                        value={val}
                        label={key}
                        onChange={onChange}
                        depth={depth + 1}
                        llmModels={llmModels}
                        llmModelsLoading={llmModelsLoading}
                    />
                ))}
            </div>
        );

        if (isRoot) return content;

        return (
            <Accordion headline={label} defaultOpen className="config-section-accordion">
                {content}
            </Accordion>
        );
    }

    // Array
    if (type === 'array') {
        return (
            <Accordion headline={`${label} [${value.length}]`} defaultOpen className="config-section-accordion">
                {value.map((item: any, index: number) => (
                    <div key={index} className="config-array-item">
                        <ConfigField
                            path={[...path, index.toString()]}
                            value={item}
                            label={`${label}[${index}]`}
                            onChange={onChange}
                            onDelete={() => {
                                const newArray = [...value];
                                newArray.splice(index, 1);
                                onChange(path, newArray);
                            }}
                            depth={depth + 1}
                            llmModels={llmModels}
                            llmModelsLoading={llmModelsLoading}
                        />
                    </div>
                ))}
                <Button
                    mode="tertiary"
                    icon="add"
                    label="Add Item"
                    onClick={() => {
                        const newArray = [...value, ""];
                        onChange(path, newArray);
                    }}
                />
            </Accordion>
        );
    }

    return null;
};

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onSave, projectId, apiClient }) => {
    const [localConfig, setLocalConfig] = useState<Record<string, any>>(config);
    const [mode, setMode] = useState<'visual' | 'json'>('visual');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [llmModels, setLlmModels] = useState<LLMModelsResponse | null>(null);
    const [llmModelsLoading, setLlmModelsLoading] = useState(false);
    const [llmModelsError, setLlmModelsError] = useState<string | null>(null);

    // Reset local state when config prop changes (and not dirty?)
    // Actually, usually we want to respect the prop updates unless user is editing.
    // For simplicity, we initialize once or when config deeply changes.
    useEffect(() => {
        if (!dirty) {
            setLocalConfig(config);
        }
    }, [config, dirty]);

    useEffect(() => {
        if (!apiClient || !projectId) return;

        let cancelled = false;

        const loadLLMModels = async () => {
            setLlmModelsLoading(true);
            setLlmModelsError(null);
            try {
                const response = await apiClient.getProjectLLMModels(projectId);
                if (!cancelled) {
                    setLlmModels(response);
                }
            } catch (err) {
                if (!cancelled) {
                    setLlmModelsError(err instanceof Error ? err.message : 'Failed to load available LLM models');
                }
            } finally {
                if (!cancelled) {
                    setLlmModelsLoading(false);
                }
            }
        };

        loadLLMModels();

        return () => {
            cancelled = true;
        };
    }, [apiClient, projectId]);

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
        <div className="config-editor-wrapper">
            {/* Toolbar */}
            <div className="config-editor-toolbar">
                <div className="config-editor-toolbar-left">
                    <h6 className="config-editor-title">Project Configuration</h6>
                    <TabNavigation
                        className="config-editor-mode-tabs"
                        selectedValue={mode}
                        onTabSelect={(_ev, data) => setMode(data.value as 'visual' | 'json')}
                    >
                        <Tab value="visual" icon={{ iconName: 'list' }}>Visual</Tab>
                        <Tab value="json" icon={{ iconName: 'code' }}>JSON</Tab>
                    </TabNavigation>
                </div>
                <Button
                    mode="primary"
                    icon="save"
                    label={saving ? 'Saving...' : 'Save Changes'}
                    onClick={handleSave}
                    disabled={saving || (mode === 'json' && !!jsonError)}
                />
            </div>

            {/* Content */}
            <div className="config-editor-content">
                {llmModelsLoading && (
                    <div className="config-llm-models-loading">
                        <ActivityIndicator size="small" />
                        <span>Loading available LLM models...</span>
                    </div>
                )}
                {llmModelsError && (
                    <div className="config-llm-models-notice">
                        <Notification type="warning" defaultOpen>
                            LLM model selector unavailable: {llmModelsError}
                        </Notification>
                    </div>
                )}
                {mode === 'visual' ? (
                    <ConfigField
                        path={[]}
                        value={localConfig}
                        label="Root"
                        onChange={handleFieldChange}
                        llmModels={llmModels}
                        llmModelsLoading={llmModelsLoading}
                    />
                ) : (
                    <div>
                        <TextArea
                            id="config-json-editor"
                            label="JSON Configuration"
                            rows={20}
                            value={JSON.stringify(localConfig, null, 2)}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            className="config-json-textarea"
                        />
                        {jsonError && (
                            <p className="config-json-error">{jsonError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
