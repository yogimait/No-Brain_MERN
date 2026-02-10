// server/src/agents/workflowAssembler.js
// Converts node plan to React Flow compatible graph

import { v4 as uuidv4 } from 'uuid';
import { logDecision } from './agentContext.js';
import { NODE_SPACING_X, NODE_POSITION_Y } from './constants.js';

/**
 * Generate a unique edge ID
 * @param {string} source - Source node ID
 * @param {string} target - Target node ID
 * @returns {string} - Edge ID
 */
function generateEdgeId(source, target) {
    return `e${source}-${target}`;
}

/**
 * Calculate node position based on index and category
 * @param {number} index - Node index in sequence
 * @param {string} category - Node category
 * @returns {object} - { x, y }
 */
function calculatePosition(index, category) {
    return {
        x: 100 + (index * NODE_SPACING_X),
        y: NODE_POSITION_Y[category] || 150
    };
}

/**
 * Create a React Flow node from a plan node
 * @param {object} planNode - Node from agent planner
 * @param {number} index - Position index
 * @returns {object} - React Flow node
 */
function createFlowNode(planNode, index) {
    const id = String(index + 1);
    const position = calculatePosition(index, planNode.category);

    return {
        id,
        type: 'customNode',
        position,
        data: {
            nodeId: planNode.nodeId,
            label: planNode.label,
            category: planNode.category,
            handler: planNode.nodeId,
            reason: planNode.reason,
            config: {}
        }
    };
}

/**
 * Create sequential edges between nodes
 * @param {Array} nodes - Array of React Flow nodes
 * @returns {Array} - Array of React Flow edges
 */
function createSequentialEdges(nodes) {
    const edges = [];

    for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            id: generateEdgeId(nodes[i].id, nodes[i + 1].id),
            source: nodes[i].id,
            target: nodes[i + 1].id,
            type: 'smoothstep',
            animated: true
        });
    }

    return edges;
}

/**
 * Assemble a complete workflow from planned nodes
 * @param {Array} plannedNodes - Array from agentPlanner
 * @param {object} context - AgentContext for logging
 * @param {object} metadata - Additional workflow metadata
 * @returns {object} - { nodes, edges, metadata }
 */
export function assembleWorkflow(plannedNodes, context = null, metadata = {}) {
    // Handle empty plan
    if (!plannedNodes || plannedNodes.length === 0) {
        if (context) {
            logDecision(context, 'assembler', 'empty_plan', 'No nodes to assemble');
        }
        return {
            nodes: [],
            edges: [],
            metadata: {
                ...metadata,
                nodeCount: 0,
                edgeCount: 0,
                assembledAt: new Date().toISOString()
            }
        };
    }

    // Create React Flow nodes
    const nodes = plannedNodes.map((node, index) => createFlowNode(node, index));

    // Create sequential edges
    const edges = createSequentialEdges(nodes);

    if (context) {
        logDecision(context, 'assembler', 'assembly_complete',
            `Assembled ${nodes.length} node(s) with ${edges.length} edge(s)`
        );
    }

    return {
        nodes,
        edges,
        metadata: {
            ...metadata,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            assembledAt: new Date().toISOString()
        }
    };
}

/**
 * Add a node to an existing workflow
 * @param {object} workflow - Existing workflow
 * @param {object} planNode - Node to add
 * @param {number} position - Insert position (default: end)
 * @returns {object} - Updated workflow
 */
export function addNodeToWorkflow(workflow, planNode, position = -1) {
    const nodes = [...workflow.nodes];
    const insertIndex = position === -1 ? nodes.length : position;

    const newNode = createFlowNode(planNode, insertIndex);

    // Update IDs and positions for all nodes
    nodes.splice(insertIndex, 0, newNode);

    // Reassign IDs and positions
    nodes.forEach((node, index) => {
        node.id = String(index + 1);
        node.position = calculatePosition(index, node.data.category);
    });

    // Recreate edges
    const edges = createSequentialEdges(nodes);

    return {
        ...workflow,
        nodes,
        edges,
        metadata: {
            ...workflow.metadata,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            modifiedAt: new Date().toISOString()
        }
    };
}

/**
 * Remove a node from an existing workflow
 * @param {object} workflow - Existing workflow
 * @param {string} nodeId - ID of node to remove
 * @returns {object} - Updated workflow
 */
export function removeNodeFromWorkflow(workflow, nodeId) {
    const nodes = workflow.nodes.filter(n => n.id !== nodeId);

    // Reassign IDs and positions
    nodes.forEach((node, index) => {
        node.id = String(index + 1);
        node.position = calculatePosition(index, node.data.category);
    });

    // Recreate edges
    const edges = createSequentialEdges(nodes);

    return {
        ...workflow,
        nodes,
        edges,
        metadata: {
            ...workflow.metadata,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            modifiedAt: new Date().toISOString()
        }
    };
}
