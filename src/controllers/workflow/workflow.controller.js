// src/controllers/workflow/workflow.controller.js
const { db } = require('../../models');

class WorkflowController {

  // --- WORKFLOW DEFINITIONS ---

  static async getWorkflows(req, res) {
    try {
      const workflows = await db.Workflow.findAll({
        order: [['createdAt', 'DESC']]
      });
      return res.json(workflows);
    } catch (error) {
      console.error('Get Workflows Error:', error);
      return res.status(500).json({ message: 'Error fetching workflows' });
    }
  }

  static async createWorkflow(req, res) {
    try {
      const { name, module_type, description } = req.body;
      const workflow = await db.Workflow.create({ name, module_type, description });
      return res.status(201).json(workflow);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating workflow' });
    }
  }

  // --- STAGE MANAGEMENT (The Graph) ---

  static async getStages(req, res) {
    try {
      const { workflowId } = req.params;
      
      // Fetch Stages with their Dependencies
      const stages = await db.WorkflowStage.findAll({
        where: { workflow_id: workflowId },
        include: [
          { 
            model: db.WorkflowStage, 
            as: 'nextStages', // Children
            through: { attributes: [] }, // We just need the IDs
            attributes: ['id']
          },
          {
            model: db.WorkflowStage,
            as: 'rejectTarget',
            attributes: ['id', 'name']
          }
        ]
      });

      // Transform for Frontend (Flatten dependencies)
      const formatted = stages.map(s => {
        // Handle stage_config - parse if string, use object if already parsed, default to {}
        let stageConfig = {};
        try {
          if (typeof s.stage_config === 'string') {
            stageConfig = JSON.parse(s.stage_config);
          } else if (s.stage_config && typeof s.stage_config === 'object') {
            stageConfig = s.stage_config;
          }
        } catch (e) {
          console.warn('Failed to parse stage_config for stage', s.id, e);
          stageConfig = {};
        }

        return {
          id: s.id,
          name: s.name,
          type: s.type,
          skip_condition: s.skip_condition,
          reject_to_stage_id: s.reject_to_stage_id,
          form_schema: s.form_schema || [],
          stage_config: stageConfig, // Include stage_config
          permissions: s.permissions || { view: [], edit: [], approve: [] },
          // Convert [{id: 1}] to [1] for easier frontend handling
          depends_on: [] // We'll fill this by looking at who points TO this stage
        };
      });

      // Invert the 'nextStages' to 'depends_on' for the frontend graph
      // (The frontend expects "depends_on" [Parent IDs])
      const stageMap = {};
      formatted.forEach(s => stageMap[s.id] = s);
      
      // Re-query to find parents (or process in memory if dataset is small)
      // For simplicity, let's just fetch all dependencies raw
      const dependencies = await db.sequelize.query(
        `SELECT parent_stage_id, child_stage_id FROM stage_dependencies`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      dependencies.forEach(dep => {
        if (stageMap[dep.child_stage_id]) {
          stageMap[dep.child_stage_id].depends_on.push(dep.parent_stage_id);
        }
      });

      return res.json(Object.values(stageMap));
    } catch (error) {
      console.error('Get Stages Error:', error);
      console.error('Error Stack:', error.stack);
      return res.status(500).json({ 
        message: 'Error fetching stages',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async upsertStage(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { 
        id, workflow_id, name, type, 
        form_schema, permissions, 
        reject_to_stage_id, skip_condition, 
        stage_config, // Include stage_config
        depends_on // Array of Parent IDs
      } = req.body;

      let stage;

      const payload = {
        workflow_id, name, type,
        form_schema, permissions,
        stage_config: stage_config || {}, // Include stage_config
        reject_to_stage_id: reject_to_stage_id || null,
        skip_condition
      };

      if (id && id > 0) {
        // Update
        stage = await db.WorkflowStage.findByPk(id);
        if (stage) {
          await stage.update(payload, { transaction: t });
        } else {
            // ID sent but not found, create new
            stage = await db.WorkflowStage.create(payload, { transaction: t });
        }
      } else {
        // Create
        stage = await db.WorkflowStage.create(payload, { transaction: t });
      }

      // Handle Dependencies (Edges)
      // depends_on = [ParentID1, ParentID2] -> These are the parents of THIS stage
      if (depends_on) {
        // We are the CHILD. The IDs in depends_on are the PARENTS.
        // We need to set the associations where this stage is the child.
        // Sequelize belongsToMany 'setPreviousStages' isn't standard generated alias, 
        // so we use the Junction Model directly for safety.
        
        // 1. Clear existing parents
        await db.sequelize.models.StageDependency.destroy({
          where: { child_stage_id: stage.id },
          transaction: t
        });

        // 2. Add new parents
        if (depends_on.length > 0) {
            const bulkDeps = depends_on.map(parentId => ({
                parent_stage_id: parentId,
                child_stage_id: stage.id
            }));
            await db.sequelize.models.StageDependency.bulkCreate(bulkDeps, { transaction: t });
        }
      }

      await t.commit();
      return res.json({ success: true, stage });

    } catch (error) {
      await t.rollback();
      console.error('Save Stage Error:', error);
      return res.status(500).json({ message: 'Error saving stage' });
    }
  }

  // --- EXECUTION (Runtime) ---

  static async startInstance(req, res) {
    try {
      const { workflow_id, entity_id, entity_type } = req.body;
      const instance = await db.WorkflowInstance.create({
        workflow_id,
        entity_id: entity_id || Math.floor(Math.random() * 10000), // Mock ID if not provided
        entity_type: entity_type || 'PROJECT',
        status: 'IN_PROGRESS'
      });
      return res.json(instance);
    } catch (error) {
        console.error("Start Instance Error", error);
        return res.status(500).json({ message: 'Failed to start workflow' });
    }
  }

  static async submitStage(req, res) {
      try {
          const { instanceId } = req.params;
          const { stage_id, form_data, status, rejection_notes } = req.body; // status: 'APPROVED' | 'REJECTED' | 'SUBMITTED'
          const userId = req.user?.id || 1; // Fallback to 1 if no user (for testing)
          const userRole = req.user?.role || 'User';

          // Fetch the stage to check permissions
          const stage = await db.WorkflowStage.findByPk(stage_id);
          if (!stage) {
              return res.status(404).json({ message: 'Stage not found' });
          }

          // Check permissions based on action type
          const stagePermissions = stage.permissions || { view: [], edit: [], approve: [] };
          const isAdmin = userRole === 'Admin';

          if (status === 'APPROVED' || status === 'REJECTED') {
              // Approval/Rejection requires approve permission
              const canApprove = isAdmin || (stagePermissions.approve || []).includes(userRole);
              if (!canApprove) {
                  return res.status(403).json({ 
                      message: 'You do not have permission to approve/reject this stage',
                      required_permission: 'approve',
                      your_role: userRole
                  });
              }
          } else if (status === 'SUBMITTED') {
              // Submission requires edit permission
              const canEdit = isAdmin || (stagePermissions.edit || []).includes(userRole);
              if (!canEdit) {
                  return res.status(403).json({ 
                      message: 'You do not have permission to submit this stage',
                      required_permission: 'edit',
                      your_role: userRole
                  });
              }
          }

          // Check prerequisites (depends_on) - Only check for NEW submissions, not edits
          // First check if this is an edit (existing completed submission)
          const existingStageDataCheck = await db.InstanceStageData.findOne({
              where: {
                  instance_id: instanceId,
                  stage_id: stage_id
              },
              order: [['created_at', 'DESC']]
          });
          
          const isEdit = !!existingStageDataCheck && existingStageDataCheck.status !== 'PENDING';
          
          // Only validate prerequisites for new submissions, not edits
          if (!isEdit) {
              // Get all dependencies (prerequisites) for this stage
              const dependencies = await db.sequelize.query(
                  `SELECT parent_stage_id FROM stage_dependencies WHERE child_stage_id = :stageId`,
                  {
                      replacements: { stageId: stage_id },
                      type: db.sequelize.QueryTypes.SELECT
                  }
              );

              if (dependencies && dependencies.length > 0) {
                  const prerequisiteStageIds = dependencies.map(d => d.parent_stage_id);
                  
                  // Check if all prerequisite stages are completed
                  const prerequisiteStatuses = await db.InstanceStageData.findAll({
                      where: {
                          instance_id: instanceId,
                          stage_id: prerequisiteStageIds
                      },
                      order: [['created_at', 'DESC']],
                      attributes: ['stage_id', 'status'],
                      raw: true
                  });

                  // Group by stage_id and get the latest status for each
                  const latestStatuses = {};
                  prerequisiteStatuses.forEach(ps => {
                      if (!latestStatuses[ps.stage_id] || 
                          (ps.status === 'APPROVED' || ps.status === 'SUBMITTED')) {
                          latestStatuses[ps.stage_id] = ps.status;
                      }
                  });

                  // Check if all prerequisites are completed (APPROVED or SUBMITTED)
                  const incompletePrerequisites = prerequisiteStageIds.filter(prereqId => {
                      const status = latestStatuses[prereqId];
                      return !status || (status !== 'APPROVED' && status !== 'SUBMITTED');
                  });

                  if (incompletePrerequisites.length > 0) {
                      // Get names of incomplete prerequisite stages for better error message
                      const incompleteStageNames = await db.WorkflowStage.findAll({
                          where: { id: incompletePrerequisites },
                          attributes: ['id', 'name'],
                          raw: true
                      });

                      return res.status(400).json({
                          message: 'Cannot submit this stage. Prerequisite stages must be completed first.',
                          incomplete_prerequisites: incompleteStageNames.map(s => ({ id: s.id, name: s.name })),
                          error_code: 'PREREQUISITES_NOT_MET'
                      });
                  }
              }
          }

          // Check if stage data already exists (get the latest one) - reuse the check from above
          const existingStageData = existingStageDataCheck || await db.InstanceStageData.findOne({
              where: {
                  instance_id: instanceId,
                  stage_id: stage_id
              },
              order: [['created_at', 'DESC']] // Get the latest entry
          });
          
          // Always create a new entry for edits to track history, or create/update for initial submission
          let stageData;
          if (isEdit) {
              // For edits, create a new entry to track the edit history
              stageData = await db.InstanceStageData.create({
                  instance_id: instanceId,
                  stage_id,
                  form_data: {
                      ...(form_data || {}),
                      is_edit: true,
                      edited_at: new Date().toISOString(),
                      original_completed_at: existingStageData.completed_at
                  },
                  status: status, // Keep the same status for edits
                  action_by_user_id: userId,
                  completed_at: existingStageData.completed_at, // Keep original completion time
                  rejection_notes: rejection_notes || existingStageData.rejection_notes
              });
          } else if (existingStageData) {
              // Update existing pending entry
              await existingStageData.update({
                  form_data: form_data || existingStageData.form_data,
                  status,
                  action_by_user_id: userId,
                  completed_at: status !== 'PENDING' ? new Date() : null,
                  rejection_notes: rejection_notes || existingStageData.rejection_notes
              });
              stageData = existingStageData;
          } else {
              // Create new entry
              stageData = await db.InstanceStageData.create({
                  instance_id: instanceId,
                  stage_id,
                  form_data: form_data || {},
                  status,
                  action_by_user_id: userId,
                  completed_at: status !== 'PENDING' ? new Date() : null,
                  rejection_notes: rejection_notes || null
              });
          }

          // Logic for Rejection/Next Step would go here in a real engine
          // For now, we just save the record so the frontend can query history
          
          return res.json({ 
              success: true, 
              message: 'Stage submitted successfully',
              stage_data: stageData 
          });
      } catch (error) {
          console.error("Submit Stage Error", error);
          return res.status(500).json({ message: 'Failed to submit stage', error: error.message });
      }
  }

}

module.exports = WorkflowController;