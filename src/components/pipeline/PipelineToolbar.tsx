import React, { useState } from 'react';
import { Button } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { PortalTooltip } from '../common/PortalTooltip';

interface ToolbarItem {
    type: string;
    label: string;
    icon: string;
    color: string;
    category: 'step' | 'attachment';
}

const STEP_TYPES: ToolbarItem[] = [
    { type: 'retrieve', label: 'Retrieve', icon: 'Search', color: '#007bc0', category: 'step' },
    { type: 'generate', label: 'Generate', icon: 'SmartToy', color: '#18837e', category: 'step' },
    { type: 'classify', label: 'Classify', icon: 'Description', color: '#9c27b0', category: 'step' },
    { type: 'route', label: 'Route', icon: 'CallSplit', color: '#ed6c02', category: 'step' },
    { type: 'transform', label: 'Transform', icon: 'Refresh', color: '#0288d1', category: 'step' },
    { type: 'parallel', label: 'Parallel', icon: 'Bolt', color: '#9c27b0', category: 'step' },
    { type: 'agent', label: 'Agent', icon: 'SmartToy', color: '#c62828', category: 'step' },
    { type: 'project', label: 'Project', icon: 'OpenInNew', color: '#00695c', category: 'step' },
];

const ATTACHMENT_TYPES: ToolbarItem[] = [
    { type: 'tool', label: 'Tool', icon: 'Build', color: '#0288d1', category: 'attachment' },
    { type: 'mcp_server', label: 'MCP Server', icon: 'Cloud', color: '#7b1fa2', category: 'attachment' },
    { type: 'sub_agent', label: 'Sub-Agent', icon: 'SmartToy', color: '#c62828', category: 'attachment' },
    { type: 'worker', label: 'Worker', icon: 'Group', color: '#00695c', category: 'attachment' },
    { type: 'database', label: 'Database', icon: 'Storage', color: '#ef6c00', category: 'attachment' },
];

export const PipelineToolbar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, item: ToolbarItem) => {
        event.dataTransfer.setData('application/stepType', item.type);
        event.dataTransfer.setData('application/nodeCategory', item.category);
        event.dataTransfer.effectAllowed = 'move';
    };

    const renderItem = (item: ToolbarItem) => {
        const el = (
            <div
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                className="pipeline-step-item"
                style={{
                    marginBottom: '0.375rem',
                    border: item.category === 'attachment' ? `1px dashed ${item.color}40` : '1px solid var(--app-border)',
                    borderRadius: item.category === 'attachment' ? 6 : 2,
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0.4rem' : '0.5rem',
                    gap: '0.5rem',
                    background: 'var(--app-bg-surface)',
                    transition: 'border-color 150ms ease, background-color 150ms ease',
                }}
            >
                <span style={{ color: item.color, display: 'flex', flexShrink: 0 }}>
                    <FrokIcon name={item.icon} />
                </span>
                {!collapsed && (
                    <>
                        <span style={{ flex: 1, fontSize: '0.8rem' }}>{item.label}</span>
                        <FrokIcon name="DragIndicator" style={{ color: 'var(--app-text-secondary)', fontSize: 14 }} />
                    </>
                )}
            </div>
        );

        return collapsed ? (
            <PortalTooltip key={item.type} content={item.label} position="right">
                {el}
            </PortalTooltip>
        ) : (
            <React.Fragment key={item.type}>{el}</React.Fragment>
        );
    };

    const sectionHeader = (title: string) =>
        !collapsed ? (
            <div
                style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--app-text-secondary)',
                    fontWeight: 600,
                    padding: '0.5rem 0 0.25rem',
                    borderBottom: '1px solid var(--app-border)',
                    marginBottom: '0.375rem',
                }}
            >
                {title}
            </div>
        ) : (
            <div style={{ borderBottom: '1px solid var(--app-border)', margin: '0.25rem 0' }} />
        );

    return (
        <div
            style={{
                width: collapsed ? 52 : 210,
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
                    padding: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid var(--app-border)',
                }}
            >
                {!collapsed && (
                    <strong style={{ fontSize: '0.8rem' }}>Toolbox</strong>
                )}
                <Button mode="integrated" icon={collapsed ? 'right' : 'left'} onClick={() => setCollapsed(!collapsed)} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.375rem', minHeight: 0 }}>
                {sectionHeader('Pipeline Steps')}
                {STEP_TYPES.map(renderItem)}

                {sectionHeader('Attachments')}
                {ATTACHMENT_TYPES.map(renderItem)}
            </div>

            {!collapsed && (
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--app-border)', flexShrink: 0, background: 'var(--app-bg)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--app-text-secondary)' }}>
                        Drag items onto the canvas
                    </span>
                </div>
            )}
        </div>
    );
};
