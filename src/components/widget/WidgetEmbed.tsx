import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { WidgetConfig } from '../../types';
import { RAGaaSClient } from '../../services/api';
import { useAuth } from '../../context';

interface WidgetEmbedProps {
    projectId: string;
    apiClient: RAGaaSClient;
    projectName: string;
}

const colorPresets = [
    { name: 'Accent Blue', value: '#007bc0' },
    { name: 'Emerald', value: '#00884a' },
    { name: 'Purple', value: '#9e2896' },
    { name: 'Turquoise', value: '#18837e' },
];

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 600;

/** Small code-block with copy button — reused across the Guide + Embed tabs. */
const CodeBlock: React.FC<{
    code: string;
    copyKey: string;
    copied: string | null;
    onCopy: (text: string, key: string) => void;
    language?: string;
    multiline?: boolean;
}> = ({ code, copyKey, copied, onCopy, language, multiline = true }) => (
    <div style={{ position: 'relative' }}>
        <pre
            style={{
                padding: '0.9rem 1rem',
                paddingRight: '3rem',
                background: 'var(--app-bg-surface)',
                border: '1px solid var(--app-border)',
                overflow: 'auto',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                margin: 0,
                whiteSpace: multiline ? 'pre' : 'pre-wrap',
                wordBreak: multiline ? 'normal' : 'break-all',
            }}
            data-lang={language}
        >
            {code}
        </pre>
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
            <Tooltip content={copied === copyKey ? 'Copied!' : 'Copy'}>
                <Button
                    mode="integrated"
                    onClick={() => onCopy(code, copyKey)}
                    aria-label="Copy code"
                >
                    {copied === copyKey ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                </Button>
            </Tooltip>
        </div>
    </div>
);

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({
    projectId,
    apiClient,
    projectName,
}) => {
    const { tenantId } = useAuth();
    const [tab, setTab] = useState('guide');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [config, setConfig] = useState<WidgetConfig>({
        enabled: true,
        title: projectName,
        welcome_message: `Hi! I'm here to help you with ${projectName}. Ask me anything!`,
        primary_color: '#007bc0',
        position: 'right',
    });
    const [copied, setCopied] = useState<string | null>(null);
    const [baseUrl] = useState(window.location.origin);

    // Dimensions of the generated iframe snippet
    const [embedWidth, setEmbedWidth] = useState<number>(DEFAULT_WIDTH);
    const [embedHeight, setEmbedHeight] = useState<number>(DEFAULT_HEIGHT);

    // Debounced copy of `config` so the live preview iframe doesn't thrash on every keystroke
    const [debouncedConfig, setDebouncedConfig] = useState<WidgetConfig>(config);
    const [previewKey, setPreviewKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        fetchWidgetConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedConfig(config), 400);
        return () => clearTimeout(handle);
    }, [config]);

    const fetchWidgetConfig = async () => {
        try {
            setLoading(true);
            setError('');
            const widgetConfig = await apiClient.getWidgetConfig(projectId);
            setConfig(widgetConfig);
        } catch {
            // No config saved yet — defaults already set above
        } finally {
            setLoading(false);
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

    /** Build a widget URL from an arbitrary config (used for both preview and snippets). */
    const buildWidgetUrl = (cfg: WidgetConfig) => {
        const params = new URLSearchParams({
            projectId,
            tenant: tenantId,
        });
        if (cfg.title) params.set('title', cfg.title);
        if (cfg.primary_color) params.set('primaryColor', cfg.primary_color);
        if (cfg.welcome_message) params.set('welcomeMessage', cfg.welcome_message);
        return `${baseUrl}/widget.html?${params.toString()}`;
    };

    const previewUrl = useMemo(
        () => buildWidgetUrl(debouncedConfig),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [debouncedConfig, projectId, tenantId, baseUrl],
    );

    const snippetUrl = useMemo(
        () => buildWidgetUrl(config),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config, projectId, tenantId, baseUrl],
    );

    const generateScriptCode = () => {
        const side = config.position === 'left' ? 'left' : 'right';
        return `<!-- RAGaaS Chat Widget -->
<script>
  (function () {
    var iframe = document.createElement('iframe');
    iframe.src = ${JSON.stringify(snippetUrl)};
    iframe.title = ${JSON.stringify(config.title || 'Chat Widget')};
    iframe.allow = 'clipboard-write';
    iframe.style.cssText = [
      'position: fixed',
      '${side}: 20px',
      'bottom: 20px',
      'width: ${embedWidth}px',
      'height: ${embedHeight}px',
      'border: 0',
      'border-radius: 16px',
      'box-shadow: 0 8px 32px rgba(0,0,0,0.3)',
      'z-index: 9999',
      'background: transparent'
    ].join('; ');
    document.body.appendChild(iframe);
  })();
</script>`;
    };

    const generateIframeCode = () => {
        const side = config.position === 'left' ? 'left' : 'right';
        return `<iframe
  src="${snippetUrl}"
  style="position: fixed; ${side}: 20px; bottom: 20px; width: ${embedWidth}px; height: ${embedHeight}px; border: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
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
                <Tab value="guide">How to Use</Tab>
                <Tab value="embed">Embed Code</Tab>
                <Tab value="customize">Customize &amp; Preview</Tab>
            </TabNavigation>

            {/* ─────────────────────────────── Guide Tab ─────────────────────────────── */}
            {tab === 'guide' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <Notification type="neutral" defaultOpen>
                        The widget is shipped as a static HTML page (<code>widget.html</code>) from this
                        frontend's build. The backend's <code>relax_widget_frame_policy</code> middleware
                        already sets <code>content-security-policy: frame-ancestors *</code> for
                        <code> /widget.html</code> and <code>/assets/*</code>, so third-party origins
                        can embed it without <code>X-Frame-Options</code> blocking.
                    </Notification>

                    {/* 1. Direct URL */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                                1. Direct URL
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                Open directly in a browser for a quick smoke test — the page fills the
                                viewport and boots the chat UI. <code>projectId</code> is required;
                                <code> tenant</code> scopes requests via <code>X-User-ID</code> on the backend.
                            </p>
                            <CodeBlock
                                code={snippetUrl}
                                copyKey="guide-url"
                                copied={copied}
                                onCopy={handleCopy}
                                multiline={false}
                            />
                            <div style={{ marginTop: '0.75rem' }}>
                                <Button
                                    mode="secondary"
                                    onClick={() => window.open(snippetUrl, '_blank', 'noopener')}
                                >
                                    Open widget in a new tab
                                </Button>
                            </div>
                        </div>
                    </Tile>

                    {/* 2. iFrame embed */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                                2. iFrame Embed (drop into any 3rd-party site)
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                A plain iframe tag. Use this when the host page can't execute extra
                                JavaScript (e.g. CMS restrictions).
                            </p>
                            <CodeBlock
                                code={generateIframeCode()}
                                copyKey="guide-iframe"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    {/* 3. Script embed */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                                3. Script Embed (floating chat bubble — recommended)
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                Paste just before the closing <code>&lt;/body&gt;</code> tag. The iframe
                                is injected at runtime, so the URL can be updated later without touching
                                host-page markup.
                            </p>
                            <CodeBlock
                                code={generateScriptCode()}
                                copyKey="guide-script"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    {/* 4. Pre-filled snippets from the UI */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                4. Get pre-filled snippets from this UI
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                The <strong>Embed Code</strong> tab renders copyable script + iframe
                                snippets; the <strong>Customize &amp; Preview</strong> tab lets you tweak
                                the title, welcome message, position, and primary color while watching a
                                live iframe preview of the real widget. All URLs are built from
                                <code> window.location.origin</code>, so whichever host serves this SPA
                                also serves the widget.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Button mode="secondary" onClick={() => setTab('embed')}>
                                    Go to Embed Code
                                </Button>
                                <Button mode="tertiary" onClick={() => setTab('customize')}>
                                    Go to Customize &amp; Preview
                                </Button>
                            </div>
                        </div>
                    </Tile>

                    {/* 5. Legacy URLs */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                5. Legacy URLs still work
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                The old backend-served URL shape is auto-redirected (HTTP 301):
                            </p>
                            <CodeBlock
                                code={`/widget/<project_id>?tenant_id=<t>   →   /widget.html?projectId=<project_id>&tenant=<t>`}
                                copyKey="guide-legacy"
                                copied={copied}
                                onCopy={handleCopy}
                                multiline={false}
                            />
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.8125rem', margin: '0.75rem 0 0 0' }}>
                                Any embeds already deployed at the old URL transparently 301 to the new
                                static widget — no action required on customer sites.
                            </p>
                        </div>
                    </Tile>

                    {/* 6. Sanity test */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                6. Quick sanity test
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                With the backend running (<code>uvicorn src.main:app --reload</code>),
                                open the widget URL directly. You should see the Bosch-styled chat UI
                                full-bleed. Then drop the iframe snippet into any test HTML file served
                                from a <em>different</em> origin (e.g. <code>python -m http.server</code>{' '}
                                on a different port) — it should render inside the iframe without
                                <code> X-Frame-Options</code> blocking it.
                            </p>
                            <CodeBlock
                                code={`http://localhost:8000/widget.html?projectId=${projectId}&tenant=${tenantId}`}
                                copyKey="guide-local"
                                copied={copied}
                                onCopy={handleCopy}
                                multiline={false}
                            />
                        </div>
                    </Tile>

                    {/* Production note */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                Production note on <code>frame-ancestors</code>
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                Embedding is currently fully open (<code>frame-ancestors *</code>). To
                                restrict embedding to a known allow-list of customer domains, change
                                the header in <code>relax_widget_frame_policy</code> (in
                                <code> src/main.py</code>) from:
                            </p>
                            <CodeBlock
                                code={`response.headers["content-security-policy"] = "frame-ancestors *"`}
                                copyKey="guide-csp-open"
                                copied={copied}
                                onCopy={handleCopy}
                                multiline={false}
                                language="python"
                            />
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0.75rem 0' }}>
                                to something like:
                            </p>
                            <CodeBlock
                                code={`response.headers["content-security-policy"] = (
    "frame-ancestors https://customer-a.example.com https://customer-b.example.com"
)`}
                                copyKey="guide-csp-allowlist"
                                copied={copied}
                                onCopy={handleCopy}
                                language="python"
                            />
                        </div>
                    </Tile>
                </div>
            )}

            {/* ──────────────────────────────── Embed Code Tab ─────────────────────────────── */}
            {tab === 'embed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <Notification type="neutral" defaultOpen>
                        Copy the code below and paste it into your website's HTML, just before the closing
                        &nbsp;&lt;/body&gt; tag. The widget is served as a static asset from this app —
                        no backend widget route required.
                    </Notification>

                    {/* Widget URL (shared between snippets, handy for direct testing) */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Widget URL</h3>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Tooltip content="Open in new tab">
                                        <Button
                                            mode="integrated"
                                            onClick={() => window.open(snippetUrl, '_blank', 'noopener')}
                                            aria-label="Open widget in new tab"
                                        >
                                            <FrokIcon name="OpenInNew" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content={copied === 'url' ? 'Copied!' : 'Copy URL'}>
                                        <Button
                                            mode="integrated"
                                            onClick={() => handleCopy(snippetUrl, 'url')}
                                            aria-label="Copy widget URL"
                                        >
                                            {copied === 'url' ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                            <pre
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {snippetUrl}
                            </pre>
                        </div>
                    </Tile>

                    {/* Embed dimensions */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 1rem 0' }}>Iframe Dimensions</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <TextField
                                    id="widget-width"
                                    label="Width (px)"
                                    value={String(embedWidth)}
                                    onChange={(e) => {
                                        const n = Number(e.target.value.replace(/\D/g, ''));
                                        setEmbedWidth(n > 0 ? Math.max(200, n) : DEFAULT_WIDTH);
                                    }}
                                />
                                <TextField
                                    id="widget-height"
                                    label="Height (px)"
                                    value={String(embedHeight)}
                                    onChange={(e) => {
                                        const n = Number(e.target.value.replace(/\D/g, ''));
                                        setEmbedHeight(n > 0 ? Math.max(300, n) : DEFAULT_HEIGHT);
                                    }}
                                />
                            </div>
                        </div>
                    </Tile>

                    {/* Script Embed */}
                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Script Embed (Recommended)</h3>
                                <Tooltip content={copied === 'script' ? 'Copied!' : 'Copy code'}>
                                    <Button
                                        mode="integrated"
                                        onClick={() => handleCopy(generateScriptCode(), 'script')}
                                        aria-label="Copy script embed"
                                    >
                                        {copied === 'script' ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                                    </Button>
                                </Tooltip>
                            </div>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Injects a floating chat iframe after the page loads. Easier to update in-place
                                if the widget URL changes later.
                            </p>
                            <pre
                                style={{
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    margin: 0,
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
                                    <Button
                                        mode="integrated"
                                        onClick={() => handleCopy(generateIframeCode(), 'iframe')}
                                        aria-label="Copy iframe embed"
                                    >
                                        {copied === 'iframe' ? <FrokIcon name="Check" /> : <FrokIcon name="ContentCopy" />}
                                    </Button>
                                </Tooltip>
                            </div>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                A plain iframe tag. Use this when you can't run JavaScript (e.g. CMS restrictions).
                            </p>
                            <pre
                                style={{
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    margin: 0,
                                }}
                            >
                                {generateIframeCode()}
                            </pre>
                        </div>
                    </Tile>
                </div>
            )}

            {/* ───────────────────────── Customize & Preview Tab ───────────────────────── */}
            {tab === 'customize' && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                    {/* Configuration Form */}
                    <Tile style={{ flex: 1, minWidth: 320 }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Widget Configuration</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <Toggle
                                    id="widget-enabled"
                                    leftLabel="Enable Widget"
                                    checked={config.enabled}
                                    onChange={(e) =>
                                        setConfig({ ...config, enabled: (e.target as HTMLInputElement).checked })
                                    }
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
                                    onChange={(e) =>
                                        setConfig({ ...config, position: e.target.value as 'left' | 'right' })
                                    }
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

                    {/* Live Preview — real iframe pointing at widget.html */}
                    <Tile style={{ flex: 1, minWidth: 360 }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Live Preview</h3>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Tooltip content="Reload preview">
                                        <Button
                                            mode="integrated"
                                            onClick={() => setPreviewKey((k) => k + 1)}
                                            aria-label="Reload preview"
                                        >
                                            <FrokIcon name="Refresh" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Open in new tab">
                                        <Button
                                            mode="integrated"
                                            onClick={() => window.open(previewUrl, '_blank', 'noopener')}
                                            aria-label="Open widget in new tab"
                                        >
                                            <FrokIcon name="OpenInNew" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.8125rem', margin: '0 0 0.75rem 0' }}>
                                This iframe points at <code>/widget.html</code> — it's the exact widget that
                                will be embedded on third-party sites.
                            </p>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: config.position === 'right' ? 'flex-end' : 'flex-start',
                                    padding: '1rem',
                                    background: 'var(--app-bg-surface)',
                                    border: '1px solid var(--app-border)',
                                    minHeight: 560,
                                }}
                            >
                                <iframe
                                    key={previewKey}
                                    ref={iframeRef}
                                    src={previewUrl}
                                    title="Widget preview"
                                    allow="clipboard-write"
                                    style={{
                                        width: 360,
                                        height: 540,
                                        border: '1px solid var(--app-border)',
                                        borderRadius: 12,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                                        background: 'var(--app-bg)',
                                    }}
                                />
                            </div>
                        </div>
                    </Tile>
                </div>
            )}
        </div>
    );
};
