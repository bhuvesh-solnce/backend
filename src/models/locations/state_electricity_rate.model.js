const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StateElectricityRate extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Association to Electricity Provider
      StateElectricityRate.belongsTo(models.ElectricityProvider, {
        foreignKey: 'provider_id',
        as: 'provider',
        onDelete: 'CASCADE',
      });

      // Association to State
      StateElectricityRate.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state',
        onDelete: 'CASCADE',
      });
    }
  }

  StateElectricityRate.init(
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
          model: 'electricityproviders', // Matches tableName in ElectricityProvider model
          key: 'id',
        },
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'state',
          key: 'state_id',
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
      modelName: 'StateElectricityRate',
      tableName: 'state_electricity_rates',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['provider_id'],
          name: 'state_elec_provider_idx',
        },
        {
          fields: ['state_id'],
          name: 'state_elec_state_idx',
        },
      ],
    }
  );

  return StateElectricityRate;
};