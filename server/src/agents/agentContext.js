// server/src/agents/agentContext.js
// Shared context object passed through all pipeline stages

import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new AgentContext object
 * @param {string} prompt - The user prompt
 * @returns {AgentContext} - A new context object
 */
export function createAgentContext(prompt) {
    return {
        id: uuidv4(),
        prompt: prompt || '',
        timestamp: Date.now(),
        intent: null,
        selectedNodes: [],
        workflow: { nodes: [], edges: [] },
        decisions: [],
        repairs: []
    };
}

/**
 * Logs a decision to the agent context
 * @param {AgentContext} context - The context object
 * @param {string} stage - Pipeline stage: 'intent' | 'planner' | 'assembler' | 'validator'
 * @param {string} action - What action was taken
 * @param {string} reason - Why the action was taken
 */
export function logDecision(context, stage, action, reason) {
    context.decisions.push({
        stage,
        action,
        reason,
        timestamp: Date.now()
    });
}

/**
 * Logs a repair action to the context
 * @param {AgentContext} context - The context object
 * @param {string} repair - Description of the repair
 */
export function logRepair(context, repair) {
    context.repairs.push(repair);
}

/**
 * Finalize context for API response
 * @param {AgentContext} context - The context object
 * @returns {object} - Cleaned context for response
 */
export function finalizeContext(context) {
    return {
        decisions: context.decisions,
        repairs: context.repairs,
        intent: context.intent,
        processingTime: Date.now() - context.timestamp
    };
}
