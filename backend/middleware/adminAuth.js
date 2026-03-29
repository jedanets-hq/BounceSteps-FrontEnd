const jwt = require('jsonwebtoken');
const { pool } = require('../models');

/**
 * Admin Authentication Middleware
 * Verifies JWT token and checks if user is an admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        code: 'NOT_ADMIN'
      });
    }
    
    // Get admin user from database
    const result = await pool.query(
      'SELECT id, email, full_name, role, permissions, is_active FROM admin_users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin user not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }
    
    const admin = result.rows[0];
    
    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated',
        code: 'ADMIN_INACTIVE'
      });
    }
    
    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }
    
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Check if admin has specific permission
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const admin = req.admin;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') {
      return next();
    }
    
    // Check if admin has the required permission
    const permissions = admin.permissions || [];
    
    if (!permissions.includes(requiredPermission) && !permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermission
      });
    }
    
    next();
  };
};

/**
 * Log admin action to audit log
 */
const logAdminAction = async (adminId, action, resourceType, resourceId, oldValue, newValue, req) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await pool.query(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [adminId, action, resourceType, resourceId, JSON.stringify(oldValue), JSON.stringify(newValue), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

module.exports = {
  authenticateAdmin,
  checkPermission,
  logAdminAction
};
