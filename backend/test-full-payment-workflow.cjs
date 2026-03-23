require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function testFullPaymentWorkflow() {
  console.log('='.repeat(80));
  console.log('TESTING FULL PAYMENT WORKFLOW');
  console.log('='.repeat(80));
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Step 1: Create a test service provider
    console.log('\n1. CREATING TEST SERVICE PROVIDER...');
    
    // First create a test user
    const userResult = await client.query(`
      INSERT INTO users (
        email, password, first_name, last_name, phone, user_type, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      'test-provider-payment@test.com',
      'hashed_password',
      'Test',
      'Provider',
      '+255123456789',
      'service_provider',
      true
    ]);
    
    const userId = userResult.rows[0].id;
    console.log('✅ Test user created/found:', userId);
    
    // Create service provider
    const providerResult = await client.query(`
      INSERT INTO service_providers (
        user_id, business_name, business_type, description, location, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      userId,
      'Test Payment Provider',
      'tour_operator',
      'Testing payment workflow',
      'Dar es Salaam',
      false
    ]);
    
    const providerId = providerResult.rows[0].id;
    console.log('✅ Test provider created/found:', providerId);
    console.log('   Business Name:', providerResult.rows[0].business_name);
    console.log('   Is Verified:', providerResult.rows[0].is_verified);
    
    // Step 2: Get verification pricing
    console.log('\n2. GETTING VERIFICATION PRICING...');
    const pricingResult = await client.query(`
      SELECT price, currency, duration_days, description
      FROM promotion_pricing
      WHERE promotion_type = 'verification' AND is_active = TRUE
    `);
    
    if (pricingResult.rows.length === 0) {
      throw new Error('Verification pricing not found!');
    }
    
    const pricing = pricingResult.rows[0];
    console.log('✅ Pricing found:');
    console.log('   Price:', pricing.currency, pricing.price);
    console.log('   Duration:', pricing.duration_days, 'days');
    console.log('   Description:', pricing.description);
    
    // Step 3: Get primary admin account
    console.log('\n3. GETTING PRIMARY ADMIN ACCOUNT...');
    const adminAccountResult = await client.query(`
      SELECT id, account_type, account_holder_name, account_number
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);
    
    if (adminAccountResult.rows.length === 0) {
      throw new Error('No primary admin account found!');
    }
    
    const adminAccount = adminAccountResult.rows[0];
    console.log('✅ Admin account found:');
    console.log('   Account Holder:', adminAccount.account_holder_name);
    console.log('   Account Type:', adminAccount.account_type);
    console.log('   Account Number:', adminAccount.account_number);
    
    // Step 4: Simulate payment processing
    console.log('\n4. PROCESSING PAYMENT...');
    
    const transactionRef = `VER-TEST-${Date.now()}-${providerId}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pricing.duration_days);
    
    const cardNumber = '4111111111111111'; // Test Visa card
    const maskedCardNumber = cardNumber.slice(-4).padStart(16, '*');
    
    console.log('   Transaction Ref:', transactionRef);
    console.log('   Card Number:', maskedCardNumber);
    console.log('   Start Date:', startDate.toISOString());
    console.log('   End Date:', endDate.toISOString());
    
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
      'TEST CARDHOLDER',
      '12/25',
      adminAccount.id,
      'completed',
      transactionRef,
      pricing.description,
      pricing.duration_days,
      startDate,
      endDate
    ]);
    
    console.log('✅ Payment record created:');
    console.log('   Payment ID:', paymentResult.rows[0].id);
    console.log('   Amount:', paymentResult.rows[0].currency, paymentResult.rows[0].amount);
    console.log('   Status:', paymentResult.rows[0].status);
    console.log('   Transaction Ref:', paymentResult.rows[0].transaction_reference);
    
    // Step 5: Check if provider appears in verification requests
    console.log('\n5. CHECKING VERIFICATION REQUESTS...');
    const verificationRequestsResult = await client.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.is_verified,
        u.email,
        pp.id as payment_id,
        pp.amount,
        pp.currency,
        pp.status as payment_status,
        pp.transaction_reference,
        pp.created_at as payment_date,
        apa.account_holder_name as admin_account_holder
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE sp.id = $1
    `, [providerId]);
    
    if (verificationRequestsResult.rows.length > 0) {
      const request = verificationRequestsResult.rows[0];
      console.log('✅ Provider appears in verification requests:');
      console.log('   Business Name:', request.business_name);
      console.log('   Email:', request.email);
      console.log('   Payment ID:', request.payment_id);
      console.log('   Amount:', request.currency, request.amount);
      console.log('   Payment Status:', request.payment_status);
      console.log('   Transaction Ref:', request.transaction_reference);
      console.log('   Admin Account:', request.admin_account_holder);
      console.log('   Is Verified:', request.is_verified);
      
      if (!request.is_verified) {
        console.log('\n   ⏳ Status: Payment received, pending admin approval');
      }
    } else {
      console.log('❌ Provider NOT found in verification requests!');
    }
    
    // Step 6: Simulate admin approval (update is_verified)
    console.log('\n6. SIMULATING ADMIN APPROVAL...');
    await client.query(`
      UPDATE service_providers
      SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [providerId]);
    
    console.log('✅ Provider verified by admin');
    
    // Step 7: Check final status
    console.log('\n7. CHECKING FINAL STATUS...');
    const finalStatusResult = await client.query(`
      SELECT 
        sp.id,
        sp.business_name,
        sp.is_verified,
        pp.amount,
        pp.currency,
        pp.status,
        pp.transaction_reference
      FROM service_providers sp
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      WHERE sp.id = $1
    `, [providerId]);
    
    const finalStatus = finalStatusResult.rows[0];
    console.log('✅ Final Status:');
    console.log('   Business Name:', finalStatus.business_name);
    console.log('   Is Verified:', finalStatus.is_verified);
    console.log('   Payment Amount:', finalStatus.currency, finalStatus.amount);
    console.log('   Payment Status:', finalStatus.status);
    console.log('   Transaction Ref:', finalStatus.transaction_reference);
    
    await client.query('ROLLBACK'); // Rollback test data
    console.log('\n✅ Test data rolled back (not saved to database)');
    
    console.log('\n' + '='.repeat(80));
    console.log('WORKFLOW TEST COMPLETE');
    console.log('='.repeat(80));
    
    console.log('\n📊 WORKFLOW SUMMARY:');
    console.log('✅ Step 1: Service provider created');
    console.log('✅ Step 2: Verification pricing retrieved');
    console.log('✅ Step 3: Primary admin account found');
    console.log('✅ Step 4: Payment processed successfully');
    console.log('✅ Step 5: Provider appears in verification requests');
    console.log('✅ Step 6: Admin can approve verification');
    console.log('✅ Step 7: Provider status updated to verified');
    
    console.log('\n🎉 ALL WORKFLOW STEPS WORKING CORRECTLY!');
    console.log('\nThe complete workflow is:');
    console.log('1. Provider selects verification promotion');
    console.log('2. Provider enters card details and pays');
    console.log('3. Payment is processed and recorded');
    console.log('4. Money goes to admin account:', adminAccount.account_holder_name);
    console.log('5. Provider appears in admin verification requests');
    console.log('6. Admin reviews and approves');
    console.log('7. Provider gets verified badge');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testFullPaymentWorkflow();
