const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InverterCompany extends Model {
    static associate(models) {
      if (models.InverterSpecification) {
        InverterCompany.hasMany(models.InverterSpecification, {
          foreignKey: 'company_id',
          as: 'inverterSpecifications',
        });
      }
    }
  }

  InverterCompany.init(
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
      modelName: 'InverterCompany',
      tableName: 'inverter_companies',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return InverterCompany;
};

