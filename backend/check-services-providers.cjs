const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkServicesProviders() {
  try {
    const result = await pool.query(`
      SELECT s.id, s.title, s.provider_id, sp.user_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
    `);
    
    console.log('Services and their providers:');
    result.rows.forEach(r => {
      console.log(`  Service ${r.id} (${r.title}): provider_id=${r.provider_id}, sp.user_id=${r.user_id}, business=${r.business_name || 'NULL'}`);
    });
    
    // Check which provider_ids don't exist
    const orphaned = result.rows.filter(r => r.user_id === null);
    if (orphaned.length > 0) {
      console.log('\n❌ Orphaned services (provider not in service_providers):');
      orphaned.forEach(r => {
        console.log(`  Service ${r.id}: provider_id=${r.provider_id} NOT FOUND`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkServicesProviders();
