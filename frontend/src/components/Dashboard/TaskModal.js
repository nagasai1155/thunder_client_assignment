import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { format, isValid } from 'date-fns';

/**
 * Task Modal Component
 * Modal for viewing task details and comments
 */
const TaskModal = ({ task, onClose, onEdit }) => {
  const { comments, loadComments, addComment, deleteTask } = useTask();
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const taskComments = comments[task.id] || [];

  // Load comments when modal opens
  useEffect(() => {
    if (task.id) {
      loadComments(task.id);
    }
  }, [task.id, loadComments]);

  /**
   * Handle comment submission
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    setIsAddingComment(true);
    
    try {
      const result = await addComment(task.id, newComment.trim());
      
      if (result.success) {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  /**
   * Handle task deletion
   */
  const handleDeleteTask = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteTask(task.id);
      
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Handle modal backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, 'MMM dd, yyyy \'at\' h:mm a');
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content task-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="task-header-info">
            <h2 className="task-title">{task.title}</h2>
            <div className="task-meta">
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {task.priority} Priority
              </span>
              <span className={`status-badge ${getBadgeClass(task.badge)}`}>
                {task.badge}
              </span>
            </div>
          </div>
          
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={onEdit}
              title="Edit task"
            >
              Edit
            </button>
            
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
              disabled={isDeleting}
            >
              Delete
            </button>
            
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Task Details */}
        <div className="modal-body">
          <div className="task-details">
            {/* Description */}
            <div className="detail-section">
              <h3>Description</h3>
              <div className="description-content">
                {task.description ? (
                  <p>{task.description}</p>
                ) : (
                  <p className="no-description">No description provided</p>
                )}
              </div>
            </div>

            {/* Task Information */}
            <div className="detail-section">
              <h3>Task Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-value">{task.status}</span>
                </div>
                
                <div className="info-item">
                  <label>Assignee:</label>
                  <span className="assignee-value">
                    {task.assignee ? (
                      <span title={task.assignee.email}>
                        {task.assignee.name}
                      </span>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Due Date:</label>
                  <span className="due-date-value">
                    {formatDate(task.due_date)}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Created:</label>
                  <span className="created-value">
                    {formatDate(task.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="detail-section comments-section">
              <h3>Comments ({taskComments.length})</h3>
              
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="add-comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  disabled={isAddingComment}
                  maxLength={1000}
                />
                <div className="comment-form-actions">
                  <small className="char-count">
                    {newComment.length}/1000 characters
                  </small>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isAddingComment || !newComment.trim()}
                  >
                    {isAddingComment ? (
                      <>
                        <span className="loading-spinner small"></span>
                        Adding...
                      </>
                    ) : (
                      'Add Comment'
                    )}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="comments-list">
                {taskComments.length === 0 ? (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                  taskComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author.name}</span>
                        <span className="comment-date">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div className="comment-body">
                        {comment.body}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <h3>Delete Task</h3>
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="confirmation-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;