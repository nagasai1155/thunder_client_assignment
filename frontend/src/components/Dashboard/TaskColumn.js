import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import TaskCard from './TaskCard';

/**
 * Task Column Component
 * Represents a single column in the task board (Backlog, In Progress, etc.)
 */
const TaskColumn = ({ 
  id, 
  title, 
  status, 
  tasks, 
  className, 
  onTaskClick, 
  onTaskEdit 
}) => {
  const { moveTask } = useTask();
  const [draggedOver, setDraggedOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  /**
   * Handle drag over event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  /**
   * Handle drop event
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    setDraggedOver(false);
    setIsDropping(true);

    try {
      // Get task data from drag event
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      const { taskId, currentStatus } = taskData;

      // Don't move if dropping in same column
      if (currentStatus === status) {
        return;
      }

      // Move task to new status
      const result = await moveTask(taskId, status);
      
      if (!result.success) {
        console.error('Failed to move task:', result.error);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      setIsDropping(false);
    }
  };

  /**
   * Get column class names
   */
  const getColumnClassName = () => {
    let classes = `task-column ${className}`;
    
    if (draggedOver) {
      classes += ' drag-over';
    }
    
    if (isDropping) {
      classes += ' dropping';
    }
    
    return classes;
  };

  return (
    <div 
      className={getColumnClassName()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="column-header">
        <h3 className="column-title">{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      {/* Tasks List */}
      <div className="column-content">
        {tasks.length === 0 ? (
          <div className="empty-column">
            <p>No tasks</p>
            {draggedOver && (
              <p className="drop-hint">Drop task here</p>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onEdit={() => onTaskEdit(task)}
              />
            ))}
          </div>
        )}

        {/* Drop indicator */}
        {isDropping && (
          <div className="drop-indicator">
            <div className="drop-spinner"></div>
            <p>Moving task...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;