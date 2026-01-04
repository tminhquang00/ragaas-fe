import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider,
    Node,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';

import { StepNode } from './StepNode';
import { PipelinePropertyPanel } from './PipelinePropertyPanel';
import { PipelineToolbar } from './PipelineToolbar';
import { PipelineConfig } from '../../types';
import { configToFlow, graphToConfig, PipelineNode } from '../../utils/pipelineFlowUtils';

interface PipelineEditorProps {
    initialConfig: PipelineConfig;
    onConfigChange?: (config: PipelineConfig) => void;
}

function PipelineEditorContent({ initialConfig, onConfigChange }: PipelineEditorProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // State
    const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);

    const nodeTypes = useMemo(() => ({
        step: StepNode,
    }), []);

    const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const isInitialMount = useRef(true);

    // Initial load
    useEffect(() => {
        if (isInitialMount.current) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = configToFlow(initialConfig);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            isInitialMount.current = false;
        }
    }, [initialConfig, setNodes, setEdges]);

    // Sync back to config on changes
    useEffect(() => {
        if (!onConfigChange || isInitialMount.current) return;

        const timer = setTimeout(() => {
            // Use graphToConfig which respects edges
            const newConfig = graphToConfig(nodes, edges);
            onConfigChange(newConfig);
        }, 500);

        return () => clearTimeout(timer);
    }, [nodes, edges, onConfigChange]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // -- Drag & Drop Logic --
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const stepType = event.dataTransfer.getData('application/stepType');
            if (typeof stepType === 'undefined' || !stepType) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newIndex = nodes.length;

            const newNode: PipelineNode = {
                id: `step-${Date.now()}`,
                type: 'step',
                position,
                data: {
                    label: `New ${stepType}`,
                    type: stepType as any,
                    config: {},
                    stepIndex: newIndex
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
        },
        [screenToFlowPosition, nodes, setNodes]
    );

    // -- Selection Logic --
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node as PipelineNode);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // -- Update & Delete Logic --
    const onUpdateNode = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: newData };
                }
                return node;
            })
        );
        setSelectedNode((prev) => prev && prev.id === nodeId ? { ...prev, data: newData } : prev);
    }, [setNodes]);

    const onDeleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNode(null);
    }, [setNodes, setEdges]);

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                height: 600,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.default',
                overflow: 'hidden'
            }}
        >
            <PipelineToolbar />

            <Box sx={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background gap={12} size={1} />
                    <Controls />
                </ReactFlow>
            </Box>

            <PipelinePropertyPanel
                selectedNode={selectedNode}
                onUpdateNode={onUpdateNode}
                onDeleteNode={onDeleteNode}
            />
        </Box>
    );
}

export default function PipelineEditor(props: PipelineEditorProps) {
    return (
        <ReactFlowProvider>
            <PipelineEditorContent {...props} />
        </ReactFlowProvider>
    );
}
