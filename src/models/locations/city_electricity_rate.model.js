const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CityElectricityRate extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Association to Electricity Provider
      CityElectricityRate.belongsTo(models.ElectricityProvider, {
        foreignKey: 'provider_id',
        as: 'provider',
        onDelete: 'CASCADE',
      });

      // Association to City
      CityElectricityRate.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'city',
        onDelete: 'CASCADE',
      });
    }
  }

  CityElectricityRate.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'electricityproviders',
          key: 'id',
        },
      },
      city_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'city',
          key: 'city_id',
        },
      },
      // The 4 specific rates requested
      residential_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Rate for Residential connections',
      },
      nrgp_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Rate for Non-Residential General Purpose',
      },
      lt_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Rate for Low Tension',
      },
      ht_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Rate for High Tension',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CityElectricityRate',
      tableName: 'city_electricity_rates',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['provider_id'],
          name: 'city_elec_provider_idx',
        },
        {
          fields: ['city_id'],
          name: 'city_elec_city_idx',
        },
      ],
    }
  );

  return CityElectricityRate;
};