const router = require('express').Router();
const LocationsController = require('../../controllers/locations/locations.controller');
const LocationPriceManagementController = require('../../controllers/locations/location-price-management.controller');
const PincodeManagementController = require('../../controllers/locations/pincode-management.controller');

// States routes
router.post('/states', LocationsController.getStates);
router.post('/states/create', LocationsController.createState);
router.put('/states/:state_id', LocationsController.updateState);
router.delete('/states/:state_id', LocationsController.deleteState);

// Cities routes
router.post('/cities', LocationsController.getCities);
router.post('/cities/create', LocationsController.createCity);
router.put('/cities/:city_id', LocationsController.updateCity);
router.delete('/cities/:city_id', LocationsController.deleteCity);

// Pin codes routes
router.post('/pin-codes', LocationsController.getPinCodes);
router.post('/pincodes/get', PincodeManagementController.getPincodes);
router.post('/pincodes/manage', PincodeManagementController.managePincode);

// City Panel Pricing routes
router.post('/city-panel-prices', LocationPriceManagementController.getCityPanelPrices);
router.post('/city-panel-prices/manage', LocationPriceManagementController.manageCityPanelPrice);

// City Cost Range routes
router.post('/city-cost-ranges', LocationPriceManagementController.getCityCostRanges);
router.post('/city-cost-ranges/manage', LocationPriceManagementController.manageCityCostRange);

// City Discom Pricing routes
router.post('/city-discom-pricing', LocationPriceManagementController.getCityDiscomPricing);
router.post('/city-discom-pricing/manage', LocationPriceManagementController.manageCityDiscomPricing);

// State Panel Pricing routes
router.post('/state-panel-prices', LocationPriceManagementController.getStatePanelPrices);
router.post('/state-panel-prices/manage', LocationPriceManagementController.manageStatePanelPrice);

// State Cost Range routes
router.post('/state-cost-ranges', LocationPriceManagementController.getStateCostRanges);
router.post('/state-cost-ranges/manage', LocationPriceManagementController.manageStateCostRange);

// State Discom Pricing routes
router.post('/state-discom-pricing', LocationPriceManagementController.getStateDiscomPricing);
router.post('/state-discom-pricing/manage', LocationPriceManagementController.manageStateDiscomPricing);

// City Electricity Rates routes
router.post('/city-electricity-rates', LocationPriceManagementController.getCityElectricityRates);
router.post('/city-electricity-rates/manage', LocationPriceManagementController.manageCityElectricityRate);

// State Electricity Rates routes
router.post('/state-electricity-rates', LocationPriceManagementController.getStateElectricityRates);
router.post('/state-electricity-rates/manage', LocationPriceManagementController.manageStateElectricityRate);

// Panel Companies & Types (for dropdowns)
router.get('/panel-companies', LocationPriceManagementController.getPanelCompanies);
router.get('/panel-types', LocationPriceManagementController.getPanelTypes);

// Electricity Providers (for dropdowns)
router.get('/electricity-providers', LocationPriceManagementController.getElectricityProviders);

module.exports = router;

