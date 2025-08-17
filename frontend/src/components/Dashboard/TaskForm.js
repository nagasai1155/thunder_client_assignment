import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { format } from 'date-fns';
import '../../styles/TaskForm.css';
/**
 * Task Form Component
 * Modal form for creating and editing tasks
 */
const TaskForm = ({ task, onClose, onSuccess }) => {
  const { users, createTask, updateTask, loading } = useTask();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignee_id: '',
    due_date: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!task;

  // Initialize form data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        assignee_id: task.assignee?.id || '',
        due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd\'T\'HH:mm') : ''
      });
    }
  }, [task]);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length > 255) {
      errors.title = 'Title must be less than 255 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // Due date validation
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.due_date = 'Please enter a valid date';
      } else if (dueDate < now && !isEditing) {
        errors.due_date = 'Due date cannot be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare task data
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        due_date: formData.due_date || null
      };

      let result;
      if (isEditing) {
        result = await updateTask(task.id, taskData);
      } else {
        result = await createTask(taskData);
      }

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Task form submission error:', error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content task-form-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={formErrors.title ? 'error' : ''}
              placeholder="Enter task title"
              disabled={isSubmitting}
              maxLength={255}
            />
            {formErrors.title && (
              <span className="error-message">{formErrors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={formErrors.description ? 'error' : ''}
              placeholder="Enter task description (optional)"
              rows={4}
              disabled={isSubmitting}
              maxLength={1000}
            />
            {formErrors.description && (
              <span className="error-message">{formErrors.description}</span>
            )}
            <small className="char-count">
              {formData.description.length}/1000 characters
            </small>
          </div>

          {/* Priority and Assignee Row */}
          <div className="form-row">
            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="form-group">
              <label htmlFor="assignee_id">Assignee</label>
              <select
                id="assignee_id"
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={formErrors.due_date ? 'error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.due_date && (
              <span className="error-message">{formErrors.due_date}</span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner small"></span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;