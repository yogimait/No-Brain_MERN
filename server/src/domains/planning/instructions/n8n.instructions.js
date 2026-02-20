// server/src/domains/planning/instructions/n8n.instructions.js
// Phase-7: n8n Platform-Specific Instruction Templates
// Deterministic, no AI — uses catalog metadata for role-based templates

/**
 * Generate n8n-specific recreation instructions for a node.
 * @param {object} params - { label, role, stepNumber, isFirst, description, inputLabels, outputLabels }
 * @returns {object} { title, instructions, configHints }
 */
export function getNodeInstructions({ label, role, stepNumber, isFirst, description, inputLabels, outputLabels }) {
  const instructions = [];
  const configHints = [];

  if (role === 'trigger') {
    return getTriggerInstructions({ label, stepNumber, isFirst, description });
  }

  // Action node
  if (isFirst) {
    instructions.push(`Click the "+" button in the center of the canvas`);
  } else if (inputLabels.length > 0) {
    instructions.push(`Click the "+" button on the right edge of the ${inputLabels[0]} node`);
  } else {
    instructions.push(`Click the "+" button in the canvas`);
  }

  instructions.push(`Search for "${label}" in the node search panel`);
  instructions.push(`Select "${label}" from the results`);

  // Configuration hints from description
  if (description && description.trim().length > 0) {
    configHints.push(`Configure: ${description.trim()}`);
  }

  configHints.push(`Set required fields in the node parameters panel`);
  configHints.push(`Click outside the node or press Escape to close the editor`);

  return {
    title: `Add ${label} Node`,
    instructions,
    configHints
  };
}

/**
 * Trigger-specific instructions for n8n.
 */
function getTriggerInstructions({ label, stepNumber, isFirst, description }) {
  const instructions = [];
  const configHints = [];

  if (isFirst || stepNumber === 1) {
    instructions.push(`Click the "Add first step..." button in the center of the canvas`);
  } else {
    instructions.push(`Click the "+" button in the canvas toolbar`);
  }

  instructions.push(`Search for "${label}" in the node search panel`);
  instructions.push(`Select "${label}" from the trigger category`);

  if (description && description.trim().length > 0) {
    configHints.push(`Configure: ${description.trim()}`);
  }

  // Common trigger configuration hints
  const lower = label.toLowerCase();
  if (lower.includes('cron') || lower.includes('schedule')) {
    configHints.push(`Set the schedule frequency (e.g., every hour, daily, etc.)`);
  } else if (lower.includes('webhook')) {
    configHints.push(`Copy the webhook URL for external service configuration`);
    configHints.push(`Select HTTP Method (POST recommended)`);
  } else {
    configHints.push(`Configure trigger event settings as needed`);
  }

  configHints.push(`Test the trigger by clicking "Listen for Test Event" or "Fetch Test Event"`);

  return {
    title: `Add ${label} Trigger`,
    instructions,
    configHints
  };
}

/**
 * Generate connection instructions between nodes.
 * Handles direct, fan-in, and fan-out connections.
 * @param {Array} edges - [{ sourceLabel, targetLabel }]
 * @returns {Array} connection instruction strings
 */
