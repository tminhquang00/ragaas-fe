import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tooltip,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    AutoGraph as GenerateIcon,
    Label as ClassifyIcon,
    CallSplit as RouteIcon,
    Transform as TransformIcon,
    Merge as ParallelIcon,
    SmartToy as AgentIcon,
    DragIndicator as DragIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const STEP_TYPES = [
    { type: 'retrieve', label: 'Retrieve', icon: <SearchIcon />, color: 'primary' },
    { type: 'generate', label: 'Generate', icon: <GenerateIcon />, color: 'success' },
    { type: 'classify', label: 'Classify', icon: <ClassifyIcon />, color: 'secondary' },
    { type: 'route', label: 'Route', icon: <RouteIcon />, color: 'warning' },
    { type: 'transform', label: 'Transform', icon: <TransformIcon />, color: 'info' },
    { type: 'parallel', label: 'Parallel', icon: <ParallelIcon />, color: 'info' },
    { type: 'agent', label: 'Agent', icon: <AgentIcon />, color: 'error' },
];

export const PipelineToolbar = () => {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/stepType', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <Paper
            elevation={3}
            sx={{
                width: collapsed ? 60 : 240,
                transition: 'width 0.2s',
                display: 'flex',
                flexDirection: 'column',
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                zIndex: 2,
            }}
        >
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                {!collapsed && (
                    <Typography variant="subtitle2" fontWeight="bold">
                        Pipeline Steps
                    </Typography>
                )}
                <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
                    {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            <Box sx={{ overflowY: 'auto', flex: 1, p: 1 }}>
                <List dense sx={{ p: 0 }}>
                    {STEP_TYPES.map((step) => (
                        <Tooltip
                            key={step.type}
                            title={collapsed ? step.label : ''}
                            placement="right"
                        >
                            <ListItem
                                draggable
                                onDragStart={(event) => onDragStart(event, step.type)}
                                sx={{
                                    mb: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    bgcolor: 'background.default',
                                    cursor: 'grab',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        borderColor: `${step.color}.main`,
                                    },
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    p: 1,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 36, color: `${step.color}.main` }}>
                                    {step.icon}
                                </ListItemIcon>
                                {!collapsed && (
                                    <>
                                        <ListItemText primary={step.label} />
                                        <DragIcon fontSize="small" color="disabled" />
                                    </>
                                )}
                            </ListItem>
                        </Tooltip>
                    ))}
                </List>
            </Box>

            {!collapsed && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        Drag steps onto the canvas to add them to your pipeline.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};
