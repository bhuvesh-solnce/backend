const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workflow extends Model {
    static associate(models) {
      Workflow.hasMany(models.WorkflowStage, { 
        foreignKey: 'workflow_id', 
        as: 'stages',
        onDelete: 'CASCADE' 
      });
      Workflow.hasMany(models.WorkflowInstance, { 
        foreignKey: 'workflow_id',
        as: 'instances'
      });
    }
  }

  Workflow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      module_type: {
        type: DataTypes.ENUM('PROJECT', 'LEAD', 'TASK'),
        allowNull: false,
        comment: "Determines which part of the app uses this workflow"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Workflow',
      tableName: 'workflows',
      timestamps: true,
      underscored: true,
    }
  );

  return Workflow;
};