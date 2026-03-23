const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testRealPayment() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing REAL Promotion Payment Flow\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Test 1: Verification Payment (no service_id needed)
    console.log('TEST 1: Verification Payment (Provider Badge)');
    console.log('─────────────────────────────────────────────────────────\n');
    
    await client.query('BEGIN');
    
    try {
      // Get admin account
      const adminAccount = await client.query(`
        SELECT id FROM admin_payment_accounts
        WHERE is_primary = TRUE AND is_active = TRUE
        LIMIT 1
      `);
      
      // Get pricing
      const pricing = await client.query(`
        SELECT price, currency, duration_days, description
        FROM promotion_pricing
        WHERE promotion_type = 'verification' AND is_active = TRUE
      `);
      
      const transactionRef = `PROMO-${Date.now()}-1`;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pricing.rows[0].duration_days);
      
      // Insert payment WITHOUT service_id (for verification)
      const paymentResult = await client.query(`
        INSERT INTO promotion_payments (
          provider_id, service_id, promotion_type, amount, currency,
          provider_card_number, provider_card_holder, provider_card_expiry,
          admin_account_id, status, transaction_reference,
          description, duration_days, start_date, end_date
        ) VALUES ($1, $