export function getConnectionInstructions(edges) {
  if (edges.length === 0) return [];

  // Group by target to detect fan-in
  const targetGroups = new Map();
  edges.forEach(({ sourceLabel, targetLabel }) => {
    if (!targetGroups.has(targetLabel)) targetGroups.set(targetLabel, []);
    targetGroups.get(targetLabel).push(sourceLabel);
  });

  // Group by source to detect fan-out
  const sourceGroups = new Map();
  edges.forEach(({ sourceLabel, targetLabel }) => {
    if (!sourceGroups.has(sourceLabel)) sourceGroups.set(sourceLabel, []);
    sourceGroups.get(sourceLabel).push(targetLabel);
  });

  const instructions = [];
  const processed = new Set();

  // Handle fan-in first
  targetGroups.forEach((sources, target) => {
    if (sources.length > 1) {
      instructions.push(`Connect both ${sources.join(' and ')} to ${target} by dragging from each node's output circle to ${target}'s input`);
      sources.forEach(s => processed.add(`${s}->${target}`));
    }
  });

  // Handle fan-out
  sourceGroups.forEach((targets, source) => {
    const unprocessed = targets.filter(t => !processed.has(`${source}->${t}`));
    if (unprocessed.length > 1) {
      instructions.push(`Connect ${source} to both ${unprocessed.join(' and ')} by dragging from its output circle`);
      unprocessed.forEach(t => processed.add(`${source}->${t}`));
    }
  });

  // Handle remaining direct connections
  edges.forEach(({ sourceLabel, targetLabel }) => {
    const key = `${sourceLabel}->${targetLabel}`;
    if (!processed.has(key)) {
      instructions.push(`Drag from ${sourceLabel}'s output (right circle) to ${targetLabel}'s input (left circle)`);
      processed.add(key);
    }
  });

  return instructions;
}

/**
 * Generate field mapping hints based on node description.
 * @param {string} label - Node label
 * @param {string} description - Node description
 * @param {Array} inputLabels - Labels of input nodes
 * @returns {Array} mapping hint strings
 */
export function getFieldMappingHints(label, description, inputLabels) {
  const hints = [];

  if (!description || description.trim().length === 0) return hints;

  const lower = description.toLowerCase();
  const labelLower = label.toLowerCase();

  // Detect common patterns
  if (labelLower.includes('slack') || labelLower.includes('discord') || labelLower.includes('telegram')) {
    hints.push(`Map the message content from the previous node's output to the "Message" field`);
    if (inputLabels.length > 0) {
      hints.push(`Use expressions like {{ $json.fieldName }} to reference data from ${inputLabels.join(', ')}`);
    }
  }

  if (labelLower.includes('email') || labelLower.includes('sendgrid') || labelLower.includes('ses')) {
    hints.push(`Set "To Email" and "Subject" fields`);
    hints.push(`Map the email body from the previous node's output`);
  }

  if (labelLower.includes('sheets') || labelLower.includes('airtable') || labelLower.includes('database')) {
    hints.push(`Map column values from the previous node's output fields`);
  }

  if (lower.includes('filter') || lower.includes('condition')) {
    hints.push(`Define the filter condition using the expression editor`);
  }

  if (lower.includes('transform') || lower.includes('convert') || lower.includes('format')) {
    hints.push(`Configure field transformations in the node settings`);
  }

  return hints;
}

/**
 * Get platform-specific notes for n8n.
 * @param {number} nodeCount
 * @param {number} edgeCount
 * @returns {Array} platform note strings
 */
export function getPlatformNotes(nodeCount, edgeCount) {
  const notes = [
    `In n8n, drag from a node's small output circle (right side) to another node's input circle (left side) to connect them`,
    `Use "Test Workflow" to run the workflow with test data before activating`,
    `Save your workflow frequently using Ctrl+S`,
  ];

  if (nodeCount > 5) {
    notes.push(`Tip: Use the minimap (bottom-right) to navigate large workflows`);
  }

  if (edgeCount > nodeCount) {
    notes.push(`Tip: Use "Node" → "Reorganize" to auto-arrange your nodes for clarity`);
  }

  return notes;
}

/**
 * Estimate recreation time based on complexity.
 * @param {number} nodeCount
 * @param {number} edgeCount
 * @returns {string} estimated time string
 */
export function estimateRecreationTime(nodeCount, edgeCount) {
  const minutes = Math.ceil(nodeCount * 1.5 + edgeCount * 0.5);
  if (minutes <= 3) return '2–3 minutes';
  if (minutes <= 7) return '5–7 minutes';
  if (minutes <= 12) return '8–12 minutes';
  return `${minutes - 2}–${minutes + 2} minutes`;
}
