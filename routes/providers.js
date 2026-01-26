const express = require('express');
const router = express.Router();
const { pool } = require('../models');

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

module.exports = router;
