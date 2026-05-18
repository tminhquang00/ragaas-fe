// Evaluation Framework — per-project quality regression testing
// See: docs/features/evaluation-frontend.md

export type EvalMetricName =
    | 'answer_correctness'
    | 'answer_relevancy'
    | 'semantic_similarity'
    | 'faithfulness'
    | 'context_precision'
    | 'context_recall';

export type ToolExecutionMode = 'live' | 'read_only' | 'stubbed';

export type EvalRunPendingStatus = 'queued' | 'running';
export type EvalRunTerminalStatus = 'completed' | 'failed' | 'aborted';
export type EvalRunStatus = EvalRunPendingStatus | EvalRunTerminalStatus;

export type EvalCaseResultStatus = 'completed' | 'error' | 'timeout' | 'skipped';

export interface EvalTurn {
    user: string;
    expected_assistant?: string | null;
}

export interface EvalCase {
    case_id: string;
    dataset_id: string;
    tenant_id: string;
    project_id: string;
    turns: EvalTurn[];
    expected_chunk_ids: string[];
    tags: string[];
    source: 'manual' | 'synthetic';
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface EvalDataset {
    dataset_id: string;
    project_id: string;
    tenant_id: string;
    name: string;
    description?: string | null;
    enabled_metrics: string[];
    judge_llm_config_name?: string | null;
    baseline_run_id?: string | null;
    thresholds: Record<string, number>;
    tool_execution_mode: ToolExecutionMode;
    cases_count: number;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChunkSnapshot {
    chunk_id: string;
    document_id: string;
    source: string;
    content: string;
    score?: number | null;
    metadata: Record<string, unknown>;
}

export interface EvalCaseResult {
    result_id: string;
    run_id: string;
    dataset_id: string;
    project_id: string;
    tenant_id: string;
    case_id: string;
    status: EvalCaseResultStatus;
    predicted_answer?: string | null;
    retrieved_chunks: ChunkSnapshot[];
    metrics: Record<string, number | null>;
    skip_reasons: Record<string, string>;
    latency_ms: number;
    tokens_used: number;
    cost_usd: number;
    error_message?: string | null;
    retry_count: number;
    pinned: boolean;
    created_at: string;
}

export interface EvalRun {
    run_id: string;
    dataset_id: string;
    project_id: string;
    tenant_id: string;
    status: EvalRunStatus;
    config_snapshot: Record<string, unknown>;
    judge_llm_used: string;
    aggregate_scores: Record<string, number>;
    cases_total: number;
    cases_completed: number;
    cases_errored: number;
    cases_skipped_per_metric: Record<string, number>;
    started_at: string;
    finished_at?: string | null;
    triggered_by: string;
    triggered_via: 'api' | 'ui';
    total_cost_usd: number;
    pinned: boolean;
    notes?: string | null;
    error_message?: string | null;
}

export interface EvalRunDiff {
    run_a: EvalRun;
    run_b: EvalRun;
    metric_deltas: Record<string, number>;
}

// Request payloads

export interface CreateDatasetRequest {
    name: string;
    description?: string | null;
    enabled_metrics?: string[] | null;
    judge_llm_config_name?: string | null;
    thresholds?: Record<string, number>;
    tool_execution_mode?: ToolExecutionMode;
}

export interface UpdateDatasetRequest {
    name?: string;
    description?: string | null;
    enabled_metrics?: string[] | null;
    judge_llm_config_name?: string | null;
    baseline_run_id?: string | null;
    thresholds?: Record<string, number>;
    tool_execution_mode?: ToolExecutionMode;
}

export interface StartRunRequest {
    dataset_id: string;
    notes?: string | null;
    triggered_via?: 'api' | 'ui';
}

export interface SyntheticGenerationRequest {
    target_count: number;
}

export interface SyntheticGenerationResponse {
    requested: number;
    generated: number;
    skipped: number;
    errors: string[];
}

// Helpers

/** Metrics where lower is better (computed pass/fail flips). */
export const LOWER_IS_BETTER_METRICS: ReadonlySet<string> = new Set([
    'latency_p50_ms',
    'latency_p95_ms',
    'cost_usd',
    'error_rate',
]);

export const TERMINAL_RUN_STATUSES: ReadonlySet<EvalRunStatus> = new Set([
    'completed',
    'failed',
    'aborted',
]);

export const ALL_EVAL_METRICS: EvalMetricName[] = [
    'answer_correctness',
    'answer_relevancy',
    'semantic_similarity',
    'faithfulness',
    'context_precision',
    'context_recall',
];

export const TOOL_EXECUTION_MODES: { value: ToolExecutionMode; label: string; help: string }[] = [
    {
        value: 'read_only',
        label: 'Read-only tools',
        help: 'Recommended. Search and read tools run; side-effect tools are stubbed.',
    },
    {
        value: 'stubbed',
        label: 'Stub all tools',
        help: 'Fast smoke tests; no tool calls execute.',
    },
    {
        value: 'live',
        label: 'Live tools',
        help: 'Full fidelity. May call external systems or create side effects.',
    },
];

export function metricPasses(metric: string, value: number, threshold: number): boolean {
    return LOWER_IS_BETTER_METRICS.has(metric) ? value <= threshold : value >= threshold;
}

export function isTerminalRunStatus(status: EvalRunStatus): boolean {
    return TERMINAL_RUN_STATUSES.has(status);
}
