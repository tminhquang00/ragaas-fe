import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    TextField,
    TextArea,
    Accordion,
    Dropdown,
    TabNavigation,
    Tab,
    Notification,
    ActivityIndicator,
    Slider,
    Icon,
    Button,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { useAuth } from '../../context';
import {
    CreateProjectRequest,
    TemplateInfo,
    TemplateOverrides,
    CreateFromTemplateRequest,
} from '../../types';

type CreationMode = 'templates' | 'manual' | 'yaml';
type TemplateStep = 'pick' | 'customize';
type CategoryFilter = 'all' | 'rag' | 'agent' | 'extraction' | 'multi_agent';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => Promise<void>;
    onUploadYaml?: (file: File) => Promise<void>;
    onCreateFromTemplate?: (request: CreateFromTemplateRequest) => Promise<void>;
    loading?: boolean;
}

const AVAILABLE_MODELS = [
    { model_name: 'gpt-5-mini',    temperature: 1,   description: 'Default — GPT-5 Mini' },
    { model_name: 'gpt-4.1-mini',  temperature: 0.7, description: 'GPT-4.1 Mini — Fast & cost-effective' },
    { model_name: 'gpt-4o-mini',   temperature: 0.7, description: 'GPT-4o Mini — Multimodal capable' },
    { model_name: 'gpt-5',         temperature: 0.7, description: 'GPT-5 — Most capable' },
    { model_name: 'gpt-5-nano',    temperature: 0.7, description: 'GPT-5 Nano — Lightweight' },
    { model_name: 'gpt-5.1',       temperature: 0.7, description: 'GPT-5.1 — Latest' },
    { model_name: 'gpt-4o',        temperature: 0.7, description: 'GPT-4o — Fast & capable' },
    { model_name: 'model-router',  temperature: 0.7, description: 'Model Router — Auto selection' },
];

const TEMPLATE_ICON_MAP: Record<string, string> = {
    'file-search':    'search',
    'bot':            'robot',
    'database':       'database',
    'receipt':        'document-text',
    'file-text':      'document',
    'message-circle': 'chat',
    'users':          'user',
    'git-branch':     'route',
    'network':        'connection',
    'search':         'search',
};

const CATEGORY_COLORS: Record<string, string> = {
    rag:         '#007bc0',
    agent:       '#7c3aed',
    extraction:  '#00884a',
    multi_agent: '#d97706',
};

const CATEGORY_LABELS: Record<string, string> = {
    all:         'All',
    rag:         'RAG',
    agent:       'Agent',
    extraction:  'Extraction',
    multi_agent: 'Multi-Agent',
};

