// server/src/domains/planning/planner.explainer.js
// Phase-6: Deterministic Explainability Engine
// Part of planning domain — no AI dependency, no orchestrator import
// Generates execution order, node explanations, data flow, and dependency mapping

import { loadCatalog } from "../platform/platform.service.js";

// ── Self-contained Topological Sort (Kahn's Algorithm) ──
// Planning-domain-only — no orchestrator dependency

export function topologicalSort(nodes, edges) {
  const graph = new Map(); // nodeId -> [targetIds]
  const inDegree = new Map(); // nodeId -> count

  // Initialize
  nodes.forEach((node) => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build adjacency + in-degrees
  edges.forEach((edge) => {
    if (graph.has(edge.source) && graph.has(edge.target)) {
      graph.get(edge.source).push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
  });

  // Kahn's: start with zero in-degree nodes
  const queue = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    for (const neighbor of graph.get(current) || []) {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return { sorted, hasCycle: sorted.length !== nodes.length };
}

// ── Graph Validation ──

export function validateGraph(nodes, edges) {
  const errors = [];

  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push("Workflow must have at least one node.");
    return { valid: false, errors };
  }

  if (!Array.isArray(edges)) {
    errors.push("Edges must be an array.");
    return { valid: false, errors };
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  // Check all nodes have ids and labels
  nodes.forEach((node, i) => {
    if (!node.id) errors.push(`Node at index ${i} is missing an id.`);
    if (!node.label && !node.data?.label)
      errors.push(`Node ${node.id || i} is missing a label.`);
  });

  // Check edges reference valid nodes
  edges.forEach((edge, i) => {
    if (!edge.source || !edge.target) {
      errors.push(`Edge at index ${i} is missing source or target.`);
    } else {
      if (!nodeIds.has(edge.source))
        errors.push(`Edge references non-existent source: "${edge.source}".`);
      if (!nodeIds.has(edge.target))
        errors.push(`Edge references non-existent target: "${edge.target}".`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// ── Role Classification via Catalog ──

export function classifyNodeRole(nodeLabel, catalogLookup) {
  const catalogEntry = catalogLookup.get(nodeLabel);
  if (catalogEntry) {
    return catalogEntry.type; // 'trigger' or 'action' from catalog metadata
  }

  // Fallback heuristic only when catalog doesn't have the node
  const lower = (nodeLabel || "").toLowerCase();
  if (
    lower.includes("trigger") ||
    lower.includes("cron") ||
    lower.includes("schedule") ||
    lower.includes("webhook")
  ) {
    return "trigger";
  }
  return "action";
}

// ── Deterministic Explanation Templates ──

function generateNodeExplanation(
  label,
  role,
  description,
  inputLabels,
  outputLabels,
) {
  // Use provided description if available
  if (description && description.trim().length > 0) {
    return description.trim();
  }

  // Deterministic templates based on role
  if (role === "trigger") {
    if (inputLabels.length === 0) {
      return `This node initiates the workflow. It acts as the starting point and triggers all downstream processing.`;
    }
    return `This node acts as a trigger, starting a branch of the workflow.`;
  }

  // For action nodes, describe based on position in flow
  if (outputLabels.length === 0) {
    return `This node is the final step in its branch. It receives data from ${inputLabels.join(", ")} and produces the workflow's output.`;
  }

  if (inputLabels.length === 0) {
    return `This node acts as a data source, providing input to ${outputLabels.join(", ")}.`;
  }

  return `This node processes data received from ${inputLabels.join(", ")} and passes results to ${outputLabels.join(", ")}.`;
}

// ── Build Layered Data Flow ──

function buildLayeredFlow(
  nodes,
  sortedIds,
  catalogLookup,
  reverseAdj,
  forwardAdj,
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const layers = {
    trigger: [],
    processing: [],
    output: [],
  };

  sortedIds.forEach((nodeId) => {
    const node = nodeMap.get(nodeId);
    const label = node?.label || node?.data?.label || nodeId;
    const role = classifyNodeRole(label, catalogLookup);

    if (role === "trigger") {
      layers.trigger.push(label);
    } else if ((forwardAdj.get(nodeId) || []).length === 0) {
      // No outgoing edges — it's an output/terminal node
      layers.output.push(label);
    } else {
      layers.processing.push(label);
    }
  });

  return layers;
}

// ── Build Dependency Summary ──

function buildDependencySummary(sortedIds, nodeMap, reverseAdj) {
  const deps = [];

  // Iterate in reverse execution order (last node first)
  const reversed = [...sortedIds].reverse();

  for (const nodeId of reversed) {
    const node = nodeMap.get(nodeId);
    const label = node?.label || node?.data?.label || nodeId;
    const parents = reverseAdj.get(nodeId) || [];

    if (parents.length > 0) {
      const parentLabels = parents.map((pid) => {
        const pn = nodeMap.get(pid);
        return pn?.label || pn?.data?.label || pid;
      });
      deps.push(`${label} depends on ${parentLabels.join(" and ")}`);
    }
  }

  return deps;
}

// ── Build Narrative ──

function buildNarrative(layers) {
  const parts = [];

  if (layers.trigger.length > 0) {
    const triggerStr = layers.trigger.join(" and ");
    parts.push(`This workflow begins with ${triggerStr}`);
  }

  if (layers.processing.length > 0) {
    const procStr = layers.processing.join(", ");
    parts.push(`It then processes data through ${procStr}`);
  }

  if (layers.output.length > 0) {
    const outStr = layers.output.join(" and ");
    parts.push(`Finally, it delivers results via ${outStr}`);
  }

  if (parts.length === 0) {
    return "This workflow has no recognizable flow pattern.";
  }

  return parts.join(". ") + ".";
}

// ── Main Explainer Function ──

export function explainWorkflow(nodes, edges, platform = "n8n") {
  // Step 1: Validate graph
  const validation = validateGraph(nodes, edges);
  if (!validation.valid) {
    return {
      success: false,
      error: "Invalid workflow graph",
      details: validation.errors,
    };
  }

  // Step 2: Build adjacency lists (forward + reverse)
  const forwardAdj = new Map(); // nodeId -> [targetIds]
  const reverseAdj = new Map(); // nodeId -> [sourceIds]
  const nodeMap = new Map();

  nodes.forEach((node) => {
    forwardAdj.set(node.id, []);
    reverseAdj.set(node.id, []);
    nodeMap.set(node.id, node);
  });

  edges.forEach((edge) => {
    if (forwardAdj.has(edge.source) && forwardAdj.has(edge.target)) {
      forwardAdj.get(edge.source).push(edge.target);
      reverseAdj.get(edge.target).push(edge.source);
    }
  });

  // Step 3: Detect cycles via topological sort
  const { sorted: sortedIds, hasCycle } = topologicalSort(nodes, edges);

  if (hasCycle) {
    return {
      success: false,
      error:
        "Cycle detected in workflow graph. Workflows must be acyclic (DAG).",
      details: ["Remove circular dependencies to enable explanation."],
    };
  }

  // Step 4: Load platform catalog for role classification
  const catalog = loadCatalog(platform);
  const catalogLookup = new Map();

  if (catalog && Array.isArray(catalog.nodes)) {
    catalog.nodes.forEach((cn) => {
      catalogLookup.set(cn.label, cn);
    });
  }

  // Step 5: Build node explanations
  const executionOrder = [];
  const nodeExplanations = [];

  sortedIds.forEach((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    const label = node?.label || node?.data?.label || nodeId;
    const description = node?.data?.description || "";
    const role = classifyNodeRole(label, catalogLookup);

    // Gather input/output labels
    const inputIds = reverseAdj.get(nodeId) || [];
    const outputIds = forwardAdj.get(nodeId) || [];

    const inputLabels = inputIds.map((id) => {
      const n = nodeMap.get(id);
      return n?.label || n?.data?.label || id;
    });
    const outputLabels = outputIds.map((id) => {
      const n = nodeMap.get(id);
      return n?.label || n?.data?.label || id;
    });

    const explanation = generateNodeExplanation(
      label,
      role,
      description,
      inputLabels,
      outputLabels,
    );

    executionOrder.push({
      step: index + 1,
      nodeId,
      label,
    });

    nodeExplanations.push({
      nodeId,
      label,
      executionStep: index + 1,
      role,
      explanation,
      inputFrom: inputLabels,
      outputTo: outputLabels,
    });
  });

  // Step 6: Build layered data flow
  const layeredFlow = buildLayeredFlow(
    nodes,
    sortedIds,
    catalogLookup,
    reverseAdj,
    forwardAdj,
  );

  // Step 7: Build dependency summary (reverse execution order)
  const dependencySummary = buildDependencySummary(
    sortedIds,
    nodeMap,
    reverseAdj,
  );

  // Step 8: Generate deterministic narrative
  const narrative = buildNarrative(layeredFlow);

  return {
    success: true,
    executionOrder,
    nodeExplanations,
    layeredFlow,
    dependencySummary,
    narrative,
  };
}
