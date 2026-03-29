const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://isafari_user:@Jctnftr01.@dpg-cu0bnhm8ii6s73a5rvpg-a.oregon-postgres.render.com/isafari_db',
  ssl: { rejectUnauthorized: false }
});

async function checkService() {
  try {
    console.log('🔍 Checking if service ID 16 exists...');
    
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [16]);
    
    if (result.rows.length > 0) {
      console.log('✅ Service found:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Service ID 16 NOT FOUND in database');
      console.log('\n📋 Checking all services...');
      
      const allServices = await pool.query('SELECT id, title, provider_id FROM services LIMIT 10');
      console.log(`Found ${allServices.rows.length} services:`);
      allServices.rows.forEach(s => {
        console.log(`  - ID: ${s.id}, Title: ${s.title}, Provider: ${s.provider_id}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkService();
