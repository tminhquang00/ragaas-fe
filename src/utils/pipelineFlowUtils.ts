import { Edge, Node, Position, MarkerType } from '@xyflow/react';
import dagre from 'dagre';
import {
    PipelineGraph,
    GraphNode,
    GraphEdge,
    GraphNodeType,
    ConnectionRules,
    ATTACHMENT_NODE_TYPES,
    PipelineConfig,
    PipelineStep,
} from '../types';

// ── React Flow node data ──

export type PipelineNodeData = {
    label: string;
    type: GraphNodeType;
    config: Record<string, any>;
    parentId?: string | null;
    branchId?: string | null;
    branchKeys?: string[];
    [key: string]: any;
};

export type PipelineNode = Node<PipelineNodeData>;

// ── Constants ──

const STEP_NODE_WIDTH = 250;
const STEP_NODE_HEIGHT = 100;
const ATTACHMENT_NODE_WIDTH = 180;
const ATTACHMENT_NODE_HEIGHT = 70;

export function isAttachmentType(type: GraphNodeType | string): boolean {
    return ATTACHMENT_NODE_TYPES.includes(type as GraphNodeType);
}

// ── Backend Graph → React Flow ──

export function graphToReactFlow(graph: PipelineGraph): { nodes: PipelineNode[]; edges: Edge[] } {
    const nodes: PipelineNode[] = graph.nodes.map((gn) => {
        const attachment = isAttachmentType(gn.type);
        return {
            id: gn.id,
            type: attachment ? 'attachment' : 'step',
            position: gn.position,
            data: {
                label: gn.label,
                type: gn.type,
                config: gn.data ?? {},
                parentId: gn.parent_id ?? null,
                branchId: gn.branch_id ?? null,
            },
        };
    });

    const edges: Edge[] = graph.edges.map((ge) => edgeFromGraph(ge));

    return getLayoutedElements(nodes, edges);
}

function edgeFromGraph(ge: GraphEdge): Edge {
    const base: Edge = {
        id: ge.id,
        source: ge.source,
        target: ge.target,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
    };

    if (ge.edge_type === 'attachment') {
        return {
            ...base,
            style: { strokeDasharray: '6 3', opacity: 0.7 },
            className: 'edge-attachment',
        };
    }

    if (ge.edge_type === 'branch') {
        return {
            ...base,
            label: ge.label ?? '',
            sourceHandle: ge.label ?? undefined,
            className: 'edge-branch',
        };
    }

    return base;
}

// ── React Flow → Backend Graph ──

export function reactFlowToGraph(nodes: PipelineNode[], edges: Edge[]): PipelineGraph {
    const graphNodes: GraphNode[] = nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        label: n.data.label,
        position: n.position,
        data: n.data.config ?? {},
        parent_id: n.data.parentId ?? null,
        branch_id: n.data.branchId ?? null,
    }));

    const graphEdges: GraphEdge[] = edges.map((e) => {
        let edge_type: GraphEdge['edge_type'] = 'flow';
        if (e.className === 'edge-attachment' || e.style?.strokeDasharray) {
            edge_type = 'attachment';
        } else if (e.className === 'edge-branch' || e.sourceHandle) {
            edge_type = 'branch';
        }
        return {
            id: e.id,
            source: e.source,
            target: e.target,
            label: typeof e.label === 'string' ? e.label : undefined,
            edge_type,
        };
    });

    return { nodes: graphNodes, edges: graphEdges };
}

// ── Connection Validation ──

export function validateConnection(
    sourceType: string,
    targetType: string,
    rules: ConnectionRules
): { valid: boolean; edgeType: GraphEdge['edge_type'] } {
    if (isAttachmentType(targetType as GraphNodeType)) {
        const match = rules.valid_edges.find(
            (r) => r.from_type === sourceType && r.to_type === targetType && r.edge_type === 'attachment'
        );
        return match ? { valid: true, edgeType: 'attachment' } : { valid: false, edgeType: 'attachment' };
    }

    if (isAttachmentType(sourceType as GraphNodeType)) {
        const match = rules.valid_edges.find(
            (r) => r.from_type === sourceType && r.to_type === targetType && r.edge_type === 'attachment'
        );
        return match ? { valid: true, edgeType: 'attachment' } : { valid: false, edgeType: 'attachment' };
    }

    const match = rules.valid_edges.find(
        (r) => r.from_type === sourceType && r.to_type === targetType && (r.edge_type === 'flow' || r.edge_type === 'branch')
    );
    return match ? { valid: true, edgeType: match.edge_type } : { valid: false, edgeType: 'flow' };
}

// ── Dagre Layout ──

