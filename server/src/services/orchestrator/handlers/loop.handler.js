export default async function loopHandler(nodeConfig, inputs, context) {
  try{
    // For now, just pass-through and mark completed
    return { success: true, output: { looped: true }, logs: { nodeId: nodeConfig.id, type: 'loop', status: 'completed', timestamp: new Date().toISOString() } };
  }catch(error){ return { success: false, logs: { nodeId: nodeConfig.id, type: 'loop', status: 'failed', error: error.message, timestamp: new Date().toISOString() } } }
}