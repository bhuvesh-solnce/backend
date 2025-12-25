'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rolesData = [
      { name: 'Admin', description: 'System Administrator with full access', is_system: true },
      { name: 'Directors', description: 'Company Directors', is_system: false },
      { name: 'Salesperson', description: 'Sales Team Member', is_system: false },
      { name: 'Designer', description: 'System Designer', is_system: false },
      { name: 'Project Manager', description: 'Project Manager', is_system: false },
      { name: 'Sales Head', description: 'Head of Sales Department', is_system: false },
      { name: 'Project Head', description: 'Head of Projects Department', is_system: false },
      { name: 'User', description: 'Standard User / Customer', is_system: true },
      { name: 'Service Engineer', description: 'Maintenance and Service Engineer', is_system: false },
    ];

    // Add timestamps to each record
    const rolesWithTimestamp = rolesData.map((role) => ({
      ...role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // Use bulkInsert with updateOnDuplicate for Idempotency
    return queryInterface.bulkInsert('roles', rolesWithTimestamp, {
      updateOnDuplicate: ['description', 'updated_at'], // If name exists, just update description
    });
  },

  async down(queryInterface, Sequelize) {
    // We strictly delete only the roles we created, leaving others alone
    return queryInterface.bulkDelete('roles', {
      name: [
        'Admin', 'Directors', 'Salesperson', 'Designer', 'Project Manager',
        'Sales Head', 'Project Head', 'User', 'Service Engineer'
      ]
    });
  }
};