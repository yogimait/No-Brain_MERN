export default async function calendarEventHandler(nodeConfig, inputs, context) {
  console.log(`[calendarEvent] Executing node ${nodeConfig.id}`);

  // Minimal mock -- in real app this would create calendar event (Google/Outlook)
  return {
    success: true,
    type: 'calendarEvent',
    nodeId: nodeConfig.id,
    result: { message: 'Calendar event simulated', details: nodeConfig.data }
  };
}
