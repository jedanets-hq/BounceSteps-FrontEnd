const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get all users with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      userType = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      whereConditions.push(`(
        u.email ILIKE $${paramCount} OR 
        u.first_name ILIKE $${paramCount} OR 
        u.last_name ILIKE $${paramCount} OR
        u.phone ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // User type filter
    if (userType) {
      whereConditions.push(`u.user_type = $${paramCount}`);
      queryParams.push(userType);
      paramCount++;
    }

    // Status filter
    if (status === 'active') {
      whereConditions.push(`u.is_active = true`);
    } else if (status === 'inactive') {
      whereConditions.push(`u.is_active = false`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      queryParams
    );

    const totalUsers = parseInt(countResult.rows[0].total);

    // Get users
    queryParams.push(limit, offset);
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.user_type,
        u.is_verified,
        u.is_active,
        u.avatar_url,
        u.auth_provider,
        u.created_at,
        u.updated_at,
        CASE 
          WHEN u.user_type = 'service_provider' THEN sp.business_name
          ELSE NULL
        END as business_name,
        CASE 
          WHEN u.user_type = 'service_provider' THEN sp.is_verified
          ELSE NULL
        END as provider_verified,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as total_bookings,
        (SELECT COUNT(*) FROM services WHERE provider_id = sp.id) as total_services
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, queryParams);

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// Get user by ID with detailed information
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user details
    const userResult = await pool.query(`
      SELECT 
        u.*,
        sp.id as provider_id,
        sp.business_name,
        sp.business_type,
        sp.description,
        sp.location,
        sp.service_location,
        sp.is_verified as provider_verified,
        sp.rating as provider_rating,
        sp.total_reviews
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get user's bookings
    const bookingsResult = await pool.query(`
      SELECT 
        b.*,
        s.title as service_title,
        s.category as service_category
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get user's services (if provider)
    let services = [];
    if (user.user_type === 'service_provider' && user.provider_id) {
      const servicesResult = await pool.query(`
        SELECT 
          s.*,
          COUNT(DISTINCT b.id) as total_bookings
        FROM services s
        LEFT JOIN bookings b ON s.id = b.service_id
        WHERE s.provider_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `, [user.provider_id]);
      services = servicesResult.rows;
    }

    res.json({
      success: true,
      user: {
        ...user,
        bookings: bookingsResult.rows,
        services
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, phone, email } = req.body;

    // Get old values for audit log
    const oldResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const oldUser = oldResult.rows[0];

    // Update user
    const result = await pool.query(`
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [firstName, lastName, phone, email, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Suspend user
router.post('/:id/suspend', async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user'
    });
  }
});

// Restore user
router.post('/:id/restore', async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(`
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User restored successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore user'
    });
  }
});

// Get user activity log
router.get('/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    const { limit = 50 } = req.query;

    const result = await pool.query(`
      SELECT 
        'booking' as type,
        b.id,
        b.status,
        b.total_amount,
        b.created_at,
        s.title as service_title
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.user_id = $1
      
      UNION ALL
      
      SELECT 
        'service' as type,
        s.id,
        s.status,
        s.price as total_amount,
        s.created_at,
        s.title as service_title
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE sp.user_id = $1
      
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json({
      success: true,
      activities: result.rows
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity'
    });
  }
});

module.exports = router;
