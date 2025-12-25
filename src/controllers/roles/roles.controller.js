const { db } = require('../../models');

class RolesController {
  
  // 1. Fetch all Roles (with Permission data & User counts)
  static async getRoles(req, res) {
    try {
      const roles = await db.Role.findAll({
        include: [
          { 
            model: db.Permission, 
            as: 'permissions',
            attributes: ['id', 'slug', 'description', 'module']
          },
          {
            model: db.User,
            as: 'users',
            attributes: ['id'] // We only need IDs to count them
          }
        ],
        order: [['id', 'ASC']]
      });

      // Format data for frontend (calculate userCount)
      const formattedRoles = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        is_system: role.is_system,
        userCount: role.users.length,
        permissions: role.permissions.map(p => p.slug) // Send list of slugs ['users.view', ...]
      }));

      return res.json(formattedRoles);
    } catch (error) {
      console.error('Get Roles Error:', error);
      return res.status(500).json({ message: 'Failed to fetch roles' });
    }
  }

  // 2. Fetch all Available Permissions (for the selection matrix)
  static async getAllPermissions(req, res) {
    try {
      const permissions = await db.Permission.findAll({
        attributes: ['id', 'slug', 'description', 'module'],
        order: [['module', 'ASC'], ['slug', 'ASC']]
      });
      return res.json(permissions);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  }

  // 3. Create a New Role
  static async createRole(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { name, description, permissions } = req.body; // permissions = ['slug1', 'slug2']

      // Create Role
      const newRole = await db.Role.create({ name, description, is_system: false }, { transaction: t });

      // Find Permission IDs based on Slugs
      if (permissions && permissions.length > 0) {
        const permRecords = await db.Permission.findAll({ where: { slug: permissions } });
        await newRole.setPermissions(permRecords, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ message: 'Role created successfully', roleId: newRole.id });

    } catch (error) {
      if (t && !t.finished) {
        await t.rollback();
      }
      console.error('Create Role Error:', error);
      return res.status(500).json({ message: 'Failed to create role' });
    }
  }

  // 4. Update an Existing Role
  static async updateRole(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;

      const role = await db.Role.findByPk(id, { transaction: t });
      if (!role) {
        await t.rollback();
        return res.status(404).json({ message: 'Role not found' });
      }

      // System roles (like Admin) usually shouldn't have their name changed to prevent breakage,
      // but we allow updating permissions.
      await role.update({ name, description }, { transaction: t });

      // Update Permissions (Sync replaces old associations with new ones)
      if (permissions) {
        const permRecords = await db.Permission.findAll({ where: { slug: permissions } });
        await role.setPermissions(permRecords, { transaction: t });
      }

      await t.commit();
      return res.json({ message: 'Role updated successfully' });

    } catch (error) {
      if (t && !t.finished) {
        await t.rollback();
      }
      console.error('Update Role Error:', error);
      return res.status(500).json({ message: 'Failed to update role' });
    }
  }
}

module.exports = RolesController;