const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CityCostRange extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CityCostRange.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'city',
        onDelete: 'CASCADE',
      });
    }
  }

  CityCostRange.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      city_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'city', // Ensures reference to the 'city' table
          key: 'city_id',
        },
      },
      min_kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      max_kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      gst_tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      profit_lp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      profit_up: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      cei: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      file_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      inc_fabricated: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      inc_prefabricated: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      inc_monorail: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      structure_fabricated: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      structure_prefabricated: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      structure_monorail: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      BOS: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'BOS', // Preserves exact column name
      },
      transport_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      transport_per_inverter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CityCostRange',
      tableName: 'city_cost_ranges', // Conventional plural table name
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['city_id'],
          name: 'city_cost_city_idx',
        },
      ],
    }
  );

  return CityCostRange;
};