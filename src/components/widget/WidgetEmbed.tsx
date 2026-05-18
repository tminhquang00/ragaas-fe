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
const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
    enabled: true,
    welcome_message: '',
    primary_color: '#007bc0',
    position: 'right',
    show_team_tag: true,
};

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
        ...DEFAULT_WIDGET_CONFIG,
        title: projectName,
        welcome_message: `Hi! I'm here to help you with ${projectName}. Ask me anything!`,
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
            setConfig({
                ...DEFAULT_WIDGET_CONFIG,
                ...widgetConfig,
                title: widgetConfig.title || projectName,
                welcome_message:
                    widgetConfig.welcome_message ||
                    `Hi! I'm here to help you with ${projectName}. Ask me anything!`,
                show_team_tag: widgetConfig.show_team_tag ?? true,
            });
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
        params.set('showTeamTag', String(cfg.show_team_tag ?? true));
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
    var side = ${JSON.stringify(side)};
    var widgetUrl = ${JSON.stringify(snippetUrl)};
    var widgetTitle = ${JSON.stringify(config.title || 'Chat Widget')};
    var iframe;
    var launcher;
    var expanded = false;

    function createLauncher() {
      launcher = document.createElement('button');
      launcher.type = 'button';
      launcher.setAttribute('aria-label', 'Open ' + widgetTitle);
      launcher.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v7c0 1.38-1.12 2.5-2.5 2.5H10l-4.4 3.3c-.66.5-1.6.03-1.6-.8V5.5Zm2.5-.5a.5.5 0 0 0-.5.5v10l3.33-2.5h8.17a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11Z"/></svg>';
      launcher.style.cssText = [
        'position: fixed',
        side + ': 20px',
        'bottom: 20px',
        'width: 44px',
        'height: 44px',
        'padding: 0',
        'border: 0',
        'border-radius: 50%',
        'background: ${config.primary_color || '#007bc0'}',
        'color: #fff',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.28)',
        'cursor: pointer',
        'z-index: 9999'
      ].join('; ');
      launcher.onclick = openWidget;
      document.body.appendChild(launcher);
    }

    function openWidget() {
      if (launcher) launcher.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        applyIframeSize();
        return;
      }
      iframe = document.createElement('iframe');
      iframe.src = widgetUrl;
      iframe.title = widgetTitle;
      iframe.allow = 'clipboard-write';
      iframe.style.cssText = [
        'position: fixed',
        side + ': 20px',
        'bottom: 20px',
        'border: 0',
        'border-radius: 16px',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.3)',
        'z-index: 9999',
        'background: transparent',
        'transition: width 180ms ease, height 180ms ease'
      ].join('; ');
      applyIframeSize();
      document.body.appendChild(iframe);
    }

    function applyIframeSize() {
      if (!iframe) return;
      iframe.style.width = expanded
        ? 'min(900px, calc(100vw - 32px))'
        : 'min(${embedWidth}px, calc(100vw - 32px))';
      iframe.style.height = expanded
        ? 'min(760px, calc(100vh - 32px))'
        : 'min(${embedHeight}px, calc(100vh - 32px))';
    }

    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'ragaas-widget:close') {
        expanded = false;
        if (iframe) iframe.style.display = 'none';
        if (launcher) launcher.style.display = 'block';
      }
      if (event.data && event.data.type === 'ragaas-widget:resize') {
        expanded = !!event.data.expanded;
        applyIframeSize();
      }
    });

    createLauncher();
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
                <Tab value="customize">Customize &amp; Embed</Tab>
                <Tab value="chat-api">Chat API Integration</Tab>
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

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                Current widget behavior
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                The recommended embed now starts as a compact launcher button instead of
                                an always-open chat window. When users open it, they can expand the popup
                                for a larger chat surface or hide it again with the close button in the
                                widget header. The widget sends <code>ragaas-widget:resize</code> and
                                <code> ragaas-widget:close</code> messages to the host page, and the embed
                                script resizes the iframe or restores the launcher.
                            </p>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                                The header shows only the configured widget title and Bosch logo mark.
                                It no longer renders the old <code>RAGaaS assistant</code> eyebrow or plus icon.
                            </p>
                        </div>
                    </Tile>

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
                                JavaScript (e.g. CMS restrictions). This version stays visible while the
                                iframe is present. For the hideable launcher, use the script embed below.
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
                                3. Script Embed (hideable launcher — recommended)
                            </h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                Paste just before the closing <code>&lt;/body&gt;</code> tag. The script
                                starts as a compact launcher, opens the iframe on click, supports the
                                expand button in the widget header, and restores the launcher when the
                                widget's close button is pressed.
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
                                The <strong>Customize &amp; Embed</strong> tab lets you tweak the title,
                                welcome message, position, primary color, and dimensions while watching a
                                live preview of the real widget. The same tab also renders copyable script
                                and iframe snippets. All URLs are built from
                                <code> window.location.origin</code>, so whichever host serves this SPA
                                also serves the widget.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Button mode="secondary" onClick={() => setTab('customize')}>
                                    Go to Customize &amp; Embed
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
                                full-bleed. Then drop the script snippet into any test HTML file served
                                from a <em>different</em> origin (e.g. <code>python -m http.server</code>{' '}
                                on a different port). It should render a launcher, open the iframe on click,
                                expand or shrink from the widget header, and restore the launcher when the
                                widget close button is pressed.
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

            {/* ───────────────────────── Customize & Embed Tab ───────────────────────── */}
            {tab === 'customize' && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                    <div style={{ width: '100%' }}>
                        <Notification type="neutral" defaultOpen>
                            Configure the widget, verify the live preview, then copy the embed code from
                            the same page. The recommended script renders a hideable, expandable launcher.
                        </Notification>
                    </div>

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

                                <div
                                    style={{
                                        padding: '1rem',
                                        border: '1px solid var(--app-border)',
                                        background: 'var(--app-bg-surface)',
                                    }}
                                >
                                    <Toggle
                                        id="widget-team-tag"
                                        leftLabel="Show BSGV/SX-EIT-MM attribution tag"
                                        checked={config.show_team_tag ?? true}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                show_team_tag: (e.target as HTMLInputElement).checked,
                                            })
                                        }
                                    />
                                    <p
                                        style={{
                                            color: 'var(--app-text-secondary)',
                                            fontSize: '0.8125rem',
                                            margin: '0.5rem 0 0 0',
                                        }}
                                    >
                                        Adds a small Bosch-styled footer tag that says the solution was
                                        developed by the BSGV/SX-EIT-MM team.
                                    </p>
                                </div>

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
                                        Default iframe size
                                    </p>
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
                                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.8125rem', margin: '0.5rem 0 0 0' }}>
                                        The expand button grows the popup up to 900 x 760 px, constrained by
                                        the user's viewport.
                                    </p>
                                </div>

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

                    <Tile style={{ width: '100%' }}>
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
                            <CodeBlock
                                code={snippetUrl}
                                copyKey="url-block"
                                copied={copied}
                                onCopy={handleCopy}
                                multiline={false}
                            />
                        </div>
                    </Tile>

                    <Tile style={{ width: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Script Embed (Recommended)</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                Paste this before the closing <code>&lt;/body&gt;</code> tag. It renders a
                                compact launcher first, injects the iframe when opened, resizes it from
                                the widget expand button, and hides it from the widget close button.
                            </p>
                            <CodeBlock
                                code={generateScriptCode()}
                                copyKey="script"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    <Tile style={{ width: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>iFrame Embed</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                Use this static iframe when the host page cannot run custom JavaScript.
                                It does not provide the launcher restore behavior.
                            </p>
                            <CodeBlock
                                code={generateIframeCode()}
                                copyKey="iframe"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>
                </div>
            )}

            {/* ───────────────────────── Chat API Integration Tab ───────────────────────── */}
            {tab === 'chat-api' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <Notification type="neutral" defaultOpen>
                        Use the widget iframe for browser embeds. Use these Chat API examples when a backend
                        service, middleware, bot, or custom application needs to call this project's agent directly.
                    </Notification>

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Base Contract</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                All tenant-scoped chat calls must include <code>X-User-ID</code>. For this project,
                                use:
                            </p>
                            <CodeBlock
                                code={`BASE_URL=${baseUrl}
PROJECT_ID=${projectId}
TENANT_ID=${tenantId}

Required headers:
Content-Type: application/json
X-User-ID: ${tenantId}`}
                                copyKey="chat-api-contract"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Non-Streaming Chat</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                Use <code>POST /api/v1/projects/{'{project_id}'}/chat</code> when your backend
                                wants a single JSON response after the agent finishes.
                            </p>
                            <CodeBlock
                                code={`curl -X POST "${baseUrl}/api/v1/projects/${projectId}/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-User-ID: ${tenantId}" \\
  -d '{
    "query": "How can I reset my application access?",
    "session_id": "optional-session-id",
    "metadata": {
      "source": "backend-integration"
    }
  }'`}
                                copyKey="chat-api-curl"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Streaming Chat</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                Use <code>POST /api/v1/projects/{'{project_id}'}/chat/stream</code> for a
                                Server-Sent Events stream. Events are sent as <code>data: ...</code> lines and
                                terminate with <code>[DONE]</code>.
                            </p>
                            <CodeBlock
                                code={`curl -N -X POST "${baseUrl}/api/v1/projects/${projectId}/chat/stream" \\
  -H "Accept: text/event-stream" \\
  -H "Content-Type: application/json" \\
  -H "X-User-ID: ${tenantId}" \\
  -d '{
    "query": "Summarize the latest support incidents.",
    "session_id": "optional-session-id"
  }'`}
                                copyKey="chat-api-stream-curl"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Node.js Backend Example</h3>
                            <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                This example proxies a user question through your backend. Keep tenant and
                                auth decisions on the server side rather than exposing privileged integration
                                logic in browser code.
                            </p>
                            <CodeBlock
                                language="ts"
                                code={`export async function askProjectAgent(query: string) {
  const response = await fetch("${baseUrl}/api/v1/projects/${projectId}/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": "${tenantId}",
    },
    body: JSON.stringify({
      query,
      metadata: { source: "custom-backend" },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}`}
                                copyKey="chat-api-node"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </Tile>

                    <Tile>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Operational Notes</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                                <p style={{ margin: 0 }}>
                                    <strong style={{ color: 'var(--app-text)' }}>Sessions:</strong> pass
                                    <code> session_id</code> to continue a conversation. Omit it to let the
                                    backend create a new session.
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong style={{ color: 'var(--app-text)' }}>Files and images:</strong> send
                                    base64 payloads in <code>files</code> or <code>images</code> when your
                                    custom backend needs multimodal input.
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong style={{ color: 'var(--app-text)' }}>Quotas:</strong> handle
                                    <code> 429</code> responses and show a retry or quota-request path in your
                                    calling application.
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong style={{ color: 'var(--app-text)' }}>Activation:</strong> chat calls
                                    require the project to be active. Draft or archived projects should be blocked
                                    before invoking the API.
                                </p>
                            </div>
                        </div>
                    </Tile>
                </div>
            )}
        </div>
    );
};
