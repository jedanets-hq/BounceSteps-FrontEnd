const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all providers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.rating DESC, sp.created_at DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get providers' });
  }
});

// Get provider by ID with their services
router.get('/:id', async (req, res) => {
  try {
    // Get provider details
    const providerResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [req.params.id]);
    
    if (providerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    const provider = providerResult.rows[0];
    
    // Get provider's services from services table
    const servicesResult = await pool.query(`
      SELECT s.*,
             COUNT(DISTINCT b.id) as review_count,
             AVG(b.rating) as average_rating
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE s.provider_id = $1 AND s.is_active = true AND s.status = 'active'
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [req.params.id]);
    
    // Add services to provider object
    provider.services = servicesResult.rows;
    provider.services_count = servicesResult.rows.length;
    
    res.json({ success: true, provider: provider });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to get provider' });
  }
});

// Follow a provider
router.post('/:id/follow', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const providerId = req.params.id;
    
    console.log('👤 Following provider:', { userId, providerId });
    
    await client.query('BEGIN');
    
    // Check if already following
    const existingFollow = await client.query(
      'SELECT * FROM provider_followers WHERE user_id = $1 AND provider_id = $2',
      [userId, providerId]
    );
    
    if (existingFollow.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.json({ success: false, message: 'Already following this provider' });
    }
    
    // Add follow
    await client.query(
      'INSERT INTO provider_followers (user_id, provider_id) VALUES ($1, $2)',
      [userId, providerId]
    );
    
    // Get updated follower count
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM provider_followers WHERE provider_id = $1',
      [providerId]
    );
    
    await client.query('COMMIT');
    
    console.log('✅ Provider followed successfully');
    
    res.json({ 
      success: true, 
      message: 'Provider followed successfully',
      followers_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Follow provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to follow provider' });
  } finally {
    client.release();
  }
});

// Unfollow a provider
router.post('/:id/unfollow', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const providerId = req.params.id;
    
    console.log('👤 Unfollowing provider:', { userId, providerId });
    
    await client.query('BEGIN');
    
    // Remove follow
    const result = await client.query(
      'DELETE FROM provider_followers WHERE user_id = $1 AND provider_id = $2 RETURNING *',
      [userId, providerId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ success: false, message: 'Not following this provider' });
    }
    
    // Get updated follower count
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM provider_followers WHERE provider_id = $1',
      [providerId]
    );
    
    await client.query('COMMIT');
    
    console.log('✅ Provider unfollowed successfully');
    
    res.json({ 
      success: true, 
      message: 'Provider unfollowed successfully',
      followers_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Unfollow provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to unfollow provider' });
  } finally {
    client.release();
  }
});

// Get follower count for a provider
router.get('/:id/followers/count', async (req, res) => {
  try {
    const providerId = req.params.id;
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM provider_followers WHERE provider_id = $1',
      [providerId]
    );
    
    res.json({ 
      success: true, 
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('❌ Get follower count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get follower count' });
  }
});

// Get followed providers for a user
router.get('/user/followed', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url, u.is_verified,
             pf.created_at as followed_at
      FROM provider_followers pf
      JOIN service_providers sp ON pf.provider_id = sp.user_id
      JOIN users u ON sp.user_id = u.id
      WHERE pf.user_id = $1
      ORDER BY pf.created_at DESC
    `, [userId]);
    
    res.json({ 
      success: true, 
      providers: result.rows 
    });
  } catch (error) {
    console.error('❌ Get followed providers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get followed providers' });
  }
});

module.exports = router;
