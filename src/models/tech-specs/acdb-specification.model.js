const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AcdbSpecification extends Model {
    static associate(models) {
      // Add associations here if needed in the future
    }
  }

  AcdbSpecification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      model_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      full_model_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      capacity_kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      phase: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      input_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      io_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nvr: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      vaf: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      breaker_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      current_capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      breaker_specification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contactor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      contactor_specification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      box_dimensions: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      market_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      solnce_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AcdbSpecification',
      tableName: 'acdb_specifications_auto',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return AcdbSpecification;
};

