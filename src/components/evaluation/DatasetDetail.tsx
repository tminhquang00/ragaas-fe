import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Badge,
    Button,
    Chip,
    Notification,
    Tab,
    TabNavigation,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import {
    EvalCase,
    EvalDataset,
    EvalRun,
    isTerminalRunStatus,
} from '../../types';
import {
    formatCost,
    formatDate,
    formatRelativeDuration,
    statusBadgeType,
    statusLabel,
} from './evalFormat';

interface DatasetDetailProps {
    projectId: string;
    apiClient: RAGaaSClient;
    dataset: EvalDataset;
    canManage: boolean;
    onBack: () => void;
    onEdit: () => void;
    onAddCases: () => void;
    onStartRun: () => void;
    onOpenRun: (run: EvalRun) => void;
    onCompareRuns: (run?: EvalRun) => void;
    refreshKey?: number;
}

const SUB_TABS = {
    CASES: 0,
    RUNS: 1,
} as const;

export const DatasetDetail: React.FC<DatasetDetailProps> = ({
    projectId,
    apiClient,
    dataset,
    canManage,
    onBack,
    onEdit,
    onAddCases,
    onStartRun,
    onOpenRun,
    onCompareRuns,
    refreshKey,
}) => {
    const [tab, setTab] = useState<number>(SUB_TABS.CASES);

    // Cases
    const [cases, setCases] = useState<EvalCase[]>([]);
    const [casesLoading, setCasesLoading] = useState(false);
    const [casesError, setCasesError] = useState('');
    const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);

    // Runs
    const [runs, setRuns] = useState<EvalRun[]>([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [runsError, setRunsError] = useState('');

    const loadCases = useCallback(async () => {
        setCasesLoading(true);
        setCasesError('');
        try {
            const data = await apiClient.listEvalCases(projectId, dataset.dataset_id, 0, 100);
            setCases(data);
        } catch (err) {
            setCasesError(err instanceof Error ? err.message : 'Failed to load cases');
        } finally {
            setCasesLoading(false);
        }
    }, [apiClient, projectId, dataset.dataset_id]);

    const loadRuns = useCallback(async () => {
        setRunsLoading(true);
        setRunsError('');
        try {
            const data = await apiClient.listEvalRuns(projectId, {
                datasetId: dataset.dataset_id,
                limit: 100,
            });
            setRuns(data);
        } catch (err) {
            setRunsError(err instanceof Error ? err.message : 'Failed to load runs');
        } finally {
            setRunsLoading(false);
        }
    }, [apiClient, projectId, dataset.dataset_id]);

    useEffect(() => {
        loadCases();
        loadRuns();
    }, [loadCases, loadRuns, refreshKey]);

    // Auto-refresh runs while any are non-terminal.
    useEffect(() => {
        if (tab !== SUB_TABS.RUNS) return;
        const hasInFlight = runs.some((run) => !isTerminalRunStatus(run.status));
        if (!hasInFlight) return;
        const handle = setInterval(() => {
            loadRuns();
        }, 5000);
        return () => clearInterval(handle);
    }, [tab, runs, loadRuns]);

    const handleDeleteCase = async (caseRow: EvalCase) => {
        if (!window.confirm('Delete this case? This cannot be undone.')) return;
        setDeletingCaseId(caseRow.case_id);
        try {
            await apiClient.deleteEvalCase(projectId, dataset.dataset_id, caseRow.case_id);
            setCases((prev) => prev.filter((c) => c.case_id !== caseRow.case_id));
        } catch (err) {
            setCasesError(err instanceof Error ? err.message : 'Failed to delete case');
        } finally {
            setDeletingCaseId(null);
        }
    };

    return (
        <div className="eval-detail">
            <div className="eval-detail__header">
                <div>
                    <button className="eval-detail__back" type="button" onClick={onBack}>
                        ← Back to datasets
                    </button>
                    <h4 className="eval-detail__title" style={{ marginTop: '0.25rem' }}>
                        {dataset.name}
                    </h4>
                    <p className="eval-detail__sub">
                        {dataset.cases_count} case{dataset.cases_count === 1 ? '' : 's'} · Tool mode <strong>{dataset.tool_execution_mode}</strong> · Updated {formatDate(dataset.updated_at)}
                    </p>
                    {dataset.description && (
                        <p className="eval-detail__sub" style={{ marginTop: '0.25rem' }}>
                            {dataset.description}
                        </p>
                    )}
                </div>
                <div className="eval-detail__actions">
                    {canManage && (
                        <>
                            <Button mode="secondary" icon="upload" onClick={onAddCases}>
                                Add cases
                            </Button>
                            <Button
                                mode="primary"
                                icon="play"
                                disabled={dataset.cases_count === 0}
                                onClick={onStartRun}
                            >
                                Run evaluation
                            </Button>
                            <Button mode="tertiary" icon="edit" onClick={onEdit}>
                                Edit settings
                            </Button>
                        </>
                    )}
                    <Button mode="tertiary" icon={'connection-on' as any} onClick={() => onCompareRuns(undefined)}>
                        Compare runs
                    </Button>
                </div>
            </div>

            {dataset.enabled_metrics.length > 0 && (
                <div className="eval-dataset-card__chips">
                    {dataset.enabled_metrics.map((metric) => (
                        <Chip key={metric} label={metric} />
                    ))}
                </div>
            )}

            <TabNavigation
                selectedValue={tab}
                onTabSelect={(_e, data) => setTab(data.value as number)}
            >
                <Tab value={SUB_TABS.CASES}>Cases ({dataset.cases_count})</Tab>
                <Tab value={SUB_TABS.RUNS}>Runs ({runs.length})</Tab>
            </TabNavigation>

            {tab === SUB_TABS.CASES && (
                <div className="eval-subtab-panel">
                    {casesError && (
                        <Notification type="error" defaultOpen onCloseClick={() => setCasesError('')}>
                            {casesError}
                        </Notification>
                    )}

                    {casesLoading && (
                        <div className="eval-loading">
                            <ActivityIndicator />
                            <span>Loading cases…</span>
                        </div>
                    )}

                    {!casesLoading && cases.length === 0 && (
                        <div className="eval-empty-state">
                            <h6>No cases yet</h6>
                            <p>
                                Upload a CSV or JSON file or generate synthetic cases from your project documents.
                            </p>
                            {canManage && (
                                <Button mode="primary" icon="upload" onClick={onAddCases}>
                                    Add cases
                                </Button>
                            )}
                        </div>
                    )}

                    {!casesLoading && cases.length > 0 && (
                        <div className="eval-table-shell">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell header>Question</TableCell>
                                        <TableCell header>Source</TableCell>
                                        <TableCell header>Tags</TableCell>
                                        <TableCell header>Created</TableCell>
                                        <TableCell header align="right">{canManage ? 'Actions' : ''}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cases.map((caseRow) => {
                                        const firstTurn = caseRow.turns[0];
                                        const isBusy = deletingCaseId === caseRow.case_id;
                                        return (
                                            <TableRow key={caseRow.case_id}>
                                                <TableCell>
                                                    <div className="eval-case-question">
                                                        <strong>{firstTurn?.user || '(empty)'}</strong>
                                                        {firstTurn?.expected_assistant && (
                                                            <span title={firstTurn.expected_assistant}>
                                                                Expected: {firstTurn.expected_assistant}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge type={caseRow.source === 'manual' ? undefined : 'success'}>
                                                        {caseRow.source}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="eval-dataset-card__chips">
                                                        {caseRow.tags.length === 0 ? (
                                                            <span className="eval-muted">—</span>
                                                        ) : (
                                                            caseRow.tags.slice(0, 4).map((tag) => (
                                                                <Chip key={tag} label={tag} />
                                                            ))
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="eval-muted">{formatDate(caseRow.created_at)}</span>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {canManage && (
                                                        <Button
                                                            mode="integrated"
                                                            icon="delete"
                                                            aria-label="Delete case"
                                                            disabled={isBusy}
                                                            onClick={() => handleDeleteCase(caseRow)}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}

            {tab === SUB_TABS.RUNS && (
                <div className="eval-subtab-panel">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <Button mode="tertiary" icon="refresh" onClick={loadRuns} disabled={runsLoading}>
                            Refresh
                        </Button>
                    </div>

                    {runsError && (
                        <Notification type="error" defaultOpen onCloseClick={() => setRunsError('')}>
                            {runsError}
                        </Notification>
                    )}

                    {runsLoading && runs.length === 0 && (
                        <div className="eval-loading">
                            <ActivityIndicator />
                            <span>Loading runs…</span>
                        </div>
                    )}

                    {!runsLoading && runs.length === 0 && (
                        <div className="eval-empty-state">
                            <h6>No runs yet</h6>
                            <p>Start an evaluation run to score this dataset against the project's current pipeline.</p>
                            {canManage && (
                                <Button
                                    mode="primary"
                                    icon="play"
                                    disabled={dataset.cases_count === 0}
                                    onClick={onStartRun}
                                >
                                    Run evaluation
                                </Button>
                            )}
                        </div>
                    )}

                    {runs.length > 0 && (
                        <div className="eval-table-shell">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell header>Run</TableCell>
                                        <TableCell header>Status</TableCell>
                                        <TableCell header>Progress</TableCell>
                                        <TableCell header>Errors</TableCell>
                                        <TableCell header>Cost</TableCell>
                                        <TableCell header>Duration</TableCell>
                                        <TableCell header align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {runs.map((run) => {
                                        const isBaseline = dataset.baseline_run_id === run.run_id;
                                        return (
                                            <TableRow key={run.run_id}>
                                                <TableCell>
                                                    <div className="eval-case-question">
                                                        <strong>{run.run_id.slice(0, 12)}…</strong>
                                                        <span>{formatDate(run.started_at)}</span>
                                                        {isBaseline && (
                                                            <Badge type="success">Baseline</Badge>
                                                        )}
                                                        {run.notes && (
                                                            <span title={run.notes}>{run.notes}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge type={statusBadgeType(run.status)}>
                                                        {statusLabel(run.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {run.cases_completed}/{run.cases_total}
                                                </TableCell>
                                                <TableCell>{run.cases_errored}</TableCell>
                                                <TableCell>{formatCost(run.total_cost_usd)}</TableCell>
                                                <TableCell>
                                                    {formatRelativeDuration(run.started_at, run.finished_at)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <div className="eval-detail__actions" style={{ justifyContent: 'flex-end' }}>
                                                        <Button
                                                            mode="tertiary"
                                                            icon="forward-right"
                                                            onClick={() => onOpenRun(run)}
                                                        >
                                                            Open
                                                        </Button>
                                                        <Button
                                                            mode="integrated"
                                                            icon={'connection-on' as any}
                                                            aria-label="Compare with another run"
                                                            disabled={run.status !== 'completed'}
                                                            onClick={() => onCompareRuns(run)}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatasetDetail;
