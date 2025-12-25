const { db } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {

  static async register(req, res) {
    try {
      const { email, password, first_name, last_name } = req.body;
      console.log('[BACKEND ← FRONTEND] Received payload:', { ...req.body, password: '***' });
      
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Hash password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = await db.User.create({
        email,
        password: hashedPassword, 
        first_name: first_name,
        last_name: last_name,
        role_id: 8
      });
      // First get user with role data for permissions
      console.log('[RBAC BACKEND] Fetching user with role and permissions for user ID:', newUser.id);
      const userWithRole = await db.User.findOne({
          where: { id: newUser.id },
          include: [{
              model: db.Role,
              as: 'roleData',
              include: [{ model: db.Permission, as: 'permissions', through: { attributes: [] } }]
          }]
      });
      
      console.log('[RBAC BACKEND] User role data:', {
        userId: userWithRole?.id,
        roleId: userWithRole?.role_id,
        roleName: userWithRole?.roleData?.name,
        permissionsCount: userWithRole?.roleData?.permissions?.length || 0
      });
      
      const permissionSlugs = userWithRole?.roleData?.permissions?.map(p => p.slug) || [];
      console.log('[RBAC BACKEND] Permission slugs from database:', permissionSlugs);
      console.log('[RBAC BACKEND] Raw permissions from DB:', userWithRole?.roleData?.permissions?.map(p => ({
        id: p.id,
        slug: p.slug,
        description: p.description,
        module: p.module
      })));
      
      // Now create token with permissions
      const tokenPayload = { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role_id,
        permissions: permissionSlugs
      };
      console.log('[RBAC BACKEND] JWT payload being created:', { ...tokenPayload, permissions: permissionSlugs });
      
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1d' }
      );
      
      console.log('[RBAC BACKEND] JWT token created with permissions:', permissionSlugs.length, 'permissions');
      
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 
      });

      const responseData = {
        success: true, 
        message: 'User registered and logged in',
        token: token,
        user: { 
          id: userWithRole.id, 
          email: userWithRole.email, 
          name: `${userWithRole.first_name} ${userWithRole.last_name}`, 
          role: userWithRole.roleData.name,
          permissions: userWithRole.roleData?.permissions 
            ? userWithRole.roleData.permissions.map(p => p.slug) 
            : []
        }
      };
      
      console.log('[BACKEND → FRONTEND] Sending payload:', { ...responseData, token: '***' });
      return res.status(201).json(responseData);

    } catch (error) {
      console.error('Register Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log('[BACKEND ← FRONTEND] Received payload:', req.body);
      console.log('[RBAC BACKEND] Login attempt for email:', email);
      const user = await db.User.findOne({ 
        where: { email },
        include: [{
        model: db.Role,
        as: 'roleData', 
          include: [{
            model: db.Permission,
            as: 'permissions', 
            through: { attributes: [] } 
          }]
      }]});
      if (!user) {
        console.log('[RBAC BACKEND] User not found for email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('[RBAC BACKEND] User found:', {
        userId: user.id,
        roleId: user.role_id,
        roleName: user.roleData?.name,
        permissionsCount: user.roleData?.permissions?.length || 0
      });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('[RBAC BACKEND] Password mismatch for user:', user.id);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const permissionSlugs = user.roleData?.permissions?.map(p => p.slug) || [];
      console.log('[RBAC BACKEND] Permission slugs from database:', permissionSlugs);
      console.log('[RBAC BACKEND] Raw permissions from DB:', user.roleData?.permissions?.map(p => ({
        id: p.id,
        slug: p.slug,
        description: p.description,
        module: p.module
      })));
      
      const tokenPayload = { 
        id: user.id, 
        email: user.email, 
        role: user.role_id,
        permissions: permissionSlugs
      };
      console.log('[RBAC BACKEND] JWT payload being created:', { ...tokenPayload, permissions: permissionSlugs });
      
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1d' }
      );
      
      console.log('[RBAC BACKEND] JWT token created with', permissionSlugs.length, 'permissions');
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      const responsePermissions = user.roleData?.permissions 
        ? user.roleData.permissions.map(p => p.slug) 
        : [];
      
      const responseData = {
        success: true,
        user: { 
          id: user.id, 
          email: user.email, 
          name: `${user.first_name} ${user.last_name}`.trim(), 
          role: user.roleData.name,
          permissions: responsePermissions
         }
      };
      console.log('[RBAC BACKEND] Login response - User permissions being sent to frontend:', responsePermissions);
      console.log('[BACKEND → FRONTEND] Sending payload:', responseData);
      return res.json(responseData);

    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async logout(req, res) {
    try {
      console.log('[BACKEND ← FRONTEND] Logout request received');
      console.log('[BACKEND] Clearing authToken cookie');
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      const responseData = { success: true, message: 'Logged out' };
      console.log('[BACKEND → FRONTEND] Sending logout response:', responseData);
      return res.json(responseData);
    } catch (error) {
      console.error('[BACKEND] Logout Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = AuthController;