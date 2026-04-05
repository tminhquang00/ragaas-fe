import React, { useState } from 'react';
import { Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';

const STEP_TYPES = [
    { type: 'retrieve', label: 'Retrieve', icon: 'Search', color: '#007bc0' },
    { type: 'generate', label: 'Generate', icon: 'SmartToy', color: '#18837e' },
    { type: 'classify', label: 'Classify', icon: 'Description', color: '#9c27b0' },
    { type: 'route', label: 'Route', icon: 'CallSplit', color: '#ed6c02' },
    { type: 'transform', label: 'Transform', icon: 'Refresh', color: '#0288d1' },
    { type: 'parallel', label: 'Parallel', icon: 'Bolt', color: '#0288d1' },
    { type: 'agent', label: 'Agent', icon: 'Build', color: '#d32f2f' },
];

export const PipelineToolbar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/stepType', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            style={{
                width: collapsed ? 60 : 240,
                transition: 'width 0.2s',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--app-bg)',
                borderRight: '1px solid var(--app-border)',
                zIndex: 2,
                flexShrink: 0,
                height: '100%',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid var(--app-border)',
                }}
            >
                {!collapsed && (
                    <strong style={{ fontSize: '0.875rem' }}>
                        Pipeline Steps
                    </strong>
                )}
                <Button mode="integrated" icon={collapsed ? 'right' : 'left'} onClick={() => setCollapsed(!collapsed)} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem', minHeight: 0 }}>
                {STEP_TYPES.map((step) => {
                    const stepItem = (
                        <div
                            draggable
                            onDragStart={(event) => onDragStart(event, step.type)}
                            className="pipeline-step-item"
                            style={{
                                marginBottom: '0.5rem',
                                border: '1px solid var(--app-border)',
                                borderRadius: '2px',
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: '0.5rem',
                                gap: '0.5rem',
                                background: 'var(--app-bg-surface)',
                                transition: 'border-color 150ms ease, background-color 150ms ease',
                            }}
                        >
                            <span style={{ color: step.color, display: 'flex', flexShrink: 0 }}>
                                <FrokIcon name={step.icon} />
                            </span>
                            {!collapsed && (
                                <>
                                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{step.label}</span>
                                    <FrokIcon name="DragIndicator" style={{ color: 'var(--app-text-secondary)' }} />
                                </>
                            )}
                        </div>
                    );

                    return collapsed ? (
                        <PortalTooltip key={step.type} content={step.label} position="right">
                            {stepItem}
                        </PortalTooltip>
                    ) : (
                        <React.Fragment key={step.type}>{stepItem}</React.Fragment>
                    );
                })}
            </div>

            {!collapsed && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--app-border)', flexShrink: 0, background: 'var(--app-bg)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                        Drag steps onto the canvas to add
                    </span>
                </div>
            )}
        </div>
    );
};
