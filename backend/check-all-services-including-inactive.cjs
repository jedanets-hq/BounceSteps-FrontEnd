const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkAllServices() {
  try {
    console.log('🔍 Checking ALL services (including inactive)...\n');
    
    // Check all services regardless of status
    const allServices = await pool.query(`
      SELECT s.id, s.title, s.category, s.provider_id, s.is_active, s.status,
             sp.business_name as provider_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.id
    `);
    
    console.log(`📦 ALL SERVICES (${allServices.rows.length} total):\n`);
    allServices.rows.forEach(s => {
      const statusIcon = s.is_active && s.status === 'active' ? '✅' : '❌';
      console.log(`${statusIcon} ID: ${s.id}`);
      console.log(`   Title: ${s.title}`);
      console.log(`   Category: ${s.category}`);
      console.log(`   Provider ID: ${s.provider_id} (${s.provider_name || 'NO PROVIDER'})`);
      console.log(`   Active: ${s.is_active}, Status: ${s.status}`);
      console.log('');
    });
    
    // Count services per provider
    const servicesPerProvider = await pool.query(`
      SELECT sp.id, sp.business_name, COUNT(s.id) as service_count
      FROM service_providers sp
      LEFT JOIN services s ON sp.id = s.provider_id
      GROUP BY sp.id, sp.business_name
      ORDER BY sp.id
    `);
    
    console.log('\n📊 SERVICES PER PROVIDER:\n');
    servicesPerProvider.rows.forEach(p => {
      console.log(`Provider ID ${p.id}: ${p.business_name} - ${p.service_count} services`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllServices();
