import React from 'react';
import { format, isValid } from 'date-fns';

/**
 * Task Card Component
 * Individual task card displaying task information
 */
const TaskCard = ({ task, onClick, onEdit }) => {
  /**
   * Handle drag start event
   */
  const handleDragStart = (e) => {
    const taskData = {
      taskId: task.id,
      currentStatus: task.status
    };
    e.dataTransfer.setData('application/json', JSON.stringify(taskData));
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Get badge class based on badge status
   */
  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'On Track':
        return 'badge-on-track';
      case 'At Risk':
        return 'badge-at-risk';
      case 'Overdue':
        return 'badge-overdue';
      default:
        return 'badge-on-track';
    }
  };

  /**
   * Get priority class
   */
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  /**
   * Format due date for display
   */
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    if (!isValid(date)) return null;
    
    return format(date, 'MMM dd, yyyy');
  };

  /**
   * Handle card click (prevent event bubbling for edit button)
   */
  const handleCardClick = (e) => {
    if (e.target.closest('.task-edit-btn')) {
      return; // Don't trigger card click if edit button was clicked
    }
    onClick();
  };

  /**
   * Handle edit button click
   */
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const formattedDueDate = formatDueDate(task.due_date);

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(e);
        }
      }}
    >
      {/* Task Header */}
      <div className="task-header">
        <div className="task-priority">
          <span className={`priority-indicator ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <button
          className="task-edit-btn"
          onClick={handleEditClick}
          aria-label="Edit task"
          title="Edit task"
        >
          ✎
        </button>
      </div>

      {/* Task Title */}
      <h4 className="task-title">{task.title}</h4>

      {/* Task Description Preview */}
      {task.description && (
        <p className="task-description">
          {task.description.length > 80 
            ? `${task.description.substring(0, 80)}...` 
            : task.description
          }
        </p>
      )}

      {/* Task Footer */}
      <div className="task-footer">
        {/* Assignee */}
        <div className="task-assignee">
          {task.assignee ? (
            <span className="assignee-name" title={task.assignee.email}>
              {task.assignee.name}
            </span>
          ) : (
            <span className="no-assignee">Unassigned</span>
          )}
        </div>

        {/* Due Date and Badge */}
        <div className="task-meta">
          {formattedDueDate && (
            <span className="task-due-date">
              Due: {formattedDueDate}
            </span>
          )}
          
          <span className={`task-badge ${getBadgeClass(task.badge)}`}>
            {task.badge}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;