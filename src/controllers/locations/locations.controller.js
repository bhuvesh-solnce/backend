const { db } = require('../../models');
const { Op } = require('sequelize');

class LocationsController {
  // Get all states
  static async getStates(req, res) {
    try {
      const { search } = req.body || req.query;
      const where = {
        deleted_at: null,
      };

      if (search) {
        where.name = {
          [Op.like]: `%${search}%`,
        };
      }

      const states = await db.State.findAll({
        where,
        include: [
          {
            model: db.City,
            as: 'cities',
            where: { deleted_at: null },
            required: false,
            attributes: ['city_id'],
          },
        ],
        attributes: [
          'state_id',
          'name',
          'created_at',
          'updated_at',
        ],
        order: [['name', 'ASC']],
      });

      const statesWithCounts = states.map((state) => ({
        state_id: state.state_id,
        state_name: state.name,
        city_counter: state.cities ? state.cities.length : 0,
        discom_counter: 0, // TODO: Add discom counter when discom table is created
        updated_at: state.updated_at,
      }));

      res.json({
        action: 'success',
        data: statesWithCounts,
      });
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch states',
        error: error.message,
      });
    }
  }

  // Get all cities
  static async getCities(req, res) {
    try {
      const { search, state_id } = req.body || req.query;
      const where = {
        deleted_at: null,
      };

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { '$state.name$': { [Op.like]: `%${search}%` } },
        ];
      }

      if (state_id) {
        where.state_id = parseInt(state_id);
      }

      const cities = await db.City.findAll({
        where,
        include: [
          {
            model: db.State,
            as: 'state',
            attributes: ['state_id', 'name'],
          },
        ],
        attributes: [
          'city_id',
          'state_id',
          'name',
          'created_at',
          'updated_at',
        ],
        order: [['name', 'ASC']],
      });

      const formattedCities = cities.map((city) => ({
        city_id: city.city_id,
        state_id: city.state_id,
        city_name: city.name,
        state_name: city.state ? city.state.name : null,
        updated_at: city.updated_at,
      }));

      res.json({
        action: 'success',
        data: formattedCities,
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch cities',
        error: error.message,
      });
    }
  }

  // Get pin codes grouped by city
  static async getPinCodes(req, res) {
    try {
      const { search, city_id } = req.query;
      
      // Get cities with their pin codes
      const cityWhere = {
        deleted_at: null,
      };

      if (search) {
        cityWhere.name = {
          [Op.like]: `%${search}%`,
        };
      }

      if (city_id) {
        cityWhere.city_id = parseInt(city_id);
      }

      const cities = await db.City.findAll({
        where: cityWhere,
        include: [
          {
            model: db.PinCodeList,
            as: 'pinCodes',
            where: { deleted_at: null },
            required: false,
            attributes: [
              'id',
              'pin_code',
            ],
          },
        ],
        attributes: [
          'city_id',
          'name',
          'state_id',
        ],
        order: [['name', 'ASC']],
      });

      const formattedData = cities.map((city) => ({
        city_id: city.city_id,
        city: city.name,
        pin_code: city.pinCodes || [],
        dcr_price: null, // TODO: Add dcr_price when available
        ndcr_price: null, // TODO: Add ndcr_price when available
      }));

      res.json({
        action: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error fetching zip codes:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch zip codes',
        error: error.message,
      });
    }
  }

  // Create state
  static async createState(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          action: 'error',
          message: 'State name is required',
        });
      }

      const state = await db.State.create({
        name: name.trim(),
      });

      res.json({
        action: 'success',
        message: 'State created successfully',
        data: state,
      });
    } catch (error) {
      console.error('Error creating state:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to create state',
        error: error.message,
      });
    }
  }

  // Update state
  static async updateState(req, res) {
    try {
      const { state_id } = req.params;
      const { name } = req.body;

      const state = await db.State.findByPk(state_id);
      if (!state) {
        return res.status(404).json({
          action: 'error',
          message: 'State not found',
        });
      }

      if (name) {
        state.name = name.trim();
      }

      await state.save();

      res.json({
        action: 'success',
        message: 'State updated successfully',
        data: state,
      });
    } catch (error) {
      console.error('Error updating state:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to update state',
        error: error.message,
      });
    }
  }

  // Delete state (soft delete)
  static async deleteState(req, res) {
    try {
      const { state_id } = req.params;

      const state = await db.State.findByPk(state_id);
      if (!state) {
        return res.status(404).json({
          action: 'error',
          message: 'State not found',
        });
      }

      await state.destroy();

      res.json({
        action: 'success',
        message: 'State deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting state:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to delete state',
        error: error.message,
      });
    }
  }

  // Create city
  static async createCity(req, res) {
    try {
      const { name, state_id } = req.body;

      if (!name || !state_id) {
        return res.status(400).json({
          action: 'error',
          message: 'City name and state_id are required',
        });
      }

      const city = await db.City.create({
        name: name.trim(),
        state_id: parseInt(state_id),
      });

      res.json({
        action: 'success',
        message: 'City created successfully',
        data: city,
      });
    } catch (error) {
      console.error('Error creating city:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to create city',
        error: error.message,
      });
    }
  }

  // Update city
  static async updateCity(req, res) {
    try {
      const { city_id } = req.params;
      const { name, state_id } = req.body;

      const city = await db.City.findByPk(city_id);
      if (!city) {
        return res.status(404).json({
          action: 'error',
          message: 'City not found',
        });
      }

      if (name) {
        city.name = name.trim();
      }
      if (state_id) {
        city.state_id = parseInt(state_id);
      }

      await city.save();

      res.json({
        action: 'success',
        message: 'City updated successfully',
        data: city,
      });
    } catch (error) {
      console.error('Error updating city:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to update city',
        error: error.message,
      });
    }
  }

  // Delete city (soft delete)
  static async deleteCity(req, res) {
    try {
      const { city_id } = req.params;

      const city = await db.City.findByPk(city_id);
      if (!city) {
        return res.status(404).json({
          action: 'error',
          message: 'City not found',
        });
      }

      await city.destroy();

      res.json({
        action: 'success',
        message: 'City deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting city:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to delete city',
        error: error.message,
      });
    }
  }
}

module.exports = LocationsController;

