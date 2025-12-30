import React from 'react';
import {
    Description as DescriptionIcon,
    Search as SearchIcon,
    AutoFixHigh as MagicIcon,
    FilterList as FilterIcon,
    SmartToy as BotIcon,
} from '@mui/icons-material';
import { Box, Typography, Paper, Tooltip } from '@mui/material';

export const PipelineToolbar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, stepType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/stepType', stepType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const steps = [
        { type: 'transform', label: 'Query Rewrite', icon: <MagicIcon fontSize="small" /> },
        { type: 'retrieve', label: 'Retrieval', icon: <SearchIcon fontSize="small" /> },
        { type: 'filter', label: 'Re-ranking', icon: <FilterIcon fontSize="small" /> },
        { type: 'generate', label: 'Generation', icon: <BotIcon fontSize="small" /> },
        { type: 'tool_call', label: 'Tool Call', icon: <DescriptionIcon fontSize="small" /> },
    ];

    return (
        <Box
            sx={{
                width: 240,
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
        >
            <Typography variant="overline" color="text.secondary" fontWeight="bold">
                Available Steps
            </Typography>

            {steps.map((step) => (
                <Paper
                    key={step.label}
                    variant="outlined"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'step', step.type)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 2,
                        py: 1.5,
                        cursor: 'grab',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                        {step.icon}
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                        {step.label}
                    </Typography>
                </Paper>
            ))}

            <Box sx={{ mt: 'auto', p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Drag items to the canvas to add them to the pipeline.
                </Typography>
            </Box>
        </Box>
    );
};
