// server/src/agents/agentPlanner.js
// Maps intents to nodes using capability matching

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logDecision } from './agentContext.js';
import { CATEGORY_ORDER, DEFAULT_INPUT_NODE, DEFAULT_OUTPUT_NODE } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load node registry
let nodeRegistry = null;

function loadRegistry() {
    if (nodeRegistry) return nodeRegistry;

    try {
        const registryPath = join(__dirname, '../registry/nodeRegistry.json');
        const registryData = readFileSync(registryPath, 'utf-8');
        nodeRegistry = JSON.parse(registryData);
        return nodeRegistry;
    } catch (error) {
        console.error('Failed to load node registry:', error.message);
        return { nodes: [] };
    }
}

/**
 * Get all nodes from registry
 * @returns {Array} - Array of node definitions
 */
function getNodes() {
    const registry = loadRegistry();
    return registry.nodes || [];
}

/**
 * Get nodes by category
 * @param {string} category - 'input' | 'process' | 'output'
 * @returns {Array} - Nodes in that category
 */
function getNodesByCategory(category) {
    return getNodes().filter(node => node.category === category);
}

/**
 * Find best matching node for an action
 * @param {string} actionType - The action to match (e.g., 'fetch', 'summarize')
 * @param {number} intentConfidence - Confidence from intent parser
 * @returns {object|null} - { nodeId, reason, score } or null
 */
function findBestNodeForAction(actionType, intentConfidence = 1.0) {
    const nodes = getNodes();
    let bestMatch = null;
    let bestScore = 0;

    for (const node of nodes) {
        for (const capability of node.capabilities) {
            if (capability.action === actionType) {
                // Calculate match score
                const capabilityScore = capability.strength;
                const priorityScore = 1 / (node.priority || 1); // Lower priority = higher score
                const fallbackPenalty = node.isFallback ? 0.1 : 0;

                const totalScore = (capabilityScore * intentConfidence * priorityScore) - fallbackPenalty;

                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestMatch = {
                        nodeId: node.id,
                        category: node.category,
                        label: node.label,
                        reason: `Matched '${actionType}' with capability score ${capability.strength}`,
                        score: Math.round(totalScore * 100) / 100,
                        isFallback: node.isFallback || false
                    };
                }
            }
        }
    }

    return bestMatch;
}

/**
 * Map output keywords to specific nodes
 * @param {string[]} outputs - Output types from intent (e.g., ['email', 'slack'])
 * @returns {Array} - Array of { nodeId, reason, score }
 */
function mapOutputsToNodes(outputs) {
    const outputMap = {
        email: 'emailGenerator',
        slack: 'slackSender',
        sms: 'smsSender',
        twitter: 'twitterApi',
        instagram: 'instagramApi',
        linkedin: 'linkedinApi',
        sheets: 'googleSheets',
        s3: 's3Upload',
        webhook: 'webhookTrigger',
        file: 's3Upload'
    };

    const result = [];
    const nodes = getNodes();

    for (const output of outputs) {
        const nodeId = outputMap[output];
        if (nodeId) {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                result.push({
                    nodeId: node.id,
                    category: 'output',
                    label: node.label,
                    reason: `Explicit output target: ${output}`,
                    score: 0.95
                });
            }
        }
    }

    return result;
}

/**
 * Remove duplicate nodes, keeping highest score
 * @param {Array} nodes - Array of node selections
 * @returns {Array} - Deduplicated array
 */
function deduplicateNodes(nodes) {
    const seen = new Map();

    for (const node of nodes) {
        const existing = seen.get(node.nodeId);
        if (!existing || node.score > existing.score) {
            seen.set(node.nodeId, node);
        }
    }

    return Array.from(seen.values());
}

/**
 * Sort nodes by category order (input → process → output)
 * @param {Array} nodes - Array of node selections
 * @returns {Array} - Sorted array
 */
function sortByCategory(nodes) {
    return nodes.sort((a, b) => {
        const orderA = CATEGORY_ORDER.indexOf(a.category);
        const orderB = CATEGORY_ORDER.indexOf(b.category);

        if (orderA !== orderB) return orderA - orderB;

        // Within same category, sort by score descending
        return b.score - a.score;
    });
}

