import axios from 'axios';

// API Base URL Configuration
// In production: VITE_API_URL must be set, otherwise fail loudly
// In development: Falls back to localhost
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    return envUrl;
  }

  // In production, missing VITE_API_URL is a critical error
  if (import.meta.env.PROD) {
    console.error('CRITICAL: VITE_API_URL environment variable is not set in production!');
    throw new Error('API configuration error: VITE_API_URL is required in production');
  }

  // Development fallback
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

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

// 🔴 Deprecated in v2 — Execution API disabled
// export const executionAPI = {
//   create: async (executionData) => { ... },
//   getAll: async (params = {}) => { ... },
//   getByWorkflow: async (workflowId, params = {}) => { ... },
//   getByRunId: async (runId) => { ... },
//   update: async (runId, executionData) => { ... },
//   delete: async (runId) => { ... },
// };

// NLP APIs (AI workflow generation)
export const nlpAPI = {
  // Generate workflow from text prompt using Groq
  generateWorkflow: async (prompt, model = 'openai/gpt-oss-20b', platform = 'n8n') => {
    const response = await api.post('/nlp/generate', { prompt, model, platform });
    return response.data;
  },

  // 🔴 Deprecated in v2 — Generate + Execute disabled
  // generateAndRun: async (prompt) => { ... },

  // Get example prompts for testing
  getExamples: async () => {
    const response = await api.get('/nlp/examples');
    return response.data;
  },

  // Get available node types from backend
  getAvailableNodes: async () => {
    const response = await api.get('/nlp/nodes');
    return response.data;
  },

  // Health check for NLP service
  healthCheck: async () => {
    const response = await api.get('/nlp/health');
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
