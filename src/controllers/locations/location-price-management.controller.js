const { db } = require('../../models');
const { Op } = require('sequelize');

class LocationPriceManagementController {
  // ==================== CITY PANEL PRICING ====================
  static async getCityPanelPrices(req, res) {
    try {
      const { actiontype, city_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (city_id) {
          where.city_id = parseInt(city_id);
        }

        const prices = await db.CityPanelPrice.findAll({
          where,
          include: [
            {
              model: db.PanelCompany,
              as: 'company',
              attributes: ['id', 'company_name'],
            },
            {
              model: db.PanelType,
              as: 'panelType',
              attributes: ['id', 'panel_type'],
            },
          ],
          attributes: ['id', 'city_id', 'company_id', 'panel_type_id', 'dcr_price', 'ndcr_price'],
        });

        const formattedPrices = prices.map((price) => ({
          id: price.id,
          city_id: price.city_id,
          company_id: price.company_id,
          panel_type_id: price.panel_type_id,
          company_name: price.company?.company_name || '',
          panel_type_name: price.panelType?.panel_type || '',
          dcr_price: parseFloat(price.dcr_price) || 0,
          ndcr_price: parseFloat(price.ndcr_price) || 0,
        }));

        return res.json({
          action: 'success',
          data: formattedPrices,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching city panel prices:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch city panel prices',
        error: error.message,
      });
    }
  }

  static async manageCityPanelPrice(req, res) {
    try {
      const { actiontype, id, city_id, company_id, panel_type_id, dcr_price, ndcr_price } = req.body;

      if (actiontype === 'add') {
        if (!city_id || !company_id || !panel_type_id) {
          return res.status(400).json({
            action: 'error',
            message: 'city_id, company_id, and panel_type_id are required',
          });
        }

        const [price, created] = await db.CityPanelPrice.findOrCreate({
          where: {
            city_id: parseInt(city_id),
            company_id: parseInt(company_id),
            panel_type_id: parseInt(panel_type_id),
            deleted_at: null,
          },
          defaults: {
            city_id: parseInt(city_id),
            company_id: parseInt(company_id),
            panel_type_id: parseInt(panel_type_id),
            dcr_price: parseFloat(dcr_price) || 0,
            ndcr_price: parseFloat(ndcr_price) || 0,
          },
        });

        if (!created) {
          // Update if exists
          price.dcr_price = parseFloat(dcr_price) || price.dcr_price;
          price.ndcr_price = parseFloat(ndcr_price) || price.ndcr_price;
          await price.save();
        }

        return res.json({
          action: 'success',
          message: created ? 'City panel price added successfully' : 'City panel price updated successfully',
          data: price,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const price = await db.CityPanelPrice.findByPk(id);
        if (!price) {
          return res.status(404).json({
            action: 'error',
            message: 'City panel price not found',
          });
        }

        if (dcr_price !== undefined) price.dcr_price = parseFloat(dcr_price);
        if (ndcr_price !== undefined) price.ndcr_price = parseFloat(ndcr_price);
        if (company_id !== undefined) price.company_id = parseInt(company_id);
        if (panel_type_id !== undefined) price.panel_type_id = parseInt(panel_type_id);

        await price.save();

        return res.json({
          action: 'success',
          message: 'City panel price updated successfully',
          data: price,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const price = await db.CityPanelPrice.findByPk(id);
        if (!price) {
          return res.status(404).json({
            action: 'error',
            message: 'City panel price not found',
          });
        }

        await price.destroy();

        return res.json({
          action: 'success',
          message: 'City panel price deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing city panel price:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage city panel price',
        error: error.message,
      });
    }
  }

  // ==================== CITY COST RANGE ====================
  static async getCityCostRanges(req, res) {
    try {
      const { actiontype, city_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (city_id) {
          where.city_id = parseInt(city_id);
        }

        const ranges = await db.CityCostRange.findAll({
          where,
          order: [['min_kw', 'ASC']],
        });

        // Convert DECIMAL fields to numbers
        const formattedRanges = ranges.map((range) => ({
          id: range.id,
          city_id: range.city_id,
          min_kw: parseFloat(range.min_kw) || 0,
          max_kw: parseFloat(range.max_kw) || 0,
          gst_tax: range.gst_tax != null ? parseFloat(range.gst_tax) : null,
          profit_lp: range.profit_lp != null ? parseFloat(range.profit_lp) : null,
          profit_up: range.profit_up != null ? parseFloat(range.profit_up) : null,
          cei: range.cei != null ? parseFloat(range.cei) : null,
          file_charge: range.file_charge != null ? parseFloat(range.file_charge) : null,
          inc_fabricated: range.inc_fabricated != null ? parseFloat(range.inc_fabricated) : null,
          inc_prefabricated: range.inc_prefabricated != null ? parseFloat(range.inc_prefabricated) : null,
          inc_monorail: range.inc_monorail != null ? parseFloat(range.inc_monorail) : null,
          structure_fabricated: range.structure_fabricated != null ? parseFloat(range.structure_fabricated) : null,
          structure_prefabricated: range.structure_prefabricated != null ? parseFloat(range.structure_prefabricated) : null,
          structure_monorail: range.structure_monorail != null ? parseFloat(range.structure_monorail) : null,
          BOS: range.BOS != null ? parseFloat(range.BOS) : null,
          transport_cost: range.transport_cost != null ? parseFloat(range.transport_cost) : null,
          transport_per_inverter: range.transport_per_inverter != null ? parseFloat(range.transport_per_inverter) : null,
        }));

        return res.json({
          action: 'success',
          data: formattedRanges,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching city cost ranges:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch city cost ranges',
        error: error.message,
      });
    }
  }

  static async manageCityCostRange(req, res) {
    try {
      const { actiontype, id, city_id, min_kw, max_kw, gst_tax, profit_lp, profit_up, cei, file_charge, inc_fabricated, inc_prefabricated, inc_monorail, structure_fabricated, structure_prefabricated, structure_monorail, BOS, transport_cost, transport_per_inverter } = req.body;

      if (actiontype === 'insert') {
        if (!city_id || !min_kw || !max_kw) {
          return res.status(400).json({
            action: 'error',
            message: 'city_id, min_kw, and max_kw are required',
          });
        }

        const range = await db.CityCostRange.create({
          city_id: parseInt(city_id),
          min_kw: parseFloat(min_kw) || 0,
          max_kw: parseFloat(max_kw) || 0,
          gst_tax: gst_tax !== undefined ? parseFloat(gst_tax) : null,
          profit_lp: profit_lp !== undefined ? parseFloat(profit_lp) : null,
          profit_up: profit_up !== undefined ? parseFloat(profit_up) : null,
          cei: cei !== undefined ? parseFloat(cei) : null,
          file_charge: file_charge !== undefined ? parseFloat(file_charge) : null,
          inc_fabricated: inc_fabricated !== undefined ? parseFloat(inc_fabricated) : null,
          inc_prefabricated: inc_prefabricated !== undefined ? parseFloat(inc_prefabricated) : null,
          inc_monorail: inc_monorail !== undefined ? parseFloat(inc_monorail) : null,
          structure_fabricated: structure_fabricated !== undefined ? parseFloat(structure_fabricated) : null,
          structure_prefabricated: structure_prefabricated !== undefined ? parseFloat(structure_prefabricated) : null,
          structure_monorail: structure_monorail !== undefined ? parseFloat(structure_monorail) : null,
          BOS: BOS !== undefined ? parseFloat(BOS) : null,
          transport_cost: transport_cost !== undefined ? parseFloat(transport_cost) : null,
          transport_per_inverter: transport_per_inverter !== undefined ? parseFloat(transport_per_inverter) : null,
        });

        return res.json({
          action: 'success',
          message: 'City cost range added successfully',
          data: range,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const range = await db.CityCostRange.findByPk(id);
        if (!range) {
          return res.status(404).json({
            action: 'error',
            message: 'City cost range not found',
          });
        }

        // Update only provided fields
        const fieldsToUpdate = ['min_kw', 'max_kw', 'gst_tax', 'profit_lp', 'profit_up', 'cei', 'file_charge', 'inc_fabricated', 'inc_prefabricated', 'inc_monorail', 'structure_fabricated', 'structure_prefabricated', 'structure_monorail', 'BOS', 'transport_cost', 'transport_per_inverter'];
        fieldsToUpdate.forEach(field => {
          if (req.body[field] !== undefined) {
            if (req.body[field] === null || req.body[field] === '') {
              range[field] = null;
            } else {
              const numValue = typeof req.body[field] === 'string' ? parseFloat(req.body[field]) : Number(req.body[field]);
              range[field] = isNaN(numValue) ? null : numValue;
            }
          }
        });

        await range.save();

        return res.json({
          action: 'success',
          message: 'City cost range updated successfully',
          data: range,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const range = await db.CityCostRange.findByPk(id);
        if (!range) {
          return res.status(404).json({
            action: 'error',
            message: 'City cost range not found',
          });
        }

        await range.destroy();

        return res.json({
          action: 'success',
          message: 'City cost range deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing city cost range:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage city cost range',
        error: error.message,
      });
    }
  }

  // ==================== CITY DISCOM PRICING ====================
  static async getCityDiscomPricing(req, res) {
    try {
      const { actiontype, city_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (city_id) {
          where.city_id = parseInt(city_id);
        }

        const pricing = await db.CityDiscomPricing.findAll({
          where,
          order: [['discom_name', 'ASC']],
        });

        return res.json({
          action: 'success',
          data: pricing,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching city discom pricing:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch city discom pricing',
        error: error.message,
      });
    }
  }

  static async manageCityDiscomPricing(req, res) {
    try {
      const { actiontype, id, city_id, discom_name, unit_rate, fixed_charge } = req.body;

      if (actiontype === 'insert') {
        if (!city_id || !discom_name || unit_rate === undefined) {
          return res.status(400).json({
            action: 'error',
            message: 'city_id, discom_name, and unit_rate are required',
          });
        }

        const pricing = await db.CityDiscomPricing.create({
          city_id: parseInt(city_id),
          discom_name: discom_name.trim(),
          unit_rate: parseFloat(unit_rate) || 0,
          fixed_charge: fixed_charge !== undefined ? parseFloat(fixed_charge) : null,
        });

        return res.json({
          action: 'success',
          message: 'City discom pricing added successfully',
          data: pricing,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const pricing = await db.CityDiscomPricing.findByPk(id);
        if (!pricing) {
          return res.status(404).json({
            action: 'error',
            message: 'City discom pricing not found',
          });
        }

        if (discom_name !== undefined) pricing.discom_name = discom_name.trim();
        if (unit_rate !== undefined) pricing.unit_rate = parseFloat(unit_rate);
        if (fixed_charge !== undefined) pricing.fixed_charge = fixed_charge === null ? null : parseFloat(fixed_charge);

        await pricing.save();

        return res.json({
          action: 'success',
          message: 'City discom pricing updated successfully',
          data: pricing,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const pricing = await db.CityDiscomPricing.findByPk(id);
        if (!pricing) {
          return res.status(404).json({
            action: 'error',
            message: 'City discom pricing not found',
          });
        }

        await pricing.destroy();

        return res.json({
          action: 'success',
          message: 'City discom pricing deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing city discom pricing:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage city discom pricing',
        error: error.message,
      });
    }
  }

  // ==================== STATE PANEL PRICING ====================
  static async getStatePanelPrices(req, res) {
    try {
      const { actiontype, state_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (state_id) {
          where.state_id = parseInt(state_id);
        }

        const prices = await db.StatePanelPrice.findAll({
          where,
          include: [
            {
              model: db.PanelCompany,
              as: 'company',
              attributes: ['id', 'company_name'],
            },
            {
              model: db.PanelType,
              as: 'panelType',
              attributes: ['id', 'panel_type'],
            },
          ],
          attributes: ['id', 'state_id', 'company_id', 'panel_type_id', 'dcr_price', 'ndcr_price'],
        });

        const formattedPrices = prices.map((price) => ({
          id: price.id,
          state_id: price.state_id,
          company_id: price.company_id,
          panel_type_id: price.panel_type_id,
          company_name: price.company?.company_name || '',
          panel_type_name: price.panelType?.panel_type || '',
          dcr_price: parseFloat(price.dcr_price) || 0,
          ndcr_price: parseFloat(price.ndcr_price) || 0,
        }));

        return res.json({
          action: 'success',
          data: formattedPrices,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching state panel prices:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch state panel prices',
        error: error.message,
      });
    }
  }

  static async manageStatePanelPrice(req, res) {
    try {
      const { actiontype, id, state_id, company_id, panel_type_id, dcr_price, ndcr_price } = req.body;

      if (actiontype === 'add') {
        if (!state_id || !company_id || !panel_type_id) {
          return res.status(400).json({
            action: 'error',
            message: 'state_id, company_id, and panel_type_id are required',
          });
        }

        const [price, created] = await db.StatePanelPrice.findOrCreate({
          where: {
            state_id: parseInt(state_id),
            company_id: parseInt(company_id),
            panel_type_id: parseInt(panel_type_id),
            deleted_at: null,
          },
          defaults: {
            state_id: parseInt(state_id),
            company_id: parseInt(company_id),
            panel_type_id: parseInt(panel_type_id),
            dcr_price: parseFloat(dcr_price) || 0,
            ndcr_price: parseFloat(ndcr_price) || 0,
          },
        });

        if (!created) {
          price.dcr_price = parseFloat(dcr_price) || price.dcr_price;
          price.ndcr_price = parseFloat(ndcr_price) || price.ndcr_price;
          await price.save();
        }

        return res.json({
          action: 'success',
          message: created ? 'State panel price added successfully' : 'State panel price updated successfully',
          data: price,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const price = await db.StatePanelPrice.findByPk(id);
        if (!price) {
          return res.status(404).json({
            action: 'error',
            message: 'State panel price not found',
          });
        }

        if (dcr_price !== undefined) price.dcr_price = parseFloat(dcr_price);
        if (ndcr_price !== undefined) price.ndcr_price = parseFloat(ndcr_price);
        if (company_id !== undefined) price.company_id = parseInt(company_id);
        if (panel_type_id !== undefined) price.panel_type_id = parseInt(panel_type_id);

        await price.save();

        return res.json({
          action: 'success',
          message: 'State panel price updated successfully',
          data: price,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const price = await db.StatePanelPrice.findByPk(id);
        if (!price) {
          return res.status(404).json({
            action: 'error',
            message: 'State panel price not found',
          });
        }

        await price.destroy();

        return res.json({
          action: 'success',
          message: 'State panel price deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing state panel price:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage state panel price',
        error: error.message,
      });
    }
  }

  // ==================== STATE COST RANGE ====================
  static async getStateCostRanges(req, res) {
    try {
      const { actiontype, state_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (state_id) {
          where.state_id = parseInt(state_id);
        }

        const ranges = await db.StateCostRange.findAll({
          where,
          order: [['min_kw', 'ASC']],
        });

        // Convert DECIMAL fields to numbers
        const formattedRanges = ranges.map((range) => ({
          id: range.id,
          state_id: range.state_id,
          min_kw: parseFloat(range.min_kw) || 0,
          max_kw: parseFloat(range.max_kw) || 0,
          gst_tax: range.gst_tax != null ? parseFloat(range.gst_tax) : null,
          profit_lp: range.profit_lp != null ? parseFloat(range.profit_lp) : null,
          profit_up: range.profit_up != null ? parseFloat(range.profit_up) : null,
          cei: range.cei != null ? parseFloat(range.cei) : null,
          file_charge: range.file_charge != null ? parseFloat(range.file_charge) : null,
          inc_fabricated: range.inc_fabricated != null ? parseFloat(range.inc_fabricated) : null,
          inc_prefabricated: range.inc_prefabricated != null ? parseFloat(range.inc_prefabricated) : null,
          inc_monorail: range.inc_monorail != null ? parseFloat(range.inc_monorail) : null,
          structure_fabricated: range.structure_fabricated != null ? parseFloat(range.structure_fabricated) : null,
          structure_prefabricated: range.structure_prefabricated != null ? parseFloat(range.structure_prefabricated) : null,
          structure_monorail: range.structure_monorail != null ? parseFloat(range.structure_monorail) : null,
          BOS: range.BOS != null ? parseFloat(range.BOS) : null,
          transport_cost: range.transport_cost != null ? parseFloat(range.transport_cost) : null,
          transport_per_inverter: range.transport_per_inverter != null ? parseFloat(range.transport_per_inverter) : null,
        }));

        return res.json({
          action: 'success',
          data: formattedRanges,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching state cost ranges:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch state cost ranges',
        error: error.message,
      });
    }
  }

  static async manageStateCostRange(req, res) {
    try {
      const { actiontype, id, state_id, min_kw, max_kw, gst_tax, profit_lp, profit_up, cei, file_charge, inc_fabricated, inc_prefabricated, inc_monorail, structure_fabricated, structure_prefabricated, structure_monorail, BOS, transport_cost, transport_per_inverter } = req.body;

      if (actiontype === 'insert') {
        if (!state_id || !min_kw || !max_kw) {
          return res.status(400).json({
            action: 'error',
            message: 'state_id, min_kw, and max_kw are required',
          });
        }

        const range = await db.StateCostRange.create({
          state_id: parseInt(state_id),
          min_kw: parseFloat(min_kw) || 0,
          max_kw: parseFloat(max_kw) || 0,
          gst_tax: gst_tax !== undefined ? parseFloat(gst_tax) : null,
          profit_lp: profit_lp !== undefined ? parseFloat(profit_lp) : null,
          profit_up: profit_up !== undefined ? parseFloat(profit_up) : null,
          cei: cei !== undefined ? parseFloat(cei) : null,
          file_charge: file_charge !== undefined ? parseFloat(file_charge) : null,
          inc_fabricated: inc_fabricated !== undefined ? parseFloat(inc_fabricated) : null,
          inc_prefabricated: inc_prefabricated !== undefined ? parseFloat(inc_prefabricated) : null,
          inc_monorail: inc_monorail !== undefined ? parseFloat(inc_monorail) : null,
          structure_fabricated: structure_fabricated !== undefined ? parseFloat(structure_fabricated) : null,
          structure_prefabricated: structure_prefabricated !== undefined ? parseFloat(structure_prefabricated) : null,
          structure_monorail: structure_monorail !== undefined ? parseFloat(structure_monorail) : null,
          BOS: BOS !== undefined ? parseFloat(BOS) : null,
          transport_cost: transport_cost !== undefined ? parseFloat(transport_cost) : null,
          transport_per_inverter: transport_per_inverter !== undefined ? parseFloat(transport_per_inverter) : null,
        });

        return res.json({
          action: 'success',
          message: 'State cost range added successfully',
          data: range,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const range = await db.StateCostRange.findByPk(id);
        if (!range) {
          return res.status(404).json({
            action: 'error',
            message: 'State cost range not found',
          });
        }

        const fieldsToUpdate = ['min_kw', 'max_kw', 'gst_tax', 'profit_lp', 'profit_up', 'cei', 'file_charge', 'inc_fabricated', 'inc_prefabricated', 'inc_monorail', 'structure_fabricated', 'structure_prefabricated', 'structure_monorail', 'BOS', 'transport_cost', 'transport_per_inverter'];
        fieldsToUpdate.forEach(field => {
          if (req.body[field] !== undefined) {
            if (req.body[field] === null || req.body[field] === '') {
              range[field] = null;
            } else {
              const numValue = typeof req.body[field] === 'string' ? parseFloat(req.body[field]) : Number(req.body[field]);
              range[field] = isNaN(numValue) ? null : numValue;
            }
          }
        });

        await range.save();

        return res.json({
          action: 'success',
          message: 'State cost range updated successfully',
          data: range,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const range = await db.StateCostRange.findByPk(id);
        if (!range) {
          return res.status(404).json({
            action: 'error',
            message: 'State cost range not found',
          });
        }

        await range.destroy();

        return res.json({
          action: 'success',
          message: 'State cost range deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing state cost range:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage state cost range',
        error: error.message,
      });
    }
  }

  // ==================== STATE DISCOM PRICING ====================
  static async getStateDiscomPricing(req, res) {
    try {
      const { actiontype, state_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (state_id) {
          where.state_id = parseInt(state_id);
        }

        const pricing = await db.StateDiscomPricing.findAll({
          where,
          order: [['discom_name', 'ASC']],
        });

        return res.json({
          action: 'success',
          data: pricing,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching state discom pricing:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch state discom pricing',
        error: error.message,
      });
    }
  }

  static async manageStateDiscomPricing(req, res) {
    try {
      const { actiontype, id, state_id, discom_name, unit_rate, fixed_charge } = req.body;

      if (actiontype === 'insert') {
        if (!state_id || !discom_name || unit_rate === undefined) {
          return res.status(400).json({
            action: 'error',
            message: 'state_id, discom_name, and unit_rate are required',
          });
        }

        const pricing = await db.StateDiscomPricing.create({
          state_id: parseInt(state_id),
          discom_name: discom_name.trim(),
          unit_rate: parseFloat(unit_rate) || 0,
          fixed_charge: fixed_charge !== undefined ? parseFloat(fixed_charge) : null,
        });

        return res.json({
          action: 'success',
          message: 'State discom pricing added successfully',
          data: pricing,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const pricing = await db.StateDiscomPricing.findByPk(id);
        if (!pricing) {
          return res.status(404).json({
            action: 'error',
            message: 'State discom pricing not found',
          });
        }

        if (discom_name !== undefined) pricing.discom_name = discom_name.trim();
        if (unit_rate !== undefined) pricing.unit_rate = parseFloat(unit_rate);
        if (fixed_charge !== undefined) pricing.fixed_charge = fixed_charge === null ? null : parseFloat(fixed_charge);

        await pricing.save();

        return res.json({
          action: 'success',
          message: 'State discom pricing updated successfully',
          data: pricing,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const pricing = await db.StateDiscomPricing.findByPk(id);
        if (!pricing) {
          return res.status(404).json({
            action: 'error',
            message: 'State discom pricing not found',
          });
        }

        await pricing.destroy();

        return res.json({
          action: 'success',
          message: 'State discom pricing deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing state discom pricing:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage state discom pricing',
        error: error.message,
      });
    }
  }

  // ==================== PANEL COMPANIES & TYPES (for dropdowns) ====================
  static async getPanelCompanies(req, res) {
    try {
      const companies = await db.PanelCompany.findAll({
        attributes: ['id', 'company_name'],
        order: [['company_name', 'ASC']],
      });

      return res.json({
        action: 'success',
        data: companies,
      });
    } catch (error) {
      console.error('Error fetching panel companies:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch panel companies',
        error: error.message,
      });
    }
  }

  static async getPanelTypes(req, res) {
    try {
      const types = await db.PanelType.findAll({
        attributes: ['id', 'panel_type'],
        order: [['panel_type', 'ASC']],
      });

      return res.json({
        action: 'success',
        data: types,
      });
    } catch (error) {
      console.error('Error fetching panel types:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch panel types',
        error: error.message,
      });
    }
  }

  // ==================== CITY ELECTRICITY RATES ====================
  static async getCityElectricityRates(req, res) {
    try {
      const { actiontype, city_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (city_id) {
          where.city_id = parseInt(city_id);
        }

        const rates = await db.CityElectricityRate.findAll({
          where,
          include: [
            {
              model: db.ElectricityProvider,
              as: 'provider',
              attributes: ['id', 'provider'],
            },
          ],
          attributes: ['id', 'city_id', 'provider_id', 'residential_price', 'nrgp_price', 'lt_price', 'ht_price'],
        });

        const formattedRates = rates.map((rate) => ({
          id: rate.id,
          city_id: rate.city_id,
          provider_id: rate.provider_id,
          provider_name: rate.provider?.provider || '',
          residential_price: parseFloat(rate.residential_price) || 0,
          nrgp_price: parseFloat(rate.nrgp_price) || 0,
          lt_price: parseFloat(rate.lt_price) || 0,
          ht_price: parseFloat(rate.ht_price) || 0,
        }));

        return res.json({
          action: 'success',
          data: formattedRates,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching city electricity rates:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch city electricity rates',
        error: error.message,
      });
    }
  }

  static async manageCityElectricityRate(req, res) {
    try {
      const { actiontype, id, city_id, provider_id, residential_price, nrgp_price, lt_price, ht_price } = req.body;

      if (actiontype === 'add') {
        if (!city_id || !provider_id) {
          return res.status(400).json({
            action: 'error',
            message: 'city_id and provider_id are required',
          });
        }

        const [rate, created] = await db.CityElectricityRate.findOrCreate({
          where: {
            city_id: parseInt(city_id),
            provider_id: parseInt(provider_id),
            deleted_at: null,
          },
          defaults: {
            city_id: parseInt(city_id),
            provider_id: parseInt(provider_id),
            residential_price: residential_price ? parseFloat(residential_price) : null,
            nrgp_price: nrgp_price ? parseFloat(nrgp_price) : null,
            lt_price: lt_price ? parseFloat(lt_price) : null,
            ht_price: ht_price ? parseFloat(ht_price) : null,
          },
        });

        if (!created) {
          if (residential_price !== undefined) rate.residential_price = residential_price ? parseFloat(residential_price) : null;
          if (nrgp_price !== undefined) rate.nrgp_price = nrgp_price ? parseFloat(nrgp_price) : null;
          if (lt_price !== undefined) rate.lt_price = lt_price ? parseFloat(lt_price) : null;
          if (ht_price !== undefined) rate.ht_price = ht_price ? parseFloat(ht_price) : null;
          await rate.save();
        }

        return res.json({
          action: 'success',
          message: created ? 'City electricity rate added successfully' : 'City electricity rate updated successfully',
          data: rate,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const rate = await db.CityElectricityRate.findByPk(id);
        if (!rate) {
          return res.status(404).json({
            action: 'error',
            message: 'City electricity rate not found',
          });
        }

        if (residential_price !== undefined) rate.residential_price = residential_price ? parseFloat(residential_price) : null;
        if (nrgp_price !== undefined) rate.nrgp_price = nrgp_price ? parseFloat(nrgp_price) : null;
        if (lt_price !== undefined) rate.lt_price = lt_price ? parseFloat(lt_price) : null;
        if (ht_price !== undefined) rate.ht_price = ht_price ? parseFloat(ht_price) : null;
        if (provider_id !== undefined) rate.provider_id = parseInt(provider_id);

        await rate.save();

        return res.json({
          action: 'success',
          message: 'City electricity rate updated successfully',
          data: rate,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const rate = await db.CityElectricityRate.findByPk(id);
        if (!rate) {
          return res.status(404).json({
            action: 'error',
            message: 'City electricity rate not found',
          });
        }

        await rate.destroy();

        return res.json({
          action: 'success',
          message: 'City electricity rate deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing city electricity rate:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage city electricity rate',
        error: error.message,
      });
    }
  }

  // ==================== STATE ELECTRICITY RATES ====================
  static async getStateElectricityRates(req, res) {
    try {
      const { actiontype, state_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (state_id) {
          where.state_id = parseInt(state_id);
        }

        const rates = await db.StateElectricityRate.findAll({
          where,
          include: [
            {
              model: db.ElectricityProvider,
              as: 'provider',
              attributes: ['id', 'provider'],
            },
          ],
          attributes: ['id', 'state_id', 'provider_id', 'residential_price', 'nrgp_price', 'lt_price', 'ht_price'],
        });

        const formattedRates = rates.map((rate) => ({
          id: rate.id,
          state_id: rate.state_id,
          provider_id: rate.provider_id,
          provider_name: rate.provider?.provider || '',
          residential_price: parseFloat(rate.residential_price) || 0,
          nrgp_price: parseFloat(rate.nrgp_price) || 0,
          lt_price: parseFloat(rate.lt_price) || 0,
          ht_price: parseFloat(rate.ht_price) || 0,
        }));

        return res.json({
          action: 'success',
          data: formattedRates,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching state electricity rates:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch state electricity rates',
        error: error.message,
      });
    }
  }

  static async manageStateElectricityRate(req, res) {
    try {
      const { actiontype, id, state_id, provider_id, residential_price, nrgp_price, lt_price, ht_price } = req.body;

      if (actiontype === 'add') {
        if (!state_id || !provider_id) {
          return res.status(400).json({
            action: 'error',
            message: 'state_id and provider_id are required',
          });
        }

        const [rate, created] = await db.StateElectricityRate.findOrCreate({
          where: {
            state_id: parseInt(state_id),
            provider_id: parseInt(provider_id),
            deleted_at: null,
          },
          defaults: {
            state_id: parseInt(state_id),
            provider_id: parseInt(provider_id),
            residential_price: residential_price ? parseFloat(residential_price) : null,
            nrgp_price: nrgp_price ? parseFloat(nrgp_price) : null,
            lt_price: lt_price ? parseFloat(lt_price) : null,
            ht_price: ht_price ? parseFloat(ht_price) : null,
          },
        });

        if (!created) {
          if (residential_price !== undefined) rate.residential_price = residential_price ? parseFloat(residential_price) : null;
          if (nrgp_price !== undefined) rate.nrgp_price = nrgp_price ? parseFloat(nrgp_price) : null;
          if (lt_price !== undefined) rate.lt_price = lt_price ? parseFloat(lt_price) : null;
          if (ht_price !== undefined) rate.ht_price = ht_price ? parseFloat(ht_price) : null;
          await rate.save();
        }

        return res.json({
          action: 'success',
          message: created ? 'State electricity rate added successfully' : 'State electricity rate updated successfully',
          data: rate,
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const rate = await db.StateElectricityRate.findByPk(id);
        if (!rate) {
          return res.status(404).json({
            action: 'error',
            message: 'State electricity rate not found',
          });
        }

        if (residential_price !== undefined) rate.residential_price = residential_price ? parseFloat(residential_price) : null;
        if (nrgp_price !== undefined) rate.nrgp_price = nrgp_price ? parseFloat(nrgp_price) : null;
        if (lt_price !== undefined) rate.lt_price = lt_price ? parseFloat(lt_price) : null;
        if (ht_price !== undefined) rate.ht_price = ht_price ? parseFloat(ht_price) : null;
        if (provider_id !== undefined) rate.provider_id = parseInt(provider_id);

        await rate.save();

        return res.json({
          action: 'success',
          message: 'State electricity rate updated successfully',
          data: rate,
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const rate = await db.StateElectricityRate.findByPk(id);
        if (!rate) {
          return res.status(404).json({
            action: 'error',
            message: 'State electricity rate not found',
          });
        }

        await rate.destroy();

        return res.json({
          action: 'success',
          message: 'State electricity rate deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing state electricity rate:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage state electricity rate',
        error: error.message,
      });
    }
  }

  // ==================== GET ELECTRICITY PROVIDERS (for dropdowns) ====================
  static async getElectricityProviders(req, res) {
    try {
      const providers = await db.ElectricityProvider.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'provider'],
        order: [['provider', 'ASC']],
      });

      return res.json({
        action: 'success',
        data: providers,
      });
    } catch (error) {
      console.error('Error fetching electricity providers:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch electricity providers',
        error: error.message,
      });
    }
  }
}

module.exports = LocationPriceManagementController;

