import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider,
    Node,
    useReactFlow,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PipelinePropertyPanel } from './PipelinePropertyPanel';
import { PipelineToolbar } from './PipelineToolbar';
import { pipelineNodeTypes } from './nodeTypes';
import { RAGaaSClient } from '../../services/api';
import {
    PipelineBuilderMetadata,
    ValidationResult,
    GraphNodeType,
} from '../../types';
import {
    PipelineNode,
    graphToReactFlow,
    reactFlowToGraph,
    getLayoutedElements,
    validateConnection,
} from '../../utils/pipelineFlowUtils';
import { FrokIcon } from '../../utils/iconAdapter';

interface PipelineEditorProps {
    projectId: string;
    apiClient: RAGaaSClient;
    readOnly?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

function PipelineEditorContent({ projectId, apiClient, readOnly, onDirtyChange }: PipelineEditorProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
    const [metadata, setMetadata] = useState<PipelineBuilderMetadata | null>(null);
    const [pipelineType, setPipelineType] = useState<string>('custom');
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadedRef = useRef(false);

    // ── Load metadata + graph on mount ──
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [meta, graphResp] = await Promise.all([
                    apiClient.getPipelineMetadata().catch(() => null),
                    apiClient.getPipelineGraph(projectId),
                ]);

                if (meta) setMetadata(meta);
                setPipelineType(graphResp.pipeline_type);
                setValidation(graphResp.validation);

                const { nodes: rfNodes, edges: rfEdges } = graphToReactFlow(graphResp.graph);
                setNodes(rfNodes);
                setEdges(rfEdges);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load pipeline graph');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [projectId, apiClient, setNodes, setEdges]);

    // ── Dirty tracking ──
    const markDirty = useCallback(() => {
        if (!isDirty) {
            setIsDirty(true);
            onDirtyChange?.(true);
        }
    }, [isDirty, onDirtyChange]);

    // ── Save ──
    const handleSave = useCallback(async () => {
        if (readOnly || saving) return;
        setSaving(true);
        setError(null);
        try {
            const graph = reactFlowToGraph(nodes, edges);
            const resp = await apiClient.savePipelineGraph(projectId, { graph, pipeline_type: pipelineType });
            setValidation(resp.validation);

            const { nodes: rfNodes, edges: rfEdges } = graphToReactFlow(resp.graph);
            setNodes(rfNodes);
            setEdges(rfEdges);
            setIsDirty(false);
            onDirtyChange?.(false);
        } catch (err: any) {
            const msg = err?.message || 'Failed to save pipeline';
            setError(msg);
            if (err?.status === 422) {
                try {
                    const detail = JSON.parse(msg);
                    if (detail.errors || detail.warnings) {
                        setValidation({ valid: false, errors: detail.errors || [], warnings: detail.warnings || [] });
                    }
                } catch { /* not JSON */ }
            }
        } finally {
            setSaving(false);
        }
    }, [nodes, edges, pipelineType, projectId, apiClient, readOnly, saving, setNodes, setEdges, onDirtyChange]);

    // ── Auto layout ──
    const handleAutoLayout = useCallback(() => {
        const { nodes: laid, edges: laidEdges } = getLayoutedElements(nodes, edges);
        setNodes(laid);
        setEdges(laidEdges);
        markDirty();
    }, [nodes, edges, setNodes, setEdges, markDirty]);

    // ── Connection ──
    const onConnect = useCallback(
        (params: Connection) => {
            if (readOnly) return;
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);
            if (!sourceNode || !targetNode) return;

            const sourceType = sourceNode.data.type;
            const targetType = targetNode.data.type;

            if (metadata?.connection_rules) {
                const result = validateConnection(sourceType, targetType, metadata.connection_rules);
                if (!result.valid) return;

                const edgeBase: Edge = {
                    id: `e-${params.source}-${params.target}-${Date.now()}`,
                    source: params.source!,
                    target: params.target!,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                };

                if (result.edgeType === 'attachment') {
                    setEdges((eds) => [
                        ...eds,
                        { ...edgeBase, style: { strokeDasharray: '6 3', opacity: 0.7 }, className: 'edge-attachment' },
                    ]);
                } else {
                    setEdges((eds) => [...eds, edgeBase]);
                }
            } else {
                setEdges((eds) => addEdge(params, eds));
            }
            markDirty();
        },
        [nodes, metadata, readOnly, setEdges, markDirty],
    );

    // ── Drag & Drop ──
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            if (readOnly) return;
            event.preventDefault();

            const stepType = event.dataTransfer.getData('application/stepType');
            const nodeCategory = event.dataTransfer.getData('application/nodeCategory') || 'step';
            if (!stepType) return;

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const isAttachment = nodeCategory === 'attachment';

