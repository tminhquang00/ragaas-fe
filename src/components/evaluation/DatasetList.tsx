import React from 'react';
import { Badge, Button, Chip, Tile } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { EvalDataset } from '../../types';
import { formatDate } from './evalFormat';

interface DatasetListProps {
    datasets: EvalDataset[];
    canManage: boolean;
    onSelect: (dataset: EvalDataset) => void;
    onEdit: (dataset: EvalDataset) => void;
    onDelete: (dataset: EvalDataset) => void;
    onRun: (dataset: EvalDataset) => void;
    busyDatasetId?: string | null;
}

export const DatasetList: React.FC<DatasetListProps> = ({
    datasets,
    canManage,
    onSelect,
    onEdit,
    onDelete,
    onRun,
    busyDatasetId,
}) => {
    if (datasets.length === 0) {
        return (
            <div className="eval-empty-state">
                <FrokIcon name="AutoGraph" />
                <h6>No evaluation datasets yet</h6>
                <p>
                    Create a dataset to start measuring whether prompt, model, or pipeline changes
                    regress quality. Upload manual cases or generate synthetic ones from your
                    project's documents.
                </p>
            </div>
        );
    }

    return (
        <div className="eval-dataset-grid">
            {datasets.map((dataset) => {
                const isBusy = busyDatasetId === dataset.dataset_id;
                return (
                    <Tile
                        background="floating"
                        key={dataset.dataset_id}
                        className="eval-dataset-card"
                        onClick={() => onSelect(dataset)}
                    >
                        <div className="eval-dataset-card__header">
                            <h6 className="eval-dataset-card__name">{dataset.name}</h6>
                            <Badge type={dataset.baseline_run_id ? 'success' : undefined}>
                                {dataset.baseline_run_id ? 'Baseline set' : 'No baseline'}
                            </Badge>
                        </div>

                        {dataset.description && (
                            <p className="eval-dataset-card__desc">{dataset.description}</p>
                        )}

                        <dl className="eval-dataset-card__meta-row">
                            <dt>Cases</dt>
                            <dd>{dataset.cases_count}</dd>
                            <dt>Tool mode</dt>
                            <dd>{dataset.tool_execution_mode}</dd>
                            <dt>Updated</dt>
                            <dd>{formatDate(dataset.updated_at)}</dd>
                            <dt>Judge</dt>
                            <dd>{dataset.judge_llm_config_name ?? 'default'}</dd>
                        </dl>

                        {dataset.enabled_metrics.length > 0 && (
                            <div className="eval-dataset-card__chips">
                                {dataset.enabled_metrics.slice(0, 4).map((metric) => (
                                    <Chip key={metric} label={metric} />
                                ))}
                                {dataset.enabled_metrics.length > 4 && (
                                    <Chip label={`+${dataset.enabled_metrics.length - 4} more`} />
                                )}
                            </div>
                        )}

                        <div
                            className="eval-dataset-card__footer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                mode="tertiary"
                                icon="forward-right"
                                onClick={() => onSelect(dataset)}
                            >
                                Open
                            </Button>
                            {canManage && (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Button
                                        mode="tertiary"
                                        icon="play"
                                        disabled={isBusy || dataset.cases_count === 0}
                                        onClick={() => onRun(dataset)}
                                    >
                                        Run
                                    </Button>
                                    <Button
                                        mode="integrated"
                                        icon="edit"
                                        aria-label={`Edit ${dataset.name}`}
                                        disabled={isBusy}
                                        onClick={() => onEdit(dataset)}
                                    />
                                    <Button
                                        mode="integrated"
                                        icon="delete"
                                        aria-label={`Delete ${dataset.name}`}
                                        disabled={isBusy}
                                        onClick={() => onDelete(dataset)}
                                    />
                                </div>
                            )}
                        </div>
                    </Tile>
                );
            })}
        </div>
    );
};

export default DatasetList;
