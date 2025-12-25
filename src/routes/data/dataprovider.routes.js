const express = require('express');
const router = express.Router();
const DataProviderController = require('../../controllers/data/dataprovider.controller');
const authenticate = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// List all available data sources (for builder UI)
router.get('/sources/list', DataProviderController.listSources);

// Get data by source type (supports query params for filtering)
router.get('/:source', DataProviderController.getDataBySource);

module.exports = router;

