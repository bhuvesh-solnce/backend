'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if tables exist before creating
    const tableExists = async (tableName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '${tableName}'`
      );
      return results[0].count > 0;
    };

    // Create state table
    if (!(await tableExists('state'))) {
      await queryInterface.createTable('state', {
        state_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      // Add unique constraint on name
      await queryInterface.addIndex('state', ['name'], {
        name: 'name_UNIQUE',
        unique: true,
      });
    }

    // Create city table
    if (!(await tableExists('city'))) {
      await queryInterface.createTable('city', {
        city_id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        state_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'state',
            key: 'state_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      // Add foreign key index
      await queryInterface.addIndex('city', ['state_id'], {
        name: 'city_idfk_1_idx',
      });
    }

    // Create pin_code_list table
    if (!(await tableExists('pin_code_list'))) {
      await queryInterface.createTable('pin_code_list', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        pin_code: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        city_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'city',
            key: 'city_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      // Add index on city_id
      await queryInterface.addIndex('pin_code_list', ['city_id'], {
        name: 'idx_pin_code_list_city_id',
      });

      // Add unique constraint on pin_code (without provider_id since we're not using it)
      await queryInterface.addIndex('pin_code_list', ['pin_code'], {
        name: 'idx_pin_code_list_pin_code',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order due to foreign key constraints
    await queryInterface.dropTable('pin_code_list');
    await queryInterface.dropTable('city');
    await queryInterface.dropTable('state');
  },
};

