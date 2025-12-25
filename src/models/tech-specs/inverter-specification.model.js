const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InverterSpecification extends Model {
    static associate(models) {
      InverterSpecification.belongsTo(models.InverterCompany, {
        foreignKey: 'company_id',
        as: 'inverterCompany'
      });
    }
  }

  InverterSpecification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'inverter_companies',
          key: 'id',
        },
      },
      company_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      capacity: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      overloading_factor: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      feed_in_phases: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      connections_phase: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      start_up_voltage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_dc_voltage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_dc_current_per_mppt: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      no_of_strings_per_mppt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      no_of_mppt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mppt_voltage_range: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      rated_ac_voltage: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      rated_ac_current: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      frequency_range: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      power_factor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      protection_level: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      dimensions: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      total_strings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      probabilistic_occupancy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mppt_voltage_used_by_solnce: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'InverterSpecification',
      tableName: 'inverter_specifications_auto',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return InverterSpecification;
};

