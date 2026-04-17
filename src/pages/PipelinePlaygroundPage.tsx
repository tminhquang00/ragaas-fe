import { useAuth } from '../context';

export default function PipelinePlaygroundPage() {
    const { apiClient } = useAuth();

    if (!apiClient) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                Please sign in to use the Pipeline Playground.
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 64px)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pipeline Editor Playground</h1>
                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                    Open a project's Pipeline tab to use the visual pipeline builder.
                </p>
            </div>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--app-border)',
                    borderRadius: 8,
                    color: 'var(--app-text-secondary)',
                }}
            >
                The pipeline editor now requires a project context. Navigate to a project's Pipeline tab to edit.
            </div>
        </div>
    );
}
