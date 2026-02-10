// server/src/controllers/agent.controller.js
// Controller for agentic workflow generation

import { createAgentContext, finalizeContext, logDecision } from '../agents/agentContext.js';
import { parseIntent, isActionableIntent } from '../agents/intentParser.js';
import { planWorkflow } from '../agents/agentPlanner.js';
import { assembleWorkflow } from '../agents/workflowAssembler.js';
import { validateAndRepair } from '../agents/workflowValidator.js';
import { API_VERSION, DEFAULT_OUTPUT_NODE } from '../agents/constants.js';
// ❌ REMOVED: Gemini import - agentic mode must NEVER depend on AI
// import { generateWorkflowFromText } from '../services/nlp/textToWorkflow.service.js';

/**
 * Generate workflow from prompt using agentic system
 * POST /api/agent/generate-workflow
 * 
 * IMPORTANT: This endpoint is 100% rule-based, NO AI calls.
 * For AI mode, use /api/nlp/generate instead.
 */
export async function generateWorkflow(req, res) {
    const startTime = Date.now();

    try {
        const { prompt, mode = 'agentic' } = req.body;

        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required and must be a non-empty string'
            });
        }

        // Hard gate: Redirect AI mode requests to the correct endpoint
        if (mode === 'ai') {
            return res.status(400).json({
                success: false,
                error: 'AI mode is not available on this endpoint. Use /api/nlp/generate for AI-powered generation.',
                suggestion: 'Set mode to "agentic" or call /api/nlp/generate for AI mode'
            });
        }

        console.log('🧠 Agentic pipeline started for prompt:', prompt.substring(0, 50) + '...');

        // Create agent context for explainability
        const context = createAgentContext(prompt);

        // Step 1: Parse intent
        const intent = parseIntent(prompt, context);
        context.intent = intent;

        // Step 2: Handle no-op case (no actionable intent)
        if (!isActionableIntent(intent)) {
            logDecision(context, 'planner', 'no_op_workflow',
                'No actionable intent found, creating minimal output workflow'
            );

            // Create minimal workflow with just output logger
            const minimalWorkflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    position: { x: 100, y: 100 },
                    data: {
                        nodeId: DEFAULT_OUTPUT_NODE,
                        label: 'Output Logger',
                        category: 'output',
                        handler: DEFAULT_OUTPUT_NODE,
                        reason: 'No actionable intent found'
                    }
                }],
                edges: [],
                metadata: {
                    prompt,
                    generatedAt: new Date().toISOString()
                }
            };

            context.repairs.push('No actionable intent found, added output_logger');

            return res.json({
                success: true,
                version: API_VERSION,
                source: 'agentic',
                mode: 'agentic',
                workflow: minimalWorkflow,
                context: finalizeContext(context)
            });
        }

        // Step 3: Plan workflow
        const plannedNodes = planWorkflow(intent, context);
        context.selectedNodes = plannedNodes.map(n => n.nodeId);

        // Step 4: Assemble workflow
        const assembledWorkflow = assembleWorkflow(plannedNodes, context, {
            prompt,
            generatedFrom: 'agentic'
        });

        // Step 5: Validate and repair
        const { workflow: finalWorkflow, valid, repairs } = validateAndRepair(
            assembledWorkflow,
            context
        );
        context.workflow = finalWorkflow;

        // Calculate execution time
        const executionTime = Date.now() - startTime;

        // Build response
        const response = {
            success: true,
            version: API_VERSION,
            source: 'agentic',
            mode: 'agentic',
            workflow: finalWorkflow,
            context: finalizeContext(context),
            executionTime: `${executionTime}ms`
        };

        // Add warning if repairs were made
        if (repairs && repairs.length > 0) {
            response.warning = `Auto-repaired ${repairs.length} issue(s)`;
        }

        return res.json(response);

    } catch (error) {
        console.error('Agentic workflow generation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate workflow',
            details: error.message
        });
    }
}

/**
 * Get available node types
 * GET /api/agent/nodes
 */
export function getAvailableNodes(req, res) {
    try {
        const { getAvailableNodeTypes, getNodeById } = require('../agents/agentPlanner.js');
        const nodeTypes = getAvailableNodeTypes();

        const nodes = nodeTypes.map(id => {
            const node = getNodeById(id);
            return {
                id: node.id,
                label: node.label,
                category: node.category,
                capabilities: node.capabilities.map(c => c.action)
            };
        });

        return res.json({
            success: true,
            count: nodes.length,
            nodes
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch available nodes'
        });
    }
}

/**
 * Health check
 * GET /api/agent/health
 */
export function healthCheck(req, res) {
    return res.json({
        success: true,
        version: API_VERSION,
        status: 'operational',
        timestamp: new Date().toISOString()
    });
}

/**
 * Get example prompts
 * GET /api/agent/examples
 */
export function getExamples(req, res) {
    const examples = [
        {
            prompt: "Fetch blog posts and email me a summary",
            description: "Input → Process → Output pipeline"
        },
        {
            prompt: "Scrape news articles, analyze sentiment, send to Slack",
            description: "Web scraping with analysis"
        },
        {
            prompt: "Get RSS feed, summarize content, post to Twitter",
            description: "Social media automation"
        },
        {
            prompt: "Collect data from API, transform it, upload to S3",
            description: "Data pipeline"
        },
        {
            prompt: "Monitor website changes and notify me via SMS",
            description: "Monitoring workflow"
        }
    ];

    return res.json({
        success: true,
        examples
    });
}
