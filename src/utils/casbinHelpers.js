const { getEnforcer } = require('../config/casbin');

/**
 * Casbin Policy Management Helpers
 * These functions help manage policies and roles in Casbin
 */

/**
 * Add a policy
 * @param {string} subject - Subject (user/role)
 * @param {string} object - Object (resource)
 * @param {string} action - Action (e.g., 'read', 'write', 'delete')
 * @returns {Promise<boolean>} True if policy was added
 */
async function addPolicy(subject, object, action) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.addPolicy(subject, object, action);
  } catch (error) {
    console.error('Error adding policy:', error);
    throw error;
  }
}

/**
 * Remove a policy
 * @param {string} subject - Subject (user/role)
 * @param {string} object - Object (resource)
 * @param {string} action - Action
 * @returns {Promise<boolean>} True if policy was removed
 */
async function removePolicy(subject, object, action) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.removePolicy(subject, object, action);
  } catch (error) {
    console.error('Error removing policy:', error);
    throw error;
  }
}

/**
 * Check if a policy exists
 * @param {string} subject - Subject (user/role)
 * @param {string} object - Object (resource)
 * @param {string} action - Action
 * @returns {Promise<boolean>} True if policy exists
 */
async function hasPolicy(subject, object, action) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.hasPolicy(subject, object, action);
  } catch (error) {
    console.error('Error checking policy:', error);
    return false;
  }
}

/**
 * Get all policies
 * @returns {Promise<Array>} Array of policies
 */
async function getAllPolicies() {
  try {
    const enforcer = getEnforcer();
    return await enforcer.getPolicy();
  } catch (error) {
    console.error('Error getting policies:', error);
    return [];
  }
}

/**
 * Get policies for a specific subject
 * @param {string} subject - Subject (user/role)
 * @returns {Promise<Array>} Array of policies for the subject
 */
async function getPoliciesForSubject(subject) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.getPermissionsForUser(subject);
  } catch (error) {
    console.error('Error getting policies for subject:', error);
    return [];
  }
}

/**
 * Assign a role to a user
 * @param {string} user - User identifier
 * @param {string} role - Role name
 * @returns {Promise<boolean>} True if role was assigned
 */
async function assignRole(user, role) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.addRoleForUser(user, role);
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
}

/**
 * Remove a role from a user
 * @param {string} user - User identifier
 * @param {string} role - Role name
 * @returns {Promise<boolean>} True if role was removed
 */
async function removeRole(user, role) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.deleteRoleForUser(user, role);
  } catch (error) {
    console.error('Error removing role:', error);
    throw error;
  }
}

/**
 * Get all roles for a user
 * @param {string} user - User identifier
 * @returns {Promise<Array>} Array of roles
 */
async function getRolesForUser(user) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.getRolesForUser(user);
  } catch (error) {
    console.error('Error getting roles for user:', error);
    return [];
  }
}

/**
 * Get all users with a specific role
 * @param {string} role - Role name
 * @returns {Promise<Array>} Array of users
 */
async function getUsersForRole(role) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.getUsersForRole(role);
  } catch (error) {
    console.error('Error getting users for role:', error);
    return [];
  }
}

/**
 * Check if a user has a specific role
 * @param {string} user - User identifier
 * @param {string} role - Role name
 * @returns {Promise<boolean>} True if user has the role
 */
async function hasRole(user, role) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.hasRoleForUser(user, role);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Delete all policies for a user
 * @param {string} user - User identifier
 * @returns {Promise<boolean>} True if policies were deleted
 */
async function deleteUser(user) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.deleteUser(user);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Delete all policies for a role
 * @param {string} role - Role name
 * @returns {Promise<boolean>} True if role was deleted
 */
async function deleteRole(role) {
  try {
    const enforcer = getEnforcer();
    return await enforcer.deleteRole(role);
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
}

module.exports = {
  // Policy management
  addPolicy,
  removePolicy,
  hasPolicy,
  getAllPolicies,
  getPoliciesForSubject,
  
  // Role management
  assignRole,
  removeRole,
  getRolesForUser,
  getUsersForRole,
  hasRole,
  deleteUser,
  deleteRole
};
