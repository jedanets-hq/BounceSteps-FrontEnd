const { pool } = require('./config/postgresql');

async function checkData() {
  console.log('🔍 Checking database data...\n');
  
  try {
    // Check services
    console.log('📦 Services:');
    const services = await pool.query('SELECT id, title, provider_id FROM services LIMIT 3');
    services.rows.forEach(s => {
      console.log(`   - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
    });
    
    // Check service_providers
    console.log('\n👥 Service Providers:');
    const providers = await pool.query('SELECT id, user_id, business_name FROM service_providers LIMIT 3');
    providers.rows.forEach(p => {
      console.log(`   - Provider ${p.id}: ${p.business_name} (user_id: ${p.user_id})`);
    });
    
    // Check users
    console.log('\n👤 Users (service_provider role):');
    const users = await pool.query(`SELECT id, email, role FROM users WHERE role = 'service_provider' LIMIT 3`);
    users.rows.forEach(u => {
      console.log(`   - User ${u.id}: ${u.email} (${u.role})`);
    });
    
    console.log('\n✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
