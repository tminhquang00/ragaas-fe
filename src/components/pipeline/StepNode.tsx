import { Handle, Position, NodeProps } from '@xyflow/react';
import { PipelineNode } from '../../utils/pipelineFlowUtils';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Divider,
    Stack
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Search as SearchIcon,
    AutoFixHigh as MagicIcon,
    FilterList as FilterIcon,
    SmartToy as BotIcon,
    Description as DescriptionIcon,
    Bolt as BoltIcon,
} from '@mui/icons-material';

const typeIcons: Record<string, React.ReactElement> = {
    retrieve: <SearchIcon fontSize="small" />,
    classify: <DescriptionIcon fontSize="small" />,
    generate: <BotIcon fontSize="small" />,
    transform: <MagicIcon fontSize="small" />,
    filter: <FilterIcon fontSize="small" />,
    tool_call: <SettingsIcon fontSize="small" />,
    parallel: <BoltIcon fontSize="small" />,
};

const typeColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    retrieve: 'primary',
    classify: 'secondary',
    generate: 'success',
    transform: 'warning',
    filter: 'error',
    tool_call: 'info',
    parallel: 'secondary',
    default: 'default',
};

export function StepNode({ data, selected }: NodeProps<PipelineNode>) {
    const { label, type, config } = data;
    const icon = typeIcons[type || 'default'] || <SettingsIcon fontSize="small" />;
    const color = typeColors[type || 'default'] || 'default';

    // Helper to format config for display
    const renderConfigPreview = () => {
        if (!config || Object.keys(config).length === 0) return null;

        // Pick top 2-3 important keys
        return (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
                {Object.entries(config).slice(0, 3).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {key.replace('_', ' ')}
                        </Typography>
                        <Typography variant="caption" fontWeight={500} sx={{ maxWidth: 80 }} noWrap>
                            {String(value)}
                        </Typography>
                    </Box>
                ))}
                {Object.keys(config).length > 3 && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', fontSize: '0.65rem' }}>
                        + {Object.keys(config).length - 3} more...
                    </Typography>
                )}
            </Stack>
        );
    };

    return (
        <Card
            variant="outlined"
            sx={{
                width: 200,
                borderRadius: 2,
                boxShadow: selected ? `0 0 0 2px #1976d2` : 1, // Highlight when selected
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555', width: 10, height: 10 }}
            />

            <CardContent sx={{ p: '12px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: `${color}.main`, display: 'flex' }}>
                            {icon}
                        </Box>
                        <Typography variant="subtitle2" component="div" width={90} noWrap fontWeight={600} title={label}>
                            {label}
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    label={type}
                    size="small"
                    color={color}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem', width: '100%', mb: 1, textTransform: 'uppercase' }}
                />

                <Divider />

                {/* Config Preview */}
                {renderConfigPreview()}

            </CardContent>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', width: 10, height: 10 }}
            />
        </Card>
    );
}
