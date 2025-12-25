'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add deleted_at to panel_companies
      const panelCompaniesDesc = await queryInterface.describeTable('panel_companies');
      if (!panelCompaniesDesc.deleted_at) {
        await queryInterface.addColumn('panel_companies', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          after: 'description',
        });
        console.log('✅ Added deleted_at column to panel_companies table');
      } else {
        console.log('ℹ️  deleted_at column already exists in panel_companies table');
      }

      // Add deleted_at to panel_types
      const panelTypesDesc = await queryInterface.describeTable('panel_types');
      if (!panelTypesDesc.deleted_at) {
        await queryInterface.addColumn('panel_types', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          after: 'is_ground_mounted_enabled',
        });
        console.log('✅ Added deleted_at column to panel_types table');
      } else {
        console.log('ℹ️  deleted_at column already exists in panel_types table');
      }

      // Add deleted_at to watt_peaks
      const wattPeaksDesc = await queryInterface.describeTable('watt_peaks');
      if (!wattPeaksDesc.deleted_at) {
        await queryInterface.addColumn('watt_peaks', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          after: 'panel_type_id',
        });
        console.log('✅ Added deleted_at column to watt_peaks table');
      } else {
        console.log('ℹ️  deleted_at column already exists in watt_peaks table');
      }
    } catch (error) {
      // If 'after' is not supported, add columns without it
      if (error.message && error.message.includes('after')) {
        const panelCompaniesDesc = await queryInterface.describeTable('panel_companies');
        if (!panelCompaniesDesc.deleted_at) {
          await queryInterface.addColumn('panel_companies', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
          });
        }

        const panelTypesDesc = await queryInterface.describeTable('panel_types');
        if (!panelTypesDesc.deleted_at) {
          await queryInterface.addColumn('panel_types', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
          });
        }

        const wattPeaksDesc = await queryInterface.describeTable('watt_peaks');
        if (!wattPeaksDesc.deleted_at) {
          await queryInterface.addColumn('watt_peaks', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
          });
        }
        console.log('✅ Added deleted_at columns (without position)');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove deleted_at from panel_companies
      const panelCompaniesDesc = await queryInterface.describeTable('panel_companies');
      if (panelCompaniesDesc.deleted_at) {
        await queryInterface.removeColumn('panel_companies', 'deleted_at');
        console.log('✅ Removed deleted_at column from panel_companies table');
      }

      // Remove deleted_at from panel_types
      const panelTypesDesc = await queryInterface.describeTable('panel_types');
      if (panelTypesDesc.deleted_at) {
        await queryInterface.removeColumn('panel_types', 'deleted_at');
        console.log('✅ Removed deleted_at column from panel_types table');
      }

      // Remove deleted_at from watt_peaks
      const wattPeaksDesc = await queryInterface.describeTable('watt_peaks');
      if (wattPeaksDesc.deleted_at) {
        await queryInterface.removeColumn('watt_peaks', 'deleted_at');
        console.log('✅ Removed deleted_at column from watt_peaks table');
      }
    } catch (error) {
      console.error('Error removing deleted_at columns:', error.message);
      throw error;
    }
  },
};

