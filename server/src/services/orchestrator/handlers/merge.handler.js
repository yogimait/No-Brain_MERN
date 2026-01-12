export default async function mergeHandler(nodeConfig, inputs, context) {
  try{
    // merge inputs - just combine outputs from inputs
    const merged = Object.values(inputs || {}).reduce((acc, cur) => {
      acc.push(cur);
      return acc;
    }, []);
    return { success: true, output: { merged }, logs: { nodeId: nodeConfig.id, type: 'merge', status: 'completed', timestamp: new Date().toISOString() } };
  }catch(error){ return { success: false, logs: { nodeId: nodeConfig.id, type: 'merge', status: 'failed', error: error.message, timestamp: new Date().toISOString() } } }
}