const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      State.hasMany(models.City, { foreignKey: 'state_id', as: 'cities' });
      // Panel Pricing associations
      if (models.StatePanelPrice) {
        State.hasMany(models.StatePanelPrice, { foreignKey: 'state_id', as: 'panelPrices' });
      }
      // Cost Range associations
      if (models.StateCostRange) {
        State.hasMany(models.StateCostRange, { foreignKey: 'state_id', as: 'costRanges' });
      }
      // Discom Pricing associations
      if (models.StateDiscomPricing) {
        State.hasMany(models.StateDiscomPricing, { foreignKey: 'state_id', as: 'discomPricing' });
      }
      // Electricity Rate associations
      if (models.StateElectricityRate) {
        State.hasMany(models.StateElectricityRate, { foreignKey: 'state_id', as: 'electricityRates' });
      }
    }
  }

  State.init(
    {
      state_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'State',
      tableName: 'state',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'name_UNIQUE',
        },
      ],
    }
  );

  return State;
};

