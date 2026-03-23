require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function testPromotionWorkflow() {
  console.log('='.repeat(80));
  console.log('TESTING PROMOTION PAYMENT WORKFLOW');
  console.log('='.repeat(80));
  console.log('\nDatabase Config:');
  console.log('Host:', process.env.DB_HOST || 'localhost');
  console.log('Database:', process.env.DB_NAME || 'isafari_db');
  console.log('User:', process.env.DB_USER || 'postgres');
  console.log('Password:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
  
  try {
    // Test connection
    console.log('\n0. TESTING DATABASE CONNECTION...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // 1. Check promotion_pricing table
    console.log('\n1. CHECKING PROMOTION PRICING...');
    const pricingResult = await pool.query(`
      SELECT * FROM promotion_pricing WHERE is_active = TRUE ORDER BY price
    `);
    console.log('Found', pricingResult.rows.length, 'active pricing plans');
    pricingResult.rows.forEach(row => {
      console.log(`  - ${row.promotion_type}: ${row.currency} ${row.price} (${row.duration_days} days)`);
    });
    
    // 2. Check admin_payment_accounts table
    console.log('\n2. CHECKING ADMIN PAYMENT ACCOUNTS...');
    const adminAccountsResult = await pool.query(`
      SELECT * FROM admin_payment_accounts WHERE is_active = TRUE ORDER BY is_primary DESC
    `);
    console.log('Found', adminAccountsResult.rows.length, 'active admin accounts');
    adminAccountsResult.rows.forEach(row => {
      console.log(`  - ${row.account_holder_name} (${row.account_type}) - Primary: ${row.is_primary}`);
    });
    
    // 3. Check if there's a primary account
    console.log('\n3. CHECKING PRIMARY ADMIN ACCOUNT...');
    const primaryAccountResult = await pool.query(`
      SELECT * FROM admin_payment_accounts WHERE is_primary = TRUE AND is_active = TRUE LIMIT 1
    `);
    if (primaryAccountResult.rows.length > 0) {
      const acc = primaryAccountResult.rows[0];
      console.log('✅ Primary Account Found:');
      console.log(`   Account Holder: ${acc.account_holder_name}`);
      console.log(`   Account Type: ${acc.account_type}`);
      console.log(`   Account Number: ${acc.account_number}`);
    } else {
      console.log('⚠️  WARNING: NO PRIMARY ADMIN ACCOUNT FOUND!');
      console.log('   This will cause payment processing to fail.');
      console.log('   Provider will get error: "No active admin payment account configured"');
    }
    
    // 4. Check promotion_payments table structure
    console.log('\n4. CHECKING PROMOTION_PAYMENTS TABLE STRUCTURE...');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'promotion_payments'
      ORDER BY ordinal_position
    `);
    console.log('Table has', tableStructure.rows.length, 'columns:');
    
    // 5. Check for column name mismatch (payment_type vs promotion_type)
    console.log('\n5. CHECKING FOR COLUMN NAME ISSUES...');
    const hasPaymentType = tableStructure.rows.some(col => col.column_name === 'payment_type');
    const hasPromotionType = tableStructure.rows.some(col => col.column_name === 'promotion_type');
    
    console.log('Has payment_type column:', hasPaymentType);
    console.log('Has promotion_type column:', hasPromotionType);
    
    if (hasPaymentType && !hasPromotionType) {
      console.log('\n⚠️  CRITICAL ISSUE FOUND!');
      console.log('   Database schema has "payment_type" column');
      console.log('   But code uses "promotion_type" in INSERT queries');
      console.log('   This will cause ALL payment processing to FAIL!');
      console.log('\n   SOLUTION: Need to either:');
      console.log('   1. Rename database column from payment_type to promotion_type, OR');
      console.log('   2. Update code to use payment_type instead of promotion_type');
    } else if (!hasPaymentType && hasPromotionType) {
      console.log('✅ Column naming is correct (promotion_type)');
    } else if (hasPaymentType && hasPromotionType) {
      console.log('⚠️  Both columns exist - this is unusual');
    } else {
      console.log('❌ Neither column exists - table structure is broken');
    }
    
    // 6. Check existing promotion payments
    console.log('\n6. CHECKING EXISTING PROMOTION PAYMENTS...');
    const paymentsResult = await pool.query(`
      SELECT 
        pp.id,
        pp.provider_id,
        pp.amount,
        pp.currency,
        pp.status,
        pp.created_at,
        sp.business_name,
        u.email
      FROM promotion_payments pp
      LEFT JOIN service_providers sp ON pp.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY pp.created_at DESC
      LIMIT 5
    `);
    console.log('Found', paymentsResult.rows.length, 'recent payments');
    paymentsResult.rows.forEach(row => {
      console.log(`  - ${row.business_name || 'Unknown'} (${row.email}): ${row.currency} ${row.amount} - ${row.status}`);
    });
    
    // 7. Check verification requests
    console.log('\n7. CHECKING VERIFICATION REQUESTS...');
    
    // First try with promotion_type
    let verificationResult;
    try {
      verificationResult = await pool.query(`
        SELECT 
          sp.id as provider_id,
          sp.business_name,
          sp.is_verified,
          u.email,
          pp.id as payment_id,
          pp.amount,
          pp.status as payment_status,
          pp.created_at as payment_date
        FROM service_providers sp
        LEFT JOIN users u ON sp.user_id = u.id
        LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id 
          AND pp.promotion_type = 'verification'
        WHERE pp.id IS NOT NULL OR sp.is_verified = TRUE
        ORDER BY pp.created_at DESC NULLS LAST
        LIMIT 10
      `);
      console.log('Query with promotion_type succeeded');
    } catch (e) {
      console.log('Query with promotion_type failed, trying payment_type...');
      verificationResult = await pool.query(`
        SELECT 
          sp.id as provider_id,
          sp.business_name,
          sp.is_verified,
          u.email,
          pp.id as payment_id,
          pp.amount,
          pp.status as payment_status,
          pp.created_at as payment_date
        FROM service_providers sp
        LEFT JOIN users u ON sp.user_id = u.id
        LEFT JOIN promotion_payments pp ON sp.id = pp.provider_id 
          AND pp.payment_type = 'verification'
        WHERE pp.id IS NOT NULL OR sp.is_verified = TRUE
        ORDER BY pp.created_at DESC NULLS LAST
        LIMIT 10
      `);
      console.log('Query with payment_type succeeded');
    }
    
    console.log('Found', verificationResult.rows.length, 'verification requests');
    verificationResult.rows.forEach(row => {
      const status = row.is_verified ? '✅ Verified' : (row.payment_id ? '⏳ Paid, Pending Approval' : '❌ Not Verified');
      console.log(`  - ${row.business_name || 'Unknown'} (${row.email}): ${status}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('WORKFLOW TEST COMPLETE');
    console.log('='.repeat(80));
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log(`${pricingResult.rows.length > 0 ? '✅' : '❌'} Promotion pricing: ${pricingResult.rows.length} plans`);
    console.log(`${adminAccountsResult.rows.length > 0 ? '✅' : '❌'} Admin accounts: ${adminAccountsResult.rows.length} accounts`);
    console.log(`${primaryAccountResult.rows.length > 0 ? '✅' : '❌'} Primary account: ${primaryAccountResult.rows.length > 0 ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`${hasPromotionType ? '✅' : '❌'} Column naming: ${hasPromotionType ? 'Correct' : 'MISMATCH'}`);
    
    if (primaryAccountResult.rows.length === 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Create an admin payment account');
      console.log('   2. Set it as primary account');
      console.log('   3. Without this, providers cannot pay for verification');
    }
    
    if (hasPaymentType && !hasPromotionType) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   Fix column name mismatch in promotion_payments table');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testPromotionWorkflow();
