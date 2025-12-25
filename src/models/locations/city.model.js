const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      City.belongsTo(models.State, { foreignKey: 'state_id', as: 'state' });
      City.hasMany(models.PinCodeList, { foreignKey: 'city_id', as: 'pinCodes' });
      // Panel Pricing associations
      if (models.CityPanelPrice) {
        City.hasMany(models.CityPanelPrice, { foreignKey: 'city_id', as: 'panelPrices' });
      }
      // Cost Range associations
      if (models.CityCostRange) {
        City.hasMany(models.CityCostRange, { foreignKey: 'city_id', as: 'costRanges' });
      }
      // Discom Pricing associations
      if (models.CityDiscomPricing) {
        City.hasMany(models.CityDiscomPricing, { foreignKey: 'city_id', as: 'discomPricing' });
      }
      // Electricity Rate associations
      if (models.CityElectricityRate) {
        City.hasMany(models.CityElectricityRate, { foreignKey: 'city_id', as: 'electricityRates' });
      }
    }
  }

  City.init(
    {
      city_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'state',
          key: 'state_id',
        },
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
      modelName: 'City',
      tableName: 'city',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ['state_id'],
          name: 'city_idfk_1_idx',
        },
      ],
    }
  );

  return City;
};

