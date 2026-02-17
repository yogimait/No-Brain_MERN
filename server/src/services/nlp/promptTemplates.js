// server/src/services/nlp/promptTemplates.js
// Phase-2: Platform-aware system prompt generator
// Structured JSON injection + Hierarchical internal reasoning

/**
 * Generates a platform-constrained system prompt for AI workflow generation.
 * Uses structured JSON injection (not bullet lists) to reduce hallucination.
 *
 * @param {Array<{label: string, type: string}>} nodesWithTypes - Node labels with types from catalog
 * @param {string} platform - Platform identifier (e.g., "n8n")
 * @returns {string} Complete system prompt
 */
export function buildSystemPrompt(nodesWithTypes, platform = 'n8n') {
  // Structured JSON injection — dramatically reduces hallucination vs bullet lists
  const allowedNodesJSON = JSON.stringify(nodesWithTypes);

  return `You are a workflow planner for the "${platform}" platform.

AllowedNodes (JSON Array — you MUST only use labels from this list):
${allowedNodesJSON}

Internal planning steps (reason internally, output ONLY JSON):
1. Identify the trigger node from AllowedNodes (type: "trigger").
2. Identify required transformation/processing nodes (type: "action").
3. Identify required action/output nodes (type: "action").
4. Sequence them logically: Trigger → Processing → Action.
5. Verify EVERY node label exists exactly in AllowedNodes.
6. Output ONLY the final JSON object.

STRICT RULES:
- Labels must match EXACTLY from AllowedNodes. Never invent nodes.
- Do NOT rename, abbreviate, or modify any label.
- If unsure, choose the closest available node from AllowedNodes.
- First node MUST be a trigger (type: "trigger").
- Never explain your reasoning. Output only JSON.

Workflow JSON Schema:
{
  "nodes": [
    {
      "id": "1",
      "label": "Exact Label from AllowedNodes",
      "data": {
        "description": "What this node does in this workflow"
      }
    }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}

Node Rules:
1. Every node needs a unique "id" (sequential: "1", "2", "3", etc.)
2. Every "label" MUST exactly match one from AllowedNodes
3. Every node needs a "data" object with a "description"
4. Connect nodes with edges using "source" and "target"
5. Do NOT include "position" fields

Response Format:
- Place JSON between: <<<JSON>>> and <<<END_JSON>>>
- No markdown, no code fences, no explanatory text
- If you cannot produce valid JSON, reply with: <<<JSON>>>INVALID_JSON<<<END_JSON>>>

Example:
<<<JSON>>>
{
  "nodes": [
    { "id": "1", "label": "Cron", "data": { "description": "Triggers workflow on a daily schedule" } },
    { "id": "2", "label": "HTTP Request", "data": { "description": "Fetches data from external API" } },
    { "id": "3", "label": "Slack", "data": { "description": "Sends notification to Slack channel" } }
  ],
  "edges": [
    { "source": "1", "target": "2" },
    { "source": "2", "target": "3" }
  ]
}
<<<END_JSON>>>`;
}

/**
 * Builds a stricter retry prompt when hallucinated nodes are detected.
 * Only modifies the system constraint — does NOT re-send the entire prompt.
 *
 * @param {string[]} invalidNodes - List of hallucinated node labels from previous attempt
 * @param {Array<{label: string, type: string}>} nodesWithTypes - Valid node labels with types
 * @param {string} platform - Platform identifier
 * @returns {string} Stricter system prompt for retry
 */
export function buildRetrySystemPrompt(invalidNodes, nodesWithTypes, platform = 'n8n') {
  const allowedNodesJSON = JSON.stringify(nodesWithTypes);
  const invalidList = JSON.stringify(invalidNodes);

  return `You are a workflow planner for the "${platform}" platform.

⚠️ PREVIOUS ATTEMPT FAILED — the following nodes do NOT exist:
${invalidList}

You MUST regenerate the workflow strictly using ONLY nodes from AllowedNodes.
Do NOT repeat the invalid nodes listed above.

AllowedNodes (JSON Array):
${allowedNodesJSON}

Internal planning steps (reason internally, output ONLY JSON):
1. Identify a valid trigger node from AllowedNodes.
2. Identify valid action nodes. Do NOT use: ${invalidList}.
3. Sequence logically.
4. Verify every label exists in AllowedNodes.
5. Output ONLY the final JSON.

STRICT RULES:
- Labels must match EXACTLY from AllowedNodes.
- Never invent nodes. Never use nodes not in AllowedNodes.
- First node MUST be a trigger.
- Output only JSON between <<<JSON>>> and <<<END_JSON>>>`;
}

// Legacy export for backward compatibility
const systemPrompt = `You are an expert workflow automation assistant.`;
export default systemPrompt;
