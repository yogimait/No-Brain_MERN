export default async function delayHandler(nodeConfig, inputs, context) {
  try{
    // If nodeConfig.data.delayMs is present, delay accordingly
    const delayMs = parseInt(nodeConfig.data?.delayMs || 500);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return { success: true, output: { delayed: true }, logs: { nodeId: nodeConfig.id, type: 'delay', status: 'completed', executionTime: `${delayMs}ms`, timestamp: new Date().toISOString() } };
  }catch(error){ return { success: false, logs: { nodeId: nodeConfig.id, type: 'delay', status: 'failed', error: error.message, timestamp: new Date().toISOString() } } }
}