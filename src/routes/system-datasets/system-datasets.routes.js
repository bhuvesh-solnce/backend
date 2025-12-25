const express = require('express');
const router = express.Router();
const SystemDatasetsController = require('../../controllers/system-datasets/system-datasets.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/permission.middleware');

router.use(authenticate);

// Panel Types Routes
router.get('/panel-types', requirePermission('panel_types.view'), SystemDatasetsController.getAllPanelTypes);
router.get('/panel-types/:id', requirePermission('panel_types.view'), SystemDatasetsController.getPanelTypeById);
router.post('/panel-types', requirePermission('panel_types.create'), SystemDatasetsController.createPanelType);
router.put('/panel-types/:id', requirePermission('panel_types.update'), SystemDatasetsController.updatePanelType);
router.delete('/panel-types/:id', requirePermission('panel_types.delete'), SystemDatasetsController.deletePanelType);

// Watt Peaks Routes
router.get('/watt-peaks', requirePermission('watt_peaks.view'), SystemDatasetsController.getAllWattPeaks);
router.get('/watt-peaks/:id', requirePermission('watt_peaks.view'), SystemDatasetsController.getWattPeakById);
router.post('/watt-peaks', requirePermission('watt_peaks.create'), SystemDatasetsController.createWattPeak);
router.put('/watt-peaks/:id', requirePermission('watt_peaks.update'), SystemDatasetsController.updateWattPeak);
router.delete('/watt-peaks/:id', requirePermission('watt_peaks.delete'), SystemDatasetsController.deleteWattPeak);

// Panel Companies Routes
router.get('/panel-companies', requirePermission('panel_companies.view'), SystemDatasetsController.getAllPanelCompanies);
router.get('/panel-companies/:id', requirePermission('panel_companies.view'), SystemDatasetsController.getPanelCompanyById);
router.post('/panel-companies', requirePermission('panel_companies.create'), SystemDatasetsController.createPanelCompany);
router.put('/panel-companies/:id', requirePermission('panel_companies.update'), SystemDatasetsController.updatePanelCompany);
router.delete('/panel-companies/:id', requirePermission('panel_companies.delete'), SystemDatasetsController.deletePanelCompany);

// Inverter Companies Routes
router.get('/inverter-companies', requirePermission('inverter_companies.view'), SystemDatasetsController.getAllInverterCompanies);
router.get('/inverter-companies/:id', requirePermission('inverter_companies.view'), SystemDatasetsController.getInverterCompanyById);
router.post('/inverter-companies', requirePermission('inverter_companies.create'), SystemDatasetsController.createInverterCompany);
router.put('/inverter-companies/:id', requirePermission('inverter_companies.update'), SystemDatasetsController.updateInverterCompany);
router.delete('/inverter-companies/:id', requirePermission('inverter_companies.delete'), SystemDatasetsController.deleteInverterCompany);

// Electricity Providers Routes
router.get('/electricity-providers', requirePermission('electricity_providers.view'), SystemDatasetsController.getAllElectricityProviders);
router.get('/electricity-providers/:id', requirePermission('electricity_providers.view'), SystemDatasetsController.getElectricityProviderById);
router.post('/electricity-providers', requirePermission('electricity_providers.create'), SystemDatasetsController.createElectricityProvider);
router.put('/electricity-providers/:id', requirePermission('electricity_providers.update'), SystemDatasetsController.updateElectricityProvider);
router.delete('/electricity-providers/:id', requirePermission('electricity_providers.delete'), SystemDatasetsController.deleteElectricityProvider);

module.exports = router;

