import axios from 'axios';

//const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://no-brain-server.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for all requests
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // If response data is already the API response format, return it
    return response;
  },
  (error) => {
    // Don't log 401 errors as they're expected when session expires
    // AuthContext handles these gracefully
    if (error.response?.status !== 401) {
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

  // Delete execution by runId
  delete: async (runId) => {
    const response = await api.delete(`/executions/${runId}`);
    return response.data;
  },
};

// Auth APIs
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, {
      withCredentials: true // Important for cookies
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials, {
      withCredentials: true // Important for cookies
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout', {}, {
      withCredentials: true
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me', {
      withCredentials: true
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token', {}, {
      withCredentials: true
    });
    return response.data;
  },
};

export default api;

