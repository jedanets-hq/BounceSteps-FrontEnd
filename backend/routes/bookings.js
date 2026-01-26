const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all bookings for authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        b.*,
        s.title as service_title,
        s.description as service_description,
        s.images as service_images,
        s.location as service_location,
        s.price as service_price,
        s.category as service_category,
        sp.business_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        sp.user_id as provider_user_id,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name,
        u.email as traveler_email,
        u.phone as traveler_phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.user_id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);
    
    // Ensure total_price is set from total_amount if not present
    const bookings = result.rows.map(booking => ({
      ...booking,
      total_price: booking.total_price || booking.total_amount
    }));
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
});

// Get all bookings for a service provider
router.get('/provider', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get provider_id from service_providers table
    const providerCheck = await pool.query(`
      SELECT user_id FROM service_providers WHERE user_id = $1
    `, [userId]);
    
    if (providerCheck.rows.length === 0) {
      return res.json({ success: true, bookings: [] });
    }
    
    const result = await pool.query(`
      SELECT 
        b.*,
        s.title as service_title,
        s.description as service_description,
        s.images as service_images,
        s.location as service_location,
        s.price as service_price,
        s.category as service_category,
        sp.business_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name,
        u.email as traveler_email,
        u.phone as traveler_phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.user_id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = $1
      ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 1
          WHEN b.status = 'confirmed' THEN 2
          WHEN b.status = 'completed' THEN 3
          ELSE 4
        END,
        b.created_at DESC
    `, [userId]);
    
    // Ensure total_price is set
    const bookings = result.rows.map(booking => ({
      ...booking,
      total_price: booking.total_price || booking.total_amount
    }));
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
});

// Create booking (Pre-order)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { serviceId, bookingDate, participants = 1, specialRequests } = req.body;
    
    console.log('📝 Creating booking/pre-order:', { userId, serviceId, bookingDate, participants });
    
    if (!serviceId || !bookingDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service ID and booking date are required' 
      });
    }
    
    await client.query('BEGIN');
    
    // Get service details with provider info
    const serviceResult = await client.query(`
      SELECT 
        s.*,
        sp.user_id as provider_id,
        sp.business_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LEFT JOIN users u ON u.id = $2
      WHERE s.id = $1
    `, [serviceId, userId]);
    
    if (serviceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    const service = serviceResult.rows[0];
    const totalAmount = parseFloat(service.price) * parseInt(participants);
    
    // Create booking with all necessary data
    const result = await client.query(`
      INSERT INTO bookings (
        user_id, 
        service_id,
        provider_id, 
        service_type, 
        booking_date,
        travel_date,
        participants,
        total_amount,
        total_price,
        booking_details,
        special_requests,
        service_title,
        service_description,
        service_images,
        service_location,
        business_name,
        provider_phone,
        provider_email,
        traveler_first_name,
        traveler_last_name,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      userId,
      serviceId,
      service.provider_id,
      service.category || 'General',
      bookingDate,
      bookingDate, // travel_date same as booking_date
      participants,
      totalAmount,
      totalAmount, // total_price same as total_amount
      JSON.stringify({
        service_title: service.title,
        service_category: service.category,
        participants: participants,
        booking_date: bookingDate
      }),
      specialRequests,
      service.title,
      service.description,
      service.images,
      service.location,
      service.business_name,
      service.provider_phone,
      service.provider_email,
      service.traveler_first_name,
      service.traveler_last_name,
      'pending'
    ]);
    
    await client.query('COMMIT');
    
    console.log('✅ Booking created successfully:', result.rows[0].id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Pre-order created successfully',
      booking: result.rows[0] 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Update booking status (for providers)
router.patch('/:id/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    console.log('📝 Updating booking status:', { bookingId, status, userId });
    
    // Verify the booking belongs to this provider
    const checkResult = await pool.query(`
      SELECT b.id, b.provider_id 
      FROM bookings b
      WHERE b.id = $1 AND b.provider_id = $2
    `, [bookingId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or you do not have permission to update it' 
      });
    }
    
    const result = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, bookingId]);
    
    console.log('✅ Booking status updated to:', status);
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
});

// Delete booking (for both travelers and providers)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    console.log('🗑️ Deleting booking:', { bookingId, userId });
    
    // Delete booking if user is either the traveler or the provider
    const result = await pool.query(`
      DELETE FROM bookings
      WHERE id = $1 AND (user_id = $2 OR provider_id = $2)
      RETURNING *
    `, [bookingId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or you do not have permission to delete it' 
      });
    }
    
    console.log('✅ Booking deleted successfully');
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete booking' });
  }
});

module.exports = router;