/**
 * Plan a workflow from parsed intent
 * @param {object} intent - Parsed intent from intentParser
 * @param {object} context - AgentContext for decision logging
 * @returns {Array} - Array of { nodeId, reason, category }
 */
export function planWorkflow(intent, context = null) {
    const selectedNodes = [];

    // Handle no actions case
    if (!intent || !intent.actions || intent.actions.length === 0) {
        if (context) {
            logDecision(context, 'planner', 'no_actions', 'No actionable intents found');
        }
        return [];
    }

    // Step 1: Match actions to nodes
    for (const action of intent.actions) {
        const match = findBestNodeForAction(action.type, action.confidence);
        if (match) {
            selectedNodes.push(match);
            if (context) {
                logDecision(context, 'planner', 'action_matched',
                    `${action.type} → ${match.nodeId} (score: ${match.score})`
                );
            }
        } else {
            if (context) {
                logDecision(context, 'planner', 'action_unmatched',
                    `No node found for action: ${action.type}`
                );
            }
        }
    }

    // Step 2: Add explicit output nodes
    if (intent.outputs && intent.outputs.length > 0) {
        const outputNodes = mapOutputsToNodes(intent.outputs);
        selectedNodes.push(...outputNodes);
        if (context && outputNodes.length > 0) {
            logDecision(context, 'planner', 'outputs_added',
                `Added ${outputNodes.length} explicit output node(s): ${outputNodes.map(n => n.nodeId).join(', ')}`
            );
        }
    }

    // Step 3: Deduplicate (keep highest score)
    const uniqueNodes = deduplicateNodes(selectedNodes);

    // Step 4: Sort by category order
    const sortedNodes = sortByCategory(uniqueNodes);

    // Step 5: Ensure we have at least one input node
    const hasInput = sortedNodes.some(n => n.category === 'input');
    if (!hasInput && sortedNodes.length > 0) {
        const nodes = getNodes();
        const defaultInput = nodes.find(n => n.id === DEFAULT_INPUT_NODE);
        if (defaultInput) {
            sortedNodes.unshift({
                nodeId: defaultInput.id,
                category: 'input',
                label: defaultInput.label,
                reason: 'Added default input node (no input detected)',
                score: 0.5,
                isFallback: true
            });
            if (context) {
                logDecision(context, 'planner', 'default_input_added',
                    `Added ${DEFAULT_INPUT_NODE} as default input`
                );
            }
        }
    }

    // Step 6: Ensure we have at least one output node
    const hasOutput = sortedNodes.some(n => n.category === 'output');
    if (!hasOutput && sortedNodes.length > 0) {
        const nodes = getNodes();
        const defaultOutput = nodes.find(n => n.id === DEFAULT_OUTPUT_NODE);
        if (defaultOutput) {
            sortedNodes.push({
                nodeId: defaultOutput.id,
                category: 'output',
                label: defaultOutput.label,
                reason: 'Added default output node (no output detected)',
                score: 0.5,
                isFallback: true
            });
            if (context) {
                logDecision(context, 'planner', 'default_output_added',
                    `Added ${DEFAULT_OUTPUT_NODE} as default output`
                );
            }
        }
    }

    if (context) {
        logDecision(context, 'planner', 'plan_complete',
            `Final plan: ${sortedNodes.length} node(s) - ${sortedNodes.map(n => n.nodeId).join(' → ')}`
        );
    }

    return sortedNodes;
}

/**
 * Get available node types from registry
 * @returns {string[]} - Array of node IDs
 */
export function getAvailableNodeTypes() {
    return getNodes().map(n => n.id);
}

/**
 * Check if a node type is valid
 * @param {string} nodeId - Node ID to check
 * @returns {boolean}
 */
export function isValidNodeType(nodeId) {
    return getNodes().some(n => n.id === nodeId);
}

/**
 * Get node definition by ID
 * @param {string} nodeId - Node ID
 * @returns {object|null} - Node definition or null
 */
export function getNodeById(nodeId) {
    return getNodes().find(n => n.id === nodeId) || null;
}
