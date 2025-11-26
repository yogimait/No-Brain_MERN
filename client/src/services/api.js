// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => {
//     // If response data is already the API response format, return it
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error);
//     if (error.response) {
//       // Server responded with error status
//       console.error('Error Response:', error.response.data);
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('No response received:', error.request);
//       error.message = 'No response from server. Make sure the backend is running.';
//     } else {
//       // Something else happened
//       console.error('Error setting up request:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// // Workflow APIs
// export const workflowAPI = {
//   // Create a new workflow
//   create: async (workflowData) => {
//     const response = await api.post('/workflows', workflowData);
//     return response.data;
//   },

//   // Get all workflows (with optional filters)
//   getAll: async (params = {}) => {
//     const response = await api.get('/workflows', { params });
//     return response.data;
//   },

//   // Get workflow by ID
//   getById: async (id) => {
//     const response = await api.get(`/workflows/${id}`);
//     return response.data;
//   },

//   // Update workflow
//   update: async (id, workflowData) => {
//     const response = await api.put(`/workflows/${id}`, workflowData);
//     return response.data;
//   },

//   // Delete workflow
//   delete: async (id) => {
//     const response = await api.delete(`/workflows/${id}`);
//     return response.data;
//   },

//   // Search workflows
//   search: async (query) => {
//     const response = await api.get('/workflows/search', { params: { q: query } });
//     return response.data;
//   },
// };

// // Execution APIs
// export const executionAPI = {
//   // Create a new execution log
//   create: async (executionData) => {
//     const response = await api.post('/executions', executionData);
//     return response.data;
//   },

//   // Get all executions (with optional filters)
//   getAll: async (params = {}) => {
//     const response = await api.get('/executions', { params });
//     return response.data;
//   },

//   // Get executions by workflow ID
//   getByWorkflow: async (workflowId, params = {}) => {
//     const response = await api.get(`/executions/workflow/${workflowId}`, { params });
//     return response.data;
//   },

//   // Get execution by runId
//   getByRunId: async (runId) => {
//     const response = await api.get(`/executions/${runId}`);
//     return response.data;
//   },

//   // Update execution
//   update: async (runId, executionData) => {
//     const response = await api.put(`/executions/${runId}`, executionData);
//     return response.data;
//   },
// };

// export default api;

import axios from 'axios';

// --- Configuration ---
// Set the base URL for your backend API.
// Make sure this matches the port your backend server is running on.
// If your backend is at http://localhost:8000, and routes are /api/...,
// then this is correct.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API Error Handler ---
// This function helps process errors from API calls
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    console.error('API Error Status:', error.response.status);
    // Return the server's error message if it exists
    return Promise.reject(error.response.data || { message: 'An unknown server error occurred.' });
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API No Response:', error.request);
    return Promise.reject({ message: 'Network Error: Could not connect to the server.' });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Request Setup Error:', error.message);
    return Promise.reject({ message: `Request setup error: ${error.message}` });
  }
};

// Add interceptors to handle responses and errors centrally
apiClient.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => handleApiError(error) // Pass errors to the handler
);


// --- Workflow API ---
// Manages saving, loading, and updating workflow designs
export const workflowAPI = {
  /**
   * Create a new workflow.
   * @param {object} workflowData - { name, graph: { nodes, edges }, ownerId, ... }
   * @returns {Promise<object>} The created workflow object
   */
  create: async (workflowData) => {
    const response = await apiClient.post('/workflow', workflowData);
    return response.data; // Assuming backend sends { success: true, data: workflow }
  },

  /**
   * Update an existing workflow.
   * @param {string} id - The ID of the workflow to update
   * @param {object} workflowData - The updated workflow data
   * @returns {Promise<object>} The updated workflow object
   */
  update: async (id, workflowData) => {
    const response = await apiClient.put(`/workflow/${id}`, workflowData);
    return response.data; // Assuming backend sends { success: true, data: workflow }
  },

  /**
   * Get all workflows (e.g., for the dashboard).
   * @returns {Promise<Array>} A list of workflows
   */
  getAll: async () => {
    const response = await apiClient.get('/workflow');
    return response.data; // Assuming backend sends { success: true, data: [workflows] }
  },

  /**
   * Get a single workflow by its ID.
   * @param {string} id - The ID of the workflow
   * @returns {Promise<object>} The workflow object
   */
  getById: async (id) => {
    const response = await apiClient.get(`/workflow/${id}`);
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
    const response = await apiClient.get('/execution'); 
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
    const response = await apiClient.post('/execution', executionData);
    return response.data;
  }
};