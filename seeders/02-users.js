'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fetch all Roles first so we can map Names -> IDs
    // We use raw query because we can't easily rely on Models inside seeders
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`
    );

    // Create a map: { 'Admin': 1, 'Directors': 2, ... }
    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    // 2. Prepare User Data
    // We define the handles and map them to the Role Names
    const usersConfig = [
      { role: 'Admin', handle: 'admin' },
      { role: 'Directors', handle: 'directors' },
      { role: 'Salesperson', handle: 'salesperson' },
      { role: 'Designer', handle: 'designer' },
      { role: 'Project Manager', handle: 'projectmanager' },
      { role: 'Sales Head', handle: 'saleshead' },
      { role: 'Project Head', handle: 'projecthead' },
      { role: 'User', handle: 'user' },
      { role: 'Service Engineer', handle: 'serviceengineer' },
    ];

    const passwordHash = bcrypt.hashSync('123456', 10); // Hash once, reuse (faster)

    const usersToInsert = usersConfig.map((u) => {
      const roleId = roleMap[u.role];
      
      if (!roleId) {
        console.warn(`⚠️ Warning: Role '${u.role}' not found. Skipping user '${u.handle}'.`);
        return null;
      }

      return {
        username: u.handle,
        email: `${u.handle}@solnce.com`,
        password: passwordHash, // Manually hashed
        role_id: roleId,
        first_name: u.role,
        last_name: 'Test',
        mobile: '9876543210',
        is_email_verified: true,
        is_mobile_verified: true,
        is_active: true,
        // Manually generate refer code since hooks don't run
        refer_code: crypto.randomBytes(4).toString('hex'),
        created_at: new Date(),
        updated_at: new Date(),
      };
    }).filter(u => u !== null); // Remove nulls if any role was missing

    // 3. Bulk Insert
    if (usersToInsert.length > 0) {
      return queryInterface.bulkInsert('users', usersToInsert, {
        updateOnDuplicate: ['role_id', 'password', 'updated_at'] 
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Delete users with the specific domain used in seeding
    return queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.like]: '%@solnce.com'
      }
    });
  }
};