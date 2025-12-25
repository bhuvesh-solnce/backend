'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const INITIAL_PERMISSIONS = [
      // Page Access Permissions (standardized to {resource}.view format)
      { slug: 'dashboard.view', description: 'View Dashboard', module: 'General' },
      { slug: 'leads.view', description: 'View Leads List', module: 'Leads' },
      { slug: 'leads.opportunity.view', description: 'View Opportunities (Closed Leads)', module: 'Leads' },
      { slug: 'leads.rejected.view', description: 'View Rejected Leads', module: 'Leads' },
      { slug: 'leads.dormant.view', description: 'View Dormant Leads', module: 'Leads' },
      { slug: 'users.view', description: 'View User Management', module: 'System' },
      { slug: 'settings.view', description: 'View Settings', module: 'System' },
      { slug: 'workflow.view', description: 'View Workflow Management', module: 'System' },
      { slug: 'workflow_builder.view', description: 'Access Workflow Builder', module: 'System' },
      
      // Project Actions (standardized to plural 'projects')
      { slug: 'projects.create', description: 'Create new project', module: 'Projects' },
      { slug: 'projects.edit', description: 'Edit existing project', module: 'Projects' },
      { slug: 'projects.delete', description: 'Delete existing project', module: 'Projects' },
      
      // User Actions
      { slug: 'users.create', description: 'Create new user', module: 'System' },
      { slug: 'users.edit', description: 'Edit existing user', module: 'System' },
      { slug: 'users.delete', description: 'Delete existing user', module: 'System' },
      
      // Admin Tools
      { slug: 'roles.manage', description: 'Assign permissions to roles', module: 'System' },
      
      // Panel Types Permissions
      { slug: 'panel_types.view', description: 'View Panel Types', module: 'System Datasets' },
      { slug: 'panel_types.create', description: 'Create Panel Type', module: 'System Datasets' },
      { slug: 'panel_types.update', description: 'Update Panel Type', module: 'System Datasets' },
      { slug: 'panel_types.delete', description: 'Delete Panel Type', module: 'System Datasets' },
      
      // Watt Peaks Permissions
      { slug: 'watt_peaks.view', description: 'View Watt Peaks', module: 'System Datasets' },
      { slug: 'watt_peaks.create', description: 'Create Watt Peak', module: 'System Datasets' },
      { slug: 'watt_peaks.update', description: 'Update Watt Peak', module: 'System Datasets' },
      { slug: 'watt_peaks.delete', description: 'Delete Watt Peak', module: 'System Datasets' },
      
      // Panel Companies Permissions
      { slug: 'panel_companies.view', description: 'View Panel Companies', module: 'System Datasets' },
      { slug: 'panel_companies.create', description: 'Create Panel Company', module: 'System Datasets' },
      { slug: 'panel_companies.update', description: 'Update Panel Company', module: 'System Datasets' },
      { slug: 'panel_companies.delete', description: 'Delete Panel Company', module: 'System Datasets' },
      
      // Inverter Companies Permissions
      { slug: 'inverter_companies.view', description: 'View Inverter Companies', module: 'System Datasets' },
      { slug: 'inverter_companies.create', description: 'Create Inverter Company', module: 'System Datasets' },
      { slug: 'inverter_companies.update', description: 'Update Inverter Company', module: 'System Datasets' },
      { slug: 'inverter_companies.delete', description: 'Delete Inverter Company', module: 'System Datasets' },
      
      // Electricity Providers Permissions
      { slug: 'electricity_providers.view', description: 'View Electricity Providers', module: 'System Datasets' },
      { slug: 'electricity_providers.create', description: 'Create Electricity Provider', module: 'System Datasets' },
      { slug: 'electricity_providers.update', description: 'Update Electricity Provider', module: 'System Datasets' },
      { slug: 'electricity_providers.delete', description: 'Delete Electricity Provider', module: 'System Datasets' },
      
      // Solar Pricing Permissions
      { slug: 'solar_pricing.view', description: 'View Solar Pricing Management', module: 'Pricing' },
      { slug: 'solar_pricing.create', description: 'Create Solar Pricing Data', module: 'Pricing' },
      { slug: 'solar_pricing.update', description: 'Update Solar Pricing Data', module: 'Pricing' },
      { slug: 'solar_pricing.delete', description: 'Delete Solar Pricing Data', module: 'Pricing' },
      
      // Tech Specs Permissions
      { slug: 'tech_specs.view', description: 'View Tech Specs', module: 'Tech Specs' },
      { slug: 'tech_specs.create', description: 'Create Tech Spec', module: 'Tech Specs' },
      { slug: 'tech_specs.update', description: 'Update Tech Spec', module: 'Tech Specs' },
      { slug: 'tech_specs.delete', description: 'Delete Tech Spec', module: 'Tech Specs' },
      
      // Locations Permissions
      { slug: 'locations.view', description: 'View Locations Management', module: 'Locations' },
      { slug: 'cities.view', description: 'View Cities List', module: 'Locations' },
      { slug: 'cities.create', description: 'Create City', module: 'Locations' },
      { slug: 'cities.update', description: 'Update City', module: 'Locations' },
      { slug: 'cities.delete', description: 'Delete City', module: 'Locations' },
      { slug: 'states.view', description: 'View States List', module: 'Locations' },
      { slug: 'states.create', description: 'Create State', module: 'Locations' },
      { slug: 'states.update', description: 'Update State', module: 'Locations' },
      { slug: 'states.delete', description: 'Delete State', module: 'Locations' },
      { slug: 'pin_codes.view', description: 'View Zip Codes', module: 'Locations' },
      { slug: 'pin_codes.create', description: 'Create Zip Code', module: 'Locations' },
      { slug: 'pin_codes.update', description: 'Update Zip Code', module: 'Locations' },
      { slug: 'pin_codes.delete', description: 'Delete Zip Code', module: 'Locations' }
    ];

    // 1. Insert Permissions
    // We map over them to ensure created_at/updated_at are present if your DB requires them
    const permissionsData = INITIAL_PERMISSIONS.map(p => ({
      ...p,
      createdAt: new Date(), // Uncomment if your DB enforces timestamps
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('permissions', permissionsData, {
      updateOnDuplicate: ['slug'] // Safe re-seeding
    });

    // 2. Fetch Data needed for Assignment
    // We need Role IDs for Admin and User roles
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('Admin', 'User') ORDER BY name;`
    );
    
    const adminRole = roles.find(r => r.name === 'Admin');
    const userRole = roles.find(r => r.name === 'User');
    
    if (!adminRole) {
      console.warn("⚠️ Admin role not found. Skipping permission assignment.");
      return;
    }

    // We need ALL Permission IDs we just inserted
    const [allPermissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions;`
    );

    // 3. Prepare Junction Table Data (role_permissions)
    // Admin gets ALL permissions
    const adminRolePermissionsData = allPermissions.map(perm => ({
      role_id: adminRole.id,
      permission_id: perm.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // User role gets basic view permissions (dashboard, leads.view, users.view, system datasets)
    const userBasicPermissions = [
      'dashboard.view',
      'leads.view',
      'leads.opportunity.view',
      'leads.rejected.view',
      'leads.dormant.view',
      'users.view',
      'panel_types.view',
      'watt_peaks.view',
      'panel_companies.view',
      'inverter_companies.view',
      'electricity_providers.view',
      'tech_specs.view',
      'solar_pricing.view',
      'locations.view',
      'cities.view',
      'states.view',
      'pin_codes.view'
    ];
    // Query user permission IDs
    const [userPermissionIds] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug IN ('${userBasicPermissions.join("','")}');`
    );
    
    const userRolePermissionsData = userRole ? userPermissionIds.map(perm => ({
      role_id: userRole.id,
      permission_id: perm.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })) : [];

    // 4. Insert into Junction Table
    // 'ignoreDuplicates' prevents crashing if we run this twice
    if (adminRolePermissionsData.length > 0) {
      await queryInterface.bulkInsert('role_permissions', adminRolePermissionsData, {
        ignoreDuplicates: true 
      });
      console.log(`✅ Assigned ${adminRolePermissionsData.length} permissions to Admin role`);
    }
    
    if (userRole && userRolePermissionsData.length > 0) {
      await queryInterface.bulkInsert('role_permissions', userRolePermissionsData, {
        ignoreDuplicates: true 
      });
      console.log(`✅ Assigned ${userRolePermissionsData.length} basic permissions to User role`);
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove the assignments first (Foreign Key constraints)
    await queryInterface.bulkDelete('role_permissions', null, {});
    
    // 2. Remove the permissions
    await queryInterface.bulkDelete('permissions', null, {});
  }
};