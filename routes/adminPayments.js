const express = require('express');
const router = express.Router();
const { pool } = require('../config/postgresql');

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN PAYMENT ACCOUNTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Get all admin payment accounts
router.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, account_type, account_holder_name, account_number,
        bank_name, card_last_four, expiry_date, mobile_number,
        is_active, is_primary, created_at, updated_at
      FROM admin_payment_accounts
      ORDER BY is_primary DESC, created_at DESC
    `);
    
    res.json({
      success: true,
      accounts: result.rows
    });
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment accounts'
    });
  }
});

// Get primary payment account
router.get('/accounts/primary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, account_type, account_holder_name, account_number,
        bank_name, card_last_four, expiry_date, mobile_number,
        is_active, is_primary, created_at
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No primary payment account found'
      });
    }
    
    res.json({
      success: true,
      account: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching primary account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch primary account'
    });
  }
});

// Create new payment account
router.post('/accounts', async (req, res) => {
  try {
    const {
      account_type,
      account_holder_name,
      account_number,
      bank_name,
      card_last_four,
      expiry_date,
      mobile_number,
      is_primary
    } = req.body;

    // Validation
    if (!account_type || !account_holder_name || !account_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // If setting as primary, unset other primary accounts
    if (is_primary) {
      await pool.query(`
        UPDATE admin_payment_accounts 
        SET is_primary = FALSE 
        WHERE is_primary = TRUE
      `);
    }

    const result = await pool.query(`
      INSERT INTO admin_payment_accounts (
        account_type, account_holder_name, account_number,
        bank_name, card_last_four, expiry_date, mobile_number,
        is_primary, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *
    `, [
      account_type,
      account_holder_name,
      account_number,
      bank_name,
      card_last_four,
      expiry_date,
      mobile_number,
      is_primary || false
    ]);

    res.json({
      success: true,
      message: 'Payment account created successfully',
      account: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment account'
    });
  }
});

// Update payment account
router.put('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      account_holder_name,
      account_number,
      bank_name,
      card_last_four,
      expiry_date,
      mobile_number,
      is_primary,
      is_active
    } = req.body;

    // If setting as primary, unset other primary accounts
    if (is_primary) {
      await pool.query(`
        UPDATE admin_payment_accounts 
        SET is_primary = FALSE 
        WHERE is_primary = TRUE AND id != $1
      `, [id]);
    }

    const result = await pool.query(`
      UPDATE admin_payment_accounts
      SET 
        account_holder_name = COALESCE($1, account_holder_name),
        account_number = COALESCE($2, account_number),
        bank_name = COALESCE($3, bank_name),
        card_last_four = COALESCE($4, card_last_four),
        expiry_date = COALESCE($5, expiry_date),
        mobile_number = COALESCE($6, mobile_number),
        is_primary = COALESCE($7, is_primary),
        is_active = COALESCE($8, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [
      account_holder_name,
      account_number,
      bank_name,
      card_last_four,
      expiry_date,
      mobile_number,
      is_primary,
      is_active,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment account not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment account updated successfully',
      account: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment account'
    });
  }
});

// Delete payment account
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM admin_payment_accounts
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment account not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment account'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PROMOTION PAYMENTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

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

// Get promotion payment statistics
router.get('/promotions/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM promotion_payments
    `);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
});

// Process promotion payment (provider pays for promotion)
router.post('/promotions/process', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      provider_id,
      service_id,
      promotion_type,
      card_number,
      card_holder,
      card_expiry,
      card_cvv
    } = req.body;

    // Validation
    if (!provider_id || !promotion_type || !card_number || !card_holder) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Get pricing for promotion type
    const pricingResult = await client.query(`
      SELECT price, currency, duration_days, description
      FROM promotion_pricing
      WHERE promotion_type = $1 AND is_active = TRUE
    `, [promotion_type]);

    if (pricingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Promotion type not found or inactive'
      });
    }

    const pricing = pricingResult.rows[0];

    // Get primary admin account
    const adminAccountResult = await client.query(`
      SELECT id, account_type, account_holder_name, account_number
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);

    if (adminAccountResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({
        success: false,
        message: 'No active admin payment account configured. Please contact administrator.'
      });
    }

    const adminAccount = adminAccountResult.rows[0];

    // Generate transaction reference
    const transactionRef = `PROMO-${Date.now()}-${provider_id}`;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pricing.duration_days);

    // Mask card number (store only last 4 digits)
    const maskedCardNumber = card_number.slice(-4).padStart(card_number.length, '*');

    // Insert payment record
    const paymentResult = await client.query(`
      INSERT INTO promotion_payments (
        provider_id, service_id, promotion_type, amount, currency,
        provider_card_number, provider_card_holder, provider_card_expiry,
        admin_account_id, status, transaction_reference,
        description, duration_days, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      provider_id,
      service_id,
      promotion_type,
      pricing.price,
      pricing.currency,
      maskedCardNumber,
      card_holder,
      card_expiry,
      adminAccount.id,
      'completed', // Payment successful
      transactionRef,
      pricing.description,
      pricing.duration_days,
      startDate,
      endDate
    ]);

    // Apply the promotion based on type
    if (promotion_type === 'verification') {
      await client.query(`
        UPDATE service_providers
        SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [provider_id]);
    } else if (promotion_type === 'featured_listing' && service_id) {
      await client.query(`
        UPDATE services
        SET is_featured = TRUE, promotion_type = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [promotion_type, service_id]);
    } else if (promotion_type === 'premium_badge' && service_id) {
      await client.query(`
        UPDATE services
        SET promotion_type = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [promotion_type, service_id]);
    } else if (promotion_type === 'top_placement' && service_id) {
      await client.query(`
        UPDATE services
        SET promotion_type = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [promotion_type, service_id]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: paymentResult.rows[0],
      transaction_reference: transactionRef,
      admin_account: {
        account_type: adminAccount.account_type,
        account_holder: adminAccount.account_holder_name,
        account_number: adminAccount.account_number
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing promotion payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  } finally {
    client.release();
  }
});

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

// Update promotion pricing
router.put('/pricing/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { price, duration_days, description, is_active } = req.body;

    const result = await pool.query(`
      UPDATE promotion_pricing
      SET 
        price = COALESCE($1, price),
        duration_days = COALESCE($2, duration_days),
        description = COALESCE($3, description),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE promotion_type = $5
      RETURNING *
    `, [price, duration_days, description, is_active, type]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion type not found'
      });
    }

    res.json({
      success: true,
      message: 'Pricing updated successfully',
      pricing: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing'
    });
  }
});

module.exports = router;
