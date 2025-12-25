const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InstanceStageData extends Model {
    static associate(models) {
      InstanceStageData.belongsTo(models.WorkflowInstance, { foreignKey: 'instance_id', as: 'instance' });
      InstanceStageData.belongsTo(models.WorkflowStage, { 
        foreignKey: 'stage_id', 
        as: 'stage',
        required: false // Allow NULL stage_id for lead status changes
      });
      
      // Assuming you have a User model
      if(models.User) {
        InstanceStageData.belongsTo(models.User, { foreignKey: 'action_by_user_id', as: 'actionBy' });
      }
    }
  }

  InstanceStageData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SKIPPED'),
        defaultValue: 'PENDING'
      },
      // Stores actual user inputs: { "roof_area": 500 }
      form_data: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: true
      },
      rejection_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'InstanceStageData',
      tableName: 'instance_stage_data',
      timestamps: true,
      underscored: true,
    }
  );

  return InstanceStageData;
};