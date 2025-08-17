import React from 'react';
import { useTask } from '../../context/TaskContext';
import TaskColumn from './TaskColumn';
import '../../styles/TaskBoard.css';

/**
 * Task Board Component
 * Main board displaying tasks in columns by status
 */
const TaskBoard = ({ onTaskClick, onTaskEdit }) => {
  const { getTasksByStatus, loading } = useTask();

  // Get tasks grouped by status
  const tasksByStatus = getTasksByStatus();
  
  // Define column configuration
  const columns = [
    {
      id: 'backlog',
      title: 'Backlog',
      status: 'Backlog',
      className: 'backlog',
      tasks: tasksByStatus['Backlog'] || []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'In Progress',
      className: 'in-progress',
      tasks: tasksByStatus['In Progress'] || []
    },
    {
      id: 'review',
      title: 'Review',
      status: 'Review',
      className: 'review',
      tasks: tasksByStatus['Review'] || []
    },
    {
      id: 'done',
      title: 'Done',
      status: 'Done',
      className: 'done',
      tasks: tasksByStatus['Done'] || []
    }
  ];

  if (loading) {
    return (
      <div className="task-board loading">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-board">
      <div className="board-columns">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            status={column.status}
            tasks={column.tasks}
            className={column.className}
            onTaskClick={onTaskClick}
            onTaskEdit={onTaskEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;