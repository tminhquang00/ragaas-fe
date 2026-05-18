import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    Notification,
    TextArea,
    TextField,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import {
    ALL_EVAL_METRICS,
    CreateDatasetRequest,
    EvalDataset,
    TOOL_EXECUTION_MODES,
    ToolExecutionMode,
    UpdateDatasetRequest,
} from '../../types';
import { prettyMetricName } from './evalFormat';

interface DatasetDialogProps {
    open: boolean;
    projectId: string;
    apiClient: RAGaaSClient;
    dataset?: EvalDataset | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (dataset: EvalDataset) => void;
}

interface ThresholdRow {
    id: string;
    metric: string;
    value: string;
}

const DEFAULT_THRESHOLD_METRICS: { metric: string; value: number; help: string }[] = [
    { metric: 'answer_correctness', value: 0.8, help: 'Higher is better' },
    { metric: 'answer_relevancy', value: 0.8, help: 'Higher is better' },
    { metric: 'latency_p95_ms', value: 4000, help: 'Lower is better' },
];

const makeRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const rowsFromThresholds = (thresholds: Record<string, number>): ThresholdRow[] =>
    Object.entries(thresholds).map(([metric, value]) => ({
        id: makeRowId(),
        metric,
        value: String(value),
    }));

const rowsToThresholds = (rows: ThresholdRow[]): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const row of rows) {
        const metric = row.metric.trim();
        if (!metric) continue;
        const numeric = Number(row.value);
        if (!Number.isFinite(numeric)) continue;
        out[metric] = numeric;
    }
    return out;
};

