export default async function webhookHandler(nodeConfig, inputs, context) {
  const startTime = Date.now();
  try {
    console.log(`[webhook] Executing node ${nodeConfig.id}`);
    await new Promise(resolve => setTimeout(resolve, 250));

    const executionTime = Date.now() - startTime;
    return {
      success: true,
      output: { success: true },
      logs: {
        nodeId: nodeConfig.id,
        type: 'webhook',
        status: 'completed',
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      }
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      logs: {
        nodeId: nodeConfig.id,
        type: 'webhook',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}