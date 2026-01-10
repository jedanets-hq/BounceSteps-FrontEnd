/**
 * Role Protection Middleware
 * Prevents non-admin users from modifying their own user_type
 * Implements Property 9: Role Immutability
 */

const { User } = require('../models');

/**
 * Middleware to prevent role modification by non-admin users
 * Only admin users can modify user roles
 */
const preventRoleModification = async (req, res, next) => {
  try {
    // Check if request body contains user_type or userType
    const attemptedRoleChange = req.body.user_type || req.body.userType;
    
    if (!attemptedRoleChange) {
      // No role change attempted, proceed
      return next();
    }

    // Get current user from JWT
    const currentUser = req.user;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin users can modify roles
    if (currentUser.user_type === 'admin') {
      return next();
    }

    // Get the target user ID (from params or body)
    const targetUserId = req.params.id || req.params.userId || req.body.userId;
    
    // If user is trying to modify their own role, reject
    if (!targetUserId || parseInt(targetUserId) === parseInt(currentUser.id)) {
      // Check if the role is actually different
      const currentRole = currentUser.user_type;
      if (attemptedRoleChange !== currentRole) {
        console.log(`⚠️ Role modification blocked for user ${currentUser.id}: attempted to change from ${currentRole} to ${attemptedRoleChange}`);
        return res.status(403).json({
          success: false,
          message: 'You cannot modify your own account type. Contact an administrator for role changes.',
          code: 'ROLE_MODIFICATION_FORBIDDEN'
        });
      }
    }

    // Non-admin trying to modify another user's role
    if (targetUserId && parseInt(targetUserId) !== parseInt(currentUser.id)) {
      console.log(`⚠️ Role modification blocked: non-admin user ${currentUser.id} attempted to modify user ${targetUserId}`);
      return res.status(403).json({
        success: false,
        message: 'Only administrators can modify user roles.',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Role protection middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

/**
 * Middleware to strip role fields from request body for non-admin users
 * Use this as a softer alternative that silently removes role changes
 */
const stripRoleFields = (req, res, next) => {
  const currentUser = req.user;
  
  // Admin users can modify roles
  if (currentUser && currentUser.user_type === 'admin') {
    return next();
  }

  // Remove role fields from body for non-admin users
  if (req.body) {
    delete req.body.user_type;
    delete req.body.userType;
  }

  next();
};

/**
 * Validate that a role value is valid
 */
const validateRole = (role) => {
  const validRoles = ['traveler', 'service_provider', 'admin'];
  return validRoles.includes(role);
};

module.exports = {
  preventRoleModification,
  stripRoleFields,
  validateRole
};
