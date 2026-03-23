const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Get all payments/transactions
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`b.payment_status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (dateFrom) {
      whereConditions.push(`b.created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`b.created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b ${whereClause}`,
      queryParams
    );

    const totalPayments = parseInt(countResult.rows[0].total);

    // Get payments
    queryParams.push(limit, offset);
    const result = await pool.query(`
      SELECT 
        b.id,
        b.total_amount,
        b.payment_status,
        b.payment_method,
        b.status as booking_status,
        b.created_at,
        b.updated_at,
        u.id as user_id,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name,
        u.email as traveler_email,
        sp.id as provider_id,
        sp.business_name,
        s.title as service_title,
        s.category as service_category
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN services s ON b.service_id = s.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, queryParams);

    res.json({
      success: true,
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPayments,
        totalPages: Math.ceil(totalPayments / limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments'
    });
  }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '7days':
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30days':
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90days':
        dateFilter = "created_at >= NOW() - INTERVAL '90 days'";
        break;
      case '1year':
        dateFilter = "created_at >= NOW() - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
    }

    // Total revenue
    const revenueResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_transactions,
        COALESCE(AVG(total_amount), 0) as avg_transaction
      FROM bookings
      WHERE ${dateFilter} AND payment_status = 'paid'
    `);

    // Revenue by status
    const statusResult = await pool.query(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM bookings
      WHERE ${dateFilter}
      GROUP BY payment_status
    `);

    // Revenue by currency
    const currencyResult = await pool.query(`
      SELECT 
        'TZS' as currency,
        COALESCE(SUM(total_amount), 0) as amount,
        COUNT(*) as count
      FROM bookings
      WHERE ${dateFilter} AND payment_status = 'paid'
    `);

    // Top providers by revenue
    const topProvidersResult = await pool.query(`
      SELECT 
        sp.id,
        sp.business_name,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COUNT(b.id) as total_bookings
      FROM service_providers sp
      LEFT JOIN bookings b ON sp.id = b.provider_id AND b.${dateFilter} AND b.payment_status = 'paid'
      GROUP BY sp.id, sp.business_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        revenue: revenueResult.rows[0],
        byStatus: statusResult.rows,
        byCurrency: currencyResult.rows,
        topProviders: topProvidersResult.rows
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics'
    });
  }
});

// Process refund
router.post('/:id/refund', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const bookingId = req.params.id;
    const { refundAmount, reason } = req.body;

    await client.query('BEGIN');

    // Get booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.payment_status === 'refunded') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Booking already refunded'
      });
    }

    // Update booking
    const result = await client.query(`
      UPDATE bookings 
      SET 
        payment_status = 'refunded',
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [bookingId]);

    // Create payment record if payments table exists
    try {
      await client.query(`
        INSERT INTO payments (
          booking_id, user_id, provider_id, amount, 
          status, refund_amount, refund_reason, refunded_by
        )
        VALUES ($1, $2, $3, $4, 'refunded', $5, $6, $7)
      `, [
        bookingId, 
        booking.user_id, 
        booking.provider_id, 
        booking.total_amount,
        refundAmount || booking.total_amount,
        reason,
        req.admin.id
      ]);
    } catch (err) {
      // Payments table might not exist yet, continue anyway
      console.log('Payments table not available, skipping payment record');
    }

    await client.query('COMMIT');

    // Log action
    await logAdminAction(
      req.admin.id,
      'PROCESS_REFUND',
      'booking',
      bookingId,
      booking,
      { ...result.rows[0], refund_amount: refundAmount, refund_reason: reason },
      req
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      booking: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  } finally {
    client.release();
  }
});

module.exports = router;


// Get verification requests with payment information
router.get('/verification-requests', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.business_type,
        sp.location,
        sp.is_verified,
        sp.created_at as provider_created_at,
        u.email as provider_email,
        u.phone as provider_phone,
        u.first_name,
        u.last_name,
        pp.id as payment_id,
        pp.amount as payment_amount,
        pp.currency,
        pp.provider_card_number,
        pp.provider_card_holder,
        pp.transaction_reference,
        pp.status as payment_status,
        pp.created_at as payment_date,
        pp.start_date,
        pp.end_date,
        apa.account_holder_name as admin_account_holder,
        apa.account_type as admin_account_type,
        apa.account_number as admin_account_number,
        (SELECT COUNT(*) FROM services WHERE provider_id = sp.id) as total_services
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (status === 'pending') {
      query += ` AND sp.is_verified = FALSE AND pp.id IS NOT NULL`;
    } else if (status === 'approved') {
      query += ` AND sp.is_verified = TRUE AND pp.id IS NOT NULL`;
    } else if (status === 'unpaid') {
      query += ` AND sp.is_verified = FALSE AND pp.id IS NULL`;
    }

    query += ` ORDER BY pp.created_at DESC NULLS LAST, sp.created_at DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      requests: result.rows
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification requests'
    });
  }
});

// Get promotion pricing
router.get('/pricing', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM promotion_pricing
      WHERE is_active = TRUE
      ORDER BY price ASC
    `);
    
    res.json({
      success: true,
      pricing: result.rows
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing'
    });
  }
});

// Get all promotion payments
router.get('/promotions', async (req, res) => {
  try {
    const { status, promotion_type, provider_id } = req.query;
    
    let query = `
      SELECT 
        pp.*,
        sp.business_name as provider_name,
        u.email as provider_email,
        s.title as service_title,
        apa.account_holder_name as admin_account_name
      FROM promotion_payments pp
      LEFT JOIN service_providers sp ON pp.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN services s ON pp.service_id = s.id
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND pp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (promotion_type) {
      query += ` AND pp.promotion_type = $${paramCount}`;
      params.push(promotion_type);
      paramCount++;
    }

    if (provider_id) {
      query += ` AND pp.provider_id = $${paramCount}`;
      params.push(provider_id);
      paramCount++;
    }

    query += ` ORDER BY pp.created_at DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      payments: result.rows
    });
  } catch (error) {
    console.error('Error fetching promotion payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion payments'
    });
  }
});
