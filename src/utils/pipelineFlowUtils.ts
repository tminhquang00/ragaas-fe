import { Edge, Node, Position } from '@xyflow/react';
import dagre from 'dagre';
import { PipelineConfig, PipelineStep } from '../types/config';

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
const nodeHeight = 200; // Increased height to account for larger node content

/**
 * Converts a linear PipelineConfig into Nodes and Edges for React Flow.
 */
export const configToFlow = (config: PipelineConfig) => {
    const nodes: PipelineNode[] = [];
    const edges: Edge[] = [];

    // Create Start Node
    nodes.push({
        id: 'start',
        type: 'input', // or custom 'start'
        data: { label: 'Start', type: 'transform' as any, config: {}, stepIndex: -1 },
        position: { x: 0, y: 0 },
    });

    let previousNodeId = 'start';

    config.steps.forEach((step, index) => {
        const nodeId = `step-${index}`;

        nodes.push({
            id: nodeId,
            type: 'step', // Custom node type we will create
            data: {
                label: step.name,
                type: step.type,
                config: step.config,
                stepIndex: index
            },
            position: { x: 0, y: 0 }, // Position will be calculated by layout
        });

        edges.push({
            id: `e-${previousNodeId}-${nodeId}`,
            source: previousNodeId,
            target: nodeId,
            type: 'smoothstep',
            animated: true,
        });

        previousNodeId = nodeId;
    });

    // Create End Node
    const endNodeId = 'end';
    nodes.push({
        id: endNodeId,
        type: 'output', // or custom 'end'
        data: { label: 'End', type: 'transform' as any, config: {}, stepIndex: -99 },
        position: { x: 0, y: 0 },
    });

    edges.push({
        id: `e-${previousNodeId}-${endNodeId}`,
        source: previousNodeId,
        target: endNodeId,
        type: 'smoothstep',
        animated: true,
    });

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
        ranksep: 100, // Increased vertical separation
        nodesep: 80   // Increased horizontal separation
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
 * Converts React Flow Nodes back to PipelineConfig steps.
 * Note: This currently assumes a linear flow based on stepIndex or connection order.
 * A more robust implementation would traverse the graph.
 */
export const flowToConfig = (nodes: PipelineNode[], currentConfig: PipelineConfig): PipelineConfig => {
    // Filter out start/end nodes and sort by stepIndex to reconstruct the array
    // This is a naive implementation assuming we just modified properties, not structure.
    // For structural changes, we'd need to traverse edges.

    // Topological sort or traversal would be better for true graph editing.
    // For this MVP, let's assume valid linear sequence reconstruction.

    const stepNodes = nodes.filter(n => n.id.startsWith('step-'));

    // We strive to respect the visual order (y position) if structure changed
    stepNodes.sort((a, b) => a.position.y - b.position.y);

    const newSteps: PipelineStep[] = stepNodes.map(node => ({
        name: node.data.label,
        type: node.data.type,
        config: node.data.config
    }));

    return {
        ...currentConfig,
        steps: newSteps
    };
};
