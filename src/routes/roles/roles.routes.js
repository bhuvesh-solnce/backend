const router = require('express').Router();
const RolesController = require('../../controllers/roles/roles.controller');
// IMPORTANT: Add middleware here to ensure only Admins can access these routes
// const { verifyAdmin } = require('../../middleware/auth'); 

router.get('/', RolesController.getRoles);
router.get('/permissions', RolesController.getAllPermissions);
router.post('/', RolesController.createRole); // Add verifyAdmin here
router.put('/:id', RolesController.updateRole); // Add verifyAdmin here

module.exports = router;