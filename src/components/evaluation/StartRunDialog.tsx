import React, { useEffect, useState } from 'react';
import { Dialog, Notification, TextArea } from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { EvalDataset, EvalRun } from '../../types';

interface StartRunDialogProps {
    open: boolean;
    projectId: string;
    apiClient: RAGaaSClient;
    dataset: EvalDataset | null;
    onOpenChange: (open: boolean) => void;
    onStarted: (run: EvalRun) => void;
}

export const StartRunDialog: React.FC<StartRunDialogProps> = ({
    open,
    projectId,
    apiClient,
    dataset,
    onOpenChange,
    onStarted,
}) => {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setNotes('');
        setSubmitting(false);
        setError('');
    }, [open]);

    const handleConfirm = async () => {
        if (!dataset) return;
        setError('');
        setSubmitting(true);
        try {
            const run = await apiClient.startEvalRun(projectId, {
                dataset_id: dataset.dataset_id,
                notes: notes.trim() || null,
                triggered_via: 'ui',
            });
            onStarted(run);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start run');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            title={dataset ? `Start Run — ${dataset.name}` : 'Start Run'}
            modal
            open={open}
            onClose={() => onOpenChange(false)}
            cancelLabel="Cancel"
            onCancel={() => onOpenChange(false)}
            confirmLabel={submitting ? 'Starting…' : 'Start Run'}
            confirmButton={{ disabled: submitting || !dataset }}
            onConfirm={handleConfirm}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '420px' }}>
                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}
                <p className="eval-muted">
                    The run scores the dataset against the project's current pipeline configuration.
                    Eval traffic does not appear in chat history, traces, or usage analytics.
                </p>
                {dataset?.tool_execution_mode === 'live' && (
                    <Notification type="warning" defaultOpen>
                        Tool execution mode is <strong>live</strong> — tools may call external systems and create side effects.
                    </Notification>
                )}
                <TextArea
                    id="eval-run-notes"
                    label="Notes (optional)"
                    value={notes}
                    placeholder="Testing prompt v4"
                    rows={3}
                    maxLength={500}
                    disabled={submitting}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
        </Dialog>
    );
};

export default StartRunDialog;
