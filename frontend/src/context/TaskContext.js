import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { taskAPI, commentAPI, userAPI } from '../services/api';

/**
 * Task Context
 * Manages tasks, comments, and users state across the application
 */
const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState({});
  const [filters, setFilters] = useState({
    assignee: '',
    priority: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  /**
   * Load all tasks with current filters
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.assignee) params.assignee = filters.assignee;
      if (filters.priority) params.priority = filters.priority;

      const response = await taskAPI.getAllTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Load all users for assignee dropdown
   */
  const loadUsers = useCallback(async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  /**
   * Load comments for a specific task
   */
  const loadComments = useCallback(async (taskId) => {
    try {
      const response = await commentAPI.getTaskComments(taskId);
      setComments(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, []);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await taskAPI.createTask(taskData);
      const newTask = response.data.task;
      
      setTasks(prev => [newTask, ...prev]);
      return { success: true, task: newTask };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a task
   */
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setError(null);

      const response = await taskAPI.updateTask(taskId, taskData);
      const updatedTask = response.data.task;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      return { success: true, task: updatedTask };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (taskId) => {
    try {
      setError(null);

      await taskAPI.deleteTask(taskId);
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Also remove comments for this task
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[taskId];
        return newComments;
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Move task to different status column
   */
  const moveTask = useCallback(async (taskId, newStatus) => {
    return updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  /**
   * Add a comment to a task
   */
  const addComment = useCallback(async (taskId, body) => {
    try {
      setError(null);

      const response = await commentAPI.createComment(taskId, body);
      const newComment = response.data.comment;
      
      setComments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newComment]
      }));
      
      return { success: true, comment: newComment };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Update filters and reload tasks
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      assignee: '',
      priority: ''
    });
  }, []);

  /**
   * Get tasks grouped by status
   */
  const getTasksByStatus = useCallback(() => {
    return {
      'Backlog': tasks.filter(task => task.status === 'Backlog'),
      'In Progress': tasks.filter(task => task.status === 'In Progress'),
      'Review': tasks.filter(task => task.status === 'Review'),
      'Done': tasks.filter(task => task.status === 'Done')
    };
  }, [tasks]);

  /**
   * Get task by ID
   */
  const getTaskById = useCallback((taskId) => {
    return tasks.find(task => task.id === parseInt(taskId));
  }, [tasks]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reload tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const value = {
    // State
    tasks,
    users,
    comments,
    filters,
    loading,
    error,
    
    // Task operations
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTaskById,
    getTasksByStatus,
    
    // Comment operations
    loadComments,
    addComment,
    
    // Filter operations
    updateFilters,
    clearFilters,
    
    // Utility
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};