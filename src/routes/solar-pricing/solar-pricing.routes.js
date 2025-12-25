const router = require('express').Router();
const SolarPricingController = require('../../controllers/solar-pricing/solar-pricing.controller');

// City Panel Pricing routes
router.post('/city-panel-prices', SolarPricingController.getCityPanelPrices);
router.post('/city-panel-prices/manage', SolarPricingController.manageCityPanelPrice);

// City Cost Range routes
router.post('/city-cost-ranges', SolarPricingController.getCityCostRanges);
router.post('/city-cost-ranges/manage', SolarPricingController.manageCityCostRange);

// City Discom Pricing routes
router.post('/city-discom-pricing', SolarPricingController.getCityDiscomPricing);
router.post('/city-discom-pricing/manage', SolarPricingController.manageCityDiscomPricing);

// State Panel Pricing routes
router.post('/state-panel-prices', SolarPricingController.getStatePanelPrices);
router.post('/state-panel-prices/manage', SolarPricingController.manageStatePanelPrice);

// State Cost Range routes
router.post('/state-cost-ranges', SolarPricingController.getStateCostRanges);
router.post('/state-cost-ranges/manage', SolarPricingController.manageStateCostRange);

// State Discom Pricing routes
router.post('/state-discom-pricing', SolarPricingController.getStateDiscomPricing);
router.post('/state-discom-pricing/manage', SolarPricingController.manageStateDiscomPricing);

module.exports = router;

