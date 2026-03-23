const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    // Calculate date ranges
    let currentStartDate, previousStartDate, previousEndDate;
    
    if (period === 'today') {
      // Today: from start of today
      currentStartDate = new Date();
      currentStartDate.setHours(0, 0, 0, 0);
      
      // Previous period: yesterday
      previousStartDate = new Date();
      previousStartDate.setDate(previousStartDate.getDate() - 2);
      previousStartDate.setHours(0, 0, 0, 0);
      
      previousEndDate = new Date();
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousEndDate.setHours(0, 0, 0, 0);
      
    } else if (period === 'alltime') {
      // All time: from beginning of time (1970)
      currentStartDate = new Date('1970-01-01');
      
      // For all time, we compare with data from 1 year ago to now
      previousStartDate = new Date();
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 2);
      
      previousEndDate = new Date();
      previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
      
    } else {
      // Standard period (7days, 30days, 90days)
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const days = daysMap[period] || 30;
      
      currentStartDate = new Date();
      currentStartDate.setDate(currentStartDate.getDate() - days);
      
      previousStartDate = new Date();
      previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
      
      previousEndDate = new Date();
      previousEndDate.setDate(previousEndDate.getDate() - days);
    }

    // Total users
    const usersResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $1) as current_period,
        COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as previous_period
      FROM users
    `, [currentStartDate, previousStartDate, previousEndDate]);

    // Total providers
    const providersResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $1) as current_period,
        COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as previous_period,
        COUNT(*) FILTER (WHERE is_verified = true) as verified
      FROM service_providers
    `, [currentStartDate, previousStartDate, previousEndDate]);

    // Total bookings
    const bookingsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $1) as current_period,
        COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as previous_period,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM bookings
    `, [currentStartDate, previousStartDate, previousEndDate]);

    // Total revenue
    const revenueResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_price), 0) as total,
        COALESCE(SUM(total_price) FILTER (WHERE created_at >= $1), 0) as current_period,
        COALESCE(SUM(total_price) FILTER (WHERE created_at >= $2 AND created_at < $3), 0) as previous_period
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
    `, [currentStartDate, previousStartDate, previousEndDate]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const users = usersResult.rows[0];
    const providers = providersResult.rows[0];
    const bookings = bookingsResult.rows[0];
    const revenue = revenueResult.rows[0];

    res.json({
      success: true,
      stats: {
        users: {
          total: parseInt(users.total),
          growth: calculateGrowth(parseInt(users.current_period), parseInt(users.previous_period))
        },
        providers: {
          total: parseInt(providers.total),
          verified: parseInt(providers.verified),
          growth: calculateGrowth(parseInt(providers.current_period), parseInt(providers.previous_period))
        },
        bookings: {
          total: parseInt(bookings.total),
          completed: parseInt(bookings.completed),
          growth: calculateGrowth(parseInt(bookings.current_period), parseInt(bookings.previous_period))
        },
        revenue: {
          total: parseFloat(revenue.total),
          growth: calculateGrowth(parseFloat(revenue.current_period), parseFloat(revenue.previous_period))
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const result = await pool.query(`
      SELECT 
        'user_registered' as type,
        u.id,
        u.first_name || ' ' || u.last_name as name,
        u.email,
        u.user_type,
        u.created_at
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'booking_created' as type,
        b.id,
        u.first_name || ' ' || u.last_name as name,
        COALESCE(b.service_title, 'Unknown Service') as email,
        b.status as user_type,
        b.created_at
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'service_created' as type,
        s.id,
        COALESCE(sp.business_name, 'Unknown Provider') as name,
        s.title as email,
        s.category as user_type,
        s.created_at
      FROM services s
      LEFT JOIN users u ON s.provider_id = u.id
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE s.created_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      activities: result.rows
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity',
      error: error.message
    });
  }
});

// Get chart data
router.get('/charts', async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    let interval = '1 day';
    let dateFormat = 'YYYY-MM-DD';
    let periodInterval = '30 days';
    
    switch (period) {
      case '7days':
        interval = '1 day';
        dateFormat = 'YYYY-MM-DD';
        periodInterval = '7 days';
        break;
      case '30days':
        interval = '1 day';
        dateFormat = 'YYYY-MM-DD';
        periodInterval = '30 days';
        break;
      case '90days':
        interval = '1 week';
        dateFormat = 'YYYY-WW';
        periodInterval = '90 days';
        break;
      case '1year':
        interval = '1 month';
        dateFormat = 'YYYY-MM';
        periodInterval = '1 year';
        break;
    }

    // Revenue over time
    const revenueResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, $1) as date,
        COALESCE(SUM(total_price), 0) as revenue,
        COUNT(*) as bookings
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '${periodInterval}'
        AND status IN ('confirmed', 'completed')
      GROUP BY TO_CHAR(created_at, $1)
      ORDER BY date
    `, [dateFormat]);

    // Users over time
    const usersResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, $1) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${periodInterval}'
      GROUP BY TO_CHAR(created_at, $1)
      ORDER BY date
    `, [dateFormat]);

    res.json({
      success: true,
      charts: {
        revenue: revenueResult.rows,
        users: usersResult.rows
      }
    });

  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chart data',
      error: error.message
    });
  }
});

module.exports = router;
