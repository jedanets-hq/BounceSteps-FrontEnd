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

module.exports = router;
