const express = require('express');
const router = express.Router();
const { pool } = require('../config/postgresql');

// Get recent public booking activity (for homepage)
router.get('/public/recent-activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const query = `
      SELECT 
        b.id,
        b.created_at,
        s.title as service_title,
        s.category,
        s.location,
        u.first_name as traveler_first_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.status IN ('confirmed', 'completed')
      ORDER BY b.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);
    
    res.json({
      success: true,
      activities: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
