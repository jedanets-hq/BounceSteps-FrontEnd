const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testActualPayment() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🧪 Testing ACTUAL Promotion Payment\n');
    
    // Get test provider
    const providerResult = await client.query(`
      SELECT sp.id, sp.business_name, sp.is_verified, u.email
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.is_verified = FALSE
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No unverified provide