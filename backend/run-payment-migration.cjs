const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🔄 Running payment system migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'update-payment-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Payment system migration completed successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('   - admin_payment_accounts');
    console.log('   - promotion_payments');
    console.log('   - promotion_pricing');
    console.log('');
    console.log('💰 Default promotion pricing added:');
    console.log('   - Verification: TZS 50,000 (1 year)');
    console.log('   - Featured Listing: TZS 100,000 (30 days)');
    console.log('   - Premium Badge: TZS 75,000 (90 days)');
    console.log('   - Top Placement: TZS 150,000 (30 days)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
