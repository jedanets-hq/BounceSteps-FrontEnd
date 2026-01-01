const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { pool } = require('../config/postgresql');
const { Booking, Service, ServiceProvider } = require('../models');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Public endpoint for recent activity (no auth required)
router.get('/public/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Return mock data - using standard JavaScript Date constructor
    const activities = [
      {
        id: '1',
        type: 'booking',
        user: 'John D.',
        action: 'booked Safari Adventure',
        location: 'Serengeti',
        timestamp: new Date(),
        category: 'safari'
      },
      {
        id: '2',
        type: 'booking',
        user: 'Sarah M.',
        action: 'booked Mountain Climbing',
        location: 'Kilimanjaro',
        timestamp: new Date(Date.now() - 3600000),
        category: 'adventure'
      }
    ];
    
    const stats = {
      weeklyBookings: 15,
      activeTravelers: 8,
      destinations: 5,
      totalServices: 12
    };
    
    res.json({
      success: true,
      activities,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching public recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
});

// Get all bookings for authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type || req.user.userType;
    const { status, page = 1, limit = 10 } = req.query;

    console.log('📋 [GET BOOKINGS] User:', userId, 'Type:', userType);

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (userType === 'traveler') {
      whereConditions.push(`b.traveler_id = $${paramIndex++}`);
      queryParams.push(parseInt(userId));
    } else if (userType === 'service_provider') {
      // Get provider ID first
      const providerResult = await pool.query(
        'SELECT id FROM service_providers WHERE user_id = $1',
        [parseInt(userId)]
      );
      
      if (providerResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
      }
      
      whereConditions.push(`b.provider_id = $${paramIndex++}`);
      queryParams.push(providerResult.rows[0].id);
    }

    if (status) {
      whereConditions.push(`b.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get bookings with joined data
    const query = `
      SELECT 
        b.*,
        s.title as service_title,
        s.category,
        s.price,
        s.location,
        s.images,
        sp.business_name,
        sp.location as provider_location,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.traveler_id = u.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].total);

    const enrichedBookings = result.rows.map(b => ({
      id: b.id,
      traveler_id: b.traveler_id,
      service_id: b.service_id,
      provider_id: b.provider_id,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      participants: b.participants,
      total_amount: b.total_amount,
      status: b.status,
      payment_status: b.payment_status,
      special_requests: b.special_requests,
      created_at: b.created_at,
      updated_at: b.updated_at,
      service_title: b.service_title,
      business_name: b.business_name,
      traveler_name: `${b.first_name || ''} ${b.last_name || ''}`.trim()
    }));

    console.log('✅ [GET BOOKINGS] Found:', enrichedBookings.length, 'bookings');

    res.json({ 
      success: true, 
      bookings: enrichedBookings, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error('❌ GET BOOKINGS Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const query = `
      SELECT 
        b.*,
        s.title as service_title,
        s.category,
        s.price,
        s.location as service_location,
        s.images,
        sp.business_name,
        sp.location as provider_location,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.id = $1
    `;

    const result = await pool.query(query, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const b = result.rows[0];
    const booking = {
      id: b.id,
      traveler_id: b.traveler_id,
      service_id: b.service_id,
      provider_id: b.provider_id,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      participants: b.participants,
      total_amount: b.total_amount,
      status: b.status,
      payment_status: b.payment_status,
      special_requests: b.special_requests,
      created_at: b.created_at,
      updated_at: b.updated_at,
      service: {
        title: b.service_title,
        category: b.category,
        price: b.price,
        location: b.service_location,
        images: b.images
      },
      provider: {
        business_name: b.business_name,
        location: b.provider_location
      },
      traveler: {
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.email,
        phone: b.phone
      }
    };

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ GET BOOKING Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching booking' });
  }
});

// Create new booking
router.post('/', [authenticateJWT, body('serviceId').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { serviceId, bookingDate, startTime, endTime, participants = 1, specialRequests } = req.body;

    console.log('📋 [CREATE BOOKING] Request:', { serviceId, bookingDate, participants, userId: req.user.id });

    // Find service - use simple query
    const service = await Service.findById(parseInt(serviceId));
    if (!service) {
      console.log('❌ Service not found:', serviceId);
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    console.log('✅ Service found:', service.title, 'Provider:', service.provider_id);

    const totalAmount = (service.price || 0) * participants;

    // Create booking using the model
    const bookingData = {
      traveler_id: parseInt(req.user.id),
      service_id: parseInt(serviceId),
      provider_id: service.provider_id,
      booking_date: bookingDate || new Date().toISOString().split('T')[0],
      start_time: startTime || null,
      end_time: endTime || null,
      participants: parseInt(participants) || 1,
      total_amount: totalAmount,
      special_requests: specialRequests || null,
      status: 'pending',
      payment_status: 'pending'
    };

    console.log('📝 Creating booking with data:', bookingData);

    const newBooking = await Booking.create(bookingData);

    console.log('✅ Booking created:', newBooking.id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: newBooking.id,
        service_title: service.title,
        booking_date: newBooking.booking_date,
        participants: newBooking.number_of_guests || newBooking.participants,
        total_price: newBooking.total_amount,
        status: newBooking.status
      }
    });
  } catch (error) {
    console.error('❌ CREATE BOOKING Error:', error);
    res.status(500).json({ success: false, message: 'Error creating booking: ' + error.message });
  }
});

// Update booking status (provider only)
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    // Get provider
    const providerResult = await pool.query(
      'SELECT id FROM service_providers WHERE user_id = $1',
      [parseInt(req.user.id)]
    );
    
    if (providerResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Only providers can update booking status' });
    }

    const providerId = providerResult.rows[0].id;

    // Update booking
    const updateResult = await pool.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND provider_id = $3 
       RETURNING *`,
      [status, bookingId, providerId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking status updated:', bookingId, '→', status);

    res.json({ success: true, message: 'Booking status updated', booking: updateResult.rows[0] });
  } catch (error) {
    console.error('❌ UPDATE BOOKING STATUS Error:', error);
    res.status(500).json({ success: false, message: 'Error updating booking status' });
  }
});

// Cancel booking (traveler only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    // Check if booking exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id, status FROM bookings WHERE id = $1 AND traveler_id = $2',
      [bookingId, parseInt(req.user.id)]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (checkResult.rows[0].status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
    }

    // Update status to cancelled
    await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [bookingId]
    );

    console.log('✅ Booking cancelled:', bookingId);

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('❌ CANCEL BOOKING Error:', error);
    res.status(500).json({ success: false, message: 'Error cancelling booking' });
  }
});

