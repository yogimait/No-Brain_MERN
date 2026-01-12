export default async function pagerDutyHandler(nodeConfig, inputs, context) {
  console.log(`[pagerDuty] Executing node ${nodeConfig.id}`);

  // Minimal mock -- in real app this would trigger an incident
  return {
    success: true,
    type: 'pagerDuty',
    nodeId: nodeConfig.id,
    result: { message: 'PagerDuty incident simulated', details: nodeConfig.data }
  };
}
