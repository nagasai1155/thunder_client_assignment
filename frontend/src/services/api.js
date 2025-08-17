import axios from 'axios';

/**
 * API Configuration
 * Creates axios instance with base configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Login user
   */
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Register new user
   */
  register: (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  },

  /**
   * Get current user info
   */
  getMe: () => {
    return api.get('/auth/me');
  },

  /**
   * Logout user
   */
  logout: () => {
    return api.post('/auth/logout');
  }
};

/**
 * Task API endpoints
 */
export const taskAPI = {
  /**
   * Get all tasks with optional filters
   */
  getAllTasks: (params = {}) => {
    return api.get('/tasks', { params });
  },

  /**
   * Get single task by ID
   */
  getTask: (taskId) => {
    return api.get(`/tasks/${taskId}`);
  },

  /**
   * Create new task
   */
  createTask: (taskData) => {
    return api.post('/tasks', taskData);
  },

  /**
   * Update task
   */
  updateTask: (taskId, taskData) => {
    return api.put(`/tasks/${taskId}`, taskData);
  },

  /**
   * Delete task
   */
  deleteTask: (taskId) => {
    return api.delete(`/tasks/${taskId}`);
  }
};

/**
 * Comment API endpoints
 */
export const commentAPI = {
  /**
   * Get comments for a specific task
   */
  getTaskComments: (taskId) => {
    return api.get(`/comments/task/${taskId}`);
  },

  /**
   * Create new comment
   */
  createComment: (taskId, body) => {
    return api.post('/comments', { taskId, body });
  },

  /**
   * Update comment
   */
  updateComment: (commentId, body) => {
    return api.put(`/comments/${commentId}`, { body });
  },

  /**
   * Delete comment
   */
  deleteComment: (commentId) => {
    return api.delete(`/comments/${commentId}`);
  }
};

/**
 * User API endpoints
 */
export const userAPI = {
  /**
   * Get all users (for assignee dropdown)
   */
  getAllUsers: () => {
    return api.get('/users');
  },

  /**
   * Get user by ID
   */
  getUser: (userId) => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Get current user's tasks
   */
  getMyTasks: () => {
    return api.get('/users/me/tasks');
  }
};

/**
 * Utility functions
 */
export const apiUtils = {
  /**
   * Check if API is available
   */
  healthCheck: () => {
    return api.get('/health');
  },

  /**
   * Handle API errors consistently
   */
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: null,
        data: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error',
        status: null,
        data: null
      };
    }
  }
};

export default api;