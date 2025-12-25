const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ElectricityProvider extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Define associations here if any
    }
  }

  ElectricityProvider.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true, // Unique constraint from SQL
      },
      provider_img: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      remarks: {
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
      modelName: 'ElectricityProvider',
      tableName: 'electricityproviders',
      timestamps: true,
      paranoid: true, 
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return ElectricityProvider;
};