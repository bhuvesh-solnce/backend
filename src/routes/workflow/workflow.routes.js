// src/routes/workflow/workflow.routes.js
const router = require('express').Router();
const WorkflowController = require('../../controllers/workflow/workflow.controller');
const authenticate = require('../../middleware/auth.middleware');
// const { requirePermission } = require('../../middleware/permission.middleware');

// Apply Auth globally to these routes
router.use(authenticate);

// Definitions
router.get('/', WorkflowController.getWorkflows);
router.post('/', WorkflowController.createWorkflow);
router.get('/:workflowId/stages', WorkflowController.getStages);
router.post('/stages', WorkflowController.upsertStage);

// Execution
router.post('/instance', WorkflowController.startInstance);
router.post('/instance/:instanceId/submit', WorkflowController.submitStage);

module.exports = router;