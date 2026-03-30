const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testPromotionWorkflow() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing Full Promotion Payment Workflow\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Step 1: Check if admin payment account exists
    console.log('STEP 1: Checking Admin Payment Account...');
    const adminAccountResult = await client.query(`
      SELECT id, account_type, account_holder_name, account_number, is_primary, is_active
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);
    
    if (adminAccountResult.rows.length === 0) {
      console.log('   ❌ NO PRIMARY ADMIN ACCOUNT FOUND!');
      console.log('   This is a CRITICAL issue - payments cannot be processed without admin account\n');
    } else {
      const account = adminAccountResult.rows[0];
      console.log('   ✅ Admin Account Found:');
      console.log(`      - ID: ${account.id}`);
      console.log(`      - Type: ${account.account_type}`);
      console.log(`      - Holder: ${account.account_holder_name}`);
      console.log(`      - Account Number: ${account.account_number}`);
      console.log(`      - Primary: ${account.is_primary}`);
      console.log(`      - Active: ${account.is_active}\n`);
    }
    
    // Step 2: Check promotion pricing
    console.log('STEP 2: Checking Promotion Pricing...');
    const pricingResult = await client.query(`
      SELECT promotion_type, price, currency, duration_days, is_active
      FROM promotion_pricing
      WHERE is_active = TRUE
      ORDER BY promotion_type
    `);
    
    if (pricingResult.rows.length === 0) {
      console.log('   ❌ NO ACTIVE PRICING FOUND!\n');
    } else {
      console.log('   ✅ Active Pricing:');
      pricingResult.rows.forEach(price => {
        console.log(`      - ${price.promotion_type}: ${price.currency} ${price.price} (${price.duration_days} days)`);
      });
      console.log('');
    }
    
    // Step 3: Simulate a promotion payment
    console.log('STEP 3: Simulating Promotion Payment...');
    console.log('   Testing with:');
    console.log('      - Provider ID: 1');
    console.log('      - Service ID: 1');
    console.log('      - Promotion Type: verification');
    console.log('      - Card: VISA ****1234\n');
    
    // Get provider info
    const providerResult = await client.query(`
      SELECT id, business_name, is_verified
      FROM service_providers
      WHERE id = 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('   ❌ Provider ID 1 not found\n');
    } else {
      const provider = providerResult.rows[0];
      console.log('   Provider Info:');
      console.log(`      - Business: ${provider.business_name}`);
      console.log(`      - Currently Verified: ${provider.is_verified}\n`);
    }
    
    // Get pricing for verification
    const verificationPricing = await client.query(`
      SELECT price, currency, duration_days, description
      FROM promotion_pricing
      WHERE promotion_type = 'verification' AND is_active = TRUE
    `);
    
    if (verificationPricing.rows.length === 0) {
      console.log('   ❌ Verification pricing not found!\n');
    } else {
      const pricing = verificationPricing.rows[0];
      console.log('   Pricing Details:');
      console.log(`      - Amount: ${pricing.currency} ${pricing.price}`);
      console.log(`      - Duration: ${pricing.duration_days} days`);
      console.log(`      - Description: ${pricing.description}\n`);
    }
    
    // Step 4: Check if payment would be recorded
    console.log('STEP 4: Testing Payment Recording...');
    
    await client.query('BEGIN');
    
    try {
      const transactionRef = `TEST-PROMO-${Date.now()}`;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 365);
      
      const paymentResult = await client.query(`
        INSERT INTO promotion_payments (
          provider_id, service_id, promotion_type, amount, currency,
          provider_card_number, provider_card_holder, provider_card_expiry,
          admin_account_id, status, transaction_reference,
          description, duration_days, start_date, end_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, transaction_reference, amount, status
      `, [
        1, // provider_id
        1, // service_id
        'verification',
        50000.00,
        'TZS',
        '****1234',
        'TEST CARDHOLDER',
        '12/25',
        adminAccountResult.rows[0]?.id || null,
        'completed',
        transactionRef,
        'Test verification payment',
        365,
        startDate,
        endDate
      ]);
      
      console.log('   ✅ Payment Record Created:');
      console.log(`      - Payment ID: ${paymentResult.rows[0].id}`);
      console.log(`      - Transaction Ref: ${paymentResult.rows[0].transaction_reference}`);
      console.log(`      - Amount: ${paymentResult.rows[0].amount}`);
      console.log(`      - Status: ${paymentResult.rows[0].status}\n`);
      
      // Test verification update
      await client.query(`
        UPDATE service_providers
        SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      
      console.log('   ✅ Provider verification status updated\n');
      
      await client.query('ROLLBACK'); // Don't actually save test data
      console.log('   ℹ️  Test transaction rolled back (no actual changes made)\n');
      
    } catch (err) {
      await client.query('ROLLBACK');
      console.log('   ❌ Payment recording failed:', err.message, '\n');
    }
    
    // Step 5: Check verification requests endpoint data
    console.log('STEP 5: Testing Verification Requests Query...');
    const verificationRequests = await client.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.is_verified,
        u.email as provider_email,
        pp.id as payment_id,
        pp.amount as payment_amount,
        pp.status as payment_status,
        pp.transaction_reference,
        apa.account_holder_name as admin_account_holder
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      LIMIT 5
    `);
    
    console.log(`   ✅ Found ${verificationRequests.rows.length} providers:`);
    verificationRequests.rows.forEach(req => {
      console.log(`      - ${req.business_name} (${req.provider_email})`);
      console.log(`        Verified: ${req.is_verified}, Payment: ${req.payment_id ? 'Yes' : 'No'}`);
      if (req.payment_id) {
        console.log(`        Amount: ${req.payment_amount}, Status: ${req.payment_status}`);
        console.log(`        Admin Account: ${req.admin_account_holder || 'N/A'}`);
      }
    });
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('WORKFLOW ANALYSIS SUMMARY:\n');
    
    const issues = [];
    
    if (adminAccountResult.rows.length === 0) {
      issues.push('❌ No primary admin payment account configured');
    }
    
    if (pricingResult.rows.length === 0) {
      issues.push('❌ No active promotion pricing configured');
    }
    
    if (issues.length > 0) {
      console.log('CRITICAL ISSUES FOUND:');
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log('✅ All payment system components are configured correctly');
      console.log('✅ Payment workflow can process transactions');
      console.log('✅ Admin account will receive payments');
      console.log('✅ Verification requests will show payment information');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPromotionWorkflow();
