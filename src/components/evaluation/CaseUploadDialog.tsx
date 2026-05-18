import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Dialog,
    Notification,
    OptionBar,
    OptionBarItem,
    TextField,
} from '@bosch/react-frok';
import { RAGaaSClient } from '../../services/api';
import { EvalDataset, SyntheticGenerationResponse } from '../../types';

interface CaseUploadDialogProps {
    open: boolean;
    projectId: string;
    apiClient: RAGaaSClient;
    dataset: EvalDataset | null;
    onOpenChange: (open: boolean) => void;
    onCompleted: (
        result: { mode: 'upload'; count: number } | { mode: 'synthetic'; response: SyntheticGenerationResponse }
    ) => void;
}

type Mode = 'upload' | 'synthetic';

const CSV_TEMPLATE = `question,expected_answer,tags,expected_chunk_ids
"What is the refund policy?","Refunds are available within 14 days.","policy|billing","chunk_1|chunk_2"`;

const JSON_TEMPLATE = `{
  "cases": [
    {
      "question": "What is the refund policy?",
      "expected_answer": "Refunds are available within 14 days.",
      "expected_chunk_ids": ["chunk_1", "chunk_2"],
      "tags": ["policy", "billing"],
      "metadata": { "difficulty": "easy" }
    }
  ]
}`;

export const CaseUploadDialog: React.FC<CaseUploadDialogProps> = ({
    open,
    projectId,
    apiClient,
    dataset,
    onOpenChange,
    onCompleted,
}) => {
    const [mode, setMode] = useState<Mode>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [targetCount, setTargetCount] = useState('20');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;
        setMode('upload');
        setFile(null);
        setTargetCount('20');
        setError('');
        setBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [open]);

    const handleConfirm = async () => {
        if (!dataset) return;
        setError('');
        setBusy(true);
        try {
            if (mode === 'upload') {
                if (!file) {
                    setError('Choose a CSV or JSON file to upload.');
                    setBusy(false);
                    return;
                }
                const cases = await apiClient.uploadEvalCases(
                    projectId,
                    dataset.dataset_id,
                    file
                );
                onCompleted({ mode: 'upload', count: cases.length });
                onOpenChange(false);
            } else {
                const count = Number(targetCount);
                if (!Number.isFinite(count) || count <= 0) {
                    setError('Target count must be a positive number.');
                    setBusy(false);
                    return;
                }
                const response = await apiClient.generateSyntheticEvalCases(
                    projectId,
                    dataset.dataset_id,
                    Math.floor(count)
                );
                onCompleted({ mode: 'synthetic', response });
                onOpenChange(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add cases');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog
            title={dataset ? `Add Cases — ${dataset.name}` : 'Add Cases'}
            modal
            open={open}
            onClose={() => onOpenChange(false)}
            cancelLabel="Cancel"
            onCancel={() => onOpenChange(false)}
            confirmLabel={busy ? 'Working…' : mode === 'upload' ? 'Upload' : 'Generate'}
            confirmButton={{ disabled: busy }}
            onConfirm={handleConfirm}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '480px' }}>
                <OptionBar
                    name="case-source"
                    selectedValue={mode}
                    onOptionSelect={(_e, data) => {
                        if (data.value) setMode(data.value as Mode);
                    }}
                >
                    <OptionBarItem value="upload" icon="upload" label="Upload CSV/JSON" />
                    <OptionBarItem value="synthetic" icon="flash" label="Generate synthetic" />
                </OptionBar>

                {error && (
                    <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                )}

                {mode === 'upload' && (
                    <>
                        <p className="eval-muted">
                            Upload a CSV or JSON file. <code>expected_answer</code> is strongly
                            recommended — metrics requiring it are skipped when missing.
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Button
                                mode="secondary"
                                icon="upload"
                                disabled={busy}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? 'Choose another file' : 'Choose file'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.json,application/json,text/csv"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const selected = e.target.files?.[0] ?? null;
                                    setFile(selected);
                                }}
                            />
                            {file && (
                                <span className="eval-muted">{file.name} ({Math.round(file.size / 1024)} KB)</span>
                            )}
                        </div>

                        <details>
                            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                                CSV template
                            </summary>
                            <pre className="eval-chunk-item__content" style={{ marginTop: '0.5rem' }}>
                                {CSV_TEMPLATE}
                            </pre>
                        </details>

                        <details>
                            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                                JSON template
                            </summary>
                            <pre className="eval-chunk-item__content" style={{ marginTop: '0.5rem' }}>
                                {JSON_TEMPLATE}
                            </pre>
                        </details>
                    </>
                )}

                {mode === 'synthetic' && (
                    <>
                        <p className="eval-muted">
                            The backend samples completed project documents and generates factual
                            single-turn cases. Synthetic cases are tagged as <code>source: "synthetic"</code>.
                        </p>
                        <TextField
                            id="eval-synthetic-count"
                            label="Target case count"
                            value={targetCount}
                            placeholder="20"
                            disabled={busy}
                            onChange={(e) => setTargetCount(e.target.value)}
                        />
                        {busy && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <ActivityIndicator size="small" />
                                <span className="eval-muted">Generating cases — this may take a minute…</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default CaseUploadDialog;
