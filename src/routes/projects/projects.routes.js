const router = require('express').Router();
const ProjectsController = require('../../controllers/projects/projects.controller');
const commentsRoutes = require('./comments.routes');
const authenticate = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/', ProjectsController.createProject);
router.get('/', ProjectsController.getAllProjects); // List

// Mount comments routes BEFORE dynamic :id route to avoid conflicts
router.use('/', commentsRoutes);

router.get('/:id', ProjectsController.getProject);  // Detail
router.get('/:id/stage-statuses', ProjectsController.getProjectStageStatuses); // Stage statuses
router.get('/:id/lead-history', ProjectsController.getLeadHistory); // Lead history
router.patch('/:id/lead-status', ProjectsController.updateLeadStatus); // Update lead status
router.delete('/:id', ProjectsController.deleteProject); // Delete project

module.exports = router;