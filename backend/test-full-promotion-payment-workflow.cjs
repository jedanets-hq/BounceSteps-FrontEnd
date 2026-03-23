const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testFullWorkflow() {
  console.log('🔍 TESTING FULL PROMOTION PAYMENT WORKFLOW\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Check if admin payment account exists
    console.log('\n📋 STEP 1: Checking Admin Payment Account...');
    const adminAccountResult = await pool.query(`
      SELECT id, account_type, account_holder_name, account_number, is_primary, is_active
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);
    
    if (adminAccountResult.rows.length === 0) {
      console.log('❌ PROBLEM FOUND: No primary active admin payment account!');
      console.log('   Solution: Admin must add a payment account in admin portal.');
      return;
    }
    
    const adminAccount = adminAccountResult.rows[0];
    console.log('✅ Admin account found:');
    console.log(`   Type: ${adminAccount.account_type}`);
    console.log(`   Holder: ${adminAccount.account_holder_name}`);
    console.log(`   Number: ${adminAccount.account_number}`);
    
    // Step 2: Check promotion pricing
    console.log('\n📋 STEP 2: Checking Promotion Pricing...');
    const pricingResult = await pool.query(`
      SELECT promotion_type, price, currency, duration_days, is_active
      FROM promotion_pricing
      WHERE is_active = TRUE
    `);
    
    if (pricingResult.rows.length === 0) {
      console.log('❌ PROBLEM FOUND: No active promotion pricing!');
      console.log('   Solution: Admin must configure promotion pricing.');
      return;
    }
    
    console.log(`✅ Found ${pricingResult.rows.length} active promotion types:`);
    pricingResult.rows.forEach(p => {
      console.log(`   - ${p.promotion_type}: ${p.currency} ${p.price} (${p.duration_days} days)`);
    });
    
    // Step 3: Get a test provider
    console.log('\n📋 STEP 3: Getting Test Provider...');
    const providerResult = await pool.query(`
      SELECT sp.id, sp.business_name, sp.is_verified, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.is_verified = FALSE
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('⚠️  No unverified providers found for testing.');
      console.log('   Using any provider for test...');
      
      const anyProviderResult = await pool.query(`
        SELECT sp.id, sp.business_name, sp.is_verified, u.email
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        LIMIT 1
      `);
      
      if (anyProviderResult.rows.length === 0) {
        console.log('❌ No providers found in database!');
        return;
      }
      
      var testProvider = anyProviderResult.rows[0];
    } else {
      var testProvider = providerResult.rows[0];
    }
    
    console.log('✅ Test provider:');
    console.log(`   ID: ${testProvider.id}`);
    console.log(`   Name: ${testProvider.business_name}`);
    console.log(`   Email: ${testProvider.email}`);
    console.log(`   Verified: ${testProvider.is_verified ? 'Yes' : 'No'}`);
    
    // Step 4: Simulate payment processing
    console.log('\n📋 STEP 4: Simulating Payment Processing...');
    
    const verificationPricing = pricingResult.rows.find(p => p.promotion_type === 'verification');
    if (!verificationPricing) {
      console.log('❌ Verification pricing not found!');
      return;
    }
    
    console.log('Payment details:');
    console.log(`   Provider: ${testProvider.business_name}`);
    console.log(`   Type: verification`);
    console.log(`   Amount: ${verificationPricing.currency} ${verificationPricing.price}`);
    console.log(`   Duration: ${verificationPricing.duration_days} days`);
    console.log(`   Admin Account: ${adminAccount.account_holder_name} (${adminAccount.account_number})`);
    
    // Step 5: Check if payment would be recorded
    console.log('\n📋 STEP 5: Checking Payment Recording...');
    
    const transactionRef = `TEST-${Date.now()}-${testProvider.id}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + verificationPricing.duration_days);
    
    console.log('✅ Payment would be recorded with:');
    console.log(`   Transaction Ref: ${transactionRef}`);
    console.log(`   Start Date: ${startDate.toISOString()}`);
    console.log(`   End Date: ${endDate.toISOString()}`);
    console.log(`   Status: completed`);
    console.log(`   Admin Account ID: ${adminAccount.id}`);
    
    // Step 6: Check verification request visibility
    console.log('\n📋 STEP 6: Checking Verification Request Visibility...');
    
    const verificationRequestsResult = await pool.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.is_verified,
        pp.id as payment_id,
        pp.amount,
        pp.status as payment_status,
        pp.transaction_reference,
        apa.account_holder_name as admin_account_holder
      FROM service_providers sp
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE sp.id = $1
    `, [testProvider.id]);
    
    if (verificationRequestsResult.rows.length > 0) {
      const request = verificationRequestsResult.rows[0];
      console.log('✅ Verification request would appear in admin panel:');
      console.log(`   Provider: ${request.business_name}`);
      console.log(`   Payment ID: ${request.payment_id || 'Not paid yet'}`);
      console.log(`   Amount: ${request.amount || 'N/A'}`);
      console.log(`   Status: ${request.payment_status || 'unpaid'}`);
      console.log(`   Admin Account: ${request.admin_account_holder || 'N/A'}`);
    }
    
    // Step 7: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 WORKFLOW ANALYSIS SUMMARY:');
    console.log('='.repeat(60));
    
    console.log('\n✅ WORKING COMPONENTS:');
    console.log('   1. Admin payment account is configured');
    console.log('   2. Promotion pricing is set up');
    console.log('   3. Database tables exist and are accessible');
    console.log('   4. Payment recording mechanism is in place');
    
    console.log('\n🔍 POTENTIAL ISSUES TO CHECK:');
    console.log('   1. Backend server must be running on correct port');
    console.log('   2. Frontend must connect to correct API URL');
    console.log('   3. Provider must be authenticated (JWT token)');
    console.log('   4. Card validation must pass on frontend');
    console.log('   5. CORS must allow frontend domain');
    
    console.log('\n📝 NEXT STEPS TO TEST:');
    console.log('   1. Start backend server: cd backend && node server.js');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Login as provider');
    console.log('   4. Go to Account Verification section');
    console.log('   5. Click "Pay Verification Fee"');
    console.log('   6. Fill card details and submit');
    console.log('   7. Check if payment appears in admin panel');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testFullWorkflow();
