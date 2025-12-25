const { db } = require('../../models');
const { Op } = require('sequelize');

class TechSpecsController {
  /**
   * Get all tech specs grouped by category
   */
  static async getAllTechSpecs(req, res) {
    try {
      const { category } = req.query;

      // If specific category requested, return only that category
      if (category) {
        let data = [];
        switch (category) {
          case 'panel':
            const panels = await db.PanelSpecification.findAll({
              include: [
                { model: db.PanelCompany, as: 'panelCompany', attributes: ['id', 'company_name'] },
                { model: db.PanelType, as: 'panelType', attributes: ['id', 'panel_type'] },
                { model: db.WattPeak, as: 'wattPeak', attributes: ['id', 'watt_peak'] }
              ],
              order: [['id', 'DESC']]
            });
            data = panels.map((panel) => ({
              ...panel.toJSON(),
              company: panel.panelCompany?.company_name || panel.company,
              panel_type: panel.panelType?.panel_type || panel.panel_type,
              watt_peak: panel.wattPeak?.watt_peak || panel.watt_peak,
            }));
            break;
          case 'inverter':
            const inverters = await db.InverterSpecification.findAll({
              include: [
                { model: db.InverterCompany, as: 'inverterCompany', attributes: ['id', 'company_name'] }
              ],
              order: [['id', 'DESC']]
            });
            data = inverters.map((inverter) => ({
              ...inverter.toJSON(),
              company_name: inverter.inverterCompany?.company_name || inverter.company_name,
            }));
            break;
          case 'acdb':
            data = await db.AcdbSpecification.findAll({
              order: [['id', 'DESC']]
            });
            break;
          case 'dcdb':
            data = await db.DcdbSpecification.findAll({
              order: [['id', 'DESC']]
            });
            break;
          case 'circuit_breaker':
            data = await db.CircuitBreaker.findAll({
              order: [['id', 'DESC']]
            });
            break;
        }

        return res.status(200).json({
          success: true,
          action: 'success',
          data: { [category]: data }
        });
      }

      // Return all categories
      const [panels, inverters, acdbs, dcdbs, circuitBreakers] = await Promise.all([
        db.PanelSpecification.findAll({
          include: [
            { model: db.PanelCompany, as: 'panelCompany', attributes: ['id', 'company_name'] },
            { model: db.PanelType, as: 'panelType', attributes: ['id', 'panel_type'] },
            { model: db.WattPeak, as: 'wattPeak', attributes: ['id', 'watt_peak'] }
          ],
          order: [['id', 'DESC']]
        }),
        db.InverterSpecification.findAll({
          include: [
            { model: db.InverterCompany, as: 'inverterCompany', attributes: ['id', 'company_name'] }
          ],
          order: [['id', 'DESC']]
        }),
        db.AcdbSpecification.findAll({ order: [['id', 'DESC']] }),
        db.DcdbSpecification.findAll({ order: [['id', 'DESC']] }),
        db.CircuitBreaker.findAll({ order: [['id', 'DESC']] })
      ]);

      // Format panel data to include company and panel type names
      const formattedPanels = panels.map((panel) => ({
        ...panel.toJSON(),
        company: panel.panelCompany?.company_name || panel.company,
        panel_type: panel.panelType?.panel_type || panel.panel_type,
        watt_peak: panel.wattPeak?.watt_peak || panel.watt_peak,
      }));

      // Format inverter data to include company name
      const formattedInverters = inverters.map((inverter) => ({
        ...inverter.toJSON(),
        company_name: inverter.inverterCompany?.company_name || inverter.company_name,
      }));

      return res.status(200).json({
        success: true,
        action: 'success',
        data: {
          panel: formattedPanels,
          inverter: formattedInverters,
          acdb: acdbs,
          dcdb: dcdbs,
          circuit_breaker: circuitBreakers
        }
      });
    } catch (error) {
      console.error('[Tech Specs] Error fetching tech specs:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch tech specs',
        error: error.message
      });
    }
  }

  /**
   * Create a new tech spec entry
   */
  static async createTechSpec(req, res) {
    try {
      const { category, ...data } = req.body;

      if (!category) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Category is required'
        });
      }

      let created;
      switch (category) {
        case 'panel':
          created = await db.PanelSpecification.create(data);
          break;
        case 'inverter':
          created = await db.InverterSpecification.create(data);
          break;
        case 'acdb':
          created = await db.AcdbSpecification.create(data);
          break;
        case 'dcdb':
          created = await db.DcdbSpecification.create(data);
          break;
        case 'circuit_breaker':
          created = await db.CircuitBreaker.create(data);
          break;
        default:
          return res.status(400).json({
            success: false,
            action: 'error',
            message: 'Invalid category'
          });
      }

      return res.status(201).json({
        success: true,
        action: 'success',
        message: `${category} tech spec created successfully`,
        data: created
      });
    } catch (error) {
      console.error('[Tech Specs] Error creating tech spec:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to create tech spec',
        error: error.message
      });
    }
  }

  /**
   * Update a tech spec entry
   */
  static async updateTechSpec(req, res) {
    try {
      const { id } = req.params;
      const { category, ...data } = req.body;

      if (!category) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Category is required'
        });
      }

      let model;
      switch (category) {
        case 'panel':
          model = db.PanelSpecification;
          break;
        case 'inverter':
          model = db.InverterSpecification;
          break;
        case 'acdb':
          model = db.AcdbSpecification;
          break;
        case 'dcdb':
          model = db.DcdbSpecification;
          break;
        case 'circuit_breaker':
          model = db.CircuitBreaker;
          break;
        default:
          return res.status(400).json({
            success: false,
            action: 'error',
            message: 'Invalid category'
          });
      }

      const record = await model.findByPk(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: `${category} tech spec not found`
        });
      }

      await record.update(data);
      const updated = await model.findByPk(id);

      return res.status(200).json({
        success: true,
        action: 'success',
        message: `${category} tech spec updated successfully`,
        data: updated
      });
    } catch (error) {
      console.error('[Tech Specs] Error updating tech spec:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update tech spec',
        error: error.message
      });
    }
  }

  /**
   * Delete a tech spec entry
   */
  static async deleteTechSpec(req, res) {
    try {
      const { id } = req.params;
      const { category } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Category is required'
        });
      }

      let model;
      switch (category) {
        case 'panel':
          model = db.PanelSpecification;
          break;
        case 'inverter':
          model = db.InverterSpecification;
          break;
        case 'acdb':
          model = db.AcdbSpecification;
          break;
        case 'dcdb':
          model = db.DcdbSpecification;
          break;
        case 'circuit_breaker':
          model = db.CircuitBreaker;
          break;
        default:
          return res.status(400).json({
            success: false,
            action: 'error',
            message: 'Invalid category'
          });
      }

      const record = await model.findByPk(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: `${category} tech spec not found`
        });
      }

      await record.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: `${category} tech spec deleted successfully`
      });
    } catch (error) {
      console.error('[Tech Specs] Error deleting tech spec:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete tech spec',
        error: error.message
      });
    }
  }
}

module.exports = TechSpecsController;

