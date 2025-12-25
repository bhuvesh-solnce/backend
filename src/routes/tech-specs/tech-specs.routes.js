const express = require('express');
const router = express.Router();
const TechSpecsController = require('../../controllers/tech-specs/tech-specs.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/permission.middleware');

router.use(authenticate);

// Get all tech specs
router.get('/', requirePermission('tech_specs.view'), TechSpecsController.getAllTechSpecs);

// Create tech spec
router.post('/', requirePermission('tech_specs.create'), TechSpecsController.createTechSpec);

// Update tech spec
router.put('/:id', requirePermission('tech_specs.update'), TechSpecsController.updateTechSpec);

// Delete tech spec (category passed in query or body)
router.delete('/:id', requirePermission('tech_specs.delete'), TechSpecsController.deleteTechSpec);

module.exports = router;

