const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get all providers with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      verified = '',
      hasBadge = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (search) {
      whereConditions.push(`(
        sp.business_name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (verified === 'true') {
      whereConditions.push(`sp.is_verified = true`);
    } else if (verified === 'false') {
      whereConditions.push(`sp.is_verified = false`);
    }

    if (hasBadge === 'true') {
      whereConditions.push(`pb.id IS NOT NULL`);
    } else if (hasBadge === 'false') {
      whereConditions.push(`pb.id IS NULL`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total 
       FROM service_providers sp
       JOIN users u ON sp.user_id = u.id AND u.user_type = 'service_provider'
       LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
       ${whereClause}`,
      queryParams
    );

    const totalProviders = parseInt(countResult.rows[0].total);

    // Get providers
    queryParams.push(limit, offset);
    const result = await pool.query(`
      SELECT 
        sp.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.avatar_url,
        pb.badge_type,
        pb.assigned_at as badge_assigned_at,
        pb.expires_at as badge_expires_at,
        (SELECT COUNT(*) FROM services WHERE provider_id = sp.id) as total_services,
        (SELECT COUNT(*) FROM bookings WHERE provider_id = sp.id) as total_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE provider_id = sp.id AND status = 'completed') as total_revenue
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id AND u.user_type = 'service_provider'
      LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
      ${whereClause}
      ORDER BY sp.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, queryParams);

    res.json({
      success: true,
      providers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProviders,
        totalPages: Math.ceil(totalProviders / limit)
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get providers'
    });
  }
});

// Get provider by ID
router.get('/:id', async (req, res) => {
  try {
    const providerId = req.params.id;

    const result = await pool.query(`
      SELECT 
        sp.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.avatar_url,
        u.created_at as user_created_at,
        pb.badge_type,
        pb.assigned_at as badge_assigned_at,
        pb.expires_at as badge_expires_at,
        pb.notes as badge_notes
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id AND u.user_type = 'service_provider'
      LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
      WHERE sp.id = $1
    `, [providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const provider = result.rows[0];

    // Get services
    const servicesResult = await pool.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE s.provider_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [providerId]);

    // Get bookings
    const bookingsResult = await pool.query(`
      SELECT 
        b.*,
        s.title as service_title,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = $1
      ORDER BY b.created_at DESC
      LIMIT 20
    `, [providerId]);

    res.json({
      success: true,
      provider: {
        ...provider,
        services: servicesResult.rows,
        bookings: bookingsResult.rows
      }
    });

  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider'
    });
  }
});

// Verify provider identity
router.post('/:id/verify', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { notes } = req.body;

    const result = await pool.query(`
      UPDATE service_providers 
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Provider verified successfully',
      provider: result.rows[0]
    });

  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify provider'
    });
  }
});

// Unverify provider
router.post('/:id/unverify', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { reason } = req.body;

    const result = await pool.query(`
      UPDATE service_providers 
      SET is_verified = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      message: 'Provider verification removed',
      provider: result.rows[0]
    });

  } catch (error) {
    console.error('Unverify provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unverify provider'
    });
  }
});

// Assign badge to provider (SINGLE BADGE SYSTEM)
router.post('/:id/badge', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const providerId = req.params.id;
    const { badgeType, expiresAt, notes } = req.body;

    const validBadges = ['verified', 'premium', 'top_rated', 'eco_friendly', 'local_expert'];
    if (!validBadges.includes(badgeType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid badge type. Must be one of: ${validBadges.join(', ')}`
      });
    }

    await client.query('BEGIN');

    // Check if provider exists AND is a service provider
    const providerCheck = await client.query(
      `SELECT sp.id 
       FROM service_providers sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.id = $1 AND u.user_type = 'service_provider'`,
      [providerId]
    );

    if (providerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Provider not found or not a service provider'
      });
    }

    // Get old badge if exists
    const oldBadgeResult = await client.query(
      'SELECT * FROM provider_badges WHERE provider_id = $1',
      [providerId]
    );
    const oldBadge = oldBadgeResult.rows[0];

    // Delete existing badge (SINGLE BADGE RULE)
    await client.query(
      'DELETE FROM provider_badges WHERE provider_id = $1',
      [providerId]
    );

    // Insert new badge (no assigned_by since no authentication)
    const result = await client.query(`
      INSERT INTO provider_badges (provider_id, badge_type, expires_at, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [providerId, badgeType, expiresAt || null, notes || null]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Badge assigned successfully',
      badge: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Assign badge error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign badge',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Remove badge from provider
router.delete('/:id/badge', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { reason } = req.body;

    // Get old badge
    const oldBadgeResult = await pool.query(
      'SELECT * FROM provider_badges WHERE provider_id = $1',
      [providerId]
    );
    const oldBadge = oldBadgeResult.rows[0];

    if (!oldBadge) {
      return res.status(404).json({
        success: false,
        message: 'Provider has no badge'
      });
    }

    // Delete badge
    await pool.query(
      'DELETE FROM provider_badges WHERE provider_id = $1',
      [providerId]
    );

    res.json({
      success: true,
      message: 'Badge removed successfully'
    });

  } catch (error) {
    console.error('Remove badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove badge'
    });
  }
});

// Suspend provider (suspends user account and hides all services)
router.post('/:id/suspend', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const providerId = req.params.id;
    const { reason } = req.body;

    await client.query('BEGIN');

    // Get provider's user_id
    const providerResult = await client.query(
      'SELECT user_id, business_name FROM service_providers WHERE id = $1',
      [providerId]
    );

    if (providerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const { user_id, business_name } = providerResult.rows[0];

    // Suspend the user account
    await client.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user_id]
    );

    // Deactivate all provider's services
    await client.query(
      'UPDATE services SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE provider_id = $1',
      [providerId]
    );

    await client.query('COMMIT');

    console.log(`✅ Provider ${business_name} (ID: ${providerId}) suspended successfully`);

    res.json({
      success: true,
      message: 'Provider suspended successfully. All services have been hidden.',
      provider_id: providerId,
      user_id: user_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Suspend provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend provider'
    });
  } finally {
    client.release();
  }
});

// Restore provider (reactivates user account and services)
router.post('/:id/restore', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const providerId = req.params.id;

    await client.query('BEGIN');

    // Get provider's user_id
    const providerResult = await client.query(
      'SELECT user_id, business_name FROM service_providers WHERE id = $1',
      [providerId]
    );

    if (providerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const { user_id, business_name } = providerResult.rows[0];

    // Restore the user account
    await client.query(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user_id]
    );

    // Reactivate all provider's services
    await client.query(
      'UPDATE services SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE provider_id = $1',
      [providerId]
    );

    await client.query('COMMIT');

    console.log(`✅ Provider ${business_name} (ID: ${providerId}) restored successfully`);

    res.json({
      success: true,
      message: 'Provider restored successfully. All services are now visible.',
      provider_id: providerId,
      user_id: user_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Restore provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore provider'
    });
  } finally {
    client.release();
  }
});

module.exports = router;