// ---------------------------------------------------------------------------
// Custom Modal — replaces FROK Dialog to avoid its internal flex-grow issue
// ---------------------------------------------------------------------------
interface CustomModalProps {
    open: boolean;
    title: string;
    wide?: boolean;
    onClose: () => void;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ open, title, wide, onClose, footer, children }) => {
    // Lock body scroll while open
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(113,118,124,0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                boxSizing: 'border-box',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{
                    position: 'relative',
                    backgroundColor: 'var(--app-bg, #ffffff)',
                    color: 'var(--app-text, #101112)',
                    width: '100%',
                    maxWidth: wide ? '960px' : '580px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                    fontFamily: "boschsans, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px 16px 24px',
                    borderBottom: '1px solid var(--app-border, #c1c7cc)',
                    flexShrink: 0,
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {title}
                    </h2>
                    <Button mode="integrated" icon="close" onClick={onClose} aria-label="Close dialog" />
                </div>

                {/* Scrollable content — flex: 1 so it fills remaining space, min-height: 0 to allow shrink */}
                <div style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        padding: '14px 24px',
                        borderTop: '1px solid var(--app-border, #c1c7cc)',
                        flexShrink: 0,
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
    open,
    onClose,
    onSubmit,
    onUploadYaml,
    onCreateFromTemplate,
    loading = false,
}) => {
    const { apiClient } = useAuth();

    const [mode, setMode] = useState<CreationMode>('templates');
    const [templateStep, setTemplateStep] = useState<TemplateStep>('pick');

    const [templates, setTemplates] = useState<TemplateInfo[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [llmModel, setLlmModel] = useState('gpt-5-mini');
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(5);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [overrides, setOverrides] = useState<TemplateOverrides>({});
    const [yamlFile, setYamlFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const fetchTemplates = useCallback(async () => {
        if (!apiClient) return;
        setTemplatesLoading(true);
        setTemplatesError('');
        try {
            const response = await apiClient.listTemplates();
            setTemplates(response.templates);
        } catch (err) {
            setTemplatesError(err instanceof Error ? err.message : 'Failed to load templates');
        } finally {
            setTemplatesLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        if (open && mode === 'templates' && templates.length === 0) {
            fetchTemplates();
        }
    }, [open, mode, fetchTemplates, templates.length]);

    const filteredTemplates =
        categoryFilter === 'all' ? templates : templates.filter((t) => t.category === categoryFilter);

    const handleReset = () => {
        setMode('templates');
        setTemplateStep('pick');
        setSelectedTemplate(null);
        setCategoryFilter('all');
        setName('');
        setDescription('');
        setLlmModel('gpt-5-mini');
        setTemperature(0.7);
        setTopK(5);
        setSystemPrompt('');
        setOverrides({});
        setYamlFile(null);
        setError('');
        setTemplatesError('');
    };

    const handleClose = () => { handleReset(); onClose(); };

    const handleSelectTemplate = (template: TemplateInfo) => {
        setSelectedTemplate(template);
        setOverrides({});
        setName('');
        setDescription('');
        setError('');
        setTemplateStep('customize');
    };

    const handleTemplateCreate = async () => {
        if (!name.trim()) { setError('Project name is required'); return; }
        if (!selectedTemplate || !onCreateFromTemplate) return;
        setError('');
        try {
            await onCreateFromTemplate({
                template_id: selectedTemplate.id,
                name: name.trim(),
                description: description.trim() || undefined,
                overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
            });
            handleReset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        }
    };

    const handleManualSubmit = async () => {
        if (!name.trim()) { setError('Project name is required'); return; }
        setError('');
        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                config: {
                    llm_config: { config_name: llmModel, temperature },
                    retrieval_config: { retrieval_method: 'semantic', top_k: topK, similarity_threshold: 0.7 },
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

    const handleModeChange = (newMode: string) => {
        setMode(newMode as CreationMode);
        setError('');
        if (newMode === 'templates' && templates.length === 0) fetchTemplates();
    };

    const isTemplatePick = mode === 'templates' && templateStep === 'pick';
    const isTemplateCustomize = mode === 'templates' && templateStep === 'customize';

    const dialogTitle = isTemplateCustomize && selectedTemplate
        ? selectedTemplate.name
        : 'Create New Project';

    // Footer buttons
    const footer = isTemplatePick ? (
        <Button mode="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
    ) : isTemplateCustomize ? (
        <>
            <Button mode="secondary" onClick={() => { setTemplateStep('pick'); setError(''); }} disabled={loading}>
                Back
            </Button>
            <Button mode="primary" onClick={handleTemplateCreate} disabled={loading || !name.trim()}>
                {loading ? 'Creating…' : 'Create Project'}
            </Button>
        </>
    ) : mode === 'yaml' ? (
        <>
            <Button mode="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button mode="primary" onClick={handleYamlUpload} disabled={loading || !yamlFile}>
                {loading ? 'Creating…' : 'Upload & Create'}
            </Button>
        </>
    ) : (
        <>
            <Button mode="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button mode="primary" onClick={handleManualSubmit} disabled={loading || !name.trim()}>
                {loading ? 'Creating…' : 'Create Project'}
            </Button>
        </>
    );

    return (
        <CustomModal
            open={open}
            title={dialogTitle}
            wide={isTemplatePick}
            onClose={handleClose}
            footer={footer}
        >
            {/* Tab navigation — hidden while customising a template */}
            {!isTemplateCustomize && (
                <div style={{ borderBottom: '1px solid var(--app-border, #c1c7cc)' }}>
                    <TabNavigation
                        selectedValue={mode}
                        onTabSelect={(_ev, data) => handleModeChange(data.value as string)}
                    >
                        <Tab value="templates" icon={{ iconName: 'flash' }}>Templates</Tab>
                        <Tab value="manual"    icon={{ iconName: 'add'   }}>Manual Setup</Tab>
                        <Tab value="yaml"      icon={{ iconName: 'upload'}}>Upload YAML</Tab>
                    </TabNavigation>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="cpd-error">
                    <Notification type="error" defaultOpen>{error}</Notification>
                </div>
            )}

            {loading && (
                <div className="cpd-loading-overlay">
                    <ActivityIndicator size="small" />
                </div>
            )}

            {/* ===== TEMPLATE PICK ===== */}
            {isTemplatePick && (
                <div>
                    {/* Category filter */}
                    <div className="cpd-category-filter">
                        {(['all', 'rag', 'agent', 'extraction', 'multi_agent'] as CategoryFilter[]).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`cpd-category-btn${categoryFilter === cat ? ' cpd-category-btn--active' : ''}`}
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>

                    {templatesError && (
                        <div className="cpd-error">
                            <Notification type="error" defaultOpen>{templatesError}</Notification>
                        </div>
                    )}

                    {templatesLoading ? (
                        <div className="cpd-templates-loading">
                            <ActivityIndicator size="large" />
                            <p className="cpd-templates-loading-text">Loading templates…</p>
                        </div>
                    ) : (
                        <div className="cpd-templates-grid">
                            {filteredTemplates.map((template) => (
                                <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
                            ))}
                            {filteredTemplates.length === 0 && (
                                <div className="cpd-templates-empty">
                                    <Icon iconName="search" />
                                    <p>No templates in this category</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ===== TEMPLATE CUSTOMIZE ===== */}
            {isTemplateCustomize && selectedTemplate && (
                <div>
                    {/* Template summary banner */}
                    <div className="cpd-template-banner">
                        <div className="cpd-template-banner-icon">
                            <Icon iconName={TEMPLATE_ICON_MAP[selectedTemplate.icon] ?? 'document'} />
                        </div>
                        <div className="cpd-template-banner-body">
                            <p className="cpd-template-banner-desc">{selectedTemplate.description}</p>
                            <div className="cpd-template-banner-features">
                                {selectedTemplate.features.map((f) => (
                                    <span key={f} className="cpd-feature-chip">{f}</span>
                                ))}
                            </div>
                        </div>
                        <span className="cpd-category-badge" style={{ background: CATEGORY_COLORS[selectedTemplate.category] }}>
                            {CATEGORY_LABELS[selectedTemplate.category]}
                        </span>
                    </div>

                    <div className="cpd-form">
                        <TextField
                            id="tpl-project-name"
                            label="Project Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            placeholder={`My ${selectedTemplate.name}`}
                        />
                        <TextArea
                            id="tpl-project-description"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="What will this project do?"
                        />
                        <Accordion headline="Advanced Settings" size="small">
                            <div className="cpd-advanced">
                                <Dropdown
                                    label="LLM Model"
                                    value={overrides.llm_config_name ?? 'default'}
                                    onChange={(e) => setOverrides((p) => ({ ...p, llm_config_name: e.target.value }))}
                                    options={AVAILABLE_MODELS.map((m) => ({ name: m.description, value: m.model_name }))}
                                />
                                <Dropdown
                                    label="Vector Database"
                                    value={overrides.vector_db_provider ?? ''}
                                    onChange={(e) => setOverrides((p) => ({ ...p, vector_db_provider: e.target.value || undefined }))}
                                    options={[
                                        { name: 'Default', value: '' },
                                        { name: 'MongoDB Atlas', value: 'mongodb_atlas' },
                                        { name: 'Weaviate', value: 'weaviate' },
                                        { name: 'Qdrant', value: 'qdrant' },
                                    ]}
                                />
                                <Dropdown
                                    label="Retrieval Method"
                                    value={overrides.retrieval_method ?? ''}
                                    onChange={(e) => setOverrides((p) => ({ ...p, retrieval_method: e.target.value || undefined }))}
                                    options={[
                                        { name: 'Default', value: '' },
                                        { name: 'Semantic', value: 'semantic' },
                                        { name: 'Hybrid (semantic + BM25)', value: 'hybrid' },
                                        { name: 'BM25 (keyword)', value: 'bm25' },
                                    ]}
                                />
                                <div className="cpd-slider-field">
                                    <label className="cpd-slider-label">
                                        Temperature: <strong>{overrides.temperature ?? 'default'}</strong>
                                    </label>
                                    <Slider labelLeft="0" labelRight="2" tooltip input={{
                                        min: 0, max: 2, step: 0.1,
                                        value: overrides.temperature ?? 0.7,
                                        onChange: (e) => setOverrides((p) => ({ ...p, temperature: Number(e.target.value) })),
                                    }} />
                                </div>
                                <div className="cpd-slider-field">
                                    <label className="cpd-slider-label">
                                        Top K: <strong>{overrides.top_k ?? 'default'}</strong>
                                    </label>
                                    <Slider labelLeft="1" labelRight="20" tooltip input={{
                                        min: 1, max: 20, step: 1,
                                        value: overrides.top_k ?? 5,
                                        onChange: (e) => setOverrides((p) => ({ ...p, top_k: Number(e.target.value) })),
                                    }} />
                                </div>
                            </div>
                        </Accordion>
                    </div>
                </div>
            )}

            {/* ===== MANUAL SETUP ===== */}
            {mode === 'manual' && (
                <div className="cpd-form">
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
                        placeholder="An automated workflow agent for…"
                    />
                    <Accordion headline="Advanced Settings" size="small">
                        <div className="cpd-advanced">
                            <Dropdown
                                label="LLM Model"
                                value={llmModel}
                                onChange={(e) => {
                                    setLlmModel(e.target.value);
                                    const m = AVAILABLE_MODELS.find((x) => x.model_name === e.target.value);
                                    if (m) setTemperature(m.temperature);
                                }}
                                options={AVAILABLE_MODELS.map((m) => ({ name: m.description, value: m.model_name }))}
                            />
                            <div className="cpd-slider-field">
                                <label className="cpd-slider-label">Temperature: <strong>{temperature}</strong></label>
                                <Slider labelLeft="0" labelRight="2" tooltip input={{
                                    min: 0, max: 2, step: 0.1, value: temperature,
                                    onChange: (e) => setTemperature(Number(e.target.value)),
                                }} />
                            </div>
                            <div className="cpd-slider-field">
                                <label className="cpd-slider-label">Top K Results: <strong>{topK}</strong></label>
                                <Slider labelLeft="1" labelRight="20" tooltip input={{
                                    min: 1, max: 20, step: 1, value: topK,
                                    onChange: (e) => setTopK(Number(e.target.value)),
                                }} />
                            </div>
                            <TextArea
                                id="project-system-prompt"
                                label="System Prompt"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={3}
                                placeholder="You are a helpful assistant…"
                            />
                        </div>
                    </Accordion>
                </div>
            )}

            {/* ===== YAML UPLOAD ===== */}
            {mode === 'yaml' && (
                <div className="cpd-upload-area">
                    <input
                        type="file"
                        accept=".yaml,.yml"
                        className="cpd-file-input"
                        id="yaml-upload"
                        onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="yaml-upload" className="cpd-upload-label">
                        <div className={`cpd-dropzone${yamlFile ? ' cpd-dropzone--has-file' : ''}`}>
                            <FrokIcon name="Upload" className="cpd-upload-icon" />
                            <p className="cpd-upload-text">
                                {yamlFile ? yamlFile.name : 'Click to upload YAML configuration'}
                            </p>
                            <span className="cpd-upload-hint">Supported: .yaml, .yml</span>
                        </div>
                    </label>
                </div>
            )}
        </CustomModal>
    );
};

// ---------------------------------------------------------------------------
// Template Card
// ---------------------------------------------------------------------------
interface TemplateCardProps {
    template: TemplateInfo;
    onSelect: (template: TemplateInfo) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
    const iconName = TEMPLATE_ICON_MAP[template.icon] ?? 'document';
    return (
        <div className="cpd-template-card">
            <div className="cpd-template-card__header">
                <div className="cpd-template-card__icon">
                    <Icon iconName={iconName} />
                </div>
                <span className="cpd-category-badge" style={{ background: CATEGORY_COLORS[template.category] }}>
                    {CATEGORY_LABELS[template.category]}
                </span>
            </div>
            <h3 className="cpd-template-card__name">{template.name}</h3>
            <p className="cpd-template-card__desc">{template.description}</p>
            <div className="cpd-template-card__features">
                {template.features.slice(0, 4).map((f) => (
                    <span key={f} className="cpd-feature-chip">{f}</span>
                ))}
            </div>
            <div className="cpd-template-card__footer">
                <button type="button" className="cpd-use-template-btn" onClick={() => onSelect(template)}>
                    Use Template
                </button>
            </div>
        </div>
    );
};
