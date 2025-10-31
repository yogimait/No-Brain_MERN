import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
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
  // Create a new workflow
  create: async (workflowData) => {
    const response = await api.post('/workflows', workflowData);
    return response.data;
  },

  // Get all workflows (with optional filters)
  getAll: async (params = {}) => {
    const response = await api.get('/workflows', { params });
    return response.data;
  },

  // Get workflow by ID
  getById: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  // Update workflow
  update: async (id, workflowData) => {
    const response = await api.put(`/workflows/${id}`, workflowData);
    return response.data;
  },

  // Delete workflow
  delete: async (id) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  // Search workflows
  search: async (query) => {
    const response = await api.get('/workflows/search', { params: { q: query } });
    return response.data;
  },
};

// Execution APIs
export const executionAPI = {
  // Create a new execution log
  create: async (executionData) => {
    const response = await api.post('/executions', executionData);
    return response.data;
  },

  // Get all executions (with optional filters)
  getAll: async (params = {}) => {
    const response = await api.get('/executions', { params });
    return response.data;
  },

  // Get executions by workflow ID
  getByWorkflow: async (workflowId, params = {}) => {
    const response = await api.get(`/executions/workflow/${workflowId}`, { params });
    return response.data;
  },

  // Get execution by runId
  getByRunId: async (runId) => {
    const response = await api.get(`/executions/${runId}`);
    return response.data;
  },

  // Update execution
  update: async (runId, executionData) => {
    const response = await api.put(`/executions/${runId}`, executionData);
    return response.data;
  },
};

export default api;

