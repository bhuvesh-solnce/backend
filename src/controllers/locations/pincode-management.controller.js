const { db } = require('../../models');
const { Op } = require('sequelize');

class PincodeManagementController {
  // ==================== GET PINCODES ====================
  static async getPincodes(req, res) {
    try {
      const { actiontype, city_id } = req.body || req.query;
      
      if (actiontype === 'get') {
        const where = { deleted_at: null };
        
        if (city_id) {
          where.city_id = parseInt(city_id);
        }

        const pincodes = await db.PinCodeList.findAll({
          where,
          order: [['pin_code', 'ASC']],
        });

        // Convert pin_code to number
        const formattedPincodes = pincodes.map((pincode) => ({
          id: pincode.id,
          city_id: pincode.city_id,
          pin_code: Number(pincode.pin_code),
        }));

        return res.json({
          action: 'success',
          data: formattedPincodes,
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to fetch pincodes',
        error: error.message,
      });
    }
  }

  // ==================== MANAGE PINCODES ====================
  static async managePincode(req, res) {
    try {
      const { actiontype, id, city_id, pin_code } = req.body;

      if (actiontype === 'insert') {
        if (!city_id || !pin_code) {
          return res.status(400).json({
            action: 'error',
            message: 'city_id and pin_code are required',
          });
        }

        // Check if pincode already exists for this city
        const existing = await db.PinCodeList.findOne({
          where: {
            city_id: parseInt(city_id),
            pin_code: parseInt(pin_code),
            deleted_at: null,
          },
        });

        if (existing) {
          return res.status(400).json({
            action: 'error',
            message: 'Pincode already exists for this city',
          });
        }

        const pincode = await db.PinCodeList.create({
          city_id: parseInt(city_id),
          pin_code: parseInt(pin_code),
        });

        return res.json({
          action: 'success',
          message: 'Pincode added successfully',
          data: {
            id: pincode.id,
            city_id: pincode.city_id,
            pin_code: Number(pincode.pin_code),
          },
        });
      }

      if (actiontype === 'update') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for update',
          });
        }

        const pincode = await db.PinCodeList.findByPk(id);
        if (!pincode) {
          return res.status(404).json({
            action: 'error',
            message: 'Pincode not found',
          });
        }

        // Check if pincode already exists for this city (excluding current record)
        if (pin_code !== undefined && city_id !== undefined) {
          const existing = await db.PinCodeList.findOne({
            where: {
              city_id: parseInt(city_id),
              pin_code: parseInt(pin_code),
              deleted_at: null,
              id: { [Op.ne]: id },
            },
          });

          if (existing) {
            return res.status(400).json({
              action: 'error',
              message: 'Pincode already exists for this city',
            });
          }
        }

        if (city_id !== undefined) pincode.city_id = parseInt(city_id);
        if (pin_code !== undefined) pincode.pin_code = parseInt(pin_code);

        await pincode.save();

        return res.json({
          action: 'success',
          message: 'Pincode updated successfully',
          data: {
            id: pincode.id,
            city_id: pincode.city_id,
            pin_code: Number(pincode.pin_code),
          },
        });
      }

      if (actiontype === 'delete') {
        if (!id) {
          return res.status(400).json({
            action: 'error',
            message: 'id is required for delete',
          });
        }

        const pincode = await db.PinCodeList.findByPk(id);
        if (!pincode) {
          return res.status(404).json({
            action: 'error',
            message: 'Pincode not found',
          });
        }

        await pincode.destroy();

        return res.json({
          action: 'success',
          message: 'Pincode deleted successfully',
        });
      }

      return res.status(400).json({
        action: 'error',
        message: 'Invalid actiontype',
      });
    } catch (error) {
      console.error('Error managing pincode:', error);
      res.status(500).json({
        action: 'error',
        message: 'Failed to manage pincode',
        error: error.message,
      });
    }
  }
}

module.exports = PincodeManagementController;

