// Dashboard API types — see docs/dashboard-api-spec.md

export type DashboardRange = '7d' | '30d' | '90d';
export type DashboardGranularity = 'day' | 'hour';
export type TopProjectsMetric = 'sessions' | 'messages' | 'tokens' | 'requests';

export interface RecentProjectSummary {
    project_id: string;
    name: string;
    status: 'draft' | 'active' | 'archived';
    document_count: number;
    pipeline_type: string;
    updated_at: string;
}

export interface RecentSessionSummary {
    session_id: string;
    project_id: string;
    project_name: string;
    title: string | null;
    last_message_excerpt: string | null;
    last_message_at: string;
    message_count: number;
}

export interface DashboardOverview {
    total_projects: number;
    active_projects: number;
    total_documents: number;
    total_sessions_lifetime: number;

    range: DashboardRange;
    sessions_in_range: number;
    messages_in_range: number;
    tokens_in_range: number;
    requests_in_range: number;

    delta_projects: number;
    delta_active_projects: number;
    delta_documents: number;
    delta_sessions: number;
    delta_sessions_pct: number;
    delta_tokens_pct: number;
    delta_requests_pct: number;

    recent_projects: RecentProjectSummary[];
    recent_sessions: RecentSessionSummary[];

    generated_at: string;
}

export interface DashboardActivityPoint {
    timestamp: string;
    sessions: number;
    messages: number;
    tokens: number;
    requests: number;
}

export interface DashboardActivityResponse {
    range: DashboardRange;
    granularity: DashboardGranularity;
    points: DashboardActivityPoint[];
}

export interface TopProjectUsage {
    project_id: string;
    name: string;
    pipeline_type: string;
    value: number;
    share_of_total: number;
}

export interface TopProjectsResponse {
    range: DashboardRange;
    metric: TopProjectsMetric;
    projects: TopProjectUsage[];
}

export interface PipelineHealthResponse {
    window_hours: 24;
    total_queries: number;
    successful_queries: number;
    failed_queries: number;
    error_rate: number;
    avg_latency_ms: number | null;
    p50_latency_ms: number | null;
    p95_latency_ms: number | null;
    generated_at: string;
}
