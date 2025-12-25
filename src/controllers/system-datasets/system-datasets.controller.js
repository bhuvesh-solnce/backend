const { db } = require('../../models');
const { Op } = require('sequelize');

class SystemDatasetsController {
  // ========== PANEL TYPES ==========
  static async getAllPanelTypes(req, res) {
    try {
      const panelTypes = await db.PanelType.findAll({
        order: [['id', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        action: 'success',
        data: panelTypes,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching panel types:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch panel types',
        error: error.message,
      });
    }
  }

  static async getPanelTypeById(req, res) {
    try {
      const { id } = req.params;
      const panelType = await db.PanelType.findByPk(id);

      if (!panelType) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel type not found',
        });
      }

      return res.status(200).json({
        success: true,
        action: 'success',
        data: panelType,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching panel type:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch panel type',
        error: error.message,
      });
    }
  }

  static async createPanelType(req, res) {
    try {
      const {
        panel_type,
        panel_description,
        is_residential_enabled,
        is_industrial_enabled,
        is_common_building_enabled,
        is_ground_mounted_enabled,
        sequence,
      } = req.body;

      if (!panel_type) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Panel type name is required',
        });
      }

      const panelType = await db.PanelType.create({
        panel_type,
        panel_description,
        is_residential_enabled: is_residential_enabled || false,
        is_industrial_enabled: is_industrial_enabled || false,
        is_common_building_enabled: is_common_building_enabled || false,
        is_ground_mounted_enabled: is_ground_mounted_enabled || false,
      });

      return res.status(201).json({
        success: true,
        action: 'success',
        message: 'Panel type created successfully',
        data: panelType,
      });
    } catch (error) {
      console.error('[System Datasets] Error creating panel type:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: error.message.includes('Duplicate') ? 'Panel type already exists' : 'Failed to create panel type',
        error: error.message,
      });
    }
  }

  static async updatePanelType(req, res) {
    try {
      const { id } = req.params;
      const {
        panel_type,
        panel_description,
        is_residential_enabled,
        is_industrial_enabled,
        is_common_building_enabled,
        is_ground_mounted_enabled,
      } = req.body;

      const panelType = await db.PanelType.findByPk(id);

      if (!panelType) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel type not found',
        });
      }

      await panelType.update({
        panel_type: panel_type !== undefined ? panel_type : panelType.panel_type,
        panel_description: panel_description !== undefined ? panel_description : panelType.panel_description,
        is_residential_enabled: is_residential_enabled !== undefined ? is_residential_enabled : panelType.is_residential_enabled,
        is_industrial_enabled: is_industrial_enabled !== undefined ? is_industrial_enabled : panelType.is_industrial_enabled,
        is_common_building_enabled: is_common_building_enabled !== undefined ? is_common_building_enabled : panelType.is_common_building_enabled,
        is_ground_mounted_enabled: is_ground_mounted_enabled !== undefined ? is_ground_mounted_enabled : panelType.is_ground_mounted_enabled,
      });

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Panel type updated successfully',
        data: panelType,
      });
    } catch (error) {
      console.error('[System Datasets] Error updating panel type:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update panel type',
        error: error.message,
      });
    }
  }

  static async deletePanelType(req, res) {
    try {
      const { id } = req.params;
      const panelType = await db.PanelType.findByPk(id);

      if (!panelType) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel type not found',
        });
      }

      await panelType.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Panel type deleted successfully',
      });
    } catch (error) {
      console.error('[System Datasets] Error deleting panel type:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete panel type',
        error: error.message,
      });
    }
  }

  // ========== WATT PEAKS ==========
  static async getAllWattPeaks(req, res) {
    try {
      const wattPeaks = await db.WattPeak.findAll({
        include: [
          {
            model: db.PanelType,
            as: 'panelType',
            attributes: ['id', 'panel_type'],
          },
        ],
        order: [['watt_peak', 'ASC']],
      });

      const formattedData = wattPeaks.map((wp) => ({
        watt_peak_id: wp.id,
        watt_peak: wp.watt_peak,
        panel_type: wp.panelType?.panel_type || '',
        panel_type_id: wp.panel_type_id,
      }));

      return res.status(200).json({
        success: true,
        action: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching watt peaks:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch watt peaks',
        error: error.message,
      });
    }
  }

  static async getWattPeakById(req, res) {
    try {
      const { id } = req.params;
      const wattPeak = await db.WattPeak.findByPk(id, {
        include: [
          {
            model: db.PanelType,
            as: 'panelType',
            attributes: ['id', 'panel_type'],
          },
        ],
      });

      if (!wattPeak) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Watt peak not found',
        });
      }

      return res.status(200).json({
        success: true,
        action: 'success',
        data: {
          watt_peak_id: wattPeak.id,
          watt_peak: wattPeak.watt_peak,
          panel_type: wattPeak.panelType?.panel_type || '',
          panel_type_id: wattPeak.panel_type_id,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching watt peak:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch watt peak',
        error: error.message,
      });
    }
  }

  static async createWattPeak(req, res) {
    try {
      const { watt_peak, panel_type_id } = req.body;

      if (!watt_peak || !panel_type_id) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Watt peak and panel type are required',
        });
      }

      const panelType = await db.PanelType.findByPk(panel_type_id);
      if (!panelType) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel type not found',
        });
      }

      const wattPeak = await db.WattPeak.create({
        watt_peak: parseFloat(watt_peak),
        panel_type_id,
      });

      return res.status(201).json({
        success: true,
        action: 'success',
        message: 'Watt peak created successfully',
        data: {
          watt_peak_id: wattPeak.id,
          watt_peak: wattPeak.watt_peak,
          panel_type: panelType.panel_type,
          panel_type_id: wattPeak.panel_type_id,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error creating watt peak:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: error.message.includes('Duplicate') ? 'Watt peak already exists for this panel type' : 'Failed to create watt peak',
        error: error.message,
      });
    }
  }

  static async updateWattPeak(req, res) {
    try {
      const { id } = req.params;
      const { watt_peak, panel_type_id } = req.body;

      const wattPeak = await db.WattPeak.findByPk(id);

      if (!wattPeak) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Watt peak not found',
        });
      }

      if (panel_type_id) {
        const panelType = await db.PanelType.findByPk(panel_type_id);
        if (!panelType) {
          return res.status(404).json({
            success: false,
            action: 'error',
            message: 'Panel type not found',
          });
        }
      }

      await wattPeak.update({
        watt_peak: watt_peak !== undefined ? parseFloat(watt_peak) : wattPeak.watt_peak,
        panel_type_id: panel_type_id !== undefined ? panel_type_id : wattPeak.panel_type_id,
      });

      const updated = await db.WattPeak.findByPk(id, {
        include: [
          {
            model: db.PanelType,
            as: 'panelType',
            attributes: ['id', 'panel_type'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Watt peak updated successfully',
        data: {
          watt_peak_id: updated.id,
          watt_peak: updated.watt_peak,
          panel_type: updated.panelType?.panel_type || '',
          panel_type_id: updated.panel_type_id,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error updating watt peak:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update watt peak',
        error: error.message,
      });
    }
  }

  static async deleteWattPeak(req, res) {
    try {
      const { id } = req.params;
      const wattPeak = await db.WattPeak.findByPk(id);

      if (!wattPeak) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Watt peak not found',
        });
      }

      await wattPeak.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Watt peak deleted successfully',
      });
    } catch (error) {
      console.error('[System Datasets] Error deleting watt peak:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete watt peak',
        error: error.message,
      });
    }
  }

  // ========== PANEL COMPANIES ==========
  static async getAllPanelCompanies(req, res) {
    try {
      const panelCompanies = await db.PanelCompany.findAll({
        include: [
          {
            model: db.PanelWattPeakData,
            as: 'wattPeakData',
            include: [
              {
                model: db.PanelType,
                as: 'panelType',
                attributes: ['id', 'panel_type'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      const formattedData = panelCompanies.map((company) => ({
        company_id: company.id,
        company_name: company.company_name,
        company_logo: company.company_logo,
        description: company.description,
        created_at: company.created_at,
        watt_peak_data: company.wattPeakData.map((wpd) => ({
          watt_peak_id: wpd.id,
          company_id: wpd.company_id,
          panel_type_id: wpd.panel_type_id,
          panel_type: wpd.panel_type || wpd.panelType?.panel_type || '',
          attribute_id: wpd.attribute_id,
          dcr_price: wpd.dcr_price,
          ndcr_price: wpd.ndcr_price,
          price_per_kw: wpd.price_per_kw,
          max_price_range: wpd.max_price_range,
          min_price_range: wpd.min_price_range,
          rated_power_stc: wpd.rated_power_stc,
          rated_power_tol: wpd.rated_power_tol,
          rated_power_pmax: wpd.rated_power_pmax,
          max_power_current: wpd.max_power_current,
          max_power_voltage: wpd.max_power_voltage,
          module_efficiency: wpd.module_efficiency,
          nominal_cell_temp: wpd.nominal_cell_temp,
          max_power_temp_coeff: wpd.max_power_temp_coeff,
          open_circuit_voltage: wpd.open_circuit_voltage,
          short_circuit_current: wpd.short_circuit_current,
        })),
      }));

      return res.status(200).json({
        success: true,
        action: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching panel companies:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch panel companies',
        error: error.message,
      });
    }
  }

  static async getPanelCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await db.PanelCompany.findByPk(id, {
        include: [
          {
            model: db.PanelWattPeakData,
            as: 'wattPeakData',
            include: [
              {
                model: db.PanelType,
                as: 'panelType',
                attributes: ['id', 'panel_type'],
              },
            ],
          },
        ],
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel company not found',
        });
      }

      return res.status(200).json({
        success: true,
        action: 'success',
        data: {
          company_id: company.id,
          company_name: company.company_name,
          company_logo: company.company_logo,
          description: company.description,
          watt_peak_data: company.wattPeakData.map((wpd) => ({
            watt_peak_id: wpd.id,
            company_id: wpd.company_id,
            panel_type_id: wpd.panel_type_id,
            panel_type: wpd.panel_type || wpd.panelType?.panel_type || '',
            attribute_id: wpd.attribute_id,
            dcr_price: wpd.dcr_price,
            ndcr_price: wpd.ndcr_price,
            price_per_kw: wpd.price_per_kw,
            max_price_range: wpd.max_price_range,
            min_price_range: wpd.min_price_range,
            rated_power_stc: wpd.rated_power_stc,
            rated_power_tol: wpd.rated_power_tol,
            rated_power_pmax: wpd.rated_power_pmax,
            max_power_current: wpd.max_power_current,
            max_power_voltage: wpd.max_power_voltage,
            module_efficiency: wpd.module_efficiency,
            nominal_cell_temp: wpd.nominal_cell_temp,
            max_power_temp_coeff: wpd.max_power_temp_coeff,
            open_circuit_voltage: wpd.open_circuit_voltage,
            short_circuit_current: wpd.short_circuit_current,
          })),
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching panel company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch panel company',
        error: error.message,
      });
    }
  }

  static async createPanelCompany(req, res) {
    try {
      const { company_name, company_logo, description, watt_peak_data } = req.body;

      if (!company_name) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Company name is required',
        });
      }

      const transaction = await db.sequelize.transaction();

      try {
        const company = await db.PanelCompany.create(
          {
            company_name,
            company_logo: company_logo || null,
            description: description || null,
          },
          { transaction }
        );

        if (watt_peak_data && Array.isArray(watt_peak_data) && watt_peak_data.length > 0) {
          const wattPeakDataPromises = watt_peak_data.map((wpd) =>
            db.PanelWattPeakData.create(
              {
                company_id: company.id,
                panel_type_id: wpd.panel_type_id,
                attribute_id: wpd.attribute_id || null,
                dcr_price: wpd.dcr_price || null,
                ndcr_price: wpd.ndcr_price || null,
                panel_type: wpd.panel_type || null,
                price_per_kw: wpd.price_per_kw || null,
                max_price_range: wpd.max_price_range || null,
                min_price_range: wpd.min_price_range || null,
                rated_power_stc: wpd.rated_power_stc || null,
                rated_power_tol: wpd.rated_power_tol || null,
                rated_power_pmax: wpd.rated_power_pmax || null,
                max_power_current: wpd.max_power_current || null,
                max_power_voltage: wpd.max_power_voltage || null,
                module_efficiency: wpd.module_efficiency || null,
                nominal_cell_temp: wpd.nominal_cell_temp || null,
                max_power_temp_coeff: wpd.max_power_temp_coeff || null,
                open_circuit_voltage: wpd.open_circuit_voltage || null,
                short_circuit_current: wpd.short_circuit_current || null,
              },
              { transaction }
            )
          );
          await Promise.all(wattPeakDataPromises);
        }

        await transaction.commit();

        const createdCompany = await db.PanelCompany.findByPk(company.id, {
          include: [
            {
              model: db.PanelWattPeakData,
              as: 'wattPeakData',
            },
          ],
        });

        return res.status(201).json({
          success: true,
          action: 'success',
          message: 'Panel company created successfully',
          data: {
            company_id: createdCompany.id,
            company_name: createdCompany.company_name,
            company_logo: createdCompany.company_logo,
            description: createdCompany.description,
          },
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('[System Datasets] Error creating panel company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to create panel company',
        error: error.message,
      });
    }
  }

  static async updatePanelCompany(req, res) {
    try {
      const { id } = req.params;
      const { company_name, company_logo, description, watt_peak_data } = req.body;

      const company = await db.PanelCompany.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel company not found',
        });
      }

      const transaction = await db.sequelize.transaction();

      try {
        await company.update(
          {
            company_name: company_name !== undefined ? company_name : company.company_name,
            company_logo: company_logo !== undefined ? company_logo : company.company_logo,
            description: description !== undefined ? description : company.description,
          },
          { transaction }
        );

        if (watt_peak_data && Array.isArray(watt_peak_data)) {
          await db.PanelWattPeakData.destroy(
            {
              where: { company_id: company.id },
            },
            { transaction }
          );

          if (watt_peak_data.length > 0) {
            const wattPeakDataPromises = watt_peak_data.map((wpd) =>
              db.PanelWattPeakData.create(
                {
                  company_id: company.id,
                  panel_type_id: wpd.panel_type_id,
                  attribute_id: wpd.attribute_id || null,
                  dcr_price: wpd.dcr_price || null,
                  ndcr_price: wpd.ndcr_price || null,
                  panel_type: wpd.panel_type || null,
                  price_per_kw: wpd.price_per_kw || null,
                  max_price_range: wpd.max_price_range || null,
                  min_price_range: wpd.min_price_range || null,
                  rated_power_stc: wpd.rated_power_stc || null,
                  rated_power_tol: wpd.rated_power_tol || null,
                  rated_power_pmax: wpd.rated_power_pmax || null,
                  max_power_current: wpd.max_power_current || null,
                  max_power_voltage: wpd.max_power_voltage || null,
                  module_efficiency: wpd.module_efficiency || null,
                  nominal_cell_temp: wpd.nominal_cell_temp || null,
                  max_power_temp_coeff: wpd.max_power_temp_coeff || null,
                  open_circuit_voltage: wpd.open_circuit_voltage || null,
                  short_circuit_current: wpd.short_circuit_current || null,
                },
                { transaction }
              )
            );
            await Promise.all(wattPeakDataPromises);
          }
        }

        await transaction.commit();

        const updatedCompany = await db.PanelCompany.findByPk(id);

        return res.status(200).json({
          success: true,
          action: 'success',
          message: 'Panel company updated successfully',
          data: {
            company_id: updatedCompany.id,
            company_name: updatedCompany.company_name,
            company_logo: updatedCompany.company_logo,
            description: updatedCompany.description,
          },
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('[System Datasets] Error updating panel company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update panel company',
        error: error.message,
      });
    }
  }

  static async deletePanelCompany(req, res) {
    try {
      const { id } = req.params;
      const company = await db.PanelCompany.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Panel company not found',
        });
      }

      await company.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Panel company deleted successfully',
      });
    } catch (error) {
      console.error('[System Datasets] Error deleting panel company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete panel company',
        error: error.message,
      });
    }
  }

  // ========== INVERTER COMPANIES ==========
  static async getAllInverterCompanies(req, res) {
    try {
      const inverterCompanies = await db.InverterCompany.findAll({
        where: { deleted_at: null },
        order: [['created_at', 'DESC']],
      });

      const formattedData = inverterCompanies.map((company) => ({
        company_id: company.id,
        company_name: company.company_name,
        company_logo: company.company_logo,
        description: company.description,
        created_at: company.created_at,
      }));

      return res.status(200).json({
        success: true,
        action: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching inverter companies:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch inverter companies',
        error: error.message,
      });
    }
  }

  static async getInverterCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await db.InverterCompany.findByPk(id);

      if (!company || company.deleted_at) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Inverter company not found',
        });
      }

      return res.status(200).json({
        success: true,
        action: 'success',
        data: {
          company_id: company.id,
          company_name: company.company_name,
          company_logo: company.company_logo,
          description: company.description,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching inverter company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch inverter company',
        error: error.message,
      });
    }
  }

  static async createInverterCompany(req, res) {
    try {
      const { company_name, company_logo, description } = req.body;

      if (!company_name) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Company name is required',
        });
      }

      const company = await db.InverterCompany.create({
        company_name,
        company_logo: company_logo || null,
        description: description || null,
      });

      return res.status(201).json({
        success: true,
        action: 'success',
        message: 'Inverter company created successfully',
        data: {
          company_id: company.id,
          company_name: company.company_name,
          company_logo: company.company_logo,
          description: company.description,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error creating inverter company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to create inverter company',
        error: error.message,
      });
    }
  }

  static async updateInverterCompany(req, res) {
    try {
      const { id } = req.params;
      const { company_name, company_logo, description } = req.body;

      const company = await db.InverterCompany.findByPk(id);

      if (!company || company.deleted_at) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Inverter company not found',
        });
      }

      await company.update({
        company_name: company_name !== undefined ? company_name : company.company_name,
        company_logo: company_logo !== undefined ? company_logo : company.company_logo,
        description: description !== undefined ? description : company.description,
      });

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Inverter company updated successfully',
        data: {
          company_id: company.id,
          company_name: company.company_name,
          company_logo: company.company_logo,
          description: company.description,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error updating inverter company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update inverter company',
        error: error.message,
      });
    }
  }

  static async deleteInverterCompany(req, res) {
    try {
      const { id } = req.params;
      const company = await db.InverterCompany.findByPk(id);

      if (!company || company.deleted_at) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Inverter company not found',
        });
      }

      await company.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Inverter company deleted successfully',
      });
    } catch (error) {
      console.error('[System Datasets] Error deleting inverter company:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete inverter company',
        error: error.message,
      });
    }
  }

  // ========== ELECTRICITY PROVIDERS ==========
  static async getAllElectricityProviders(req, res) {
    try {
      const providers = await db.ElectricityProvider.findAll({
        order: [['created_at', 'DESC']],
      });

      const formattedData = providers.map((provider) => ({
        provider_id: provider.id,
        provider: provider.provider,
        provider_img: provider.provider_img,
        remarks: provider.remarks,
        created_at: provider.created_at,
      }));

      return res.status(200).json({
        success: true,
        action: 'success',
        data: formattedData,
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching electricity providers:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch electricity providers',
        error: error.message,
      });
    }
  }

  static async getElectricityProviderById(req, res) {
    try {
      const { id } = req.params;
      const provider = await db.ElectricityProvider.findByPk(id);

      if (!provider) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Electricity provider not found',
        });
      }

      return res.status(200).json({
        success: true,
        action: 'success',
        data: {
          provider_id: provider.id,
          provider: provider.provider,
          provider_img: provider.provider_img,
          remarks: provider.remarks,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error fetching electricity provider:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to fetch electricity provider',
        error: error.message,
      });
    }
  }

  static async createElectricityProvider(req, res) {
    try {
      const { provider, provider_img, remarks } = req.body;

      if (!provider) {
        return res.status(400).json({
          success: false,
          action: 'error',
          message: 'Provider name is required',
        });
      }

      const electricityProvider = await db.ElectricityProvider.create({
        provider,
        provider_img: provider_img || null,
        remarks: remarks || null,
      });

      return res.status(201).json({
        success: true,
        action: 'success',
        message: 'Electricity provider created successfully',
        data: {
          provider_id: electricityProvider.id,
          provider: electricityProvider.provider,
          provider_img: electricityProvider.provider_img,
          remarks: electricityProvider.remarks,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error creating electricity provider:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: error.message.includes('Duplicate') ? 'Electricity provider already exists' : 'Failed to create electricity provider',
        error: error.message,
      });
    }
  }

  static async updateElectricityProvider(req, res) {
    try {
      const { id } = req.params;
      const { provider, provider_img, remarks } = req.body;

      const electricityProvider = await db.ElectricityProvider.findByPk(id);

      if (!electricityProvider) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Electricity provider not found',
        });
      }

      await electricityProvider.update({
        provider: provider !== undefined ? provider : electricityProvider.provider,
        provider_img: provider_img !== undefined ? provider_img : electricityProvider.provider_img,
        remarks: remarks !== undefined ? remarks : electricityProvider.remarks,
      });

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Electricity provider updated successfully',
        data: {
          provider_id: electricityProvider.id,
          provider: electricityProvider.provider,
          provider_img: electricityProvider.provider_img,
          remarks: electricityProvider.remarks,
        },
      });
    } catch (error) {
      console.error('[System Datasets] Error updating electricity provider:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to update electricity provider',
        error: error.message,
      });
    }
  }

  static async deleteElectricityProvider(req, res) {
    try {
      const { id } = req.params;
      const provider = await db.ElectricityProvider.findByPk(id);

      if (!provider) {
        return res.status(404).json({
          success: false,
          action: 'error',
          message: 'Electricity provider not found',
        });
      }

      await provider.destroy();

      return res.status(200).json({
        success: true,
        action: 'success',
        message: 'Electricity provider deleted successfully',
      });
    } catch (error) {
      console.error('[System Datasets] Error deleting electricity provider:', error);
      return res.status(500).json({
        success: false,
        action: 'error',
        message: 'Failed to delete electricity provider',
        error: error.message,
      });
    }
  }
}

module.exports = SystemDatasetsController;

