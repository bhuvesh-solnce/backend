const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PanelType extends Model {
    static associate(models) {
      PanelType.hasMany(models.WattPeak, { foreignKey: 'panel_type_id', as: 'wattPeaks' });
      PanelType.hasMany(models.PanelWattPeakData, { foreignKey: 'panel_type_id', as: 'wattPeakData' });
      if (models.PanelSpecification) {
        PanelType.hasMany(models.PanelSpecification, {
          foreignKey: 'panel_type_id',
          as: 'panelSpecifications',
        });
      }
    }
  }

  PanelType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      panel_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      panel_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_residential_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_industrial_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_common_building_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_ground_mounted_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PanelType',
      tableName: 'panel_types',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PanelType;
};

