/**
 * Permission Middleware
 * Checks if user has required permission
 * Must be used after authenticate middleware
 * 
 * Usage:
 *   router.get('/projects', authenticate, requirePermission('projects.view'), getProjects);
 *   router.post('/projects', authenticate, requirePermission('projects.create'), createProject);
 */
const requirePermission = (permissionSlug) => {
  return (req, res, next) => {
    // Ensure authenticate middleware was called first
    if (!req.user) {
      console.log('[RBAC PERMISSION] No user attached to request. Ensure authenticate middleware is used first.');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = req.user;
    
    // Admin bypass (role_id 1 = Admin)
    if (user.role_id === 1) {
      console.log('[RBAC PERMISSION] Admin user - permission granted:', permissionSlug);
      return next();
    }

    // Check if user has the required permission
    const hasPermission = user.permissions && user.permissions.includes(permissionSlug);
    
    console.log('[RBAC PERMISSION] Permission check:', {
      userId: user.id,
      email: user.email,
      required: permissionSlug,
      userPermissions: user.permissions,
      hasPermission: hasPermission
    });

    if (!hasPermission) {
      console.log(`[RBAC PERMISSION] ❌ Access denied - User ${user.id} missing permission: ${permissionSlug}`);
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        required: permissionSlug
      });
    }

    console.log(`[RBAC PERMISSION] ✅ Permission granted - User ${user.id} has: ${permissionSlug}`);
    next();
  };
};

/**
 * Require Any Permission
 * User must have at least one of the specified permissions
 * 
 * Usage:
 *   router.get('/projects', authenticate, requireAnyPermission(['projects.view', 'projects.view.all']), getProjects);
 */
const requireAnyPermission = (permissionSlugs) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = req.user;
    
    // Admin bypass
    if (user.role_id === 1) {
      return next();
    }

    const hasAnyPermission = permissionSlugs.some(slug => 
      user.permissions && user.permissions.includes(slug)
    );

    if (!hasAnyPermission) {
      console.log(`[RBAC PERMISSION] ❌ Access denied - User ${user.id} missing all permissions:`, permissionSlugs);
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        required: permissionSlugs
      });
    }

    next();
  };
};

/**
 * Require All Permissions
 * User must have all of the specified permissions
 * 
 * Usage:
 *   router.post('/projects/:id/approve', authenticate, requireAllPermissions(['projects.edit', 'projects.approve']), approveProject);
 */
const requireAllPermissions = (permissionSlugs) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = req.user;
    
    // Admin bypass
    if (user.role_id === 1) {
      return next();
    }

    const hasAllPermissions = permissionSlugs.every(slug => 
      user.permissions && user.permissions.includes(slug)
    );

    if (!hasAllPermissions) {
      console.log(`[RBAC PERMISSION] ❌ Access denied - User ${user.id} missing some permissions:`, permissionSlugs);
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        required: permissionSlugs
      });
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions
};

