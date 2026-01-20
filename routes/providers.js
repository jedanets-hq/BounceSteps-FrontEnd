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

// Get provider by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to get provider' });
  }
});

module.exports = router;
