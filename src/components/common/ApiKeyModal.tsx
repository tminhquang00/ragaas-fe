import React, { useState } from 'react';
import { Dialog, Button, Checkbox, Notification, TextField } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

interface ApiKeyModalProps {
    open: boolean;
    apiKey: string;
    onClose: () => void;
    projectName?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
    open,
    apiKey,
    onClose,
    projectName,
}) => {
    const [copied, setCopied] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClose = () => {
        if (confirmed) {
            setConfirmed(false);
            setCopied(false);
            onClose();
        }
    };

    return (
        <Dialog
            title="Your API Key"
            modal={true}
            open={open}
            onConfirm={handleClose}
            confirmLabel="Continue to Project"
            confirmButton={{ disabled: !confirmed }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        background: 'var(--app-warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FrokIcon name="Key" style={{ color: 'white', fontSize: 28 }} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 600 }}>API Key</h3>
                    {projectName && (
                        <span className="-size-s" style={{ color: 'var(--app-text-secondary)' }}>
                            {projectName}
                        </span>
                    )}
                </div>
            </div>

            <Notification type="warning" defaultOpen>
                Save this key now! It won't be shown again.
            </Notification>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <TextField
                    id="api-key-display"
                    value={apiKey}
                    readOnly
                    style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                    }}
                />
                <Button
                    mode="integrated"
                    icon={copied ? 'checkmark' : 'copy'}
                    onClick={handleCopy}
                    aria-label="Copy API key"
                />
            </div>

            {copied && (
                <p className="-size-xs" style={{ textAlign: 'right', marginTop: '0.25rem', color: 'var(--app-success)' }}>
                    Copied to clipboard!
                </p>
            )}

            <div style={{ marginTop: '1.5rem' }}>
                <Checkbox
                    id="api-key-confirm"
                    label="I have saved my API key securely"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                />
            </div>
        </Dialog>
    );
};
