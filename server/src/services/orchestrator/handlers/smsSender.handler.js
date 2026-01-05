export default async function smsSenderHandler(nodeConfig, inputs, context) {
  console.log(`[smsSender] Executing node ${nodeConfig.id}`);

  // Minimal mock -- in real app this would call Twilio or similar
  return {
    success: true,
    type: 'smsSender',
    nodeId: nodeConfig.id,
    result: { message: 'SMS send simulated', details: nodeConfig.data }
  };
}
