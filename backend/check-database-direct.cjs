const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Check providers
    const providersResult = await pool.query(`
      SELECT sp.id, sp.business_name, sp.user_id, u.email, u.is_active
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.id
    `);
    
    console.log(`📊 PROVIDERS (${providersResult.rows.length} total):`);
    providersResult.rows.forEach(p => {
      console.log(`  ID: ${p.id}, Business: ${p.business_name}, User: ${p.user_id}, Email: ${p.email}, Active: ${p.is_active}`);
    });
    
    console.log('\n');
    
    // Check services
    const servicesResult = await pool.query(`
      SELECT s.id, s.title, s.category, s.provider_id, s.is_active, s.status
      FROM services s
      ORDER BY s.id
    `);
    
    console.log(`📦 SERVICES (${servicesResult.rows.length} total):`);
    servicesResult.rows.forEach(s => {
      console.log(`  ID: ${s.id}, Title: ${s.title}, Category: ${s.category}, Provider: ${s.provider_id}, Active: ${s.is_active}, Status: ${s.status}`);
    });
    
    console.log('\n');
    
    // Check if services have valid provider_id references
    const orphanedServices = await pool.query(`
      SELECT s.id, s.title, s.provider_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE sp.id IS NULL
    `);
    
    if (orphanedServices.rows.length > 0) {
      console.log(`⚠️ ORPHANED SERVICES (${orphanedServices.rows.length}):`);
      orphanedServices.rows.forEach(s => {
        console.log(`  Service ID: ${s.id}, Title: ${s.title}, Invalid Provider ID: ${s.provider_id}`);
      });
    } else {
      console.log('✅ All services have valid provider references');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
