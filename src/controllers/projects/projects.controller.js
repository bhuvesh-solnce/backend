const { db } = require('../../models');
const { Op } = require('sequelize');

class ProjectsController {

  // 1. Create Project & Start Workflow
  static async createProject(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { 
        first_name, last_name, email, phone, 
        workflow_id, 
        service_type, lead_status, pincode,
        initial_stage_data, initial_stage_id 
      } = req.body;
      
      const userId = req.user.id;

      // Generate Unique Project ID (e.g., SOL-839201)
      const uniqueId = `SOL-${Date.now().toString().slice(-6)}`;

      // A. Create Project Record
      const projectData = {
        project_id: uniqueId,
        first_name,
        last_name,
        email,
        phone,
        workflow_id,
        created_by: userId
      };
      
      if (service_type) projectData.service_type = service_type;
      if (lead_status) projectData.lead_status = lead_status;
      if (pincode) projectData.pincode = pincode;
      
      const project = await db.Project.create(projectData, { transaction: t });

      // B. Create Workflow Instance
      const instance = await db.WorkflowInstance.create({
        workflow_id,
        entity_id: project.id,
        entity_type: 'PROJECT',
        status: 'IN_PROGRESS'
      }, { transaction: t });

      // C. Save the "Workflow Form Details" (State, Capacity, etc. go here)
      if (initial_stage_id && initial_stage_data) {
        await db.InstanceStageData.create({
          instance_id: instance.id,
          stage_id: initial_stage_id,
          form_data: initial_stage_data, // JSON Blob stores the extra info
          status: 'COMPLETED',
          action_by_user_id: userId,
          completed_at: new Date()
        }, { transaction: t });
      }

      await t.commit();

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        projectId: uniqueId
      });

    } catch (error) {
      await t.rollback();
      console.error('Create Project Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return res.status(500).json({ 
        message: 'Failed to create project',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // 2. Get All Projects (For the List View)
  static async getAllProjects(req, res) {
    try {
      const { lead_status, workflow_completed } = req.query;
      
      // Build where clause based on lead_status filter
      const whereClause = {};
      
      // If filtering by workflow_completed, don't apply default lead_status filters
      // (we want all projects with completed workflows regardless of lead_status)
      if (workflow_completed !== 'true') {
        if (lead_status) {
          // If specific status requested, filter by it
          if (lead_status === 'exclude') {
            // Exclude Closed, Rejected, and Dormant (include null and other statuses)
            whereClause[Op.or] = [
              { lead_status: null },
              { lead_status: { [Op.notIn]: ['Closed', 'Rejected', 'Dormant'] } }
            ];
          } else {
            // Filter by specific status
            whereClause.lead_status = lead_status;
          }
        } else {
          // Default: exclude Closed, Rejected, Dormant (or null)
          whereClause[Op.or] = [
            { lead_status: null },
            { lead_status: { [Op.notIn]: ['Closed', 'Rejected', 'Dormant'] } }
          ];
        }
      } else if (lead_status) {
        // If workflow_completed is true but lead_status is also specified, apply it
        if (lead_status === 'exclude') {
          whereClause[Op.or] = [
            { lead_status: null },
            { lead_status: { [Op.notIn]: ['Closed', 'Rejected', 'Dormant'] } }
          ];
        } else {
          whereClause.lead_status = lead_status;
        }
      }
      
      const projects = await db.Project.findAll({
        where: whereClause,
        include: [
          // Get Workflow Name for "Type of Service" column
          { model: db.Workflow, as: 'workflow', attributes: ['name'] },
          // Get User Name for "User Name" column (if it refers to creator, or we use first_name/last_name)
          { model: db.User, as: 'creator', attributes: ['first_name', 'last_name'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Fetch workflow instances and current stages for all projects
      const projectIds = projects.map(p => p.id);
      
      const instances = await db.WorkflowInstance.findAll({
        where: {
          entity_id: { [Op.in]: projectIds },
          entity_type: 'PROJECT'
        },
        include: [
          {
            model: db.Workflow,
            as: 'workflow',
            attributes: ['id'],
            required: false,
            include: [{
              model: db.WorkflowStage,
              as: 'stages',
              attributes: ['id', 'name', 'ui_position'],
              required: false,
              separate: true,
              order: [['ui_position', 'ASC']]
            }]
          },
          {
            model: db.InstanceStageData,
            as: 'stageData',
            required: false,
            include: [{
              model: db.WorkflowStage,
              as: 'stage',
              attributes: ['id', 'name'],
              required: false
            }]
          }
        ]
      });

      // Create a map of project_id -> current stage
      const projectStageMap = {};
      instances.forEach(instance => {
        const stageData = instance.stageData || [];
        
        // Find the first pending stage
        const pendingStage = stageData.find(sd => sd.status === 'PENDING');
        if (pendingStage && pendingStage.stage) {
          projectStageMap[instance.entity_id] = pendingStage.stage.name;
          return;
        }
        
        // If no pending stage, find the last completed stage
        const completedStages = stageData
          .filter(sd => sd.status === 'APPROVED' || sd.status === 'SUBMITTED')
          .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
        
        if (completedStages.length > 0 && completedStages[0].stage) {
          projectStageMap[instance.entity_id] = completedStages[0].stage.name;
          return;
        }
        
        // If no stage data exists, get the first stage from workflow
        if (instance.workflow && instance.workflow.stages && instance.workflow.stages.length > 0) {
          // Sort stages by ui_position if available, otherwise by id
          const sortedStages = [...instance.workflow.stages].sort((a, b) => {
            const posA = a.ui_position?.y || a.ui_position?.x || a.id || 0;
            const posB = b.ui_position?.y || b.ui_position?.x || b.id || 0;
            return posA - posB;
          });
          const firstStage = sortedStages[0];
          projectStageMap[instance.entity_id] = firstStage.name;
        } else {
          projectStageMap[instance.entity_id] = 'Not Started';
        }
      });

      // Helper function to check if a workflow is completed (last stage is APPROVED or SUBMITTED)
      const isWorkflowCompleted = (instance) => {
        if (!instance.workflow || !instance.workflow.stages || instance.workflow.stages.length === 0) {
          return false; // No workflow or stages means not completed
        }
        
        // Get all stages sorted by ui_position (or id if ui_position not available)
        const sortedStages = [...instance.workflow.stages].sort((a, b) => {
          const posA = a.ui_position?.y || a.ui_position?.x || a.id || 0;
          const posB = b.ui_position?.y || b.ui_position?.x || b.id || 0;
          return posA - posB;
        });
        
        const lastStage = sortedStages[sortedStages.length - 1];
        if (!lastStage) return false;
        
        // Check if the last stage has been completed
        const stageData = instance.stageData || [];
        const lastStageData = stageData.find(sd => sd.stage_id === lastStage.id);
        
        // If last stage is APPROVED or SUBMITTED, workflow is completed
        return lastStageData && (lastStageData.status === 'APPROVED' || lastStageData.status === 'SUBMITTED');
      };

      // Create a map of project_id -> isCompleted
      const projectCompletionMap = {};
      instances.forEach(instance => {
        projectCompletionMap[instance.entity_id] = isWorkflowCompleted(instance);
      });

      // Filter projects based on workflow_completed parameter
      let filteredProjects = projects;
      if (workflow_completed === 'true') {
        // Only include completed projects
        filteredProjects = projects.filter(p => projectCompletionMap[p.id] === true);
      } else {
        // Exclude completed projects from all other pages
        filteredProjects = projects.filter(p => projectCompletionMap[p.id] !== true);
      }

      // We map the database fields to the frontend requirements
      const formatted = filteredProjects.map(p => ({
        id: p.id,
        projectId: p.project_id,
        name: `${p.first_name} ${p.last_name}`, // The Lead/Customer Name
        mobile: p.phone,
        workflow_name: p.workflow?.name, // Workflow name
        type: p.workflow?.name, // Keep for backward compatibility
        service_type: p.service_type,
        lead_status: p.lead_status,
        pincode: p.pincode,
        workflow_location: projectStageMap[p.id] || 'Not Started',
        created: p.createdAt
      }));

      return res.json(formatted);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error fetching projects' });
    }
  }

  // 3. Get Single Project (For Dynamic Routing /projects/:id)
  static async getProject(req, res) {
    try {
      const project = await db.Project.findOne({
        where: { project_id: req.params.id },
        include: [{ model: db.Workflow, as: 'workflow' }]
      });
      
      if (!project) return res.status(404).json({ message: 'Project not found' });
      return res.json(project);
    } catch (e) {
      return res.status(500).json({ message: 'Error fetching project' });
    }
  }

  // 4. Get Project Stage Statuses
  static async getProjectStageStatuses(req, res) {
    try {
      const { id } = req.params; // project_id
      
      // Find project
      const project = await db.Project.findOne({
        where: { project_id: id }
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Find workflow instance for this project
      const instance = await db.WorkflowInstance.findOne({
        where: {
          entity_id: project.id,
          entity_type: 'PROJECT'
        }
      });

      console.log('🔍 Fetching stage data for project:', {
        project_id: id,
        project_db_id: project.id,
        instance_id: instance?.id,
        instance_found: !!instance
      });

      // Fetch stage data separately to ensure NULL stage_id entries are included
      let stageDataList = [];
      if (instance) {
        // First, let's check if there are ANY entries at all
        const allEntries = await db.InstanceStageData.findAll({
          where: {
            instance_id: instance.id
          },
          raw: true // Get raw data to see what's actually in DB
        });
        
        console.log(`📊 Raw DB query found ${allEntries.length} entries for instance ${instance.id}`);
        allEntries.forEach((entry, idx) => {
          console.log(`  [${idx}] Raw entry:`, {
            id: entry.id,
            instance_id: entry.instance_id,
            stage_id: entry.stage_id,
            status: entry.status,
            form_data: entry.form_data
          });
        });

        // Now fetch with includes - order by created_at DESC to get latest entries first
        stageDataList = await db.InstanceStageData.findAll({
          where: {
            instance_id: instance.id
          },
          include: [
            {
              model: db.WorkflowStage,
              as: 'stage',
              attributes: ['id', 'name', 'type'],
              required: false
            },
            {
              model: db.User,
              as: 'actionBy',
              attributes: ['id', 'first_name', 'last_name', 'email'],
              required: false
            }
          ],
          order: [['created_at', 'DESC']] // Latest entries first
        });
        
        // Debug: Log all stage data entries
        console.log(`📊 Found ${stageDataList.length} stage data entries (with includes) for instance ${instance.id}`);
        stageDataList.forEach((sd, idx) => {
          console.log(`  [${idx}] ID: ${sd.id}, stage_id: ${sd.stage_id}, status: ${sd.status}, form_data.type: ${sd.form_data?.type || 'N/A'}`);
        });
      } else {
        console.warn('⚠️ No workflow instance found for project:', {
          project_id: id,
          project_db_id: project.id
        });
      }

      // Build status map: stage_id -> status
      const statusMap = {};
      const activitiesList = [];
      
      if (instance && stageDataList && stageDataList.length > 0) {
        // Process all stage data, including NULL stage_id entries (lead status changes)
        stageDataList.forEach((stageData) => {
          // Build user info
          let completedBy = null;
          if (stageData.actionBy) {
            completedBy = {
              id: stageData.actionBy.id,
              name: `${stageData.actionBy.first_name || ''} ${stageData.actionBy.last_name || ''}`.trim() || 'Unknown User',
              email: stageData.actionBy.email || ''
            };
          }

          // Build status map (use 'null' as key for NULL stage_id to avoid issues)
          // Since we're ordering by created_at DESC, the first entry for each stage_id is the latest
          const mapKey = stageData.stage_id === null ? 'null' : stageData.stage_id;
          
          // Only set if this is the first time we see this stage_id (which is the latest due to DESC ordering)
          if (!statusMap[mapKey]) {
            // Clean form_data: remove edit metadata before returning to frontend
            let cleanFormData = stageData.form_data || {};
            
            // If form_data has edit metadata, remove it but keep the actual form field values
            if (cleanFormData.is_edit) {
              const { is_edit, edited_at, original_completed_at, ...actualFormData } = cleanFormData;
              cleanFormData = actualFormData;
            }
            
            statusMap[mapKey] = {
              status: stageData.status,
              completed_at: stageData.completed_at,
              form_data: cleanFormData, // Return clean form_data without edit metadata
              rejection_notes: stageData.rejection_notes,
              completed_by: completedBy
            };
          }

          // Build activities list (only for completed stages or status changes)
          // Include all COMPLETED status entries, including lead status changes
          if (stageData.status !== 'PENDING') {
            // Check if it's a lead status change (stage_id is NULL or form_data.type === 'LEAD_STATUS_CHANGE')
            const isLeadStatusChange = stageData.stage_id === null || 
                                       (stageData.form_data && stageData.form_data.type === 'LEAD_STATUS_CHANGE');
            
            if (isLeadStatusChange) {
              // Always add lead status changes to activities
              const activityEntry = {
                id: stageData.id,
                stage_id: stageData.stage_id,
                stage_name: 'Lead Status Changed',
                stage_type: 'LEAD_STATUS_CHANGE',
                status: 'COMPLETED',
                completed_at: stageData.completed_at,
                completed_by: completedBy,
                form_data: stageData.form_data,
                created_at: stageData.created_at
              };
              console.log('✅ Adding lead status change to activities:', activityEntry);
              activitiesList.push(activityEntry);
            } else if (stageData.stage) {
              // Regular workflow stage activity
              const isEdit = stageData.form_data && stageData.form_data.is_edit === true;
              activitiesList.push({
                id: stageData.id,
                stage_id: stageData.stage_id,
                stage_name: stageData.stage.name,
                stage_type: stageData.stage.type,
                status: isEdit ? 'EDITED' : stageData.status, // Mark as EDITED if it's an edit
                completed_at: stageData.completed_at || stageData.created_at,
                completed_by: completedBy,
                rejection_notes: stageData.rejection_notes,
                created_at: stageData.created_at,
                is_edit: isEdit,
                edited_at: stageData.form_data?.edited_at
              });
            }
          }
        });
      }

      // Sort activities by completed_at or created_at (newest first)
      activitiesList.sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at);
        const dateB = new Date(b.completed_at || b.created_at);
        return dateB - dateA; // Descending order
      });

      // Debug: Log final activities list
      console.log(`📋 Returning ${activitiesList.length} activities for project ${id}`);
      const leadStatusChanges = activitiesList.filter(a => a.stage_type === 'LEAD_STATUS_CHANGE');
      console.log(`  - Lead status changes: ${leadStatusChanges.length}`);
      leadStatusChanges.forEach((a, idx) => {
        console.log(`    [${idx}] ${a.form_data?.old_status} → ${a.form_data?.new_status}`);
      });

      return res.json({
        instance_id: instance?.id || null,
        stage_statuses: statusMap,
        activities: activitiesList
      });
    } catch (e) {
      console.error('Get Project Stage Statuses Error:', e);
      return res.status(500).json({ message: 'Error fetching stage statuses' });
    }
  }

  // 5. Update Lead Status
  static async updateLeadStatus(req, res) {
    console.log('🚀 updateLeadStatus called!', {
      method: req.method,
      url: req.url,
      params: req.params,
      body: req.body,
      user: req.user ? { id: req.user.id, email: req.user.email } : 'NO USER'
    });
    
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params; // project_id
      const { old_status, new_status, comment } = req.body;
      const userId = req.user?.id;

      console.log('🔄 Update Lead Status Request:', {
        project_id: id,
        old_status,
        new_status,
        comment,
        user_id: userId
      });

      // Find project
      const project = await db.Project.findOne({
        where: { project_id: id },
        transaction: t
      });

      if (!project) {
        await t.rollback();
        console.error('❌ Project not found:', id);
        return res.status(404).json({ message: 'Project not found' });
      }

      console.log('✅ Project found:', {
        project_id: project.project_id,
        project_db_id: project.id,
        current_lead_status: project.lead_status
      });

      // Update lead status
      project.lead_status = new_status;
      await project.save({ transaction: t });
      console.log('✅ Lead status updated in project');

      // Save to lead_history table
      try {
        const leadHistoryEntry = await db.LeadHistory.create({
          project_id: id,
          old_status: old_status || null,
          new_status: new_status,
          comment: comment || null,
          changed_by_user_id: userId
        }, { transaction: t });
        
        console.log('✅ Lead history entry created:', {
          id: leadHistoryEntry.id,
          project_id: leadHistoryEntry.project_id,
          old_status: leadHistoryEntry.old_status,
          new_status: leadHistoryEntry.new_status
        });
      } catch (historyError) {
        console.error('❌ Could not create lead history entry:', historyError.message);
        console.error('Full error:', historyError);
        // Don't fail the status update if history fails
      }

      console.log('💾 Committing transaction...');
      await t.commit();
      console.log('✅ Transaction committed successfully');

      return res.json({
        success: true,
        message: 'Lead status updated successfully',
        lead_status: new_status
      });

    } catch (e) {
      await t.rollback();
      console.error('❌ Update Lead Status Error:', e);
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
      if (e.original) {
        console.error('Original error:', e.original);
      }
      return res.status(500).json({ message: 'Error updating lead status', error: e.message });
    }
  }

  // 6. Get Lead History
  static async getLeadHistory(req, res) {
    try {
      const { id } = req.params; // project_id
      
      const leadHistory = await db.LeadHistory.findAll({
        where: {
          project_id: id
        },
        attributes: ['id', 'project_id', 'old_status', 'new_status', 'comment', 'changed_by_user_id', 'created_at', 'updated_at'],
        include: [
          {
            model: db.User,
            as: 'changedBy',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false // Ensure we get Sequelize model instances
      });

      const formatted = leadHistory.map(entry => {
        // Debug: Log the raw entry to see what fields are available
        console.log('Raw LeadHistory entry:', {
          id: entry.id,
          created_at: entry.created_at,
          createdAt: entry.createdAt,
          dataValues: entry.dataValues,
          toJSON: entry.toJSON ? entry.toJSON() : 'no toJSON'
        });
        
        // Sequelize with underscored: true returns created_at, but let's check both
        const rawCreatedAt = entry.created_at || entry.createdAt || (entry.dataValues && entry.dataValues.created_at);
        
        // Ensure created_at is properly formatted as ISO string
        // Sequelize returns dates as Date objects, convert to ISO string
        let createdAt = null;
        if (rawCreatedAt) {
          try {
            const date = rawCreatedAt instanceof Date 
              ? rawCreatedAt 
              : new Date(rawCreatedAt);
            if (!isNaN(date.getTime())) {
              createdAt = date.toISOString();
              console.log('Formatted created_at:', createdAt);
            } else {
              console.warn('Invalid date for entry:', entry.id, rawCreatedAt);
            }
          } catch (e) {
            console.error('Error formatting created_at:', e, 'Raw value:', rawCreatedAt);
            createdAt = null;
          }
        } else {
          console.warn('No created_at found for entry:', entry.id);
        }
        
        return {
          id: entry.id,
          project_id: entry.project_id,
          old_status: entry.old_status,
          new_status: entry.new_status,
          comment: entry.comment,
          changed_by: entry.changedBy ? {
            id: entry.changedBy.id,
            name: `${entry.changedBy.first_name || ''} ${entry.changedBy.last_name || ''}`.trim() || 'Unknown User',
            email: entry.changedBy.email || ''
          } : null,
          created_at: createdAt
        };
      });

      return res.json(formatted);
    } catch (e) {
      console.error('Get Lead History Error:', e);
      return res.status(500).json({ message: 'Error fetching lead history' });
    }
  }

  // 7. Delete Project
  static async deleteProject(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params; // project_id
      const userId = req.user.id;

      // Find project
      const project = await db.Project.findOne({
        where: { project_id: id }
      });

      if (!project) {
        await t.rollback();
        return res.status(404).json({ message: 'Project not found' });
      }

      // Find workflow instance
      const instance = await db.WorkflowInstance.findOne({
        where: {
          entity_id: project.id,
          entity_type: 'PROJECT'
        }
      });

      // Delete workflow instance stage data if exists
      if (instance) {
        await db.InstanceStageData.destroy({
          where: { instance_id: instance.id },
          transaction: t
        });

        // Delete workflow instance
        await db.WorkflowInstance.destroy({
          where: { id: instance.id },
          transaction: t
        });
      }

      // Delete project comments if any (check if model exists)
      if (db.ProjectComment) {
        await db.ProjectComment.destroy({
          where: { project_id: project.id },
          transaction: t
        });
      }

      // Delete the project
      await db.Project.destroy({
        where: { id: project.id },
        transaction: t
      });

      await t.commit();

      return res.json({
        success: true,
        message: 'Project deleted successfully'
      });

    } catch (e) {
      await t.rollback();
      console.error('Delete Project Error:', e);
      return res.status(500).json({ message: 'Error deleting project' });
    }
  }
}

module.exports = ProjectsController;