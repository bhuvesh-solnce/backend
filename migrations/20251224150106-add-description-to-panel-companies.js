'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('panel_companies');
      
      if (!tableDescription.description) {
        await queryInterface.addColumn('panel_companies', 'description', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Company description',
          after: 'company_logo', // MySQL specific - places column after company_logo
        });
        console.log('✅ Added description column to panel_companies table');
      } else {
        console.log('ℹ️  description column already exists in panel_companies table');
      }
    } catch (error) {
      // If 'after' is not supported, add column without it
      if (error.message && error.message.includes('after')) {
        await queryInterface.addColumn('panel_companies', 'description', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Company description',
        });
        console.log('✅ Added description column to panel_companies table (without position)');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if column exists before removing
      const tableDescription = await queryInterface.describeTable('panel_companies');
      
      if (tableDescription.description) {
        await queryInterface.removeColumn('panel_companies', 'description');
        console.log('✅ Removed description column from panel_companies table');
      } else {
        console.log('ℹ️  description column does not exist in panel_companies table');
      }
    } catch (error) {
      console.error('Error removing description column:', error.message);
      throw error;
    }
  },
};

