import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,

    Tabs,
    Tab,
    IconButton,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Tooltip,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Check as CheckIcon,
    Code as CodeIcon,
    Preview as PreviewIcon,

} from '@mui/icons-material';
import { WidgetConfig, WidgetEmbedCode } from '../../types';
import { RAGaaSClient } from '../../services/api';

interface WidgetEmbedProps {
    projectId: string;
    apiClient: RAGaaSClient;
    projectName: string;
}

// Color presets for the widget
const colorPresets = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
];

export const WidgetEmbed: React.FC<WidgetEmbedProps> = ({
    projectId,
    apiClient,
    projectName,
}) => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [config, setConfig] = useState<WidgetConfig>({
        enabled: true,
        title: projectName,
        welcome_message: `Hi! I'm here to help you with ${projectName}. Ask me anything!`,
        primary_color: '#6366f1',
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<CodeIcon />} label="Embed Code" iconPosition="start" />
                <Tab icon={<PreviewIcon />} label="Customize" iconPosition="start" />
            </Tabs>

            {/* Embed Code Tab */}
            {tab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Alert severity="info">
                        Copy the code below and paste it into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.
                    </Alert>

                    {/* Script Embed */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Script Embed (Recommended)
                                </Typography>
                                <Tooltip title={copied === 'script' ? 'Copied!' : 'Copy code'}>
                                    <IconButton onClick={() => handleCopy(generateScriptCode(), 'script')}>
                                        {copied === 'script' ? <CheckIcon color="success" /> : <CopyIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                This embeds a floating chat bubble that can be customized and won't affect your page layout.
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    p: 2,
                                    borderRadius: 1,
                                    background: alpha(theme.palette.background.default, 0.8),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {generateScriptCode()}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* iFrame Embed */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    iFrame Embed
                                </Typography>
                                <Tooltip title={copied === 'iframe' ? 'Copied!' : 'Copy code'}>
                                    <IconButton onClick={() => handleCopy(generateIframeCode(), 'iframe')}>
                                        {copied === 'iframe' ? <CheckIcon color="success" /> : <CopyIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Use this if you prefer a simple iframe-based integration.
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    p: 2,
                                    borderRadius: 1,
                                    background: alpha(theme.palette.background.default, 0.8),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {generateIframeCode()}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Customize Tab */}
            {tab === 1 && (
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Configuration Form */}
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Widget Configuration
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={config.enabled}
                                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                                        />
                                    }
                                    label="Enable Widget"
                                />

                                <TextField
                                    label="Widget Title"
                                    value={config.title || ''}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    fullWidth
                                    placeholder="AI Assistant"
                                />

                                <TextField
                                    label="Welcome Message"
                                    value={config.welcome_message}
                                    onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Hi! How can I help you today?"
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Position</InputLabel>
                                    <Select
                                        value={config.position}
                                        label="Position"
                                        onChange={(e) => setConfig({ ...config, position: e.target.value as 'left' | 'right' })}
                                    >
                                        <MenuItem value="right">Bottom Right</MenuItem>
                                        <MenuItem value="left">Bottom Left</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Primary Color
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {colorPresets.map((color) => (
                                            <Tooltip key={color.value} title={color.name}>
                                                <Box
                                                    onClick={() => setConfig({ ...config, primary_color: color.value })}
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 1,
                                                        background: color.value,
                                                        cursor: 'pointer',
                                                        border: config.primary_color === color.value
                                                            ? '3px solid white'
                                                            : '3px solid transparent',
                                                        boxShadow: config.primary_color === color.value
                                                            ? `0 0 0 2px ${color.value}`
                                                            : 'none',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                        <TextField
                                            size="small"
                                            value={config.primary_color}
                                            onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                            sx={{ width: 100 }}
                                            placeholder="#6366f1"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card sx={{ flex: 1, minHeight: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Preview
                            </Typography>

                            {/* Mock widget preview */}
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    background: alpha(theme.palette.background.default, 0.5),
                                    minHeight: 350,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: config.position === 'right' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {/* Chat bubble preview */}
                                <Box
                                    sx={{
                                        width: 320,
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: `0 8px 32px ${alpha(config.primary_color, 0.3)}`,
                                        background: theme.palette.background.paper,
                                    }}
                                >
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            background: config.primary_color,
                                            color: 'white',
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {config.title || 'AI Assistant'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Online
                                        </Typography>
                                    </Box>

                                    {/* Message area */}
                                    <Box sx={{ p: 2, minHeight: 150 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                borderTopLeftRadius: 4,
                                                background: alpha(config.primary_color, 0.1),
                                                maxWidth: '85%',
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {config.welcome_message}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Input area */}
                                    <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 3,
                                                background: alpha(theme.palette.background.default, 0.5),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                Type a message...
                                            </Typography>
                                            <Box
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    background: config.primary_color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: 'white' }}>→</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};
