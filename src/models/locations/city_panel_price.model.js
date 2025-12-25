const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CityPanelPrice extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Association to Panel Company
      CityPanelPrice.belongsTo(models.PanelCompany, {
        foreignKey: 'company_id',
        as: 'company',
        onDelete: 'CASCADE',
      });

      // Association to Panel Type
      CityPanelPrice.belongsTo(models.PanelType, {
        foreignKey: 'panel_type_id',
        as: 'panelType',
        onDelete: 'CASCADE',
      });

      // Association to City
      CityPanelPrice.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'city',
        onDelete: 'CASCADE',
      });
    }
  }

  CityPanelPrice.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'panel_companies',
          key: 'id',
        },
      },
      panel_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'panel_types',
          key: 'id',
        },
      },
      city_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'city',
          key: 'city_id',
        },
      },
      dcr_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      ndcr_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CityPanelPrice',
      tableName: 'panel_city_price',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['company_id'],
          name: 'panel_city_company_idx',
        },
        {
          fields: ['panel_type_id'],
          name: 'panel_city_type_idx',
        },
        {
          fields: ['city_id'],
          name: 'panel_city_city_idx',
        },
      ],
    }
  );

  return CityPanelPrice;
};

