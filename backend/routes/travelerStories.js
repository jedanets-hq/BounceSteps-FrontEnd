const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all traveler stories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ts.*, u.first_name, u.last_name, u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.is_approved = true
      ORDER BY ts.created_at DESC
      LIMIT 50
    `);
    
    res.json({ success: true, stories: result.rows });
  } catch (error) {
    console.error('Get traveler stories error:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json({ success: true, stories: [] });
  }
});

// Create new traveler story (authenticated)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, images, location } = req.body;
    
    const result = await pool.query(`
      INSERT INTO traveler_stories (user_id, title, content, images, location, is_approved)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `, [userId, title, content, JSON.stringify(images || []), location]);
    
    res.status(201).json({ success: true, story: result.rows[0] });
  } catch (error) {
    console.error('Create traveler story error:', error);
    res.status(500).json({ success: false, message: 'Failed to create story' });
  }
});

module.exports = router;
