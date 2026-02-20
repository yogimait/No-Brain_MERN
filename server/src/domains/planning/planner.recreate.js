// server/src/domains/planning/planner.recreate.js
// Phase-7: Deterministic Recreation Guidance Engine
// Extends planning domain — reuses Phase-6 graph logic
// Generates step-by-step recreation instructions for building workflows in platform UI

import { validateGraph, topologicalSort, classifyNodeRole } from './planner.explainer.js';
import { loadCatalog } from '../platform/platform.service.js';
import {
  getNodeInstructions,
  getConnectionInstructions,
  getFieldMappingHints,
  getPlatformNotes,
  estimateRecreationTime
} from './instructions/n8n.instructions.js';

// ── Platform instruction loader ──
// Currently only n8n is supported; expand by adding new instruction files

function getInstructionModule(platform) {
  // Only n8n is supported in Phase-7
  // Future: switch(platform) { case 'zapier': ... case 'make': ... }
  if (platform === 'n8n') {
    return {
      getNodeInstructions,
      getConnectionInstructions,
      getFieldMappingHints,
      getPlatformNotes,
      estimateRecreationTime
    };
  }

  // Fallback to n8n templates for unsupported platforms
  return {
    getNodeInstructions,
    getConnectionInstructions,
    getFieldMappingHints,
    getPlatformNotes,
    estimateRecreationTime
  };
}

// ── Main Recreation Function ──

export function generateRecreationGuide(nodes, edges, platform = 'n8n') {
  // Step 1: Validate graph (reuse Phase-6 validation)
  const validation = validateGraph(nodes, edges);
  if (!validation.valid) {
    return {
      success: false,
      error: 'Invalid workflow graph',
      details: validation.errors
    };
  }

  // Step 2: Topological sort (reuse Phase-6)
  const { sorted: sortedIds, hasCycle } = topologicalSort(nodes, edges);

  if (hasCycle) {
    return {
      success: false,
      error: 'Cycle detected in workflow graph. Cannot generate recreation guide for cyclic workflows.',
      details: ['Remove circular dependencies first.']
    };
  }

  // Step 3: Build adjacency lists
  const nodeMap = new Map();
  const forwardAdj = new Map();
  const reverseAdj = new Map();

  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    forwardAdj.set(node.id, []);
    reverseAdj.set(node.id, []);
  });

  edges.forEach(edge => {
    if (forwardAdj.has(edge.source) && forwardAdj.has(edge.target)) {
      forwardAdj.get(edge.source).push(edge.target);
      reverseAdj.get(edge.target).push(edge.source);
    }
  });

  // Step 4: Load catalog for role classification
  const catalog = loadCatalog(platform);
  const catalogLookup = new Map();

  if (catalog && Array.isArray(catalog.nodes)) {
    catalog.nodes.forEach(cn => catalogLookup.set(cn.label, cn));
  }

  // Step 5: Get platform instruction module
  const instructionModule = getInstructionModule(platform);

  // Step 6: Generate node setup steps (in execution order)
  const steps = [];
  let stepCounter = 1;

  sortedIds.forEach((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    const label = node?.label || node?.data?.label || nodeId;
    const description = node?.data?.description || '';
    const role = classifyNodeRole(label, catalogLookup);

    const inputIds = reverseAdj.get(nodeId) || [];
    const outputIds = forwardAdj.get(nodeId) || [];

    const inputLabels = inputIds.map(id => {
      const n = nodeMap.get(id);
      return n?.label || n?.data?.label || id;
    });

    const outputLabels = outputIds.map(id => {
      const n = nodeMap.get(id);
      return n?.label || n?.data?.label || id;
    });

    // Generate node-specific instructions
    const nodeInstr = instructionModule.getNodeInstructions({
      label,
      role,
      stepNumber: index + 1,
      isFirst: index === 0,
      description,
      inputLabels,
      outputLabels
    });

    // Generate field mapping hints
    const mappingHints = instructionModule.getFieldMappingHints(label, description, inputLabels);

    steps.push({
      stepNumber: stepCounter++,
      type: 'add-node',
      title: nodeInstr.title,
      nodeLabel: label,
      nodeRole: role,
      instructions: nodeInstr.instructions,
      configHints: nodeInstr.configHints,
      mappingHints: mappingHints.length > 0 ? mappingHints : undefined
    });
  });

  // Step 7: Generate connection instructions
  const edgesWithLabels = edges
    .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map(e => {
      const srcNode = nodeMap.get(e.source);
      const tgtNode = nodeMap.get(e.target);
      return {
        sourceLabel: srcNode?.label || srcNode?.data?.label || e.source,
        targetLabel: tgtNode?.label || tgtNode?.data?.label || e.target
      };
    });

  const connectionInstructions = instructionModule.getConnectionInstructions(edgesWithLabels);

  if (connectionInstructions.length > 0) {
    steps.push({
      stepNumber: stepCounter++,
      type: 'connect',
      title: 'Connect the Nodes',
      instructions: connectionInstructions,
      configHints: [],
    });
  }

  // Step 8: Add final activation step
  steps.push({
    stepNumber: stepCounter++,
    type: 'finalize',
    title: 'Test & Activate',
    instructions: [
      'Click "Test Workflow" to run with sample data',
      'Review the output of each node for correctness',
      'Fix any configuration issues found during testing',
      'Toggle the "Active" switch in the top-right to activate the workflow'
    ],
    configHints: []
  });

  // Step 9: Generate platform notes and time estimate
  const platformNotes = instructionModule.getPlatformNotes(nodes.length, edges.length);
  const estimatedTime = instructionModule.estimateRecreationTime(nodes.length, edges.length);

  return {
    success: true,
    platform,
    totalSteps: steps.length,
    estimatedTime,
    steps,
    platformNotes
  };
}