export const DatasetDialog: React.FC<DatasetDialogProps> = ({
    open,
    projectId,
    apiClient,
    dataset,
    onOpenChange,
    onSaved,
}) => {
    const isEditing = Boolean(dataset);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [judge, setJudge] = useState('');
    const [autoSelectMetrics, setAutoSelectMetrics] = useState(true);
    const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(new Set());
    const [toolMode, setToolMode] = useState<ToolExecutionMode>('read_only');
    const [thresholdRows, setThresholdRows] = useState<ThresholdRow[]>([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmLive, setConfirmLive] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName(dataset?.name ?? '');
        setDescription(dataset?.description ?? '');
        setJudge(dataset?.judge_llm_config_name ?? '');
        if (dataset) {
            setAutoSelectMetrics(false);
            setEnabledMetrics(new Set(dataset.enabled_metrics));
            setToolMode(dataset.tool_execution_mode);
            setThresholdRows(rowsFromThresholds(dataset.thresholds));
        } else {
            setAutoSelectMetrics(true);
            setEnabledMetrics(new Set());
            setToolMode('read_only');
            setThresholdRows(
                DEFAULT_THRESHOLD_METRICS.map(({ metric, value }) => ({
                    id: makeRowId(),
                    metric,
                    value: String(value),
                }))
            );
        }
        setError('');
        setSaving(false);
        setConfirmLive(false);
    }, [open, dataset]);

    const showLiveWarning = useMemo(
        () => toolMode === 'live' && (dataset?.tool_execution_mode ?? 'read_only') !== 'live',
        [toolMode, dataset]
    );

    const handleToggleMetric = (metric: string) => {
        setEnabledMetrics((prev) => {
            const next = new Set(prev);
            if (next.has(metric)) next.delete(metric);
            else next.add(metric);
            return next;
        });
    };

    const handleAddThresholdRow = () => {
        setThresholdRows((prev) => [...prev, { id: makeRowId(), metric: '', value: '' }]);
    };

    const handleUpdateThresholdRow = (id: string, update: Partial<ThresholdRow>) => {
        setThresholdRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...update } : row)));
    };

    const handleRemoveThresholdRow = (id: string) => {
        setThresholdRows((prev) => prev.filter((row) => row.id !== id));
    };

    const validate = (): string => {
        if (!name.trim()) return 'Dataset name is required.';
        if (showLiveWarning && !confirmLive) {
            return 'Live tool mode runs evaluation cases against real systems. Confirm to proceed.';
        }
        return '';
    };

    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setSaving(true);
        try {
            const payload: CreateDatasetRequest | UpdateDatasetRequest = {
                name: name.trim(),
                description: description.trim() || null,
                judge_llm_config_name: judge.trim() || null,
                tool_execution_mode: toolMode,
                thresholds: rowsToThresholds(thresholdRows),
                enabled_metrics: autoSelectMetrics ? null : Array.from(enabledMetrics),
            };

            const saved = isEditing && dataset
                ? await apiClient.updateEvalDataset(projectId, dataset.dataset_id, payload as UpdateDatasetRequest)
                : await apiClient.createEvalDataset(projectId, payload as CreateDatasetRequest);

            onSaved(saved);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save dataset');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            title={isEditing ? `Edit Dataset: ${dataset?.name}` : 'New Evaluation Dataset'}
            modal
            open={open}
            onClose={() => onOpenChange(false)}
            cancelLabel="Cancel"
            onCancel={() => onOpenChange(false)}
            confirmLabel={saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Dataset'}
            confirmButton={{ disabled: saving }}
            onConfirm={handleSave}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '520px' }}>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}

                <TextField
                    id="eval-dataset-name"
                    label="Dataset name"
                    value={name}
                    placeholder="Production Golden Set"
                    disabled={saving}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextArea
                    id="eval-dataset-description"
                    label="Description (optional)"
                    rows={2}
                    value={description}
                    placeholder="Core questions reviewed before any prompt release."
                    disabled={saving}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <TextField
                    id="eval-dataset-judge"
                    label="Judge LLM config name (optional)"
                    value={judge}
                    placeholder="default"
                    disabled={saving}
                    onChange={(e) => setJudge(e.target.value)}
                />

                <div className="eval-settings-row">
                    <span className="eval-settings-row__label">Enabled metrics</span>
                    <Checkbox
                        id="eval-auto-metrics"
                        checked={autoSelectMetrics}
                        disabled={saving}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoSelectMetrics(e.target.checked)}
                    >
                        Auto-suggest from project pipeline type
                    </Checkbox>
                    {!autoSelectMetrics && (
                        <div className="eval-metrics-grid">
                            {ALL_EVAL_METRICS.map((metric) => (
                                <Checkbox
                                    key={metric}
                                    id={`eval-metric-${metric}`}
                                    checked={enabledMetrics.has(metric)}
                                    disabled={saving}
                                    onChange={() => handleToggleMetric(metric)}
                                >
                                    {prettyMetricName(metric)}
                                </Checkbox>
                            ))}
                        </div>
                    )}
                </div>

                <div className="eval-settings-row">
                    <span className="eval-settings-row__label">Tool execution mode</span>
                    <p className="eval-settings-row__hint">
                        Controls how the project's tools behave during evaluation runs.
                    </p>
                    <div className="eval-tool-mode-grid">
                        {TOOL_EXECUTION_MODES.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                className="eval-tool-mode-card"
                                aria-pressed={toolMode === option.value}
                                disabled={saving}
                                onClick={() => {
                                    setToolMode(option.value);
                                    setConfirmLive(false);
                                }}
                            >
                                <span className="eval-tool-mode-card__label">{option.label}</span>
                                <span className="eval-tool-mode-card__help">{option.help}</span>
                            </button>
                        ))}
                    </div>
                    {showLiveWarning && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <Notification type="warning" defaultOpen>
                                Live tool mode may call external systems and create side effects. Use with caution.
                            </Notification>
                            <Checkbox
                                id="eval-confirm-live"
                                checked={confirmLive}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmLive(e.target.checked)}
                            >
                                I understand and want to enable live tools.
                            </Checkbox>
                        </div>
                    )}
                </div>

                <div className="eval-settings-row">
                    <span className="eval-settings-row__label">Thresholds</span>
                    <p className="eval-settings-row__hint">
                        Pass/fail thresholds. Quality metrics use ≥ comparison; latency, cost, and error_rate use ≤.
                    </p>
                    {thresholdRows.length === 0 && (
                        <p className="eval-muted">No thresholds configured.</p>
                    )}
                    <div className="eval-thresholds-table">
                        {thresholdRows.map((row) => (
                            <React.Fragment key={row.id}>
                                <TextField
                                    id={`eval-threshold-metric-${row.id}`}
                                    value={row.metric}
                                    placeholder="answer_correctness"
                                    disabled={saving}
                                    onChange={(e) => handleUpdateThresholdRow(row.id, { metric: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <TextField
                                        id={`eval-threshold-value-${row.id}`}
                                        value={row.value}
                                        placeholder="0.8"
                                        disabled={saving}
                                        onChange={(e) => handleUpdateThresholdRow(row.id, { value: e.target.value })}
                                    />
                                    <Button
                                        mode="integrated"
                                        icon="delete"
                                        aria-label={`Remove threshold ${row.metric || 'row'}`}
                                        disabled={saving}
                                        onClick={() => handleRemoveThresholdRow(row.id)}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div>
                        <Button mode="tertiary" icon="add" disabled={saving} onClick={handleAddThresholdRow}>
                            Add threshold
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default DatasetDialog;
