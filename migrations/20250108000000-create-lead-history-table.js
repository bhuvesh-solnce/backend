'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lead_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      project_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'project_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      old_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      new_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changed_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('lead_history', ['project_id'], {
      name: 'idx_lead_history_project_id'
    });
    await queryInterface.addIndex('lead_history', ['changed_by_user_id'], {
      name: 'idx_lead_history_changed_by_user_id'
    });
    await queryInterface.addIndex('lead_history', ['created_at'], {
      name: 'idx_lead_history_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lead_history');
  }
};

