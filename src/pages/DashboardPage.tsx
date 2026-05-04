import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Layout, Notification } from '@bosch/react-frok';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import {
    ActivityChart,
    KpiCard,
    PipelineHealthCard,
    RecentProjectsList,
    RecentSessionsList,
    TimeRangeSelector,
    TopProjectsChart,
} from '../components/dashboard';
import { formatCompactNumber } from '../components/dashboard/formatters';
import type {
    DashboardActivityResponse,
    DashboardOverview,
    DashboardRange,
    PipelineHealthResponse,
    TopProjectsMetric,
    TopProjectsResponse,
} from '../types';
import '../components/dashboard/Dashboard.css';

const RANGE_LABEL: Record<DashboardRange, string> = {
    '7d': 'vs previous 7 days',
    '30d': 'vs previous 30 days',
    '90d': 'vs previous 90 days',
};

export const DashboardPage: React.FC = () => {
    const { apiClient } = useAuth();
    const navigate = useNavigate();

    const [range, setRange] = useState<DashboardRange>('30d');
    const [topMetric, setTopMetric] = useState<TopProjectsMetric>('sessions');

    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [activity, setActivity] = useState<DashboardActivityResponse | null>(null);
    const [topProjects, setTopProjects] = useState<TopProjectsResponse | null>(null);
    const [health, setHealth] = useState<PipelineHealthResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Top-projects refetches independently when metric toggles, without spinning the whole page.
    const fetchTopProjects = useCallback(
        async (nextRange: DashboardRange, metric: TopProjectsMetric) => {
            try {
                const data = await apiClient.getTopProjects(nextRange, metric, 5);
                setTopProjects(data);
            } catch (err) {
                // Soft-fail: keep prior data if available, otherwise leave null and let the tile show empty.
                console.error('Failed to load top projects', err);
            }
        },
        [apiClient]
    );

    const fetchAll = useCallback(
        async (nextRange: DashboardRange, metric: TopProjectsMetric) => {
            setLoading(true);
            setError(null);
            try {
                // Phase 1 (overview) is the critical path. Phase 2/3 calls run in parallel
                // and are individually soft-failed so partial backend availability still
                // yields a useful dashboard.
                const overviewPromise = apiClient.getDashboardOverview(nextRange);
                const activityPromise = apiClient
                    .getDashboardActivity(nextRange)
                    .catch((err) => {
                        console.error('Failed to load activity', err);
                        return null;
                    });
                const topPromise = apiClient
                    .getTopProjects(nextRange, metric, 5)
                    .catch((err) => {
                        console.error('Failed to load top projects', err);
                        return null;
                    });
                const healthPromise = apiClient.getPipelineHealth().catch((err) => {
                    console.error('Failed to load pipeline health', err);
                    return null;
                });

                const [overviewData, activityData, topData, healthData] = await Promise.all([
                    overviewPromise,
                    activityPromise,
                    topPromise,
                    healthPromise,
                ]);

                setOverview(overviewData);
                setActivity(activityData);
                setTopProjects(topData);
                setHealth(healthData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        },
        [apiClient]
    );

    useEffect(() => {
        fetchAll(range, topMetric);
        // topMetric change is handled separately below; only refetch everything on range change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range, fetchAll]);

    const handleMetricChange = (metric: TopProjectsMetric) => {
        setTopMetric(metric);
        fetchTopProjects(range, metric);
    };

    const handleOpenProject = (projectId: string) => navigate(`/projects/${projectId}`);
    const handleSeeAllProjects = () => navigate('/projects');

    // ─── First-paint loading state ──────────────────────────────────────────────
    if (loading && !overview) {
        return (
            <Layout>
                <div
                    style={{
                        minHeight: '60vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <ActivityIndicator size="large" />
                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                        Loading dashboard…
                    </span>
                </div>
            </Layout>
        );
    }

    // ─── Hard error state (overview failed entirely) ────────────────────────────
    if (error && !overview) {
        return (
            <Layout>
                <Notification
                    type="error"
                    variant="banner"
                    title="Failed to load dashboard"
                    style={{ marginBottom: '1rem' }}
                >
                    {error}
                </Notification>
            </Layout>
        );
    }

    if (!overview) return null; // type narrow

    const deltaLabel = RANGE_LABEL[range];

    return (
        <Layout>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                }}
            >
                <div>
                    <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2.25rem', fontWeight: 700 }}>
                        Dashboard
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--app-text-secondary)' }}>
                        At-a-glance summary of your RAGaaS workspace.
                    </p>
                </div>
                <TimeRangeSelector value={range} onChange={setRange} disabled={loading} />
            </div>

            {/* KPI strip */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem',
                }}
            >
                <KpiCard
                    title="Total Projects"
                    value={formatCompactNumber(overview.total_projects)}
                    icon="Folder"
                    iconColor="var(--g-blue-50)"
                    delta={overview.delta_projects}
                    deltaLabel={deltaLabel}
                    onClick={handleSeeAllProjects}
                />
                <KpiCard
                    title="Active Projects"
                    value={formatCompactNumber(overview.active_projects)}
                    icon="CheckCircle"
                    iconColor="var(--g-green-50)"
                    delta={overview.delta_active_projects}
                    deltaLabel={deltaLabel}
                    onClick={handleSeeAllProjects}
                />
                <KpiCard
                    title="Documents"
                    value={formatCompactNumber(overview.total_documents)}
                    icon="Description"
                    iconColor="#9b51e0"
                    delta={overview.delta_documents}
                    deltaLabel={deltaLabel}
                />
                <KpiCard
                    title={`Sessions (${range})`}
                    value={formatCompactNumber(overview.sessions_in_range)}
                    icon="Chat"
                    iconColor="#f2994a"
                    deltaPct={overview.delta_sessions_pct}
                    deltaLabel={deltaLabel}
                />
                <KpiCard
                    title={`Tokens (${range})`}
                    value={formatCompactNumber(overview.tokens_in_range)}
                    icon="AutoAwesome"
                    iconColor="var(--g-blue-50)"
                    deltaPct={overview.delta_tokens_pct}
                    deltaLabel={deltaLabel}
                />
                <KpiCard
                    title={`Requests (${range})`}
                    value={formatCompactNumber(overview.requests_in_range)}
                    icon="AutoGraph"
                    iconColor="var(--g-green-50)"
                    deltaPct={overview.delta_requests_pct}
                    deltaLabel={deltaLabel}
                />
            </div>

            {/* Charts */}
            {(activity || topProjects) && (
                <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
                    {activity && <ActivityChart data={activity} />}
                    {topProjects && (
                        <TopProjectsChart
                            data={topProjects}
                            metric={topMetric}
                            onMetricChange={handleMetricChange}
                            onProjectClick={handleOpenProject}
                        />
                    )}
                </div>
            )}

            {/* Operational lists */}
            <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
                <RecentProjectsList
                    projects={overview.recent_projects}
                    onOpen={handleOpenProject}
                    onSeeAll={handleSeeAllProjects}
                />
                <RecentSessionsList
                    sessions={overview.recent_sessions}
                    onOpen={(session) => navigate(`/projects/${session.project_id}`)}
                />
            </div>

            {/* Pipeline health */}
            {health && <PipelineHealthCard data={health} />}
        </Layout>
    );
};
