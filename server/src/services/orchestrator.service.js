// server/src/services/orchestrator.service.js
//This is the main Brain of the project and orchestrator
import { getNodeHandler } from './orchestrator/nodeRegistry.js';
import  ApiError  from '../utils/ApiError.js';
//DAG ka matlab h ki jo graph directly nodes se connect ho and acycclic isliye taki loop na bane (cause that would be deadly)

/**
 * Topological Sort - Determines execution order for DAG (Directed Acyclic Graph)- ye topological sort h ki gaph ko list ki form me convert kar deta h, aur iski dependency h toposort.
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects {source, target}
 * @returns {Array} - Sorted array of node IDs in execution order
 */
function topologicalSort(nodes, edges) {
  const graph = new Map();
  const inDegree = new Map();
  
  // Initialize graph and in-degree
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    if (!graph.has(edge.source) || !graph.has(edge.target)) {
      throw new Error(`Invalid edge: ${edge.source} -> ${edge.target}`);
    }
    graph.get(edge.source).push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  });
  
  // Find all nodes with no incoming edges (starting nodes)
  const queue = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  const sorted = [];
  
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    
    // Reduce in-degree for neighbors
    const neighbors = graph.get(current);
    neighbors.forEach(neighbor => {
      const newDegree = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error('Cycle detected in workflow graph or disconnected nodes');
  }
  
  return sorted;
}

/**
 * Validate workflow graph structure
 * @param {Object} workflow - Workflow object with nodes and edges
 * @throws {ApiError} - If validation fails
 */
function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') {
    throw new ApiError(400, 'Invalid workflow: must be an object');
  }
  
  if (!Array.isArray(workflow.nodes)) {
    throw new ApiError(400, 'Invalid workflow: nodes must be an array');
  }
  
  if (!Array.isArray(workflow.edges)) {
    throw new ApiError(400, 'Invalid workflow: edges must be an array');
  }
  
  if (workflow.nodes.length === 0) {
    throw new ApiError(400, 'Invalid workflow: must have at least one node');
  }
  
  // Validate node structure
  workflow.nodes.forEach((node, index) => {
    if (!node.id) {
      throw new ApiError(400, `Node at index ${index} missing required field: id`);
    }
    if (!node.type) {
      throw new ApiError(400, `Node ${node.id} missing required field: type`);
    }
  });
  
  // Validate edge structure
  workflow.edges.forEach((edge, index) => {
    if (!edge.source) {
      throw new ApiError(400, `Edge at index ${index} missing required field: source`);
    }
    if (!edge.target) {
      throw new ApiError(400, `Edge at index ${index} missing required field: target`);
    }
  });
  
  return true;
}

/**
 * Execute a single node
 * @param {Object} node - Node to execute
 * @param {Object} previousOutputs - Outputs from previous nodes
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} - Execution result
 */
async function executeNode(node, previousOutputs, context) {
  const handler = getNodeHandler(node.type);
  
  if (!handler) {
    throw new Error(`No handler found for node type: ${node.type}`);
  }
  
  console.log(`\n🚀 Executing node: ${node.id} (${node.type})`);
  
  try {
    const result = await handler(node, previousOutputs, context);
    
    if (result.success) {
      console.log(`✅ Node ${node.id} completed successfully`);
    } else {
      console.log(`❌ Node ${node.id} failed`);
    }
    
    return result;
  } catch (error) {
    console.error(`💥 Error executing node ${node.id}:`, error.message);
    
    return {
      success: false,
      output: null,
      logs: {
        nodeId: node.id,
        type: node.type,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Main Orchestrator - Executes entire workflow
 * @param {Object} workflow - Workflow graph {nodes, edges}
 * @param {Object} context - Execution context {runId, userId, etc.}
 * @returns {Promise<Object>} - Execution result with logs
 */
async function runWorkflow(workflow, context = {}) {
  const startTime = Date.now();
  const runId = context.runId || `run_${Date.now()}`;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 Starting workflow execution - Run ID: ${runId}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // Step 1: Validate workflow
    validateWorkflow(workflow);
    console.log('✅ Workflow validation passed');
    
    // Step 2: Determine execution order
    const executionOrder = topologicalSort(workflow.nodes, workflow.edges);
    console.log(`📋 Execution order: ${executionOrder.join(' → ')}`);
    
    // Step 3: Create node lookup map
    const nodeMap = new Map();
    workflow.nodes.forEach(node => nodeMap.set(node.id, node));
    
    // Step 4: Execute nodes sequentially
    const outputs = {}; // Store outputs from each node
    const executionLogs = [];
    let failedNode = null;
    
    for (const nodeId of executionOrder) {
      const node = nodeMap.get(nodeId);
      
      // Execute node
      const result = await executeNode(node, outputs, { ...context, runId });
      
      // Store output for next nodes
      outputs[nodeId] = result.output;
      
      // Store log
      executionLogs.push(result.logs);
      
      // Stop execution if node failed (optional - can continue on error)
      if (!result.success) {
        failedNode = nodeId;
        console.log(`\n⚠️  Stopping execution due to failure at node: ${nodeId}`);
        break;
      }
    }
    
    const totalTime = Date.now() - startTime;
    const status = failedNode ? 'failed' : 'success';
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${status === 'success' ? '✅' : '❌'} Workflow ${status} - Total time: ${totalTime}ms`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Return execution summary
    return {
      success: status === 'success',
      runId,
      status,
      executionOrder,
      outputs,
      logs: executionLogs,
      executionTime: `${totalTime}ms`,
      failedNode,
      completedAt: new Date().toISOString()
    };
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error(`\n💥 Workflow execution failed:`, error.message);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      success: false,
      runId,
      status: 'error',
      error: error.message,
      executionTime: `${totalTime}ms`,
      completedAt: new Date().toISOString()
    };
  }
}

export {
  runWorkflow,
  validateWorkflow,
  topologicalSort
};
