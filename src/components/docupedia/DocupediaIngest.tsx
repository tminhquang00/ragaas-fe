import React, { useState } from 'react';
import {
    Notification,
    Button,
    Checkbox,
    Divider,
    Dropdown,
    TextField,
    Chip,
    ProgressIndicator,
    Slider,
    Icon,
} from '@bosch/react-frok';

import { RAGaaSClient } from '../../services/api';
import { UploadTaskStatus } from '../../types';

// Types

interface DocupediaIngestProps {
    projectId: string;
    apiClient: RAGaaSClient;
    /** Called when ingestion task starts — feeds the task ID into the parent's polling loop */
    onIngestionStarted: (taskId: string) => void;
    /** Task status passed in from parent — updated by polling loop */
    uploadTaskStatus: UploadTaskStatus | null;
}

type ImageHandling = 'llm_describe' | 'skip';

// Component

export const DocupediaIngest: React.FC<DocupediaIngestProps> = ({
    projectId,
    apiClient,
    onIngestionStarted,
    uploadTaskStatus,
}) => {
    // Form state
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [includeChildren, setIncludeChildren] = useState(false);
    const [maxDepth, setMaxDepth] = useState<number>(3);
    const [imageHandling, setImageHandling] = useState<ImageHandling>('llm_describe');

    // Loading / error state
    const [ingesting, setIngesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ingest handler

    async function handleIngest() {
        if (!url.trim() || !token.trim()) return;
        setError(null);
        setIngesting(true);

        try {
            const response = await apiClient.syncConfluence(projectId, {
                url: url.trim(),
                token: token.trim(),
                include_children: includeChildren,
                max_depth: includeChildren ? maxDepth : undefined,
                image_handling: imageHandling,
            });

            const taskId = response.task_id;
            if (taskId) {
                onIngestionStarted(taskId);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to start ingestion');
        } finally {
            setIngesting(false);
        }
    }

    // Derived UI state
    const canIngest = url.trim().length > 0 && token.trim().length > 0 && !ingesting;

    const showProgress =
        uploadTaskStatus &&
        ['pending', 'processing'].includes(uploadTaskStatus.status);

    const progressPct =
        uploadTaskStatus && uploadTaskStatus.total_files > 0
            ? (uploadTaskStatus.processed_files / uploadTaskStatus.total_files) * 100
            : 0;

    // Render

    return (
        <div className="docupedia-ingest">
            {/* Info banner */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                    background: 'var(--app-bg-surface)',
                }}
            >
                <Icon iconName="document" style={{ fontSize: '1.5rem', color: 'var(--app-primary)', flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                        Ingest from Docupedia / Confluence
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                        Paste a page URL and your personal access token. Pages are fetched,
                        converted to Markdown, and processed through the RAG pipeline in the
                        background.
                    </span>
                </div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>

                {/* URL and Token - grid layout */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1rem',
                        alignItems: 'start',
                    }}
                >
                    <TextField
                        id="docupedia-url"
                        label="Docupedia / Confluence Page URL"
                        placeholder="https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <TextField
                                id="docupedia-token"
                                label="Personal Access Token"
                                placeholder="Your Confluence PAT"
                                type={showToken ? 'text' : 'password'}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                        </div>
                        <Button
                            mode="integrated"
                            icon={showToken ? 'lock-open' : 'lock-closed'}
                            onClick={() => setShowToken((v) => !v)}
                        />
                    </div>
                </div>

                {/* Include children */}
                <div>
                    <Checkbox
                        id="include-children"
                        label="Include child pages recursively"
                        checked={includeChildren}
                        onChange={(e) => setIncludeChildren((e.target as HTMLInputElement).checked)}
                    />

                    <div style={{ maxHeight: includeChildren ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                        <div style={{ paddingLeft: '2rem', paddingRight: '1rem', paddingTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                Max depth: <strong>{maxDepth}</strong>
                            </span>
                            <Slider
                                labelLeft="1"
                                labelRight="10"
                                tooltip
                                input={{
                                    min: 1,
                                    max: 10,
                                    step: 1,
                                    value: maxDepth,
                                    onChange: (e) => setMaxDepth(Number(e.target.value)),
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Image handling */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--app-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            minWidth: 100,
                        }}
                    >
                        Image handling
                    </label>
                    <div style={{ minWidth: 220 }}>
                        <Dropdown
                            value={imageHandling}
                            onChange={(e) => setImageHandling(e.target.value as ImageHandling)}
                            options={[
                                { name: 'Describe images with AI', value: 'llm_describe' },
                                { name: 'Skip images', value: 'skip' },
                            ]}
                        />
                    </div>
                </div>

                {/* Action button */}
                <div>
                    <Button
                        mode="primary"
                        icon={ingesting ? undefined : 'upload'}
                        label={ingesting ? 'Starting...' : 'Start Ingestion'}
                        onClick={handleIngest}
                        disabled={!canIngest}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: '1rem' }}>
                    <Notification type="error" defaultOpen onCloseClick={() => setError(null)}>
                        {error}
                    </Notification>
                </div>
            )}

            {/* Progress */}
            {showProgress && (
                <>
                    <Divider />
                    <div
                        style={{
                            padding: '1rem',
                            marginTop: '1rem',
                            background: 'var(--app-bg)',
                            border: '1px solid var(--app-border)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                            }}
                        >
                            <span style={{ fontWeight: 600, color: 'var(--app-primary)', fontSize: '0.875rem' }}>
                                Processing Docupedia Pages
                            </span>
                            <Chip
                                label={`${uploadTaskStatus!.processed_files}/${uploadTaskStatus!.total_files} pages`}
                            />
                        </div>
                        <ProgressIndicator
                            type="determinate"
                            value={progressPct}
                        />
                    </div>
                </>
            )}

            {uploadTaskStatus?.status === 'completed' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="success" defaultOpen>
                        Ingestion complete —{' '}
                        {uploadTaskStatus.processed_files} page
                        {uploadTaskStatus.processed_files !== 1 ? 's' : ''} processed.
                    </Notification>
                </div>
            )}

            {uploadTaskStatus?.status === 'completed_with_errors' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="warning" defaultOpen>
                        Ingestion completed with errors —{' '}
                        {uploadTaskStatus.results.filter((r) => r.status === 'failed').length} page(s) failed.
                    </Notification>
                </div>
            )}

            {uploadTaskStatus?.status === 'failed' && (
                <div style={{ marginTop: '1rem' }}>
                    <Notification type="error" defaultOpen>
                        Ingestion failed. {uploadTaskStatus.errors.join(' ')}
                    </Notification>
                </div>
            )}
        </div>
    );
};
