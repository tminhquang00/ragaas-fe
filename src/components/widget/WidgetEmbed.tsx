import React, { useState, useEffect } from 'react';
import {
    Tile,
    TextField,
    TabNavigation,
    Tab,
    Toggle,
    Dropdown,
    Notification,
    Tooltip,
    ActivityIndicator,
    Button,
} from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha } from '../../utils/frokTheme';
import { WidgetConfig, WidgetEmbedCode } from '../../types';
import { RAGaaSClient } from '../../services/api';

interface WidgetEmbedProps {
    projectId: string;
    apiClient: RAGaaSClient;
    projectName: string;
}

// Color presets for the widget
const colorPresets = [
    { name: 'Accent Blue', value: '#007bc0' },
    { name: 'Emerald', value: '#00884a' },
    { name: 'Purple', value: '#9e2896' },
    { name: 'Turquoise', value: '#18837e' },
];

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({
    projectId,
    apiClient,
    projectName,
}) => {
    const [tab, setTab] = useState('embed');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [config, setConfig] = useState<WidgetConfig>({
        enabled: true,
        title: projectName,
        welcome_message: `Hi! I'm here to help you with ${projectName}. Ask me anything!`,
        primary_color: '#007bc0',
        position: 'right',
    });
    const [_embedCode, setEmbedCode] = useState<WidgetEmbedCode | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [baseUrl, _setBaseUrl] = useState(window.location.origin);

    useEffect(() => {
        fetchWidgetConfig();
    }, [projectId]);

    const fetchWidgetConfig = async () => {
        try {
            setLoading(true);
            setError('');
            const widgetConfig = await apiClient.getWidgetConfig(projectId);
            setConfig(widgetConfig);
            await fetchEmbedCode();
        } catch (err) {
            // If no config exists, use defaults
            console.log('Using default widget config');
            await fetchEmbedCode();
        } finally {
            setLoading(false);
        }
    };

    const fetchEmbedCode = async () => {
        try {
            const code = await apiClient.getEmbedCode(projectId, baseUrl);
            setEmbedCode(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch embed code');
        }
    };

    const handleCopy = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const generateScriptCode = () => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return `<!-- RAGaaS Chat Widget -->
<script>
  (function() {
    var w = window.RAGaaSWidget = window.RAGaaSWidget || {};
    w.projectId = "${projectId}";
    w.config = ${JSON.stringify(config, null, 2)};
    w.apiUrl = "${apiBaseUrl}";
    
    var s = document.createElement('script');
    s.src = "${apiBaseUrl}/static/widget/loader.js";
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;
    };

    const generateIframeCode = () => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return `<iframe
  src="${apiBaseUrl}/widget/${projectId}"
  style="position: fixed; ${config.position}: 20px; bottom: 20px; width: 400px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 9999;"
  allow="microphone"
  title="${config.title || 'Chat Widget'}"
></iframe>`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <ActivityIndicator />
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Notification type="warning" defaultOpen onCloseClick={() => setError('')}>
                        {error}
                    </Notification>
                </div>
            )}

            <TabNavigation
                selectedValue={tab}
                onTabSelect={(_, data) => setTab(data.value as string)}
            >
                <Tab value="embed">Embed Code</Tab>
                <Tab value="customize">Customize</Tab>
            </TabNavigation>

            {/* Embed Code Tab */}
            {tab === 'embed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <Notification type="neutral" defaultOpen>
                        Copy the code below and paste it into your website's HTML, just before the closing &lt;/body&gt; tag.
                    </Notification>

                    {/* Script Embed */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Script Embed (Recommended)</h3>
                                <Tooltip content={copied === 'script' ? 'Copied!' : 'Copy code'}>
                                    <Button mode="integrated" onClick={() => handleCopy(generateScriptCode(), 'script')}>
                                        {copied === 'script' ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                                    </Button>
                                </Tooltip>
                            </div>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                This embeds a floating chat bubble that can be customized and won't affect your page layout.
                            </p>
                            <pre
                                style={{
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {generateScriptCode()}
                            </pre>
                        </div>
                    </Tile>

                    {/* iFrame Embed */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontWeight: 600, margin: 0 }}>iFrame Embed</h3>
                                <Tooltip content={copied === 'iframe' ? 'Copied!' : 'Copy code'}>
                                    <Button mode="integrated" onClick={() => handleCopy(generateIframeCode(), 'iframe')}>
                                        {copied === 'iframe' ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                                    </Button>
                                </Tooltip>
                            </div>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Use this if you prefer a simple iframe-based integration.
                            </p>
                            <pre
                                style={{
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {generateIframeCode()}
                            </pre>
                        </div>
                    </Tile>
                </div>
            )}

            {/* Customize Tab */}
            {tab === 'customize' && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                    {/* Configuration Form */}
                    <Tile style={{ flex: 1, minWidth: 300 }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Widget Configuration</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <Toggle
                                    id="widget-enabled"
                                    leftLabel="Enable Widget"
                                    checked={config.enabled}
                                    onChange={(e) => setConfig({ ...config, enabled: (e.target as HTMLInputElement).checked })}
                                />

                                <TextField
                                    id="widget-title"
                                    label="Widget Title"
                                    value={config.title || ''}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    placeholder="AI Assistant"
                                />

                                <TextField
                                    id="widget-welcome-message"
                                    label="Welcome Message"
                                    value={config.welcome_message}
                                    onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                                    placeholder="Hi! How can I help you today?"
                                />

                                <Dropdown
                                    label="Position"
                                    value={config.position}
                                    onChange={(e) => setConfig({ ...config, position: e.target.value as 'left' | 'right' })}
                                    options={[
                                        { name: 'Bottom Right', value: 'right' },
                                        { name: 'Bottom Left', value: 'left' },
                                    ]}
                                />

                                <div>
                                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Primary Color
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {colorPresets.map((color) => (
                                            <Tooltip key={color.value} content={color.name}>
                                                <div
                                                    onClick={() => setConfig({ ...config, primary_color: color.value })}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        background: color.value,
                                                        cursor: 'pointer',
                                                        border: config.primary_color === color.value
                                                            ? '3px solid white'
                                                            : '3px solid transparent',
                                                        boxShadow: config.primary_color === color.value
                                                            ? `0 0 0 2px ${color.value}`
                                                            : 'none',
                                                        transition: 'all 0.2s',
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                        <TextField
                                            id="widget-primary-color"
                                            value={config.primary_color}
                                            onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                            placeholder="#007bc0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tile>

                    {/* Preview */}
                    <Tile style={{ flex: 1, minWidth: 300, minHeight: 400 }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Preview</h3>

                            {/* Mock widget preview */}
                            <div
                                style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    minHeight: 350,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: config.position === 'right' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {/* Chat bubble preview */}
                                <div
                                    style={{
                                        width: 320,
                                        overflow: 'hidden',
                                        boxShadow: `0 8px 32px ${alpha(config.primary_color, 0.3)}`,
                                        background: 'var(--app-bg)',
                                    }}
                                >
                                    {/* Header */}
                                    <div
                                        style={{
                                            padding: '1rem',
                                            background: config.primary_color,
                                            color: 'white',
                                        }}
                                    >
                                        <p style={{ fontWeight: 600, margin: 0 }}>
                                            {config.title || 'AI Assistant'}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                            Online
                                        </span>
                                    </div>

                                    {/* Message area */}
                                    <div style={{ padding: '1rem', minHeight: 150 }}>
                                        <div
                                            style={{
                                                padding: '0.75rem',
                                                borderTopLeftRadius: 4,
                                                background: alpha(config.primary_color, 0.1),
                                                maxWidth: '85%',
                                            }}
                                        >
                                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                                {config.welcome_message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Input area */}
                                    <div style={{ padding: '0.75rem', borderTop: '1px solid var(--app-border)' }}>
                                        <div
                                            style={{
                                                padding: '0.75rem',
                                                background: 'var(--app-bg-surface)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                                                Type a message...
                                            </span>
                                            <div
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    background: config.primary_color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <span style={{ color: 'white', fontSize: '0.75rem' }}>→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tile>
                </div>
            )}
        </div>
    );
};
