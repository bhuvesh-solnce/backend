const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PanelCompany extends Model {
    static associate(models) {
      PanelCompany.hasMany(models.PanelWattPeakData, {
        foreignKey: 'company_id',
        as: 'wattPeakData',
      });
      if (models.PanelSpecification) {
        PanelCompany.hasMany(models.PanelSpecification, {
          foreignKey: 'company_id',
          as: 'panelSpecifications',
        });
      }
    }
  }

  PanelCompany.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company_logo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL or path to company logo',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Company description',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PanelCompany',
      tableName: 'panel_companies',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PanelCompany;
};

