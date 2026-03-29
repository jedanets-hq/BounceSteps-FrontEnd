const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool } = require('../models');

// Generate admin JWT token
const generateAdminToken = (admin) => {
  return jwt.sign(
    { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      isAdmin: true
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' } // Shorter expiry for admin tokens
  );
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', email);

    // Find admin by email
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = result.rows[0];

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // Generate token
    const token = generateAdminToken(admin);

    console.log('✅ Admin login successful:', admin.email);

    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
        permissions: admin.permissions
      },
      token
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Get current admin
router.get('/me', async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin.id,
        email: req.admin.email,
        fullName: req.admin.full_name,
        role: req.admin.role,
        permissions: req.admin.permissions
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin information'
    });
  }
});

// Change admin password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    // Get current admin
    const result = await pool.query(
      'SELECT password FROM admin_users WHERE id = $1',
      [adminId]
    );

    const admin = result.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      'UPDATE admin_users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, adminId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

module.exports = router;
