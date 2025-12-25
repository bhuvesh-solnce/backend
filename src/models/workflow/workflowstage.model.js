const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkflowStage extends Model {
    static associate(models) {
      WorkflowStage.belongsTo(models.Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
      
      WorkflowStage.belongsTo(models.WorkflowStage, { 
        as: 'rejectTarget', 
        foreignKey: 'reject_to_stage_id' 
      });

      WorkflowStage.belongsToMany(models.WorkflowStage, {
        as: 'nextStages',
        through: models.StageDependency,
        foreignKey: 'parent_stage_id',
        otherKey: 'child_stage_id'
      });

      WorkflowStage.belongsToMany(models.WorkflowStage, {
        as: 'previousStages',
        through: models.StageDependency,
        foreignKey: 'child_stage_id',
        otherKey: 'parent_stage_id'
      });
    }
  }

  WorkflowStage.init(
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
      type: {
        // Updated ENUM with new requested types
        type: DataTypes.ENUM(
          'FORM', 
          'APPROVAL', 
          'QUOTATION', 
          'QUOTATION_BOQ',         // Combined Quotation & BOQ
          'BOQ_GENERATION', 
          'PDF_GENERATION', 
          'COMPUTATION',
          'PAYMENT',               // New: Payment Milestones
          'GOVT_PORTAL',           
          'DOCUMENT_CHECKLIST',    
          'PROJECT_TRACKING',      
          'QC_CHECKLIST',          
          'SERVICE_CALL',          
          'VENDOR_ASSIGNMENT' // "formulas" stage
        ),
        defaultValue: 'FORM'
      },
      skip_condition: {
        type: DataTypes.STRING, 
        allowNull: true,
        comment: "Formula: If true, this stage is auto-skipped/approved."
      },
      // JSON Schema for fields
      form_schema: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false
      },
      // NEW: Stores Module Configuration (e.g. Table Columns, Milestones List, PDF Template ID)
      stage_config: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: true,
        comment: "Configuration for specialized modules (e.g. Milestones for Tracking, Columns for BOQ)"
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: { view: [], edit: [], approve: [] },
        allowNull: false
      },
      ui_position: {
        type: DataTypes.JSON,
        defaultValue: { x: 0, y: 0 }
      }
    },
    {
      sequelize,
      modelName: 'WorkflowStage',
      tableName: 'workflow_stages',
      timestamps: true,
      underscored: true,
    }
  );

  return WorkflowStage;
};