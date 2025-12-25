const router = require('express').Router();
const CommentsController = require('../../controllers/projects/comments.controller');
const authenticate = require('../../middleware/auth.middleware');

router.use(authenticate);

// Note: These routes are mounted at /projects, so full paths are:
// GET /projects/mention-users (must be before :projectId route)
// POST /projects/comments/:commentId/like
// GET /projects/:projectId/comments
// POST /projects/:projectId/comments

// Static routes MUST come before dynamic routes to avoid conflicts
router.get('/mention-users', CommentsController.getMentionUsers);
router.post('/comments/:commentId/like', CommentsController.toggleLike);

// Dynamic routes
router.get('/:projectId/comments', CommentsController.getComments);
router.post('/:projectId/comments', CommentsController.createComment);

module.exports = router;

