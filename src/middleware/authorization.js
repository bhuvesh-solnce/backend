const { getEnforcer } = require('../config/casbin');

/**
 * Casbin authorization middleware
 * Checks if the user has permission to access the resource
 * 
 * Usage:
 * app.get('/resource', authorize('resource', 'read'), (req, res) => { ... });
 * 
 * @param {string} resource - The resource (object) to check access for
 * @param {string} action - The action (e.g., 'read', 'write', 'delete')
 * @returns {Function} Express middleware function
 */
function authorize(resource, action) {
  return async (req, res, next) => {
    try {
      const enforcer = getEnforcer();
      
      // Get subject (user) from request
      // You can customize this based on your authentication method
      // For example, if using JWT: req.user.id or req.user.username
      const subject = req.user?.id || req.user?.username || req.user?.role || 'anonymous';
      
      // Check permission
      const allowed = await enforcer.enforce(subject, resource, action);
      
      if (allowed) {
        next(); // Permission granted
      } else {
        res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. You don't have permission to ${action} ${resource}`
        });
      }
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during authorization'
      });
    }
  };
}

/**
 * Check if user has role
 * 
 * @param {string} role - The role to check
 * @returns {Function} Express middleware function
 */
function requireRole(role) {
  return async (req, res, next) => {
    try {
      const enforcer = getEnforcer();
      
      const subject = req.user?.id || req.user?.username || 'anonymous';
      
      // Check if user has the role
      const hasRole = await enforcer.hasRoleForUser(subject, role);
      
      if (hasRole) {
        next();
      } else {
        res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. You don't have the required role: ${role}`
        });
      }
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during role check'
      });
    }
  };
}

/**
 * Flexible authorization middleware that checks permission
 * Can be used directly in routes
 * 
 * Usage:
 * app.get('/resource', checkPermission('resource', 'read'), (req, res) => { ... });
 * 
 * Or with custom subject extraction:
 * app.get('/resource', checkPermission('resource', 'read', (req) => req.user.id), (req, res) => { ... });
 */
async function checkPermission(subject, resource, action) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.enforce(subject, resource, action);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

module.exports = {
  authorize,
  requireRole,
  checkPermission
};
