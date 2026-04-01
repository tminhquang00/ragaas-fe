import React, { useState } from 'react';
import {
    Notification,
    Button,
    Checkbox,
    ActivityIndicator,
    Divider,
    Dropdown,
    TextField,
    Tooltip,
    Chip,
    ProgressIndicator,
} from '@bosch/react-frok';
import { Slider } from '@mui/material';
import { FrokIcon } from '../../utils/iconAdapter';

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
        <div>
            {/* Info banner */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'var(--app-bg)',
                    border: '1px solid var(--app-border)',
                }}
            >
                <FrokIcon name="Article" />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>

                {/* URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FrokIcon name="Link" />
                    <div style={{ flex: 1 }}>
                        <TextField
                            id="docupedia-url"
                            label="Docupedia / Confluence Page URL"
                            placeholder="https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                </div>

                {/* Token */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FrokIcon name="Key" />
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
                        onClick={() => setShowToken((v) => !v)}
                        aria-label={showToken ? 'Hide token' : 'Show token'}
                    >
                        {showToken ? <FrokIcon name="VisibilityOff" /> : <FrokIcon name="Visibility" />}
                    </Button>
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
                                value={maxDepth}
                                onChange={(_, val) => setMaxDepth(val as number)}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                size="small"
                                valueLabelDisplay="auto"
                                aria-label="Max depth"
                            />
                        </div>
                    </div>
                </div>

                {/* Image handling */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', minWidth: 120 }}>
                        Image handling
                    </span>
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
                    <Tooltip
                        content={
                            !url.trim() || !token.trim()
                                ? 'Enter a page URL and personal access token to continue'
                                : ''
                        }
                    >
                        <span>
                            <Button
                                mode="primary"
                                onClick={handleIngest}
                                disabled={!canIngest}
                            >
                                {ingesting
                                    ? <><ActivityIndicator size="small" /> Starting...</>
                                    : <><FrokIcon name="FileUpload" /> Start Ingestion</>
                                }
                            </Button>
                        </span>
                    </Tooltip>
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
