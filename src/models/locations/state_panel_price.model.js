const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatePanelPrice extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Association to Panel Company
      StatePanelPrice.belongsTo(models.PanelCompany, {
        foreignKey: 'company_id',
        as: 'company',
        onDelete: 'CASCADE',
      });

      // Association to Panel Type
      StatePanelPrice.belongsTo(models.PanelType, {
        foreignKey: 'panel_type_id',
        as: 'panelType',
        onDelete: 'CASCADE',
      });

      // Association to State
      StatePanelPrice.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state',
        onDelete: 'CASCADE',
      });
    }
  }

  StatePanelPrice.init(
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
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'state',
          key: 'state_id',
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
      modelName: 'StatePanelPrice',
      tableName: 'panel_state_price',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['company_id'],
          name: 'panel_state_company_idx',
        },
        {
          fields: ['panel_type_id'],
          name: 'panel_state_type_idx',
        },
        {
          fields: ['state_id'],
          name: 'panel_state_state_idx',
        },
      ],
    }
  );

  return StatePanelPrice;
};