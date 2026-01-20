const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get all services
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name 
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.created_at DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to get services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name 
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ success: false, message: 'Failed to get service' });
  }
});

// Get featured/trending services for homepage
router.get('/featured/slides', async (req, res) => {
  try {
    // Check if services table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      // Use services table if it exists
      const result = await pool.query(`
        SELECT s.*, 
               sp.business_name, 
               sp.location as provider_location,
               u.first_name as provider_first_name,
               u.last_name as provider_last_name
        FROM services s
        LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
        LEFT JOIN users u ON s.provider_id = u.id
        WHERE s.status = 'active' AND s.is_featured = true
        ORDER BY s.created_at DESC
        LIMIT 6
      `);
      
      res.json({
        success: true,
        services: result.rows,
        count: result.rows.length
      });
    } else {
      // Fallback to service_providers table
      const result = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name 
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.is_active = true
        ORDER BY sp.created_at DESC
        LIMIT 6
      `);
      
      res.json({
        success: true,
        services: result.rows,
        count: result.rows.length
      });
    }
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get featured services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
