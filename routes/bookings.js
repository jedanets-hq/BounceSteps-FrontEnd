const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, sp.business_name, sp.business_type 
      FROM bookings b
      JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.params.userId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { user_id, provider_id, service_type, booking_date, total_amount, booking_details, status } = req.body;
    
    const result = await pool.query(`
      INSERT INTO bookings (user_id, provider_id, service_type, booking_date, total_amount, booking_details, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [user_id, provider_id, service_type, booking_date, total_amount, JSON.stringify(booking_details), status || 'draft']);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const result = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
});

// Get recent public booking activity (for homepage)
router.get('/public/recent-activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
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
      `, [parseInt(limit)]);
      
      res.json({
        success: true,
        activities: result.rows,
        count: result.rows.length
      });
    } else {
      // Fallback - return empty array
      res.json({
        success: true,
        activities: [],
        count: 0
      });
    }
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
