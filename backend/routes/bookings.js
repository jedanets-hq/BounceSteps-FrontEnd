const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { pool } = require('../config/postgresql');
const { Booking, Service, ServiceProvider, User } = require('../models');
const { 
  serializeDocument,
  serializeDocuments,
  isValidObjectId,
  toObjectId,
  getPagination
} = require('../utils/pg-helpers');

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('service_id')
      .populate('provider_id')
      .populate('traveler_id')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking: serializeDocument(booking) });
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

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const provider = await ServiceProvider.findOne({ user_id: parseInt(req.user.id) });
    if (!provider) {
      return res.status(403).json({ success: false, message: 'Only providers can update booking status' });
    }

    const booking = await Booking.findOne({ _id: parseInt(req.params.id), provider_id: provider.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    console.log('✅ Booking status updated:', booking.id, '→', status);

    res.json({ success: true, message: 'Booking status updated', booking: serializeDocument(booking) });
  } catch (error) {
    console.error('❌ UPDATE BOOKING STATUS Error:', error);
    res.status(500).json({ success: false, message: 'Error updating booking status' });
  }
});

// Cancel booking (traveler only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findOne({ _id: parseInt(req.params.id), traveler_id: parseInt(req.user.id) });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    console.log('✅ Booking cancelled:', booking.id);

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

    // Get recent bookings
    const recentBookings = await Booking.find({ 
      status: { $in: ['confirmed', 'completed'] } 
    })
      .populate('service_id', 'title category location')
      .populate('traveler_id', 'first_name last_name')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format activities
    const activities = recentBookings.map(booking => {
      const firstName = booking.traveler_id?.first_name || 'Anonymous';
      const lastName = booking.traveler_id?.last_name?.[0] || '';
      
      return {
        id: booking.id,
        type: 'booking',
        user: `${firstName} ${lastName}.`,
        action: `booked ${booking.service_id?.title || 'a service'}`,
        location: booking.service_id?.location || 'Unknown location',
        timestamp: booking.created_at,
        category: booking.service_id?.category || 'general'
      };
    });

    // Get stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [weeklyBookings, totalBookings, activeServices] = await Promise.all([
      Booking.countDocuments({ 
        created_at: { $gte: weekAgo },
        status: { $in: ['confirmed', 'completed'] }
      }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
      Service.countDocuments({ is_active: true })
    ]);

    // Get active travelers (users who booked in last 30 days)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeTravelers = await Booking.distinct('traveler_id', {
      created_at: { $gte: monthAgo }
    });

    // Get unique destinations
    const destinations = await Service.distinct('location', { is_active: true });

    res.json({
      success: true,
      activities,
      stats: {
        weeklyBookings,
        activeTravelers: activeTravelers.length,
        destinations: destinations.length,
        totalServices: activeServices
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
    const provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

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

    // Get bookings
    const bookings = await Booking.find({
      provider_id: provider.id,
      created_at: { $gte: startDate }
    })
      .populate('service_id', 'title category price')
      .populate('traveler_id', 'first_name last_name country')
      .lean();

    // Calculate metrics
    const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status));
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalBookings = confirmedBookings.length;
    const uniqueCustomers = [...new Set(bookings.map(b => b.traveler_id?.id?.toString()).filter(Boolean))].length;

    // Calculate average rating
    const reviewedBookings = bookings.filter(b => b.rating);
    const averageRating = reviewedBookings.length > 0
      ? (reviewedBookings.reduce((sum, b) => sum + b.rating, 0) / reviewedBookings.length).toFixed(1)
      : 0;

    // Calculate growth
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousBookings = await Booking.find({
      provider_id: provider.id,
      created_at: { $gte: previousStartDate, $lt: startDate },
      status: { $in: ['confirmed', 'completed'] }
    }).lean();

    const previousRevenue = previousBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 0;
    const bookingsGrowth = previousBookings.length > 0 ? (((totalBookings - previousBookings.length) / previousBookings.length) * 100).toFixed(1) : 0;

    // Top services
    const serviceStats = {};
    confirmedBookings.forEach(booking => {
      if (!booking.service_id) return;
      const sid = booking.service_id.id.toString();
      if (!serviceStats[sid]) {
        serviceStats[sid] = {
          name: booking.service_id.title,
          bookings: 0,
          revenue: 0,
          ratings: []
        };
      }
      serviceStats[sid].bookings++;
      serviceStats[sid].revenue += booking.total_price || 0;
      if (booking.rating) serviceStats[sid].ratings.push(booking.rating);
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

    // Customer insights
    const countryStats = {};
    bookings.forEach(b => {
      const country = b.traveler_id?.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });

    const topCountries = Object.entries(countryStats)
      .map(([country, bookings]) => ({
        country,
        bookings,
        percentage: totalBookings > 0 ? Math.round((bookings / totalBookings) * 100) : 0
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
        revenue: monthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
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
