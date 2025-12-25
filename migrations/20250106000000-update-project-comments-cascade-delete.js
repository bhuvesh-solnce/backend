'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the current foreign key constraint name
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_comments' 
      AND COLUMN_NAME = 'project_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    // Drop existing foreign key constraint if it exists
    if (foreignKeys.length > 0) {
      const constraintName = foreignKeys[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`
        ALTER TABLE \`project_comments\` 
        DROP FOREIGN KEY \`${constraintName}\`
      `);
    }

    // Recreate the foreign key with CASCADE delete
    await queryInterface.sequelize.query(`
      ALTER TABLE \`project_comments\`
      ADD CONSTRAINT \`project_comments_project_id_fkey\`
      FOREIGN KEY (\`project_id\`)
      REFERENCES \`projects\`(\`project_id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // Also ensure parent_comment_id has CASCADE (for nested comments)
    const [parentForeignKeys] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_comments' 
      AND COLUMN_NAME = 'parent_comment_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (parentForeignKeys.length > 0) {
      const parentConstraintName = parentForeignKeys[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`
        ALTER TABLE \`project_comments\` 
        DROP FOREIGN KEY \`${parentConstraintName}\`
      `);
    }

    // Recreate parent_comment_id foreign key with CASCADE
    await queryInterface.sequelize.query(`
      ALTER TABLE \`project_comments\`
      ADD CONSTRAINT \`project_comments_parent_comment_id_fkey\`
      FOREIGN KEY (\`parent_comment_id\`)
      REFERENCES \`project_comments\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the foreign key constraints we created
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`project_comments\` 
        DROP FOREIGN KEY \`project_comments_project_id_fkey\`
      `);
    } catch (error) {
      console.log('Foreign key project_comments_project_id_fkey might not exist');
    }

    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`project_comments\` 
        DROP FOREIGN KEY \`project_comments_parent_comment_id_fkey\`
      `);
    } catch (error) {
      console.log('Foreign key project_comments_parent_comment_id_fkey might not exist');
    }

    // Recreate without CASCADE (restore original state)
    await queryInterface.sequelize.query(`
      ALTER TABLE \`project_comments\`
      ADD CONSTRAINT \`project_comments_project_id_fkey\`
      FOREIGN KEY (\`project_id\`)
      REFERENCES \`projects\`(\`project_id\`)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE \`project_comments\`
      ADD CONSTRAINT \`project_comments_parent_comment_id_fkey\`
      FOREIGN KEY (\`parent_comment_id\`)
      REFERENCES \`project_comments\`(\`id\`)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }
};

