const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PanelSpecification extends Model {
    static associate(models) {
      PanelSpecification.belongsTo(models.PanelCompany, {
        foreignKey: 'company_id',
        as: 'panelCompany'
      });
      PanelSpecification.belongsTo(models.PanelType, {
        foreignKey: 'panel_type_id',
        as: 'panelType'
      });
      PanelSpecification.belongsTo(models.WattPeak, {
        foreignKey: 'watt_peak_id',
        as: 'wattPeak'
      });
    }
  }

  PanelSpecification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'panel_companies',
          key: 'id',
        },
      },
      panel_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      panel_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'panel_types',
          key: 'id',
        },
      },
      watt_peak: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      watt_peak_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'watt_peaks',
          key: 'id',
        },
      },
      module_efficiency: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      open_circuit_voltage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      short_circuit_isc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_voltage_vmp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_current_imp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      peak_power_wmp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      length_mm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      width_mm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      height_mm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      volume_cm3: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      weight_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      product_warranty_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      performance_warranty_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      performance_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PanelSpecification',
      tableName: 'panel_specifications_auto',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PanelSpecification;
};

