import React from 'react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Filters Component
 * Provides filtering options for tasks
 */
const Filters = () => {
  const { users, filters, updateFilters, clearFilters, tasks } = useTask();
  const { user } = useAuth();

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterType, value) => {
    updateFilters({
      [filterType]: value
    });
  };

  /**
   * Handle clear filters
   */
  const handleClearFilters = () => {
    clearFilters();
  };

  /**
   * Get filter statistics
   */
  const getFilterStats = () => {
    const totalTasks = tasks.length;
    const myTasks = tasks.filter(task => task.assignee?.id === user.id).length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
    const overdueTasks = tasks.filter(task => task.badge === 'Overdue').length;

    return {
      total: totalTasks,
      myTasks,
      highPriority: highPriorityTasks,
      overdue: overdueTasks
    };
  };

  const stats = getFilterStats();
  const hasActiveFilters = filters.assignee || filters.priority;

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button
            className="clear-filters-btn"
            onClick={handleClearFilters}
            title="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Quick Filters */}
        <div className="filter-section">
          <label className="filter-label">Quick Filters</label>
          <div className="quick-filters">
            <button
              className={`quick-filter ${filters.assignee == user.id ? 'active' : ''}`}
              onClick={() => handleFilterChange('assignee', 
                filters.assignee == user.id ? '' : user.id.toString()
              )}
            >
              My Tasks ({stats.myTasks})
            </button>
            
            <button
              className={`quick-filter ${filters.priority === 'High' ? 'active' : ''}`}
              onClick={() => handleFilterChange('priority', 
                filters.priority === 'High' ? '' : 'High'
              )}
            >
              High Priority ({stats.highPriority})
            </button>
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="assignee-filter">
            Filter by Assignee
          </label>
          <select
            id="assignee-filter"
            className="filter-select"
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
          >
            <option value="">All Assignees</option>
            <option value={user.id}>My Tasks</option>
            <option value="unassigned">Unassigned</option>
            {users
              .filter(u => u.id !== user.id)
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))
            }
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="priority-filter">
            Filter by Priority
          </label>
          <select
            id="priority-filter"
            className="filter-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Task Statistics */}
        <div className="filter-section">
          <label className="filter-label">Task Overview</label>
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-label">Total Tasks:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">My Tasks:</span>
              <span className="stat-value">{stats.myTasks}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">High Priority:</span>
              <span className="stat-value priority-high">{stats.highPriority}</span>
            </div>
            
            {stats.overdue > 0 && (
              <div className="stat-item">
                <span className="stat-label">Overdue:</span>
                <span className="stat-value badge-overdue">{stats.overdue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="filter-section">
            <label className="filter-label">Active Filters</label>
            <div className="active-filters">
              {filters.assignee && (
                <span className="active-filter">
                  Assignee: {
                    filters.assignee == user.id ? 'Me' : 
                    filters.assignee === 'unassigned' ? 'Unassigned' :
                    users.find(u => u.id == filters.assignee)?.name || 'Unknown'
                  }
                  <button
                    className="remove-filter"
                    onClick={() => handleFilterChange('assignee', '')}
                    aria-label="Remove assignee filter"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.priority && (
                <span className="active-filter">
                  Priority: {filters.priority}
                  <button
                    className="remove-filter"
                    onClick={() => handleFilterChange('priority', '')}
                    aria-label="Remove priority filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;