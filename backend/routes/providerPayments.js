const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Pay for verification (provider endpoint)
router.post('/pay-verification', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const {
      card_number,
      card_holder,
      card_expiry,
      cvv
    } = req.body;

    // Validation
    if (!card_number || !card_holder || !card_expiry || !cvv) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Get provider ID from user
    const providerResult = await client.query(`
      SELECT id FROM service_providers WHERE user_id = $1
    `, [userId]);

    if (providerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const providerId = providerResult.rows[0].id;

    // Check if already verified
    const verifiedCheck = await client.query(`
      SELECT is_verified FROM service_providers WHERE id = $1
    `, [providerId]);

    if (verifiedCheck.rows[0].is_verified) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Provider is already verified'
      });
    }

    // Get verification pricing
    const pricingResult = await client.query(`
      SELECT price, currency, duration_days, description
      FROM promotion_pricing
      WHERE promotion_type = 'verification' AND is_active = TRUE
    `);

    if (pricingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Verification pricing not found'
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
    const transactionRef = `VER-${Date.now()}-${providerId}`;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pricing.duration_days);

    // Mask card number (store only last 4 digits)
    const maskedCardNumber = card_number.replace(/\s/g, '').slice(-4).padStart(16, '*');

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
      providerId,
      null, // No service_id for verification
      'verification',
      pricing.price,
      pricing.currency,
      maskedCardNumber,
      card_holder,
      card_expiry,
      adminAccount.id,
      'completed', // Payment successful - awaiting admin approval
      transactionRef,
      pricing.description,
      pricing.duration_days,
      startDate,
      endDate
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Payment processed successfully. Your verification request is pending admin approval.',
      payment: {
        id: paymentResult.rows[0].id,
        amount: paymentResult.rows[0].amount,
        currency: paymentResult.rows[0].currency,
        transaction_reference: transactionRef,
        status: 'pending_approval'
      },
      admin_account: {
        account_type: adminAccount.account_type,
        account_holder: adminAccount.account_holder_name,
        account_number: adminAccount.account_number
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing verification payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  } finally {
    client.release();
  }
});

// Get my verification payment status
router.get('/verification-status', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get provider ID
    const providerResult = await pool.query(`
      SELECT id, is_verified FROM service_providers WHERE user_id = $1
    `, [userId]);

    if (providerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const { id: providerId, is_verified } = providerResult.rows[0];

    // Get payment information
    const paymentResult = await pool.query(`
      SELECT 
        pp.*,
        apa.account_holder_name as admin_account_holder,
        apa.account_type as admin_account_type,
        apa.account_number as admin_account_number
      FROM promotion_payments pp
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE pp.provider_id = $1 AND pp.promotion_type = 'verification'
      ORDER BY pp.created_at DESC
      LIMIT 1
    `, [providerId]);

    res.json({
      success: true,
      is_verified,
      payment: paymentResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification status'
    });
  }
});

module.exports = router;
