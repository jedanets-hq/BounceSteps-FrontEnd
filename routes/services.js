const express = require('express');
const router = express.Router();
const { pool } = require('../config/postgresql');

// Get all services with optional filters
router.get('/', async (req, res) => {
  try {
    const { limit = 12, category, location } = req.query;
    
    let query = `
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND s.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND s.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      services: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured/trending services
router.get('/featured/slides', async (req, res) => {
  try {
    const query = `
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
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      services: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching featured services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
