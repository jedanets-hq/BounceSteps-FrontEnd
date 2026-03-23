const { pool } = require('./models');

async function testPromotionWorkflow() {
  console.log('='.repeat(80));
  console.log('TESTING PROMOTION PAYMENT WORKFLOW');
  console.log('='.repeat(80));
  
  try {
    // 1. Check promotion_pricing table
    console.log('\n1. CHECKING PROMOTION PRICING...');
    const pricingResult = await pool.query(`
      SELECT * FROM promotion_pricing WHERE is_active = TRUE ORDER BY price
    `);
    console.log('Promotion Pricing:', JSON.stringify(pricingResult.rows, null, 2));
    
    // 2. Check admin_payment_accounts table
    console.log('\n2. CHECKING ADMIN PAYMENT ACCOUNTS...');
    const adminAccountsResult = await pool.query(`
      SELECT * FROM admin_payment_accounts WHERE is_active = TRUE ORDER BY is_primary DESC
    `);
    console.log('Admin Payment Accounts:', JSON.stringify(adminAccountsResult.rows, null, 2));
    
    // 3. Check if there's a primary account
    console.log('\n3. CHECKING PRIMARY ADMIN ACCOUNT...');
    const primaryAccountResult = await pool.query(`
      SELECT * FROM admin_payment_accounts WHERE is_primary = TRUE AND is_active = TRUE LIMIT 1
    `);
    if (primaryAccountResult.rows.length > 0) {
      console.log('Primary Account Found:', JSON.stringify(primaryAccountResult.rows[0], null, 2));
    } else {
      console.log('⚠️  WARNING: NO PRIMARY ADMIN ACCOUNT FOUND!');
      console.log('This will cause payment processing to fail.');
    }
    
    // 4. Check promotion_payments table structure
    console.log('\n4. CHECKING PROMOTION_PAYMENTS TABLE STRUCTURE...');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'promotion_payments'
      ORDER BY ordinal_position
    `);
    console.log('Table Structure:', JSON.stringify(tableStructure.rows, null, 2));
    
    // 5. Check for column name mismatch (payment_type vs promotion_type)
    console.log('\n5. CHECKING FOR COLUMN NAME ISSUES...');
    const hasPaymentType = tableStructure.rows.some(col => col.column_name === 'payment_type');
    const hasPromotionType = tableStructure.rows.some(col => col.column_name === 'promotion_type');
    
    console.log('Has payment_type column:', hasPaymentType);
    console.log('Has promotion_type column:', hasPromotionType);
    
    if (hasPaymentType && !hasPromotionType) {
      console.log('\n⚠️  CRITICAL ISSUE FOUND!');
      console.log('Database has "payment_type" but code uses "promotion_type"');
      console.log('This will cause INSERT queries to fail!');
    } else if (!hasPaymentType && hasPromotionType) {
      console.log('\n✅ Column naming is correct (promotion_type)');
    }
    
    // 6. Check existing promotion payments
    console.log('\n6. CHECKING EXISTING PROMOTION PAYMENTS...');
    const paymentsResult = await pool.query(`
      SELECT 
        pp.*,
        sp.business_name,
        u.email
      FROM promotion_payments pp
      LEFT JOIN service_providers sp ON pp.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY pp.created_at DESC
      LIMIT 5
    `);
    console.log('Recent Payments:', JSON.stringify(paymentsResult.rows, null, 2));
    
    // 7. Check verification requests
    console.log('\n7. CHECKING VERIFICATION REQUESTS...');
    const verificationResult = await pool.query(`
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
        AND (pp.promotion_type = 'verification' OR pp.payment_type = 'verification')
      WHERE pp.id IS NOT NULL OR sp.is_verified = TRUE
      ORDER BY pp.created_at DESC NULLS LAST
      LIMIT 10
    `);
    console.log('Verification Requests:', JSON.stringify(verificationResult.rows, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log('WORKFLOW TEST COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testPromotionWorkflow();
