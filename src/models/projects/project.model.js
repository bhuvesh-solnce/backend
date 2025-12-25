const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
      Project.belongsTo(models.Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
      // Link to the workflow execution history
      Project.hasOne(models.WorkflowInstance, { 
        foreignKey: 'entity_id', 
        constraints: false,
        scope: { entity_type: 'PROJECT' },
        as: 'workflowInstance'
      });
      Project.hasMany(models.ProjectComment, {
        foreignKey: 'project_id',
        sourceKey: 'project_id',
        as: 'comments',
        onDelete: 'CASCADE',
        hooks: true 
      });
    }
  }

  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Unique Routing ID (e.g., SOL-2025-001)
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE'
      },
      service_type: {
        type: DataTypes.ENUM(
          'Residential Solar',
          'Industrial Solar',
          'Ground Mounted Solar',
          'Common Building Solar',
          'Solar Cleaning',
          'Solar Loan',
          'Maintainence Service'
        ),
        allowNull: true,
        comment: 'Type of service for the project'
      },
      lead_status: {
        type: DataTypes.ENUM(
          'Unqualifies Prospect',
          'Intro Call',
          'Visit Scehdule',
          'Follow Up',
          'Site Visit Done',
          'Dormant',
          'Closed',
          'Rejected'
        ),
        allowNull: true,
        comment: 'Current status of the lead'
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Pincode of the project location'
      }
    },
    {
      sequelize,
      modelName: 'Project',
      tableName: 'projects',
      timestamps: true,
      underscored: true,
    }
  );

  return Project;
};