// server/src/agents/workflowValidator.js
// Validates and auto-repairs workflows

import { logDecision, logRepair } from './agentContext.js';
import { getNodeById } from './agentPlanner.js';
import { addNodeToWorkflow, removeNodeFromWorkflow } from './workflowAssembler.js';
import { DEFAULT_INPUT_NODE, DEFAULT_OUTPUT_NODE } from './constants.js';

/**
 * Check if workflow has at least one input node
 * @param {object} workflow - Workflow to check
 * @returns {boolean}
 */
function hasInputNode(workflow) {
    return workflow.nodes.some(n => n.data?.category === 'input');
}

/**
 * Check if workflow has at least one output node
 * @param {object} workflow - Workflow to check
 * @returns {boolean}
 */
function hasOutputNode(workflow) {
    return workflow.nodes.some(n => n.data?.category === 'output');
}

/**
 * Find orphan nodes (nodes with no connections)
 * @param {object} workflow - Workflow to check
 * @returns {string[]} - Array of orphan node IDs
 */
function findOrphanNodes(workflow) {
    if (workflow.nodes.length <= 1) return [];

    const connectedNodes = new Set();

    for (const edge of workflow.edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    }

    return workflow.nodes
        .filter(n => !connectedNodes.has(n.id))
        .map(n => n.id);
}

/**
 * Detect cycles in the workflow using DFS
 * @param {object} workflow - Workflow to check
 * @returns {boolean} - True if cycles detected
 */
function hasCycles(workflow) {
    const adjacency = new Map();

    // Build adjacency list
    for (const node of workflow.nodes) {
        adjacency.set(node.id, []);
    }
    for (const edge of workflow.edges) {
        const neighbors = adjacency.get(edge.source) || [];
        neighbors.push(edge.target);
        adjacency.set(edge.source, neighbors);
    }

    const visited = new Set();
    const recursionStack = new Set();

    function dfs(nodeId) {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacency.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) return true;
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

    for (const node of workflow.nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) return true;
        }
    }

    return false;
}

/**
 * Find duplicate process nodes (same nodeId)
 * @param {object} workflow - Workflow to check
 * @returns {Array} - Array of { nodeId, duplicateIds }
 */
function findDuplicateProcessNodes(workflow) {
    const processNodes = workflow.nodes.filter(n => n.data?.category === 'process');
    const nodeIdCounts = new Map();

    for (const node of processNodes) {
        const nodeId = node.data?.nodeId;
        if (!nodeIdCounts.has(nodeId)) {
            nodeIdCounts.set(nodeId, []);
        }
        nodeIdCounts.get(nodeId).push(node.id);
    }

    const duplicates = [];
    for (const [nodeId, ids] of nodeIdCounts) {
        if (ids.length > 1) {
            duplicates.push({ nodeId, duplicateIds: ids.slice(1) });
        }
    }

    return duplicates;
}

/**
 * Validate workflow and return issues
 * @param {object} workflow - Workflow to validate
 * @returns {object} - { valid, issues }
 */
export function validateWorkflow(workflow) {
    const issues = [];

    // Check for empty workflow
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
        issues.push({ type: 'no_nodes', message: 'Workflow has no nodes' });
        return { valid: false, issues };
    }

    // Check for input node
    if (!hasInputNode(workflow)) {
        issues.push({ type: 'no_input', message: 'Workflow has no input node' });
    }

    // Check for output node
    if (!hasOutputNode(workflow)) {
        issues.push({ type: 'no_output', message: 'Workflow has no output node' });
    }

    // Check for orphan nodes
    const orphans = findOrphanNodes(workflow);
    if (orphans.length > 0) {
        issues.push({
            type: 'orphan_nodes',
            message: `Found ${orphans.length} orphan node(s)`,
            nodeIds: orphans
        });
    }

    // Check for cycles
    if (hasCycles(workflow)) {
        issues.push({ type: 'cycle_detected', message: 'Workflow contains cycles' });
    }

    // Check for duplicate process nodes
    const duplicates = findDuplicateProcessNodes(workflow);
    if (duplicates.length > 0) {
        issues.push({
            type: 'duplicate_nodes',
            message: `Found duplicate process nodes`,
            duplicates
        });
    }

    return { valid: issues.length === 0, issues };
}

/**
 * Auto-repair a workflow
 * @param {object} workflow - Workflow to repair
 * @param {object} context - AgentContext for logging
 * @returns {object} - { workflow, repairs, repaired }
 */
