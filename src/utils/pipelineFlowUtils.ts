import { Edge, Node, Position, MarkerType } from '@xyflow/react';
import dagre from 'dagre';
import { PipelineConfig, PipelineStep } from '../types';

// Define the Node Data type
export type PipelineNodeData = {
    label: string;
    type: PipelineStep['type'];
    config: Record<string, any>;
    stepIndex: number; // Important to map back to the array
    [key: string]: any;
};

// Define our specific Node type
export type PipelineNode = Node<PipelineNodeData>;

const nodeWidth = 250;
const nodeHeight = 100;

/**
 * Converts a recursive PipelineConfig into Nodes and Edges for React Flow.
 */
export const configToFlow = (config: PipelineConfig) => {
    const nodes: PipelineNode[] = [];
    const edges: Edge[] = [];

    let nodeIdCounter = 0;
    const generateId = () => `node-${nodeIdCounter++}`;

    // Helper to recursively process steps
    const processSteps = (steps: PipelineStep[], parentNodeId: string | null, sourceHandle?: string): string | null => {
        if (!steps || steps.length === 0) return null;

        let previousNodeId = parentNodeId;

        // If it's a branch (parentNodeId is set), we don't start from 'previousNodeId' for the first node,
        // we connect parent -> first node.

        let lastNodeId = null;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const nodeId = generateId();
            lastNodeId = nodeId;

            nodes.push({
                id: nodeId,
                type: 'step',
                data: {
                    label: step.name,
                    type: step.type,
                    config: step.config,
                    stepIndex: i
                },
                position: { x: 0, y: 0 },
            });

            // Connect to previous
            if (previousNodeId) {
                edges.push({
                    id: `e-${previousNodeId}-${nodeId}`,
                    source: previousNodeId,
                    target: nodeId,
                    sourceHandle: i === 0 ? sourceHandle : undefined, // Only use handle for first connection in branch
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    animated: true,
                });
            }

            previousNodeId = nodeId;

            // Handle Branches (Route/Parallel)
            if (step.branches) {
                Object.entries(step.branches).forEach(([branchKey, branchSteps]) => {
                    // Process branch
                    // The parent is the current node (previousNodeId)
                    // We need to use handles for Route nodes usually
                    processSteps(branchSteps, nodeId, branchKey);
                });
            }
        }

        return lastNodeId;
    };

    // Start Node
    const startNodeId = 'start';
    nodes.push({
        id: startNodeId,
        type: 'input',
        data: { label: 'Start', type: 'transform' as any, config: {}, stepIndex: -1 },
        position: { x: 0, y: 0 },
    });

    // Process Root Steps
    processSteps(config.steps, startNodeId);

    return getLayoutedElements(nodes, edges);
};

/**
 * Applies Dagre layout to nodes and edges.
 */
export const getLayoutedElements = (nodes: PipelineNode[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: 'TB',
        ranksep: 100,
        nodesep: 80
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

/**
 * Real implementation with Edges
 */
export const graphToConfig = (nodes: PipelineNode[], edges: Edge[]): PipelineConfig => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgesBySource = new Map<string, Edge[]>();

    edges.forEach(edge => {
        if (!edgesBySource.has(edge.source)) {
            edgesBySource.set(edge.source, []);
        }
        edgesBySource.get(edge.source)?.push(edge);
    });

    // Re-implementing a proper recursive builder

    // 1. Find the first node after 'start'
    const startNode = nodes.find(n => n.type === 'input' || n.id === 'start');
    if (!startNode) return { steps: [] };

    const outgoing = edgesBySource.get(startNode.id) || [];
    if (outgoing.length === 0) return { steps: [] };

    // Usually 'start' has one output connecting to the first real step.
    const firstStepId = outgoing[0].target;

    const buildChain = (startId: string): PipelineStep[] => {
        const chain: PipelineStep[] = [];
        let currId: string | undefined = startId;

        const visited = new Set<string>();

        while (currId && !visited.has(currId)) {
            visited.add(currId);
            const node = nodeMap.get(currId);
            if (!node) break;

            if (node.type === 'output' || node.id === 'end') break;

            const step: PipelineStep = {
                name: node.data.label,
                type: node.data.type,
                config: node.data.config,
            };

            // Check for branches
            // If this node is 'route' or 'parallel', we look for outgoing edges with sourceHandles
            const outEdges = edgesBySource.get(currId) || [];

            // Sort edges to ensure determinism?

            if (['route', 'parallel'].includes(step.type)) {
                const branches: Record<string, PipelineStep[]> = {};
                let hasBranches = false;

                outEdges.forEach(edge => {
                    if (edge.sourceHandle) {
                        hasBranches = true;
                        // Recursively build that branch
                        branches[edge.sourceHandle] = buildChain(edge.target);
                    } else {
                        // Main continuation? Route nodes usually don't have a "main" continuation that isn't a branch
                        // Unless it's a mixed mode. Let's assume all outputs from Route are branches if configured.
                    }
                });

                if (hasBranches) {
                    step.branches = branches;
                    // Route nodes usually act as terminal for that linear segment in terms of visualization.
                    chain.push(step);
                    break; // Stop linear chaining here, as control flow moves into branches.
                }
            }

            chain.push(step);

            const nextEdge = outEdges.find((e: Edge) => !e.sourceHandle);
            if (nextEdge) {
                currId = nextEdge.target;
            } else {
                currId = undefined;
            }
        }

        return chain;
    };

    // We need to preserve the pipeline type from the current config or guess it
    return {
        type: 'custom', // Default to custom if rebuilding from graph
        steps: buildChain(firstStepId)
    };
};
