const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkflowInstance extends Model {
    static associate(models) {
      WorkflowInstance.belongsTo(models.Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
      
      WorkflowInstance.hasMany(models.InstanceStageData, { 
        foreignKey: 'instance_id',
        as: 'stageData'
      });
    }
  }

  WorkflowInstance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Links to your existing tables
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of the Project or Lead"
      },
      entity_type: {
        type: DataTypes.STRING, // 'PROJECT' or 'LEAD'
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'HALTED', 'CANCELLED'),
        defaultValue: 'IN_PROGRESS'
      }
    },
    {
      sequelize,
      modelName: 'WorkflowInstance',
      tableName: 'workflow_instances',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: false,
          fields: ['entity_id', 'entity_type']
        }
      ]
    }
  );

  return WorkflowInstance;
};