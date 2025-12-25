'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column exists before removing
    const [columns] = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'pin_code_list' 
       AND COLUMN_NAME = 'city'`
    );

    if (columns.length > 0) {
      await queryInterface.removeColumn('pin_code_list', 'city');
      console.log('✅ Removed city column from pin_code_list table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add the column back if rolling back
    await queryInterface.addColumn('pin_code_list', 'city', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
