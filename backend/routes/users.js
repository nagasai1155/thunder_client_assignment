const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/users
 * @desc Get all users (for assignee dropdown)
 * @access Private
 */
router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [users] = await db.execute(
            'SELECT id, name, email FROM users ORDER BY name ASC'
        );

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

/**
 * @route GET /api/users/me/tasks
 * @desc Get tasks assigned to current user
 * @access Private
 */
router.get('/me/tasks', async (req, res) => {
    try {
        const userId = req.user.id;
        const db = req.app.locals.db;

        const [tasks] = await db.execute(`
            SELECT 
                t.id, t.title, t.description, t.priority, t.status, t.due_date,
                t.created_at, t.updated_at, t.assignee_id,
                u.name as assignee_name, u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            WHERE t.assignee_id = ?
            ORDER BY t.created_at DESC
        `, [userId]);

        // Helper function to determine task badge status
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
        console.error('Get user tasks error:', error);
        res.status(500).json({ message: 'Error fetching user tasks' });
    }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.app.locals.db;

        if (isNaN(id) || parseInt(id) < 1) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const [users] = await db.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

module.exports = router;