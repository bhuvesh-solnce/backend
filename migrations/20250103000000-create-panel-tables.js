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

    const indexExists = async (tableName, indexName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = '${tableName}' AND index_name = '${indexName}'`
      );
      return results[0].count > 0;
    };

    // Create panel_types table
    if (!(await tableExists('panel_types'))) {
      await queryInterface.createTable('panel_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      panel_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      panel_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_residential_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_industrial_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_common_building_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_ground_mounted_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    }

    // Create watt_peaks table
    if (!(await tableExists('watt_peaks'))) {
      await queryInterface.createTable('watt_peaks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      watt_peak: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      panel_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    }

    // Create unique index for watt_peak and panel_type_id
    if (!(await indexExists('watt_peaks', 'idx_watt_peak_unique'))) {
      try {
        await queryInterface.addIndex('watt_peaks', ['watt_peak', 'panel_type_id'], {
          unique: true,
          name: 'idx_watt_peak_unique',
        });
      } catch (error) {
        if (error.message && error.message.includes('Duplicate key name')) {
          console.log('Index idx_watt_peak_unique already exists, skipping...');
        } else {
          throw error;
        }
      }
    }

    // Create panel_companies table
    if (!(await tableExists('panel_companies'))) {
      await queryInterface.createTable('panel_companies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      company_logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    }

    // Create panel_watt_peak_data table
    if (!(await tableExists('panel_watt_peak_data'))) {
      await queryInterface.createTable('panel_watt_peak_data', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      panel_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      attribute_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dcr_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      ndcr_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      panel_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      price_per_kw: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      max_price_range: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      min_price_range: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_stc: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_tol: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_pmax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      max_power_current: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      max_power_voltage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      module_efficiency: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      nominal_cell_temp: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      max_power_temp_coeff: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      open_circuit_voltage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      short_circuit_current: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('panel_watt_peak_data');
    await queryInterface.dropTable('panel_companies');
    await queryInterface.dropTable('watt_peaks');
    await queryInterface.dropTable('panel_types');
  },
};

