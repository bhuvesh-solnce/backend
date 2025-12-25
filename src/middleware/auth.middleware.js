const jwt = require('jsonwebtoken');
const { db } = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token from cookie or Authorization header
 * Attaches user data to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('[RBAC MIDDLEWARE] No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Fetch user with role and permissions from database
    const user = await db.User.findOne({
      where: { id: decoded.id, is_active: true },
      include: [{
        model: db.Role,
        as: 'roleData',
        include: [{
          model: db.Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      }],
      attributes: { exclude: ['password', 'refresh_token', 'otp'] }
    });

    if (!user) {
      console.log('[RBAC MIDDLEWARE] User not found or inactive:', decoded.id);
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Extract permission slugs
    const permissions = user.roleData?.permissions?.map(p => p.slug) || [];

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.roleData?.name,
      permissions: permissions
    };

    console.log('[RBAC MIDDLEWARE] User authenticated:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      permissionsCount: req.user.permissions.length
    });

    next();
  } catch (error) {
    console.error('[RBAC MIDDLEWARE] Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = authenticate;

