export default async function fileUploadHandler(nodeConfig, inputs, context) {
  try{
    await new Promise(resolve => setTimeout(resolve, 250));
    return { success: true, output: { uploaded: false }, logs: { nodeId: nodeConfig.id, type: 'fileUpload', status: 'completed', timestamp: new Date().toISOString() } };
  }catch(error){ return { success: false, logs: { nodeId: nodeConfig.id, type: 'fileUpload', status: 'failed', error: error.message, timestamp: new Date().toISOString() } } }
}