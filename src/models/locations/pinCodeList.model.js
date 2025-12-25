const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PinCodeList extends Model {
    static associate(models) {
      PinCodeList.belongsTo(models.City, { foreignKey: 'city_id', as: 'city' });
    }
  }

  PinCodeList.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pin_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      city_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'city',
          key: 'city_id',
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PinCodeList',
      tableName: 'pin_code_list',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ['city_id'],
          name: 'idx_pin_code_list_city_id',
        },
        {
          fields: ['pin_code'],
          name: 'idx_pin_code_list_pin_code',
        },
      ],
    }
  );

  return PinCodeList;
};

