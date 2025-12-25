const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CircuitBreaker extends Model {
    static associate(models) {
      // Add associations here if needed in the future
    }
  }

  CircuitBreaker.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      specifications: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      voltage: {
        type: DataTypes.DECIMAL(10, 1),
        allowNull: true,
      },
      current: {
        type: DataTypes.DECIMAL(10, 1),
        allowNull: true,
      },
      price: {
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
      modelName: 'CircuitBreaker',
      tableName: 'circuit_breaker_auto',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return CircuitBreaker;
};

