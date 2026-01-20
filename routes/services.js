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

module.exports = router;
