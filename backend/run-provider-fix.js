// This script uses the same connection as the backend server
const { pool } = require('./models');

async function createMissingProviders() {
  console.log('🔧 Creating missing service_provider records...\n');
  
  try {
    // Get services with provider_id but no service_provider record
    const query = `
      INSERT INTO service_providers (user_id, business_name, created_at, updated_at)
      SELECT DISTINCT 
        s.provider_id as user_id,
        COALESCE(s.business_name, 'Service Provider') as business_name,
        NOW() as created_at,
        NOW() as updated_at
      FROM services s
      WHERE s.provider_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM service_providers sp WHERE sp.user_id = s.provider_id
        )
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      console.log(`✅ Created ${result.rows.length} service_provider records:`);
      result.rows.forEach(row => {
        console.log(`   - user_id: ${row.user_id}, business_name: ${row.business_name}`);
      });
    } else {
      console.log('ℹ️  No missing service_provider records found');
    }
    
    // Verify
    console.log('\n📊 Verifying...');
    const verifyQuery = `
      SELECT sp.id, sp.user_id, sp.business_name, COUNT(s.id) as services_count
      FROM service_providers sp
      LEFT JOIN services s ON s.provider_id = sp.user_id
      GROUP BY sp.id, sp.user_id, sp.business_name
      ORDER BY sp.id
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    console.log(`\n✅ Total service_providers: ${verifyResult.rows.length}`);
    verifyResult.rows.forEach(row => {
      console.log(`   - ${row.business_name} (user_id: ${row.user_id}, services: ${row.services_count})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

createMissingProviders();
