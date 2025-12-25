// src/routes/index.js
const express = require('express');
const router = express.Router();

const AuthRoutes = require('./auth/auth.routes');
const RolesRoutes = require('./roles/roles.routes');
const WorkflowRoutes = require('./workflow/workflow.routes'); 
const projectsRoutes = require('./projects/projects.routes');
const dataProviderRoutes = require('./data/dataprovider.routes');
const systemDatasetsRoutes = require('./system-datasets/system-datasets.routes');
const locationsRoutes = require('./locations/locations.routes');
const techSpecsRoutes = require('./tech-specs/tech-specs.routes');

const initRoutes = () => {
    router.use('/auth', AuthRoutes);
    router.use('/roles', RolesRoutes);
    router.use('/workflow', WorkflowRoutes);
    router.use('/projects', projectsRoutes);
    router.use('/data-provider', dataProviderRoutes);
    router.use('/system-datasets', systemDatasetsRoutes);
    router.use('/locations', locationsRoutes);
    router.use('/tech-specs', techSpecsRoutes);
    return router;
}

module.exports = initRoutes;