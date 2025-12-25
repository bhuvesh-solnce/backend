const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StageDependency extends Model {
    static associate(models) {
      // Junction table usually doesn't need associations unless queried directly
    }
  }

  StageDependency.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Branching Logic
      condition_logic: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Expression to evaluate before allowing transition (e.g. amount > 1000)"
      }
    },
    {
      sequelize,
      modelName: 'StageDependency',
      tableName: 'stage_dependencies',
      timestamps: false,
      underscored: true,
    }
  );

  return StageDependency;
};