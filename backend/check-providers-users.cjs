const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function checkProvidersUsers() {
  try {
    console.log('🔍 Checking providers and their users...\n');
    
    // Check all providers
    const allProviders = await pool.query(
      'SELECT id, business_name, user_id FROM service_providers ORDER BY id'
    );
    
    console.log('📦 All Providers:');
    allProviders.rows.forEach(p => {
      console.log(`  ID ${p.id}: ${p.business_name} (user_id: ${p.user_id || 'NULL'})`);
    });
    
    // Check users
    console.log('\n📦 All Users:');
    const allUsers = await pool.query(
      'SELECT id, email, first_name, last_name, is_active FROM users ORDER BY id'
    );
    allUsers.rows.forEach(u => {
      console.log(`  ID ${u.id}: ${u.email} (${u.first_name} ${u.last_name}) - Active: ${u.is_active}`);
    });
    
    // Check the JOIN query that's failing
    console.log('\n📡 Testing GET /api/providers query:');
    const providersQuery = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.rating DESC, sp.created_at DESC
    `);
    
    console.log(`  Result: ${providersQuery.rows.length} providers`);
    if (providersQuery.rows.length > 0) {
      providersQuery.rows.forEach(p => {
        console.log(`    - ${p.business_name} (${p.email})`);
      });
    } else {
      console.log('  ❌ No providers returned!');
      console.log('\n  Possible reasons:');
      console.log('    1. Providers have NULL user_id');
      console.log('    2. Users are not active (is_active = false)');
      console.log('    3. No matching users for provider user_ids');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkProvidersUsers();
