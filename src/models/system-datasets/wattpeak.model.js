const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WattPeak extends Model {
    static associate(models) {
      WattPeak.belongsTo(models.PanelType, { foreignKey: 'panel_type_id', as: 'panelType' });
      if (models.PanelSpecification) {
        WattPeak.hasMany(models.PanelSpecification, {
          foreignKey: 'watt_peak_id',
          as: 'panelSpecifications',
        });
      }
    }
  }

  WattPeak.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      watt_peak: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Watt peak in kW',
      },
      panel_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_types',
          key: 'id',
        },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'WattPeak',
      tableName: 'watt_peaks',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ['watt_peak', 'panel_type_id'],
          name: 'idx_watt_peak_unique',
        },
      ],
    }
  );

  return WattPeak;
};