export function getLayoutedElements(nodes: PipelineNode[], edges: Edge[]): { nodes: PipelineNode[]; edges: Edge[] } {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 300, nodesep: 200 });

    nodes.forEach((node) => {
        const isAttachment = node.type === 'attachment';
        dagreGraph.setNode(node.id, {
            width: isAttachment ? ATTACHMENT_NODE_WIDTH : STEP_NODE_WIDTH,
            height: isAttachment ? ATTACHMENT_NODE_HEIGHT : STEP_NODE_HEIGHT,
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const pos = dagreGraph.node(node.id);
        const isAttachment = node.type === 'attachment';
        const w = isAttachment ? ATTACHMENT_NODE_WIDTH : STEP_NODE_WIDTH;
        const h = isAttachment ? ATTACHMENT_NODE_HEIGHT : STEP_NODE_HEIGHT;

        return {
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            position: { x: pos.x - w / 2, y: pos.y - h / 2 },
        };
    });

    return { nodes: layoutedNodes, edges };
}

// ── Legacy helpers (kept for backward compat with PipelineConfig) ──

export const configToFlow = (config: PipelineConfig): { nodes: PipelineNode[]; edges: Edge[] } => {
    const nodes: PipelineNode[] = [];
    const edges: Edge[] = [];
    let nodeIdCounter = 0;
    const generateId = () => `node-${nodeIdCounter++}`;

    const processSteps = (steps: PipelineStep[], parentNodeId: string | null, sourceHandle?: string): string | null => {
        if (!steps || steps.length === 0) return null;
        let previousNodeId = parentNodeId;
        let lastNodeId = null;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const nodeId = generateId();
            lastNodeId = nodeId;

            const stepBranches = step.branches || (step.config?.branches as Record<string, PipelineStep[]> | undefined);
            const branchKeys = stepBranches ? Object.keys(stepBranches) : [];

            nodes.push({
                id: nodeId,
                type: 'step',
                data: {
                    label: step.name,
                    type: (step.type ?? 'transform') as GraphNodeType,
                    config: step.config || {},
                    branchKeys,
                },
                position: { x: 0, y: 0 },
            });

            if (previousNodeId) {
                edges.push({
                    id: `e-${previousNodeId}-${nodeId}`,
                    source: previousNodeId,
                    target: nodeId,
                    sourceHandle: i === 0 ? sourceHandle : undefined,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }

            previousNodeId = nodeId;

            if (stepBranches) {
                Object.entries(stepBranches).forEach(([branchKey, branchSteps]) => {
                    processSteps(branchSteps as PipelineStep[], nodeId, branchKey);
                });
            }
        }
        return lastNodeId;
    };

    const startNodeId = 'start';
    nodes.push({
        id: startNodeId,
        type: 'input' as any,
        data: { label: 'Start', type: 'transform' as GraphNodeType, config: {} },
        position: { x: 0, y: 0 },
    });

    processSteps(config.steps || [], startNodeId);
    return getLayoutedElements(nodes, edges);
};

export const graphToConfig = (nodes: PipelineNode[], edges: Edge[]): PipelineConfig => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edgesBySource = new Map<string, Edge[]>();
    edges.forEach((edge) => {
        if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
        edgesBySource.get(edge.source)!.push(edge);
    });

    const startNode = nodes.find((n) => n.type === ('input' as any) || n.id === 'start');
    if (!startNode) return { type: 'custom', steps: [] };

    const outgoing = edgesBySource.get(startNode.id) || [];
    if (outgoing.length === 0) return { type: 'custom', steps: [] };
    const firstStepId = outgoing[0].target;

    const buildChain = (startId: string): PipelineStep[] => {
        const chain: PipelineStep[] = [];
        let currId: string | undefined = startId;
        const visited = new Set<string>();

        while (currId && !visited.has(currId)) {
            visited.add(currId);
            const node = nodeMap.get(currId);
            if (!node || node.type === ('output' as any) || node.id === 'end') break;

            const step: PipelineStep = { name: node.data.label, type: node.data.type as PipelineStep['type'], config: node.data.config };
            const outEdges: Edge[] = edgesBySource.get(currId) || [];

            if (['route', 'parallel'].includes(step.type || '')) {
                const branches: Record<string, PipelineStep[]> = {};
                let hasBranches = false;
                outEdges.forEach((edge: Edge) => {
                    if (edge.sourceHandle) {
                        hasBranches = true;
                        branches[edge.sourceHandle] = buildChain(edge.target);
                    }
                });
                if (hasBranches) {
                    step.config = { ...step.config, branches };
                    chain.push(step);
                    break;
                }
            }

            chain.push(step);
            const nextEdge: Edge | undefined = outEdges.find((e: Edge) => !e.sourceHandle);
            currId = nextEdge ? nextEdge.target : undefined;
        }
        return chain;
    };

    return { type: 'custom', steps: buildChain(firstStepId) };
};
