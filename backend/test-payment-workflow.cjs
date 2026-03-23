const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testPaymentWorkflow() {
  try {
    console.log('🔍 TESTING PAYMENT WORKFLOW\n');
    
    // 1. Check if admin payment account exists
    console.log('1️⃣ Checking Admin Payment Accounts...');
    const adminAccounts = await pool.query(`
      SELECT id, account_type, account_holder_name, account_number, 
             is_active, is_primary
      FROM admin_payment_accounts
      ORDER BY is_primary DESC, created_at DESC
    `);
    
    if (adminAccounts.rows.length === 0) {
      console.log('❌ NO ADMIN PAYMENT ACCOUNTS FOUND!');
      console.log('   This is the FIRST PROBLEM - Admin must configure payment account first\n');
    } else {
      console.log('✅ Admin Payment Accounts Found:');
      adminAccounts.rows.forEach(acc => {
        console.log(`   - ID: ${acc.id}, Type: ${acc.account_type}, Holder: ${acc.account_holder_name}`);
        console.log(`     Account: ${acc.account_number}, Active: ${acc.is_active}, Primary: ${acc.is_primary}`);
      });
      console.log('');
    }
    
    // 2. Check promotion pricing
    console.log('2️⃣ Checking Promotion Pricing...');
    const pricing = await pool.query(`
      SELECT promotion_type, price, currency, duration_days, is_active
      FROM promotion_pricing
      ORDER BY price ASC
    `);
    
    if (pricing.rows.length === 0) {
      console.log('❌ NO PROMOTION PRICING CONFIGURED!');
    } else {
      console.log('✅ Promotion Pricing:');
      pricing.rows.forEach(p => {
        console.log(`   - ${p.promotion_type}: ${p.price} ${p.currency} (${p.duration_days} days) - Active: ${p.is_active}`);
      });
      console.log('');
    }
    
    // 3. Check existing promotion payments
    console.log('3️⃣ Checking Existing Promotion Payments...');
    const payments = await pool.query(`
      SELECT pp.id, pp.provider_id, pp.promotion_type, pp.amount, 
             pp.status, pp.transaction_reference, pp.created_at,
             sp.business_name,
             apa.account_holder_name as admin_account
      FROM promotion_payments pp
      LEFT JOIN service_providers sp ON pp.provider_id = sp.id
      LEFT JOIN admin_payment_accounts apa ON pp.admin_account_id = apa.id
      ORDER BY pp.created_at DESC
      LIMIT 5
    `);
    
    if (payments.rows.length === 0) {
      console.log('ℹ️  No promotion payments yet');
    } else {
      console.log('✅ Recent Promotion Payments:');
      payments.rows.forEach(p => {
        console.log(`   - Payment ID: ${p.id}`);
        console.log(`     Provider: ${p.business_name} (ID: ${p.provider_id})`);
        console.log(`     Type: ${p.promotion_type}, Amount: ${p.amount}`);
        console.log(`     Status: ${p.status}, Ref: ${p.transaction_reference}`);
        console.log(`     Admin Account: ${p.admin_account || 'NOT SET'}`);
        console.log(`     Date: ${p.created_at}`);
        console.log('');
      });
    }
    
    // 4. Check service providers
    console.log('4️⃣ Checking Service Providers...');
    const providers = await pool.query(`
      SELECT sp.id, sp.business_name, sp.is_verified, u.email
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LIMIT 3
    `);
    
    if (providers.rows.length === 0) {
      console.log('❌ NO SERVICE PROVIDERS FOUND!');
    } else {
      console.log('✅ Sample Service Providers:');
      providers.rows.forEach(p => {
        console.log(`   - ID: ${p.id}, Name: ${p.business_name}, Verified: ${p.is_verified}, Email: ${p.email}`);
      });
      console.log('');
    }
    
    // 5. Summary
    console.log('📊 WORKFLOW ANALYSIS:');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (adminAccounts.rows.length === 0) {
      console.log('❌ CRITICAL: No admin payment account configured');
      console.log('   → Provider cannot complete payment (no account to receive money)');
      console.log('   → Payment will fail with error message');
    } else {
      const primaryAccount = adminAccounts.rows.find(a => a.is_primary && a.is_active);
      if (!primaryAccount) {
        console.log('⚠️  WARNING: No PRIMARY admin payment account set');
        console.log('   → System may not know which account to use');
      } else {
        console.log('✅ Primary admin account configured correctly');
      }
    }
    
    if (pricing.rows.length === 0) {
      console.log('❌ CRITICAL: No promotion pricing configured');
    } else {
      console.log('✅ Promotion pricing configured');
    }
    
    if (providers.rows.length === 0) {
      console.log('❌ CRITICAL: No service providers to test with');
    } else {
      console.log('✅ Service providers exist for testing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testPaymentWorkflow();
