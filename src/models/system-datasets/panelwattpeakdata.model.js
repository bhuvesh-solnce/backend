const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PanelWattPeakData extends Model {
    static associate(models) {
      PanelWattPeakData.belongsTo(models.PanelCompany, {
        foreignKey: 'company_id',
        as: 'company',
      });
      PanelWattPeakData.belongsTo(models.PanelType, {
        foreignKey: 'panel_type_id',
        as: 'panelType',
      });
    }
  }

  PanelWattPeakData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_companies',
          key: 'id',
        },
      },
      panel_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'panel_types',
          key: 'id',
        },
      },
      attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dcr_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      ndcr_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      panel_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      price_per_kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_price_range: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      min_price_range: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_stc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_tol: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rated_power_pmax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_power_current: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      max_power_voltage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      module_efficiency: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      nominal_cell_temp: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      max_power_temp_coeff: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },
      open_circuit_voltage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      short_circuit_current: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PanelWattPeakData',
      tableName: 'panel_watt_peak_data',
      timestamps: true,
      underscored: true,
    }
  );

  return PanelWattPeakData;
};

