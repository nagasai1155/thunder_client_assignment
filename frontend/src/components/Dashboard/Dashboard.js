import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import TaskBoard from './TaskBoard';
import TaskForm from './TaskForm';
import TaskModal from './TaskModal';
import Filters from './Filters';
import '../../styles/Dashboard.css';

/**
 * Main Dashboard Component
 * Container for the entire task management interface
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { error, clearError } = useTask();
  
  // Modal states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Open task creation form
   */
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  /**
   * Open task edit form
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  /**
   * Open task details modal
   */
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  /**
   * Close task form
   */
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  /**
   * Close task modal
   */
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  /**
   * Handle task form success
   */
  const handleTaskFormSuccess = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Task Board</h1>
          <span className="user-welcome">Welcome, {user.name}</span>
        </div>
        
        <div className="header-right">
          <button 
            onClick={handleCreateTask}
            className="btn btn-primary"
          >
            + New Task
          </button>
          
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button 
            onClick={clearError}
            className="error-close"
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Filters */}
        <div className="dashboard-filters">
          <Filters />
        </div>

        {/* Task Board */}
        <div className="dashboard-board">
          <TaskBoard 
            onTaskClick={handleViewTask}
            onTaskEdit={handleEditTask}
          />
        </div>
      </main>

      {/* Modals */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseTaskForm}
          onSuccess={handleTaskFormSuccess}
        />
      )}

      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseTaskModal}
          onEdit={() => {
            handleCloseTaskModal();
            handleEditTask(selectedTask);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;