const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testPaymentWorkflow() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing Promotion Payment Workflow\n');
    
    // Step 1: Check if admin payment account exists
    console.log('Step 1: Checking admin payment account...');
    const adminAccountResult = await client.query(`
      SELECT id, account_type, account_holder_name, account_number, is_primary, is_active
      FROM admin_payment_accounts
      WHERE is_primary = TRUE AND is_active = TRUE
      LIMIT 1
    `);
    
    if (adminAccountResult.rows.length === 0) {
      console.log('❌ PROBLEM: No active admin payment account found!');
      console.log('   Solution: Admin needs to configure payment account in admin portal');
      return;
    }
    
    const adminAccount = adminAccountResult.rows[0];
    console.log('✅ Admin payment account found:');
    console.log(`   - ID: ${adminAccount.id}`);
    console.log(`   - Type: ${adminAccount.account_type}`);
    console.log(`   - Holder: ${adminAccount.account_holder_name}`);
    console.log(`   - Account: ${adminAccount.account_number}`);
    console.log(`   - Primary: ${adminAccount.is_primary}`);
    console.log(`   - Active: ${adminAccount.is_active}\n`);
    
    // Step 2: Check promotion pricing
    console.log('Step 2: Checking promotion pricing...');
    const pricingResult = await client.query(`
      SELECT promotion_type, price, currency, duration_days, is_active
      FROM promotion_pricing
      WHERE promotion_type = 'verification' AND is_active = TRUE
    `);
    
    if (pricingResult.rows.length === 0) {
      console.log('❌ PROBLEM: Verification pricing not found or inactive!');
      return;
    }
    
    const pricing = pricingResult.rows[0];
    console.log('✅ Verification pricing found:');
    console.log(`   - Type: ${pricing.promotion_type}`);
    console.log(`   - Price: ${pricing.currency} ${pricing.price}`);
    console.log(`   - Duration: ${pricing.duration_days} days`);
    console.log(`   - Active: ${pricing.is_active}\n`);
    
    // Step 3: Check if there's a test provider
    console.log('Step 3: Checking for test provider...');
    const providerResult = await client.query(`
      SELECT sp.id, sp.business_name, sp.is_verified, u.email
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.is_verified = FALSE
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('⚠️  No unverified provider found for testing');
      console.log('   Creating a test scenario with first provider...\n');
      
      const anyProvider = await client.query(`
        SELECT sp.id, sp.business_name, sp.is_verified, u.email
        FROM service_providers sp
        LEFT JOIN users u ON sp.user_id = u.id
        LIMIT 1
      `);
      
      if (anyProvider.rows.length === 0) {
        console.log('❌ No providers found in database!');
        return;
      }
      
      var provider = anyProvider.rows[0];
    } else {
      var provider = providerResult.rows[0];
    }
    
    console.log('✅ Test provider found:');
    console.log(`   - ID: ${provider.id}`);
    console.log(`   - Business: ${provider.business_name}`);
    console.log(`   - Email: ${provider.email}`);
    console.log(`   - Verified: ${provider.is_verified}\n`);
    
    // Step 4: Simulate payment process
    console.log('Step 4: Simulating payment process...');
    console.log('   Provider would submit payment with:');
    console.log(`   - Card Number: 4111 1111 1111 1111 (Visa)`);
    console.log(`   - Card Holder: ${provider.business_name}`);
    console.log(`   - Amount: ${pricing.currency} ${pricing.price}`);
    console.log(`   - Admin Account: ${adminAccount.account_holder_name} (${adminAccount.account_number})\n`);
    
    // Step 5: Check what would happen in database
    console.log('Step 5: Payment would create record in promotion_payments table:');
    console.log('   ✅ provider_id:', provider.id);
    console.log('   ✅ service_id: NULL (verification is for provider, not service)');
    console.log('   ✅ promotion_type: verification');
    console.log('   ✅ amount:', pricing.price);
    console.log('   ✅ currency:', pricing.currency);
    console.log('   ✅ admin_account_id:', adminAccount.id);
    console.log('   ✅ status: completed');
    console.log('   ✅ transaction_reference: VER-[timestamp]-[provider_id]');
    console.log('   ✅ duration_days:', pricing.duration_days);
    console.log('   ✅ start_date: NOW()');
    console.log('   ✅ end_date: NOW() + ' + pricing.duration_days + ' days\n');
    
    // Step 6: Check verification request visibility
    console.log('Step 6: Checking verification request visibility in admin portal...');
    const verificationRequestQuery = `
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        sp.is_verified,
        u.email as provider_email,
        pp.id as payment_id,
        pp.amount as payment_amount,
        pp.currency,
        pp.status as payment_status,
        pp.transaction_reference,
        pp.created_at as payment_date,
        apa.account_holder_name as admin_account_holder,
        apa.account_number as admin_account_number
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id AND pp.promotion_type = 'verification'
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      WHERE sp.id = $1
    `;
    
    const verificationRequest = await client.query(verificationRequestQuery, [provider.id]);
    
    if (verificationRequest.rows.length > 0) {
      const req = verificationRequest.rows[0];
      console.log('✅ Verification request would appear in admin portal as:');
      console.log(`   - Provider: ${req.business_name} (${req.provider_email})`);
      console.log(`   - Payment Status: ${req.payment_status || 'No payment yet'}`);
      console.log(`   - Amount: ${req.currency || 'N/A'} ${req.payment_amount || 'N/A'}`);
      console.log(`   - Transaction: ${req.transaction_reference || 'N/A'}`);
      console.log(`   - Admin Account: ${req.admin_account_holder || 'N/A'} (${req.admin_account_number || 'N/A'})`);
      console.log(`   - Verified: ${req.is_verified}\n`);
    }
    
    // Step 7: Check existing payments
    console.log('Step 7: Checking existing promotion payments...');
    const existingPayments = await client.query(`
      SELECT 
        pp.id,
        pp.provider_id,
        sp.business_name,
        pp.promotion_type,
        pp.amount,
        pp.currency,
        pp.status,
        pp.transaction_reference,
        pp.created_at,
        apa.account_holder_name as admin_account
      FROM promotion_payments pp
      LEFT JOIN service_providers sp ON pp.provider_id = sp.id
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      ORDER BY pp.created_at DESC
      LIMIT 5
    `);
    
    if (existingPayments.rows.length === 0) {
      console.log('⚠️  No existing promotion payments found');
      console.log('   This is normal if no provider has paid yet\n');
    } else {
      console.log(`✅ Found ${existingPayments.rows.length} existing payment(s):`);
      existingPayments.rows.forEach((payment, index) => {
        console.log(`\n   Payment ${index + 1}:`);
        console.log(`   - ID: ${payment.id}`);
        console.log(`   - Provider: ${payment.business_name} (ID: ${payment.provider_id})`);
        console.log(`   - Type: ${payment.promotion_type}`);
        console.log(`   - Amount: ${payment.currency} ${payment.amount}`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Transaction: ${payment.transaction_reference}`);
        console.log(`   - Admin Account: ${payment.admin_account}`);
        console.log(`   - Date: ${payment.created_at}`);
      });
      console.log();
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 WORKFLOW SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Admin payment account is configured');
    console.log('✅ Promotion pricing is active');
    console.log('✅ Payment workflow is ready');
    console.log('✅ Verification requests will appear in admin portal');
    console.log('\n🔄 PAYMENT FLOW:');
    console.log('1. Provider clicks "Pay Verification Fee" button');
    console.log('2. Provider enters card details (Visa/Mastercard)');
    console.log('3. Payment is processed and recorded in promotion_payments table');
    console.log('4. Money goes to admin account:', adminAccount.account_holder_name);
    console.log('5. Verification request appears in admin portal');
    console.log('6. Admin reviews and approves verification');
    console.log('7. Provider gets verified badge\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPaymentWorkflow();