            const newNode: PipelineNode = {
                id: `${stepType}-${Date.now()}`,
                type: isAttachment ? 'attachment' : 'step',
                position,
                data: {
                    label: `New ${stepType.replace(/_/g, ' ')}`,
                    type: stepType as GraphNodeType,
                    config: {},
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
            markDirty();
        },
        [readOnly, screenToFlowPosition, setNodes, markDirty],
    );

    // ── Selection ──
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node as PipelineNode);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // ── Node update / delete ──
    const onUpdateNode = useCallback(
        (nodeId: string, newData: any) => {
            setNodes((nds) =>
                nds.map((node) => (node.id === nodeId ? { ...node, data: newData } : node)),
            );
            setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, data: newData } : prev));
            markDirty();
        },
        [setNodes, markDirty],
    );

    const onDeleteNode = useCallback(
        (nodeId: string) => {
            if (readOnly) return;
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
            setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
            setSelectedNode(null);
            markDirty();
        },
        [readOnly, setNodes, setEdges, markDirty],
    );

    // ── Render ──

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
                <FrokIcon name="HourglassEmpty" />
                <span>Loading pipeline...</span>
            </div>
        );
    }

    return (
        <div
            className="pipeline-editor-container"
            style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', border: '1px solid var(--app-border, #c1c7cc)', borderRadius: 4, overflow: 'hidden' }}
        >
            {/* ── Top action bar ── */}
            <div
                className="pipeline-action-bar"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    borderBottom: '1px solid var(--app-border)',
                    background: 'var(--app-bg)',
                    flexShrink: 0,
                }}
            >
                {!readOnly && (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            className="pipeline-btn pipeline-btn-primary"
                        >
                            <FrokIcon name="Save" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handleAutoLayout} className="pipeline-btn">
                            <FrokIcon name="AccountTree" /> Auto Layout
                        </button>
                    </>
                )}

                <div style={{ flex: 1 }} />

                {/* Validation status */}
                {validation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                        {validation.valid ? (
                            <span style={{ color: '#18837e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FrokIcon name="CheckCircle" /> Valid
                            </span>
                        ) : (
                            <span style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FrokIcon name="Error" /> {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {validation.warnings.length > 0 && (
                            <span style={{ color: '#ed6c02', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FrokIcon name="Warning" /> {validation.warnings.length}
                            </span>
                        )}
                    </div>
                )}

                <span style={{ fontSize: '0.7rem', color: 'var(--app-text-secondary)' }}>
                    {pipelineType} &middot; {nodes.length} nodes
                </span>
            </div>

            {/* Validation detail bar */}
            {validation && !validation.valid && validation.errors.length > 0 && (
                <div style={{ padding: '0.4rem 0.75rem', background: '#fdecea', borderBottom: '1px solid #f5c6cb', fontSize: '0.75rem', color: '#721c24' }}>
                    {validation.errors.map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </div>
            )}
            {validation && validation.warnings.length > 0 && (
                <div style={{ padding: '0.4rem 0.75rem', background: '#fff3cd', borderBottom: '1px solid #ffeeba', fontSize: '0.75rem', color: '#856404' }}>
                    {validation.warnings.map((w, i) => (
                        <div key={i}>{w}</div>
                    ))}
                </div>
            )}

            {error && (
                <div style={{ padding: '0.4rem 0.75rem', background: '#fdecea', borderBottom: '1px solid #f5c6cb', fontSize: '0.75rem', color: '#721c24' }}>
                    {error}
                </div>
            )}

            {/* ── Main body ── */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <PipelineToolbar />

                <div style={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={readOnly ? undefined : onNodesChange}
                        onEdgesChange={readOnly ? undefined : onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        nodeTypes={pipelineNodeTypes}
                        fitView
                        nodesDraggable={!readOnly}
                        nodesConnectable={!readOnly}
                        elementsSelectable
                    >
                        <Background gap={16} size={1} />
                        <Controls />
                        <MiniMap
                            nodeStrokeWidth={3}
                            pannable
                            zoomable
                            style={{ border: '1px solid var(--app-border)' }}
                        />
                    </ReactFlow>
                </div>

                <PipelinePropertyPanel
                    selectedNode={selectedNode}
                    onUpdateNode={readOnly ? () => {} : onUpdateNode}
                    onDeleteNode={readOnly ? undefined : onDeleteNode}
                    metadata={metadata}
                    currentProjectId={projectId}
                />
            </div>
        </div>
    );
}

export default function PipelineEditor(props: PipelineEditorProps) {
    return (
        <ReactFlowProvider>
            <PipelineEditorContent {...props} />
        </ReactFlowProvider>
    );
}
