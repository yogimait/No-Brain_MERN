// server/src/services/orchestrator/handlers/dataFetcher.handler.js

/**
 * Mock Data Fetcher Handler
 * In production, this would fetch data from external APIs
 * 
 * @param {Object} nodeConfig - Node configuration
 * @param {Object} inputs - Outputs from previous nodes
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} - { success, output, logs }
 */
async function dataFetcherHandler(nodeConfig, inputs, context) {
  const startTime = Date.now();
  
  try {
    console.log(`[dataFetcher] Starting execution for node ${nodeConfig.id}`);
    
    const dataSource = nodeConfig.data?.source || "default";
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on source
    const mockData = {
      default: {
        text: "This is sample data from the data fetcher. It could be fetched from an API, database, or external source.",
        timestamp: new Date().toISOString(),
        records: 100
      },
      api: {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" }
        ]
      },
      database: {
        results: ["Item 1", "Item 2", "Item 3"]
      }
    };
    
    const output = mockData[dataSource] || mockData.default;
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      output: output,
      logs: {
        nodeId: nodeConfig.id,
        type: 'dataFetcher',
        status: 'completed',
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        source: dataSource,
        recordsFetched: Array.isArray(output) ? output.length : 1
      }
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      logs: {
        nodeId: nodeConfig.id,
        type: 'dataFetcher',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export default dataFetcherHandler;
