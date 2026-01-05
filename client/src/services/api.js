import axios from 'axios';

// --- Configuration ---
// Set the base URL for your backend API.
// Make sure this matches the port your backend server is running on.
// If your backend is at http://localhost:8000, and routes are /api/...,
// then this is correct.
// Vite exposes env vars via `import.meta.env`. Prefix your env var with `VITE_`.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for all requests
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // If response data is already the API response format, return it
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error Response:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      error.message = 'No response from server. Make sure the backend is running.';
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Workflow APIs
export const workflowAPI = {
  /**
   * Create a new workflow.
   * @param {object} workflowData - { name, graph: { nodes, edges }, ownerId, ... }
   * @returns {Promise<object>} The created workflow object
   */
  create: async (workflowData) => {
    const response = await apiClient.post('/workflows', workflowData);
    return response.data; // Assuming backend sends { success: true, data: workflow }
  },

  /**
   * Update an existing workflow.
   * @param {string} id - The ID of the workflow to update
   * @param {object} workflowData - The updated workflow data
   * @returns {Promise<object>} The updated workflow object
   */
  update: async (id, workflowData) => {
    const response = await apiClient.put(`/workflows/${id}`, workflowData);
    return response.data; // Assuming backend sends { success: true, data: workflow }
  },

  /**
   * Get all workflows (e.g., for the dashboard).
   * @returns {Promise<Array>} A list of workflows
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/workflows', { params });
    return response.data; // Assuming backend sends { success: true, data: [workflows] }
  },

  /**
   * Get a single workflow by its ID.
   * @param {string} id - The ID of the workflow
   * @returns {Promise<object>} The workflow object
   */
  getById: async (id) => {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data; // Assuming backend sends { success: true, data: workflow }
  },
};


// --- Execution API ---
// Manages running workflows and fetching execution logs
export const executionAPI = {
  /**
   * Run a workflow.
   * @param {object} workflowGraph - { nodes, edges }
   * @returns {Promise<object>} The execution result from the orchestrator
   */
  run: async (workflowGraph) => {
    // The backend orchestrator.service.js expects the full graph
    const response = await apiClient.post('/orchestrator/run', workflowGraph);
    return response.data; // This will be the full result from runWorkflow
  },

  /**
   * Get all execution logs (e.g., for the Logs page).
   * NOTE: This assumes you have an endpoint at /api/execution.
   * You may need to create this in your backend (e.g., execution.routes.js).
   * @returns {Promise<Array>} A list of execution log summaries
   */
  getAllLogs: async () => {
    // This is an assumed endpoint. Adjust if your backend route is different.
    const response = await apiClient.get('/executions');
    return response.data; // Assuming backend sends { success: true, data: [logs] }
  },

  /**
   * This function might be used by your Logs page.
   * It's kept here for compatibility, but `runTest` in Workflow.jsx
   * should NOT call this.
   */
  create: async (executionData) => {
    console.warn('executionAPI.create is deprecated for test runs. The backend now handles logging automatically.');
    // This assumes an endpoint exists to *manually* create a log.
    // We keep it just in case, but it's bad practice.
    const response = await apiClient.post('/executions', executionData);
    return response.data;
  },

  // Get execution by runId
  getByRunId: async (runId) => {
    const response = await apiClient.get(`/executions/${runId}`);
    return response.data;
  },

  // Update execution
  update: async (runId, executionData) => {
    const response = await apiClient.put(`/executions/${runId}`, executionData);
    return response.data;
  },
  // Get all executions (with optional query params)
  getAll: async (params = {}) => {
    const response = await apiClient.get('/executions', { params });
    return response.data;
  },
  // Get executions by workflow
  getByWorkflow: async (workflowId, params = {}) => {
    const response = await apiClient.get(`/executions/workflow/${workflowId}`, { params });
    return response.data;
  },
  // Delete execution by runId
  delete: async (runId) => {
    const response = await apiClient.delete(`/executions/${runId}`);
    return response.data;
  },
};

// --- NLP APIs ---
// AI-powered workflow generation and modification using Gemini
export const nlpAPI = {
  /**
   * Generate a workflow from a text prompt using Gemini AI
   * @param {string} prompt - The user's description of the desired workflow
   * @param {string} model - Optional: The Gemini model to use (default: gemini-2.5-pro)
   * @returns {Promise<object>} The AI-generated workflow { success, workflow, executionTime, ... }
   */
  generateWorkflow: async (prompt, model = 'gemini-2.5-pro') => {
    const response = await apiClient.post('/nlp/generate', { prompt, model });
    return response.data; // { success: true, data: { workflow, executionTime, ... }, message }
  },

  /**
   * Generate and immediately run a workflow from a text prompt
   * @param {string} prompt - The user's description of the desired workflow
   * @param {string} model - Optional: The Gemini model to use (default: gemini-2.5-pro)
   * @returns {Promise<object>} Both generation and execution results
   */
  generateAndRun: async (prompt, model = 'gemini-2.5-pro') => {
    const response = await apiClient.post('/nlp/generate-and-run', { prompt, model });
    return response.data; // { success: true, data: { generation, execution }, message }
  },

  /**
   * Get example prompts for testing
   * @returns {Promise<Array>} List of example workflow prompts
   */
  getExamplePrompts: async () => {
    const response = await apiClient.get('/nlp/examples');
    return response.data; // { success: true, data: { examples, count, ... }, message }
  },

  /**
   * Health check for the NLP service
   * @returns {Promise<object>} Service health status and configuration info
   */
  healthCheck: async () => {
    const response = await apiClient.get('/nlp/health');
    return response.data; // { success: true, data: { status, geminiConfigured, ... }, message }
  }
};

// --- Auth APIs ---
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

// Export the axios client in case other modules prefer a default import
export default apiClient;