export default async function googleSheetsHandler(nodeConfig, inputs, context) {
  console.log(`[googleSheets] Executing node ${nodeConfig.id}`);

  // Minimal mock -- in real app this would write/read Google Sheets
  return {
    success: true,
    type: 'googleSheets',
    nodeId: nodeConfig.id,
    result: { message: 'Google Sheets simulated', details: nodeConfig.data }
  };
}
