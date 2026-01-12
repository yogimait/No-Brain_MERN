export default async function aiTextGeneratorHandler(nodeConfig, inputs, context) {
  const startTime = Date.now();
  try {
    console.log(`[aiTextGenerator] Executing node ${nodeConfig.id}`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const executionTime = Date.now() - startTime;
    return {
      success: true,
      output: { text: 'Generated sample text' },
      logs: {
        nodeId: nodeConfig.id,
        type: 'aiTextGenerator',
        status: 'completed',
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        outputPreview: 'Generated sample text'
      }
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      logs: {
        nodeId: nodeConfig.id,
        type: 'aiTextGenerator',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}