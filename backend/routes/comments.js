const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All comment routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/comments/task/:taskId
 * @desc Get all comments for a specific task
 * @access Private
 */
router.get('/task/:taskId', [
    param('taskId').isInt({ min: 1 }).withMessage('Invalid task ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid task ID',
                errors: errors.array()
            });
        }

        const { taskId } = req.params;
        const db = req.app.locals.db;

        // Verify task exists
        const [tasks] = await db.execute('SELECT id FROM tasks WHERE id = ?', [taskId]);
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get comments with author information
        const [comments] = await db.execute(`
            SELECT 
                c.id, c.task_id, c.body, c.created_at,
                c.author_id, u.name as author_name, u.email as author_email
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.task_id = ?
            ORDER BY c.created_at ASC
        `, [taskId]);

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            taskId: comment.task_id,
            body: comment.body,
            createdAt: comment.created_at,
            author: {
                id: comment.author_id,
                name: comment.author_name,
                email: comment.author_email
            }
        }));

        res.json(formattedComments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

/**
 * @route POST /api/comments
 * @desc Create a new comment
 * @access Private
 */
router.post('/', [
    body('taskId')
        .isInt({ min: 1 })
        .withMessage('Valid task ID is required'),
    body('body')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment body is required and must be less than 1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { taskId, body } = req.body;
        const authorId = req.user.id;
        const db = req.app.locals.db;

        // Verify task exists
        const [tasks] = await db.execute('SELECT id FROM tasks WHERE id = ?', [taskId]);
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Create comment
        const [result] = await db.execute(
            'INSERT INTO comments (task_id, author_id, body) VALUES (?, ?, ?)',
            [taskId, authorId, body]
        );

        // Fetch the created comment with author info
        const [newComment] = await db.execute(`
            SELECT 
                c.id, c.task_id, c.body, c.created_at,
                c.author_id, u.name as author_name, u.email as author_email
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        const comment = newComment[0];
        const formattedComment = {
            id: comment.id,
            taskId: comment.task_id,
            body: comment.body,
            createdAt: comment.created_at,
            author: {
                id: comment.author_id,
                name: comment.author_name,
                email: comment.author_email
            }
        };

        res.status(201).json({
            message: 'Comment created successfully',
            comment: formattedComment
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
});

/**
 * @route PUT /api/comments/:id
 * @desc Update a comment (only by author)
 * @access Private
 */
router.put('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Invalid comment ID'),
    body('body')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment body is required and must be less than 1000 characters')
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
        const { body } = req.body;
        const userId = req.user.id;
        const db = req.app.locals.db;

        // Check if comment exists and user is author
        const [comments] = await db.execute(
            'SELECT author_id FROM comments WHERE id = ?',
            [id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comments[0].author_id !== userId) {
            return res.status(403).json({ message: 'Access denied: You can only edit your own comments' });
        }

        // Update comment
        await db.execute(
            'UPDATE comments SET body = ? WHERE id = ?',
            [body, id]
        );

        // Fetch updated comment with author info
        const [updatedComment] = await db.execute(`
            SELECT 
                c.id, c.task_id, c.body, c.created_at,
                c.author_id, u.name as author_name, u.email as author_email
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.id = ?
        `, [id]);

        const comment = updatedComment[0];
        const formattedComment = {
            id: comment.id,
            taskId: comment.task_id,
            body: comment.body,
            createdAt: comment.created_at,
            author: {
                id: comment.author_id,
                name: comment.author_name,
                email: comment.author_email
            }
        };

        res.json({
            message: 'Comment updated successfully',
            comment: formattedComment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
});

/**
 * @route DELETE /api/comments/:id
 * @desc Delete a comment (only by author)
 * @access Private
 */
router.delete('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Invalid comment ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Invalid comment ID',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const userId = req.user.id;
        const db = req.app.locals.db;

        // Check if comment exists and user is author
        const [comments] = await db.execute(
            'SELECT author_id FROM comments WHERE id = ?',
            [id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comments[0].author_id !== userId) {
            return res.status(403).json({ message: 'Access denied: You can only delete your own comments' });
        }

        await db.execute('DELETE FROM comments WHERE id = ?', [id]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

module.exports = router;