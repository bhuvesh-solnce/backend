'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding
    const columnExists = async (tableName, columnName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM information_schema.columns 
         WHERE table_schema = DATABASE() 
         AND table_name = '${tableName}' 
         AND column_name = '${columnName}'`
      );
      return results[0].count > 0;
    };

    // Add ServiceType ENUM field
    if (!(await columnExists('projects', 'service_type'))) {
      await queryInterface.addColumn('projects', 'service_type', {
        type: Sequelize.ENUM(
          'Residential Solar',
          'Industrial Solar',
          'Ground Mounted Solar',
          'Common Building Solar',
          'Solar Cleaning',
          'Solar Loan',
          'Maintainence Service'
        ),
        allowNull: true,
        comment: 'Type of service for the project'
      });
      console.log('✅ Added service_type column to projects table');
    }

    // Add LeadStatus ENUM field
    if (!(await columnExists('projects', 'lead_status'))) {
      await queryInterface.addColumn('projects', 'lead_status', {
        type: Sequelize.ENUM(
          'Unqualifies Prospect',
          'Intro Call',
          'Visit Scehdule',
          'Follow Up',
          'Site Visit Done',
          'Dormant',
          'Closed',
          'Rejected'
        ),
        allowNull: true,
        comment: 'Current status of the lead'
      });
      console.log('✅ Added lead_status column to projects table');
    }

    // Add pincode field
    if (!(await columnExists('projects', 'pincode'))) {
      await queryInterface.addColumn('projects', 'pincode', {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Pincode of the project location'
      });
      console.log('✅ Added pincode column to projects table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    const columnExists = async (tableName, columnName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM information_schema.columns 
         WHERE table_schema = DATABASE() 
         AND table_name = '${tableName}' 
         AND column_name = '${columnName}'`
      );
      return results[0].count > 0;
    };

    if (await columnExists('projects', 'pincode')) {
      await queryInterface.removeColumn('projects', 'pincode');
    }

    if (await columnExists('projects', 'lead_status')) {
      await queryInterface.removeColumn('projects', 'lead_status');
    }

    if (await columnExists('projects', 'service_type')) {
      await queryInterface.removeColumn('projects', 'service_type');
    }
  },
};

