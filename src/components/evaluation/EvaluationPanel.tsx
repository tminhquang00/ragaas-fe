import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Dialog,
    Notification,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { EvalDataset, EvalRun } from '../../types';
import { FrokIcon } from '../../utils/iconAdapter';
import { DatasetList } from './DatasetList';
import { DatasetDialog } from './DatasetDialog';
import { DatasetDetail } from './DatasetDetail';
import { CaseUploadDialog } from './CaseUploadDialog';
import { StartRunDialog } from './StartRunDialog';
import { RunDetail } from './RunDetail';
import { RunDiffDialog } from './RunDiffDialog';
import './EvaluationPanel.css';

interface EvaluationPanelProps {
    projectId: string;
    apiClient: RAGaaSClient;
    canManage: boolean;
}

type View =
    | { mode: 'list' }
    | { mode: 'dataset'; datasetId: string }
    | { mode: 'run'; datasetId: string | null; runId: string };

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
    projectId,
    apiClient,
    canManage,
}) => {
    const [datasets, setDatasets] = useState<EvalDataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [forbidden, setForbidden] = useState(false);

    const [view, setView] = useState<View>({ mode: 'list' });

    // Dialog state
    const [datasetDialogOpen, setDatasetDialogOpen] = useState(false);
    const [editingDataset, setEditingDataset] = useState<EvalDataset | null>(null);
    const [caseDialogOpen, setCaseDialogOpen] = useState(false);
    const [caseDialogDataset, setCaseDialogDataset] = useState<EvalDataset | null>(null);
    const [startRunDialogOpen, setStartRunDialogOpen] = useState(false);
    const [startRunDataset, setStartRunDataset] = useState<EvalDataset | null>(null);
    const [diffDialogOpen, setDiffDialogOpen] = useState(false);
    const [diffCandidate, setDiffCandidate] = useState<EvalRun | null>(null);
    const [diffRuns, setDiffRuns] = useState<EvalRun[]>([]);
    const [diffDataset, setDiffDataset] = useState<EvalDataset | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EvalDataset | null>(null);
    const [busyDatasetId, setBusyDatasetId] = useState<string | null>(null);

    const [detailRefreshKey, setDetailRefreshKey] = useState(0);
    const bumpDetailRefresh = () => setDetailRefreshKey((n) => n + 1);

    const loadDatasets = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.listEvalDatasets(projectId, 0, 100);
            setDatasets(data);
            setForbidden(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load evaluation datasets';
            // Backend returns 403 to non-owners.
            if (message.toLowerCase().includes('owner') || message.includes('403')) {
                setForbidden(true);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, [apiClient, projectId]);

    useEffect(() => {
        if (canManage) {
            loadDatasets();
        } else {
            setLoading(false);
            setForbidden(true);
        }
    }, [canManage, loadDatasets]);

    const currentDataset = (() => {
        if (view.mode === 'list') return null;
        return datasets.find((d) => d.dataset_id === view.datasetId) ?? null;
    })();

    const handleOpenDataset = (dataset: EvalDataset) => {
        setView({ mode: 'dataset', datasetId: dataset.dataset_id });
    };

    const handleCreateDataset = () => {
        setEditingDataset(null);
        setDatasetDialogOpen(true);
    };

    const handleEditDataset = (dataset: EvalDataset) => {
        setEditingDataset(dataset);
        setDatasetDialogOpen(true);
    };

    const handleDatasetSaved = (saved: EvalDataset) => {
        setDatasets((prev) => {
            const exists = prev.some((d) => d.dataset_id === saved.dataset_id);
            if (exists) return prev.map((d) => (d.dataset_id === saved.dataset_id ? saved : d));
            return [saved, ...prev];
        });
        setSuccess(editingDataset ? 'Dataset updated.' : 'Dataset created.');
        bumpDetailRefresh();
    };

    const handleDeleteDataset = async () => {
        if (!deleteTarget) return;
        setBusyDatasetId(deleteTarget.dataset_id);
        setError('');
        try {
            await apiClient.deleteEvalDataset(projectId, deleteTarget.dataset_id);
            setDatasets((prev) => prev.filter((d) => d.dataset_id !== deleteTarget.dataset_id));
            setSuccess(`Dataset "${deleteTarget.name}" deleted.`);
            if (view.mode !== 'list' && view.datasetId === deleteTarget.dataset_id) {
                setView({ mode: 'list' });
            }
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete dataset');
        } finally {
            setBusyDatasetId(null);
        }
    };

    const handleAddCases = (dataset: EvalDataset) => {
        setCaseDialogDataset(dataset);
        setCaseDialogOpen(true);
    };

    const handleStartRun = (dataset: EvalDataset) => {
        setStartRunDataset(dataset);
        setStartRunDialogOpen(true);
    };

    const handleRunStarted = (run: EvalRun) => {
        setSuccess('Run queued — polling for status updates.');
        setView({ mode: 'run', datasetId: run.dataset_id, runId: run.run_id });
    };

    const handleOpenRun = (run: EvalRun) => {
        setView({ mode: 'run', datasetId: run.dataset_id, runId: run.run_id });
    };

    const handleSetBaseline = async (run: EvalRun) => {
        const dataset = datasets.find((d) => d.dataset_id === run.dataset_id);
        if (!dataset) return;
        if (!window.confirm(`Pin run ${run.run_id.slice(0, 12)}… as the baseline for "${dataset.name}"?`)) {
            return;
        }
        try {
            const updated = await apiClient.updateEvalDataset(projectId, dataset.dataset_id, {
                baseline_run_id: run.run_id,
            });
            setDatasets((prev) => prev.map((d) => (d.dataset_id === updated.dataset_id ? updated : d)));
            setSuccess('Baseline updated.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set baseline');
        }
    };

    const handleOpenDiff = useCallback(
        async (dataset: EvalDataset, candidate?: EvalRun | null) => {
            setDiffDataset(dataset);
            setDiffCandidate(candidate ?? null);
            try {
                const runs = await apiClient.listEvalRuns(projectId, {
                    datasetId: dataset.dataset_id,
                    limit: 50,
                });
                setDiffRuns(runs);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load runs for diff');
                setDiffRuns([]);
            } finally {
                setDiffDialogOpen(true);
            }
        },
        [apiClient, projectId]
    );

    if (!canManage || forbidden) {
        return (
            <div className="eval-panel">
                <div className="eval-panel__title-row">
                    <FrokIcon name="AutoGraph" className="eval-panel__title-icon" />
                    <h3 className="eval-panel__title">Evaluation</h3>
                </div>
                <Notification type="neutral" icon={'lock-closed' as any} defaultOpen>
                    Only project owners can manage evaluations.
                </Notification>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="eval-loading">
                <ActivityIndicator />
                <span>Loading evaluation datasets…</span>
            </div>
        );
    }

    return (
        <div className="eval-panel">
            {view.mode === 'list' && (
                <>
                    <div className="eval-panel__header">
                        <div>
                            <div className="eval-panel__title-row">
                                <FrokIcon name="AutoGraph" className="eval-panel__title-icon" />
                                <h3 className="eval-panel__title">Evaluation</h3>
                            </div>
                            <p className="eval-panel__subtitle">
                                Test whether prompt, model, retrieval, or agent changes regress quality before
                                shipping. Eval runs are manual, scoped to this project, and do not appear in chat
                                history or trace dashboards.
                            </p>
                        </div>
                        <div className="eval-panel__actions">
                            <Button
                                mode="secondary"
                                icon="refresh"
                                onClick={loadDatasets}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                            <Button mode="primary" icon="add" onClick={handleCreateDataset}>
                                New dataset
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                            {error}
                        </Notification>
                    )}
                    {success && (
                        <Notification type="success" defaultOpen onCloseClick={() => setSuccess('')}>
                            {success}
                        </Notification>
                    )}

                    <DatasetList
                        datasets={datasets}
                        canManage={canManage}
                        busyDatasetId={busyDatasetId}
                        onSelect={handleOpenDataset}
                        onEdit={handleEditDataset}
                        onDelete={(dataset) => setDeleteTarget(dataset)}
                        onRun={handleStartRun}
                    />
                </>
            )}

            {view.mode === 'dataset' && currentDataset && (
                <>
                    {error && (
                        <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                            {error}
                        </Notification>
                    )}
                    {success && (
                        <Notification type="success" defaultOpen onCloseClick={() => setSuccess('')}>
                            {success}
                        </Notification>
                    )}
                    <DatasetDetail
                        projectId={projectId}
                        apiClient={apiClient}
                        dataset={currentDataset}
                        canManage={canManage}
                        refreshKey={detailRefreshKey}
                        onBack={() => setView({ mode: 'list' })}
                        onEdit={() => handleEditDataset(currentDataset)}
                        onAddCases={() => handleAddCases(currentDataset)}
                        onStartRun={() => handleStartRun(currentDataset)}
                        onOpenRun={handleOpenRun}
                        onCompareRuns={(run) => handleOpenDiff(currentDataset, run ?? null)}
                    />
                </>
            )}

            {view.mode === 'dataset' && !currentDataset && (
                <Notification type="error" defaultOpen>
                    Dataset not found. <Button mode="tertiary" onClick={() => setView({ mode: 'list' })}>Back to list</Button>
                </Notification>
            )}

            {view.mode === 'run' && (
                <>
                    {error && (
                        <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                            {error}
                        </Notification>
                    )}
                    {success && (
                        <Notification type="success" defaultOpen onCloseClick={() => setSuccess('')}>
                            {success}
                        </Notification>
                    )}
                    <RunDetail
                        projectId={projectId}
                        apiClient={apiClient}
                        runId={view.runId}
                        dataset={view.datasetId
                            ? datasets.find((d) => d.dataset_id === view.datasetId) ?? null
                            : null}
                        canManage={canManage}
                        onBack={() => {
                            if (view.datasetId) {
                                setView({ mode: 'dataset', datasetId: view.datasetId });
                                bumpDetailRefresh();
                            } else {
                                setView({ mode: 'list' });
                            }
                        }}
                        onSetBaseline={handleSetBaseline}
                        onDiff={(run) => {
                            const ds = datasets.find((d) => d.dataset_id === run.dataset_id) ?? null;
                            if (ds) handleOpenDiff(ds, run);
                        }}
                    />
                </>
            )}

            <DatasetDialog
                open={datasetDialogOpen}
                projectId={projectId}
                apiClient={apiClient}
                dataset={editingDataset}
                onOpenChange={setDatasetDialogOpen}
                onSaved={handleDatasetSaved}
            />

            <CaseUploadDialog
                open={caseDialogOpen}
                projectId={projectId}
                apiClient={apiClient}
                dataset={caseDialogDataset}
                onOpenChange={setCaseDialogOpen}
                onCompleted={(result) => {
                    if (result.mode === 'upload') {
                        setSuccess(`Uploaded ${result.count} case${result.count === 1 ? '' : 's'}.`);
                    } else {
                        setSuccess(
                            `Generated ${result.response.generated} of ${result.response.requested} synthetic cases.`
                        );
                    }
                    loadDatasets();
                    bumpDetailRefresh();
                }}
            />

            <StartRunDialog
                open={startRunDialogOpen}
                projectId={projectId}
                apiClient={apiClient}
                dataset={startRunDataset}
                onOpenChange={setStartRunDialogOpen}
                onStarted={handleRunStarted}
            />

            <RunDiffDialog
                open={diffDialogOpen}
                projectId={projectId}
                apiClient={apiClient}
                dataset={diffDataset}
                candidateRun={diffCandidate}
                runs={diffRuns}
                onOpenChange={setDiffDialogOpen}
            />

            <Dialog
                title="Delete Dataset?"
                variant="warning"
                modal
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteDataset}
                onCancel={() => setDeleteTarget(null)}
                confirmButton={{ disabled: Boolean(busyDatasetId) }}
            >
                {deleteTarget && (
                    <span>
                        This will soft-delete <strong>{deleteTarget.name}</strong> along with its {deleteTarget.cases_count} case{deleteTarget.cases_count === 1 ? '' : 's'} and all associated runs.
                    </span>
                )}
            </Dialog>
        </div>
    );
};

export default EvaluationPanel;
