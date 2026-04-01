import React, { useState } from 'react';
import { Tile, Tooltip, Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

const STEP_TYPES = [
    { type: 'retrieve', label: 'Retrieve', icon: 'Search', color: '#007bc0' },
    { type: 'generate', label: 'Generate', icon: 'AutoGraph', color: '#18837e' },
    { type: 'classify', label: 'Classify', icon: 'Label', color: '#9c27b0' },
    { type: 'route', label: 'Route', icon: 'CallSplit', color: '#ed6c02' },
    { type: 'transform', label: 'Transform', icon: 'Transform', color: '#0288d1' },
    { type: 'parallel', label: 'Parallel', icon: 'Merge', color: '#0288d1' },
    { type: 'agent', label: 'Agent', icon: 'SmartToy', color: '#d32f2f' },
];

export const PipelineToolbar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/stepType', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <Tile
            background="primary"
            style={{
                width: collapsed ? 60 : 240,
                transition: 'width 0.2s',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--bosch-gray-75)',
                overflow: 'hidden',
                zIndex: 2,
                padding: 0,
            }}
        >
            <div
                style={{
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid var(--bosch-gray-75)',
                }}
            >
                {!collapsed && (
                    <strong style={{ fontSize: '0.875rem' }}>
                        Pipeline Steps
                    </strong>
                )}
                <Button mode="integrated" icon={collapsed ? 'right' : 'left'} onClick={() => setCollapsed(!collapsed)} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                {STEP_TYPES.map((step) => (
                    <Tooltip
                        key={step.type}
                        content={collapsed ? step.label : ''}
                    >
                        <div
                            draggable
                            onDragStart={(event) => onDragStart(event, step.type)}
                            style={{
                                marginBottom: '0.5rem',
                                border: '1px solid var(--bosch-gray-75)',
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: '0.5rem',
                                gap: '0.5rem',
                            }}
                        >
                            <span style={{ color: step.color, display: 'flex', flexShrink: 0 }}>
                                <FrokIcon name={step.icon} />
                            </span>
                            {!collapsed && (
                                <>
                                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{step.label}</span>
                                    <FrokIcon name="DragIndicator" style={{ color: '#bdbdbd' }} />
                                </>
                            )}
                        </div>
                    </Tooltip>
                ))}
            </div>

            {!collapsed && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--bosch-gray-75)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#757575' }}>
                        Drag steps onto the canvas to add them to your pipeline.
                    </span>
                </div>
            )}
        </Tile>
    );
};
