const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testProviderIdIssue() {
  try {
    console.log('🔍 Testing provider ID issue...\n');
    
    // Get services with provider info
    const result = await pool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id,
        sp.id as sp_id,
        sp.user_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LIMIT 5
    `);
    
    console.log('📦 Services with provider info:');
    result.rows.forEach(row => {
      console.log(`\n  Service: ${row.title}`);
      console.log(`    service.provider_id: ${row.provider_id}`);
      console.log(`    service_providers.id: ${row.sp_id}`);
      console.log(`    service_providers.user_id: ${row.user_id}`);
      console.log(`    business_name: ${row.business_name}`);
      console.log(`    ✅ Match: ${row.provider_id === row.sp_id ? 'YES' : 'NO'}`);
    });
    
    console.log('\n\n🔍 Testing backend route logic:');
    console.log('When user clicks "View Provider Profile" with provider_id=1');
    console.log('Backend checks: WHERE sp.id = 1 OR sp.user_id = 1');
    
    // Test what backend will find
    const testId = 1;
    const backendResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name
      FROM service_providers sp
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [testId]);
    
    console.log(`\nBackend will find: ${backendResult.rows.length} provider(s)`);
    if (backendResult.rows.length > 0) {
      backendResult.rows.forEach(row => {
        console.log(`  - ${row.business_name} (id=${row.id}, user_id=${row.user_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderIdIssue();
