'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if projects with example.com emails already exist
    const existingProjects = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM projects WHERE email LIKE '%@example.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingProjects[0]?.count > 0) {
      console.log('ℹ️  Projects seeder data already exists. Skipping projects seeding.');
      return;
    }

    // Fetch required data
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email LIKE '%@solnce.com' LIMIT 1;`
    );
    const [workflows] = await queryInterface.sequelize.query(
      `SELECT id FROM workflows LIMIT 1;`
    );

    if (users.length === 0 || workflows.length === 0) {
      console.log('⚠️ Skipping projects seeder: No users or workflows found. Run user and workflow seeders first.');
      return;
    }

    const userId = users[0].id;
    const workflowId = workflows[0].id;

    const projectsData = [
      {
        project_id: `SOL-${Date.now().toString().slice(-6)}`,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Residential Solar',
        lead_status: 'Closed',
        pincode: '110001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 1).toString().slice(-6)}`,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '9876543211',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Industrial Solar',
        lead_status: 'Rejected',
        pincode: '400001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 2).toString().slice(-6)}`,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '9876543212',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Ground Mounted Solar',
        lead_status: 'Dormant',
        pincode: '560001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 3).toString().slice(-6)}`,
        first_name: 'Alice',
        last_name: 'Williams',
        email: 'alice.williams@example.com',
        phone: '9876543213',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Common Building Solar',
        lead_status: 'Closed',
        pincode: '700001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 4).toString().slice(-6)}`,
        first_name: 'Charlie',
        last_name: 'Brown',
        email: 'charlie.brown@example.com',
        phone: '9876543214',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Solar Cleaning',
        lead_status: 'Rejected',
        pincode: '600001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 5).toString().slice(-6)}`,
        first_name: 'Diana',
        last_name: 'Davis',
        email: 'diana.davis@example.com',
        phone: '9876543215',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Solar Loan',
        lead_status: 'Dormant',
        pincode: '500001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 6).toString().slice(-6)}`,
        first_name: 'Edward',
        last_name: 'Miller',
        email: 'edward.miller@example.com',
        phone: '9876543216',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Residential Solar',
        lead_status: 'Intro Call',
        pincode: '380001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_id: `SOL-${(Date.now() + 7).toString().slice(-6)}`,
        first_name: 'Fiona',
        last_name: 'Wilson',
        email: 'fiona.wilson@example.com',
        phone: '9876543217',
        workflow_id: workflowId,
        created_by: userId,
        service_type: 'Industrial Solar',
        lead_status: 'Follow Up',
        pincode: '110001',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('projects', projectsData, {
      updateOnDuplicate: ['updated_at']
    });

    console.log(`✅ Seeded ${projectsData.length} projects with various lead statuses`);
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    // Delete seeded projects (those with example.com emails)
    await queryInterface.bulkDelete('projects', {
      email: {
        [Op.like]: '%@example.com'
      }
    });
  }
};