export function autoRepairWorkflow(workflow, context = null) {
    let repairedWorkflow = { ...workflow };
    let repaired = false;

    const validation = validateWorkflow(workflow);

    if (validation.valid) {
        return { workflow: repairedWorkflow, repairs: [], repaired: false };
    }

    for (const issue of validation.issues) {
        switch (issue.type) {
            case 'no_nodes': {
                // Add a default output logger for empty workflows
                const outputNode = getNodeById(DEFAULT_OUTPUT_NODE);
                if (outputNode) {
                    repairedWorkflow = addNodeToWorkflow(repairedWorkflow, {
                        nodeId: outputNode.id,
                        label: outputNode.label,
                        category: 'output',
                        reason: 'Auto-added for empty workflow'
                    }, 0);
                    repaired = true;
                    const repairMsg = 'Added outputLogger for empty workflow';
                    if (context) {
                        logRepair(context, repairMsg);
                        logDecision(context, 'validator', 'auto_repair', repairMsg);
                    }
                }
                break;
            }

            case 'no_input': {
                const inputNode = getNodeById(DEFAULT_INPUT_NODE);
                if (inputNode) {
                    repairedWorkflow = addNodeToWorkflow(repairedWorkflow, {
                        nodeId: inputNode.id,
                        label: inputNode.label,
                        category: 'input',
                        reason: 'Auto-added missing input node'
                    }, 0);
                    repaired = true;
                    const repairMsg = `Inserted ${DEFAULT_INPUT_NODE} as default input`;
                    if (context) {
                        logRepair(context, repairMsg);
                        logDecision(context, 'validator', 'auto_repair', repairMsg);
                    }
                }
                break;
            }

            case 'no_output': {
                const outputNode = getNodeById(DEFAULT_OUTPUT_NODE);
                if (outputNode) {
                    repairedWorkflow = addNodeToWorkflow(repairedWorkflow, {
                        nodeId: outputNode.id,
                        label: outputNode.label,
                        category: 'output',
                        reason: 'Auto-added missing output node'
                    }, -1);
                    repaired = true;
                    const repairMsg = `Added ${DEFAULT_OUTPUT_NODE} as default output`;
                    if (context) {
                        logRepair(context, repairMsg);
                        logDecision(context, 'validator', 'auto_repair', repairMsg);
                    }
                }
                break;
            }

            case 'orphan_nodes': {
                // For orphan nodes in a sequential workflow, we just rebuild edges
                // The assembler already creates sequential edges, so orphans shouldn't happen
                // But if they do, we log it
                if (context) {
                    logDecision(context, 'validator', 'orphan_warning',
                        `Orphan nodes detected but edges are sequential - no action needed`
                    );
                }
                break;
            }

            case 'cycle_detected': {
                // Cycles shouldn't happen in sequential workflows
                // Log warning but don't modify
                if (context) {
                    logDecision(context, 'validator', 'cycle_warning',
                        'Cycle detected - manual review recommended'
                    );
                }
                break;
            }

            case 'duplicate_nodes': {
                // Remove duplicate process nodes (keep first)
                for (const dup of issue.duplicates) {
                    for (const duplicateId of dup.duplicateIds) {
                        repairedWorkflow = removeNodeFromWorkflow(repairedWorkflow, duplicateId);
                        repaired = true;
                        const repairMsg = `Removed duplicate ${dup.nodeId} node`;
                        if (context) {
                            logRepair(context, repairMsg);
                            logDecision(context, 'validator', 'auto_repair', repairMsg);
                        }
                    }
                }
                break;
            }
        }
    }

    // Re-validate after repairs
    const finalValidation = validateWorkflow(repairedWorkflow);

    if (context && !finalValidation.valid) {
        logDecision(context, 'validator', 'repair_incomplete',
            `${finalValidation.issues.length} issue(s) remaining after auto-repair`
        );
    }

    return {
        workflow: repairedWorkflow,
        repairs: context ? context.repairs : [],
        repaired
    };
}

/**
 * Validate and repair in one step
 * @param {object} workflow - Workflow to process
 * @param {object} context - AgentContext
 * @returns {object} - { workflow, valid, repairs }
 */
export function validateAndRepair(workflow, context = null) {
    const initial = validateWorkflow(workflow);

    if (initial.valid) {
        if (context) {
            logDecision(context, 'validator', 'validation_passed',
                'Workflow passed validation with no issues'
            );
        }
        return { workflow, valid: true, repairs: [] };
    }

    if (context) {
        logDecision(context, 'validator', 'issues_found',
            `Found ${initial.issues.length} issue(s): ${initial.issues.map(i => i.type).join(', ')}`
        );
    }

    const { workflow: repairedWorkflow, repairs, repaired } = autoRepairWorkflow(workflow, context);
    const final = validateWorkflow(repairedWorkflow);

    return {
        workflow: repairedWorkflow,
        valid: final.valid,
        repairs,
        repaired,
        remainingIssues: final.issues
    };
}
