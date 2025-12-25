'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create the Demo Workflow
    // Check if workflow already exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM workflows WHERE name = 'Complete Solar Project Workflow' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let workflowId;
    if (existing) {
      workflowId = existing.id;
      console.log(`✅ Using existing workflow with ID: ${workflowId}`);
    } else {
      await queryInterface.sequelize.query(`
        INSERT INTO workflows (name, module_type, description, is_active, created_at, updated_at)
        VALUES ('Complete Solar Project Workflow', 'PROJECT', 'Demo workflow with all stage types for testing', true, NOW(), NOW())
      `);
      
      const [created] = await queryInterface.sequelize.query(
        `SELECT id FROM workflows WHERE name = 'Complete Solar Project Workflow' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      workflowId = created.id;
      console.log(`✅ Created workflow with ID: ${workflowId}`);
    }

    // 2. Create all stages with proper configuration
    const stages = [
      {
        name: 'Initial Documentation',
        type: 'DOCUMENT_CHECKLIST',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Salesperson'], edit: ['Admin', 'Salesperson'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Site Survey & Assessment',
        type: 'FORM',
        workflow_id: workflowId,
        form_schema: JSON.stringify([
          { id: 'roof_area', label: 'Roof Area (sqft)', type: 'number', required: true },
          { id: 'roof_type', label: 'Roof Type', type: 'select', required: true, options_source: 'static', options_list: ['RCC', 'Metal Sheet', 'Tiled'] },
          { id: 'shading_analysis', label: 'Shading Analysis', type: 'text', required: false },
          { id: 'site_photos', label: 'Site Photos', type: 'image', required: true }
        ]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Designer'], edit: ['Admin', 'Designer'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Quotation & BOQ Generation',
        type: 'QUOTATION_BOQ',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({
          columns: [
            { header: 'Component', type: 'text' },
            { header: 'Make/Model', type: 'text' },
            { header: 'Quantity', type: 'qty' },
            { header: 'Unit Price', type: 'currency' },
            { header: 'Net Total', type: 'total' }
          ],
          pdf_template: 'Modern Blue'
        }),
        permissions: JSON.stringify({ view: ['Admin', 'Salesperson', 'Designer'], edit: ['Admin', 'Designer'], approve: ['Admin', 'Sales Head'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Quotation Approval',
        type: 'APPROVAL',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Sales Head', 'Directors'], edit: ['Admin'], approve: ['Admin', 'Sales Head', 'Directors'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Payment Milestones',
        type: 'PAYMENT',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Salesperson'], edit: ['Admin'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Vendor Assignment',
        type: 'VENDOR_ASSIGNMENT',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager'], edit: ['Admin', 'Project Manager'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Structure Management',
        type: 'PROJECT_TRACKING',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({
          milestones: [
            { name: 'Material Arrived', default_status: 'Pending', action_label: 'Confirm Arrival' },
            { name: 'Foundation Work Started', default_status: 'Pending', action_label: 'Upload Photos' },
            { name: 'Foundation Completed', default_status: 'Pending', action_label: 'QC Check' },
            { name: 'Structure Assembly Started', default_status: 'Pending', action_label: 'Update Progress' },
            { name: 'Structure Completed', default_status: 'Pending', action_label: 'Final Inspection' }
          ],
          status_options: 'Pending, In Progress, Completed, Delayed, Halted'
        }),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager', 'Service Engineer'], edit: ['Admin', 'Project Manager'], approve: ['Admin', 'Project Head'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Panel Installation',
        type: 'PROJECT_TRACKING',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({
          milestones: [
            { name: 'Panels Ready to Dispatch', default_status: 'Pending', action_label: 'Schedule RTD' },
            { name: 'Panels Dispatched', default_status: 'Pending', action_label: 'Upload Dispatch Docs' },
            { name: 'Installation Scheduled', default_status: 'Pending', action_label: 'Confirm Schedule' },
            { name: 'Installation In Progress', default_status: 'Pending', action_label: 'Update Status' },
            { name: 'Installation Completed', default_status: 'Pending', action_label: 'Final QC' }
          ],
          status_options: 'Pending, In Progress, Completed, Delayed, Halted'
        }),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager', 'Service Engineer'], edit: ['Admin', 'Project Manager', 'Service Engineer'], approve: ['Admin', 'Project Head'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Quality Control Checklist',
        type: 'QC_CHECKLIST',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager', 'Service Engineer'], edit: ['Admin', 'Service Engineer'], approve: ['Admin', 'Project Head'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Government Portal Registration',
        type: 'GOVT_PORTAL',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager'], edit: ['Admin'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissioning & Handover',
        type: 'FORM',
        workflow_id: workflowId,
        form_schema: JSON.stringify([
          { id: 'commissioning_date', label: 'Commissioning Date', type: 'date', required: true },
          { id: 'meter_reading', label: 'Initial Meter Reading', type: 'number', required: true },
          { id: 'handover_docs', label: 'Handover Documents', type: 'file', required: true },
          { id: 'customer_signature', label: 'Customer Signature', type: 'image', required: true }
        ]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Project Manager'], edit: ['Admin', 'Project Manager'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Service Call Management',
        type: 'SERVICE_CALL',
        workflow_id: workflowId,
        form_schema: JSON.stringify([]),
        stage_config: JSON.stringify({}),
        permissions: JSON.stringify({ view: ['Admin', 'Service Engineer'], edit: ['Admin', 'Service Engineer'], approve: ['Admin'] }),
        skip_condition: null,
        reject_to_stage_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Clear existing stages for this workflow first (if re-seeding)
    await queryInterface.sequelize.query(`
      DELETE FROM stage_dependencies WHERE child_stage_id IN (
        SELECT id FROM workflow_stages WHERE workflow_id = ${workflowId}
      ) OR parent_stage_id IN (
        SELECT id FROM workflow_stages WHERE workflow_id = ${workflowId}
      )
    `);
    await queryInterface.sequelize.query(`
      DELETE FROM workflow_stages WHERE workflow_id = ${workflowId}
    `);

    // Insert stages
    await queryInterface.bulkInsert('workflow_stages', stages);

    // Get stage IDs (MySQL doesn't return IDs directly, so we query them)
    const stageResults = await queryInterface.sequelize.query(`
      SELECT id, name FROM workflow_stages WHERE workflow_id = ${workflowId} ORDER BY id
    `, { type: Sequelize.QueryTypes.SELECT });

    const stageMap = {};
    stageResults.forEach(s => {
      stageMap[s.name] = s.id;
    });

    console.log('✅ Created stages:', Object.keys(stageMap).length);

    // 3. Create stage dependencies (flow logic)
    const dependencies = [
      // Initial Documentation -> Site Survey
      { parent_stage_id: stageMap['Initial Documentation'], child_stage_id: stageMap['Site Survey & Assessment'] },
      
      // Site Survey -> Quotation
      { parent_stage_id: stageMap['Site Survey & Assessment'], child_stage_id: stageMap['Quotation & BOQ Generation'] },
      
      // Quotation -> Approval
      { parent_stage_id: stageMap['Quotation & BOQ Generation'], child_stage_id: stageMap['Quotation Approval'] },
      
      // Approval -> Payment (if approved)
      { parent_stage_id: stageMap['Quotation Approval'], child_stage_id: stageMap['Payment Milestones'] },
      
      // Payment -> Vendor Assignment
      { parent_stage_id: stageMap['Payment Milestones'], child_stage_id: stageMap['Vendor Assignment'] },
      
      // Vendor Assignment -> Structure Management
      { parent_stage_id: stageMap['Vendor Assignment'], child_stage_id: stageMap['Structure Management'] },
      
      // Structure -> Panel Installation
      { parent_stage_id: stageMap['Structure Management'], child_stage_id: stageMap['Panel Installation'] },
      
      // Panel Installation -> QC Checklist
      { parent_stage_id: stageMap['Panel Installation'], child_stage_id: stageMap['Quality Control Checklist'] },
      
      // QC -> Govt Portal
      { parent_stage_id: stageMap['Quality Control Checklist'], child_stage_id: stageMap['Government Portal Registration'] },
      
      // Govt Portal -> Commissioning
      { parent_stage_id: stageMap['Government Portal Registration'], child_stage_id: stageMap['Commissioning & Handover'] },
      
      // Commissioning -> Service Call (ongoing support)
      { parent_stage_id: stageMap['Commissioning & Handover'], child_stage_id: stageMap['Service Call Management'] }
    ];

    // Set rejection route: Quotation Approval can reject back to Quotation
    await queryInterface.sequelize.query(`
      UPDATE workflow_stages 
      SET reject_to_stage_id = ${stageMap['Quotation & BOQ Generation']}
      WHERE id = ${stageMap['Quotation Approval']}
    `);

    // Insert dependencies (stage_dependencies table doesn't have timestamps)
    if (dependencies.length > 0) {
      await queryInterface.bulkInsert('stage_dependencies', dependencies);
      console.log(`✅ Created ${dependencies.length} stage dependencies`);
    }

    console.log('✅ Demo workflow seeded successfully!');
    console.log(`   Workflow ID: ${workflowId}`);
    console.log(`   Total Stages: ${stageResults.length}`);
    console.log(`   Stage Types: DOCUMENT_CHECKLIST, FORM, QUOTATION_BOQ, APPROVAL, PAYMENT, VENDOR_ASSIGNMENT, PROJECT_TRACKING (x2), QC_CHECKLIST, GOVT_PORTAL, SERVICE_CALL`);
  },

  async down(queryInterface, Sequelize) {
    // Find and delete the demo workflow (cascade will delete stages and dependencies)
    await queryInterface.sequelize.query(`
      DELETE FROM workflows WHERE name = 'Complete Solar Project Workflow'
    `);
    console.log('✅ Demo workflow removed');
  }
};

