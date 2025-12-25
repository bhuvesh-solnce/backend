'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the current foreign key constraint name
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'instance_stage_data' 
      AND COLUMN_NAME = 'stage_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    // Drop existing foreign key constraint if it exists
    if (foreignKeys.length > 0) {
      const constraintName = foreignKeys[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`
        ALTER TABLE \`instance_stage_data\` 
        DROP FOREIGN KEY \`${constraintName}\`
      `);
    }

    // Make stage_id nullable to allow lead status changes without a workflow stage
    await queryInterface.changeColumn('instance_stage_data', 'stage_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Recreate foreign key constraint with SET NULL on delete
    await queryInterface.sequelize.query(`
      ALTER TABLE \`instance_stage_data\`
      ADD CONSTRAINT \`instance_stage_data_stage_id_fkey\`
      FOREIGN KEY (\`stage_id\`)
      REFERENCES \`workflow_stages\`(\`id\`)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
  },

  async down(queryInterface, Sequelize) {
    // Get the foreign key constraint name
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'instance_stage_data' 
      AND COLUMN_NAME = 'stage_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    // Drop foreign key constraint
    if (foreignKeys.length > 0) {
      const constraintName = foreignKeys[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`
        ALTER TABLE \`instance_stage_data\` 
        DROP FOREIGN KEY \`${constraintName}\`
      `);
    }

    // First, delete any records with NULL stage_id (lead status changes)
    await queryInterface.sequelize.query(`
      DELETE FROM instance_stage_data WHERE stage_id IS NULL
    `);

    // Make stage_id NOT NULL again
    await queryInterface.changeColumn('instance_stage_data', 'stage_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    // Recreate foreign key constraint with CASCADE on delete
    await queryInterface.sequelize.query(`
      ALTER TABLE \`instance_stage_data\`
      ADD CONSTRAINT \`instance_stage_data_stage_id_fkey\`
      FOREIGN KEY (\`stage_id\`)
      REFERENCES \`workflow_stages\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }
};