// Get recent activity for homepage (public endpoint)
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent bookings with PostgreSQL
    const recentBookingsQuery = `
      SELECT 
        b.id,
        b.status,
        b.created_at,
        s.title as service_title,
        s.category,
        s.location,
        u.first_name,
        u.last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.status IN ('confirmed', 'completed')
      ORDER BY b.created_at DESC
      LIMIT $1
    `;
    
    const recentBookingsResult = await pool.query(recentBookingsQuery, [parseInt(limit)]);

    // Format activities
    const activities = recentBookingsResult.rows.map(booking => {
      const firstName = booking.first_name || 'Anonymous';
      const lastName = booking.last_name?.[0] || '';
      
      return {
        id: booking.id,
        type: 'booking',
        user: `${firstName} ${lastName}.`,
        action: `booked ${booking.service_title || 'a service'}`,
        location: booking.location || 'Unknown location',
        timestamp: booking.created_at,
        category: booking.category || 'general'
      };
    });

    // Get stats with PostgreSQL
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM bookings WHERE created_at >= $1 AND status IN ('confirmed', 'completed')) as weekly_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'completed')) as total_bookings,
        (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
        (SELECT COUNT(DISTINCT traveler_id) FROM bookings WHERE created_at >= $2) as active_travelers,
        (SELECT COUNT(DISTINCT location) FROM services WHERE is_active = true) as destinations
    `;
    
    const statsResult = await pool.query(statsQuery, [weekAgo.toISOString(), monthAgo.toISOString()]);
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      activities,
      stats: {
        weeklyBookings: parseInt(stats.weekly_bookings) || 0,
        activeTravelers: parseInt(stats.active_travelers) || 0,
        destinations: parseInt(stats.destinations) || 0,
        totalServices: parseInt(stats.active_services) || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
});

// Get provider analytics
router.get('/provider-analytics', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30days' } = req.query;

    // Get provider
    const providerResult = await pool.query(
      'SELECT id FROM service_providers WHERE user_id = $1',
      [parseInt(userId)]
    );
    
    if (providerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const providerId = providerResult.rows[0].id;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get bookings with PostgreSQL
    const bookingsQuery = `
      SELECT 
        b.*,
        s.title as service_title,
        s.category,
        s.price,
        u.first_name,
        u.last_name,
        u.country
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.provider_id = $1 AND b.created_at >= $2
      ORDER BY b.created_at DESC
    `;
    
    const bookingsResult = await pool.query(bookingsQuery, [providerId, startDate.toISOString()]);
    const bookings = bookingsResult.rows;

    // Calculate metrics
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    const totalBookings = confirmedBookings.length;
    
    // Unique customers
    const uniqueCustomerIds = [...new Set(bookings.map(b => b.traveler_id).filter(Boolean))];
    const uniqueCustomers = uniqueCustomerIds.length;

    // Calculate average rating
    const reviewedBookings = bookings.filter(b => b.rating);
    const averageRating = reviewedBookings.length > 0
      ? (reviewedBookings.reduce((sum, b) => sum + parseFloat(b.rating), 0) / reviewedBookings.length).toFixed(1)
      : 0;

    // Calculate growth (previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousBookingsQuery = `
      SELECT total_amount FROM bookings 
      WHERE provider_id = $1 AND created_at >= $2 AND created_at < $3 
      AND status IN ('confirmed', 'completed')
    `;
    const previousResult = await pool.query(previousBookingsQuery, [providerId, previousStartDate.toISOString(), startDate.toISOString()]);
    const previousBookings = previousResult.rows;
    const previousRevenue = previousBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    
    const revenueGrowth = previousRevenue > 0 ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 0;
    const bookingsGrowth = previousBookings.length > 0 ? (((totalBookings - previousBookings.length) / previousBookings.length) * 100).toFixed(1) : 0;

    // Top services
    const serviceStats = {};
    confirmedBookings.forEach(booking => {
      if (!booking.service_id) return;
      const sid = booking.service_id.toString();
      if (!serviceStats[sid]) {
        serviceStats[sid] = {
          name: booking.service_title || 'Unknown Service',
          bookings: 0,
          revenue: 0,
          ratings: []
        };
      }
      serviceStats[sid].bookings++;
      serviceStats[sid].revenue += parseFloat(booking.total_amount || 0);
      if (booking.rating) serviceStats[sid].ratings.push(parseFloat(booking.rating));
    });

    const topServices = Object.values(serviceStats)
      .map(s => ({
        name: s.name,
        bookings: s.bookings,
        revenue: s.revenue,
        rating: s.ratings.length > 0 ? (s.ratings.reduce((a, b) => a + b) / s.ratings.length).toFixed(1) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Customer insights by country
    const countryStats = {};
    bookings.forEach(b => {
      const country = b.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });

    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({
        country,
        bookings: count,
        percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings.filter(b => {
        const date = new Date(b.created_at);
        return date >= monthStart && date <= monthEnd && ['confirmed', 'completed'].includes(b.status);
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
        bookings: monthBookings.length
      });
    }

    res.json({
      success: true,
      analytics: {
        revenue: {
          total: totalRevenue,
          growth: parseFloat(revenueGrowth),
          trend: revenueGrowth >= 0 ? 'up' : 'down'
        },
        bookings: {
          total: totalBookings,
          growth: parseFloat(bookingsGrowth),
          trend: bookingsGrowth >= 0 ? 'up' : 'down'
        },
        customers: {
          total: uniqueCustomers,
          growth: 0,
          trend: 'neutral'
        },
        rating: {
          average: parseFloat(averageRating),
          total: reviewedBookings.length,
          growth: 0,
          trend: 'neutral'
        }
      },
      topServices,
      monthlyData,
      topCountries
    });
  } catch (error) {
    console.error('❌ Error fetching provider analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

module.exports = router;
