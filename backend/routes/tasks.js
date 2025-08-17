const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

/**
 * Helper function to determine task badge status
 * @param {Date} dueDate - Task due date
 * @param {string} status - Task status
 * @returns {string} Badge status: 'On Track', 'At Risk', or 'Overdue'
 */
const getTaskBadge = (dueDate, status) => {
    if (!dueDate || status === 'Done') {
        return 'On Track';
    }

    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) {
        return 'Overdue';
    } else if (hoursDiff <= 24) {
        return 'At Risk';
    }
    return 'On Track';
};

/**
 * @route GET /api/tasks
 * @desc Get all tasks with optional filters
 * @access Private
 */
router.get('/', [
    query('assignee').optional().isInt({ min: 1 }),
    query('priority').optional().isIn(['Low', 'Medium', 'High']),
    query('status').optional().isIn(['Backlog', 'In Progress', 'Review', 'Done'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid query parameters',
                errors: errors.array()
            });
        }

        const { assignee, priority, status } = req.query;
        const db = req.app.locals.db;

        // Build query with filters
        let query = `
            SELECT 
                t.id, t.title, t.description, t.priority, t.status, t.due_date,
                t.created_at, t.updated_at, t.assignee_id,
                u.name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            WHERE 1=1
        `;
        
        const queryParams = [];

        if (assignee) {
            query += ' AND t.assignee_id = ?';
            queryParams.push(assignee);
        }

        if (priority) {
            query += ' AND t.priority = ?';
            queryParams.push(priority);
        }

        if (status) {
            query += ' AND t.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await db.execute(query, queryParams);

        // Add badge status to each task
        const tasksWithBadges = tasks.map(task => ({
            ...task,
            badge: getTaskBadge(task.due_date, task.status),
            assignee: task.assignee_id ? {
                id: task.assignee_id,
                name: task.assignee_name,
                email: task.assignee_email
            } : null
        }));

        res.json(tasksWithBadges);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

/**
 * @route GET /api/tasks/:id
 * @desc Get single task by ID
 * @access Private
 */
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Invalid task ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid task ID',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const db = req.app.locals.db;

        const [tasks] = await db.execute(`
            SELECT 
                t.id, t.title, t.description, t.priority, t.status, t.due_date,
                t.created_at, t.updated_at, t.assignee_id,
                u.name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            WHERE t.id = ?
        `, [id]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const task = tasks[0];
        const taskWithBadge = {
            ...task,
            badge: getTaskBadge(task.due_date, task.status),
            assignee: task.assignee_id ? {
                id: task.assignee_id,
                name: task.assignee_name,
                email: task.assignee_email
            } : null
        };

        res.json(taskWithBadge);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Error fetching task' });
    }
});

/**
 * @route POST /api/tasks
 * @desc Create a new task
 * @access Private
 */
router.post('/', [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title is required and must be less than 255 characters'),
    body('description')
        .optional()
        .trim(),
    body('priority')
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be Low, Medium, or High'),
    body('assignee_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid assignee ID'),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, description, priority = 'Medium', assignee_id, due_date } = req.body;
        const db = req.app.locals.db;

        // Verify assignee exists if provided
        if (assignee_id) {
            const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [assignee_id]);
            if (users.length === 0) {
                return res.status(400).json({ message: 'Assignee not found' });
            }
        }

        const [result] = await db.execute(`
            INSERT INTO tasks (title, description, priority, assignee_id, due_date)
            VALUES (?, ?, ?, ?, ?)
        `, [title, description || null, priority, assignee_id || null, due_date || null]);

        // Fetch the created task with assignee info
        const [newTask] = await db.execute(`
            SELECT 
                t.id, t.title, t.description, t.priority, t.status, t.due_date,
                t.created_at, t.updated_at, t.assignee_id,
                u.name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            WHERE t.id = ?
        `, [result.insertId]);

        const task = newTask[0];
        const taskWithBadge = {
            ...task,
            badge: getTaskBadge(task.due_date, task.status),
            assignee: task.assignee_id ? {
                id: task.assignee_id,
                name: task.assignee_name,
                email: task.assignee_email
            } : null
        };

        res.status(201).json({
            message: 'Task created successfully',
            task: taskWithBadge
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Error creating task' });
    }
});

/**
 * @route PUT /api/tasks/:id
 * @desc Update a task
 * @access Private
 */
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Invalid task ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be less than 255 characters'),
    body('description')
        .optional()
        .trim(),
    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be Low, Medium, or High'),
    body('status')
        .optional()
        .isIn(['Backlog', 'In Progress', 'Review', 'Done'])
        .withMessage('Status must be Backlog, In Progress, Review, or Done'),
    body('assignee_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid assignee ID'),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const db = req.app.locals.db;

        // Check if task exists
        const [existingTasks] = await db.execute('SELECT id FROM tasks WHERE id = ?', [id]);
        if (existingTasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify assignee exists if provided
        if (req.body.assignee_id) {
            const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [req.body.assignee_id]);
            if (users.length === 0) {
                return res.status(400).json({ message: 'Assignee not found' });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        ['title', 'description', 'priority', 'status', 'assignee_id', 'due_date'].forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                updateFields.push(`${field} = ?`);
                updateValues.push(req.body[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updateValues.push(id);
        
        await db.execute(
            `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            updateValues
        );

        // Fetch updated task with assignee info
        const [updatedTask] = await db.execute(`
            SELECT 
                t.id, t.title, t.description, t.priority, t.status, t.due_date,
                t.created_at, t.updated_at, t.assignee_id,
                u.name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            WHERE t.id = ?
        `, [id]);

        const task = updatedTask[0];
        const taskWithBadge = {
            ...task,
            badge: getTaskBadge(task.due_date, task.status),
            assignee: task.assignee_id ? {
                id: task.assignee_id,
                name: task.assignee_name,
                email: task.assignee_email
            } : null
        };

        res.json({
            message: 'Task updated successfully',
            task: taskWithBadge
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete a task
 * @access Private
 */
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Invalid task ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid task ID',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const db = req.app.locals.db;

        // Check if task exists
        const [existingTasks] = await db.execute('SELECT id FROM tasks WHERE id = ?', [id]);
        if (existingTasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await db.execute('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

module.exports = router;