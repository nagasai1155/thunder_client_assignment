const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate user
 * Adds user information to req.user if token is valid
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get database connection
        const db = req.app.locals.db;
        
        // Verify user still exists in database
        const [users] = await db.execute(
            'SELECT id, email, name FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Add user info to request object
        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication error' });
    }
};

/**
 * Middleware to check if user owns a task or is admin
 * Should be used after authenticateToken
 */
const checkTaskOwnership = async (req, res, next) => {
    try {
        const taskId = req.params.id || req.body.taskId;
        const userId = req.user.id;
        const db = req.app.locals.db;

        // Check if task exists and get assignee
        const [tasks] = await db.execute(
            'SELECT assignee_id FROM tasks WHERE id = ?',
            [taskId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Allow if user is assignee or if no assignee is set
        const task = tasks[0];
        if (task.assignee_id === null || task.assignee_id === userId) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Not assigned to this task' });
        }
    } catch (error) {
        console.error('Task ownership check error:', error);
        res.status(500).json({ message: 'Authorization error' });
    }
};

module.exports = {
    authenticateToken,
    checkTaskOwnership
};