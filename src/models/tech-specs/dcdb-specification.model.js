const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DcdbSpecification extends Model {
    static associate(models) {
      // Add associations here if needed in the future
    }
  }

  DcdbSpecification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      specifications: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      number_of_input_strings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      number_of_output_strings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_current_per_string: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fuse_mcb_protection: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      spd_protection: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      health_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      current_operating_voltage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      current_total_ampere: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      current_power_kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      market_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      solnce_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_strings_same_spec: {
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
      modelName: 'DcdbSpecification',
      tableName: 'dcdb_specifications_auto',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return DcdbSpecification;
};

