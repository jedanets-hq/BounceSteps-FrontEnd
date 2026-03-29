const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkPaymentTables() {
  try {
    console.log('🔍 Checking payment system tables...\n');
    
    // Check for payment-related tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%payment%' OR table_name LIKE '%promotion%')
      ORDER BY table_name
    `);
    
    console.log('📊 Payment-related tables found:');
    if (result.rows.length === 0) {
      console.log('   ❌ No payment tables found!');
    } else {
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
    // Check admin_payment_accounts
    console.log('\n💳 Checking admin_payment_accounts table...');
    try {
      const accountsResult = await pool.query('SELECT COUNT(*) as count FROM admin_payment_accounts');
      console.log(`   ✅ Table exists with ${accountsResult.rows[0].count} records`);
      
      if (accountsResult.rows[0].count > 0) {
        const accounts = await pool.query('SELECT id, account_type, account_holder_name, is_primary, is_active FROM admin_payment_accounts');
        console.log('\n   📋 Existing accounts:');
        accounts.rows.forEach(acc => {
          console.log(`      - ID: ${acc.id}, Type: ${acc.account_type}, Holder: ${acc.account_holder_name}, Primary: ${acc.is_primary}, Active: ${acc.is_active}`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Table does not exist: ${err.message}`);
    }
    
    // Check promotion_payments
    console.log('\n💰 Checking promotion_payments table...');
    try {
      const paymentsResult = await pool.query('SELECT COUNT(*) as count FROM promotion_payments');
      console.log(`   ✅ Table exists with ${paymentsResult.rows[0].count} records`);
    } catch (err) {
      console.log(`   ❌ Table does not exist: ${err.message}`);
    }
    
    // Check promotion_pricing
    console.log('\n💵 Checking promotion_pricing table...');
    try {
      const pricingResult = await pool.query('SELECT * FROM promotion_pricing ORDER BY promotion_type');
      console.log(`   ✅ Table exists with ${pricingResult.rows.length} records`);
      
      if (pricingResult.rows.length > 0) {
        console.log('\n   📋 Pricing configuration:');
        pricingResult.rows.forEach(price => {
          console.log(`      - ${price.promotion_type}: ${price.currency} ${price.price} (${price.duration_days} days) - ${price.is_active ? 'Active' : 'Inactive'}`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Table does not exist: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPaymentTables();
