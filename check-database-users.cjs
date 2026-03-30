const { Pool } = require('./backend/node_modules/pg');

// PRODUCTION database connection
const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabaseUsers() {
  console.log('🔍 CHECKING DATABASE - USERS & SERVICE PROVIDERS\n');
  console.log('='.repeat(80));
  
  try {
    await productionPool.query('SELECT 1');
    console.log('✅ Connected to production database\n');
    
    // Check all users
    console.log('👥 ALL USERS:');
    const allUsers = await productionPool.query(`
      SELECT id, email, user_type, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    console.log(`   Total users: ${allUsers.rows.length}\n`);
    
    if (allUsers.rows.length > 0) {
      console.log('   Recent users:');
      allUsers.rows.slice(0, 10).forEach((user, idx) => {
        console.log(`     ${idx + 1}. ID: ${user.id} | ${user.email} | Type: ${user.user_type} | Created: ${user.created_at}`);
      });
    } else {
      console.log('   ⚠️  NO USERS FOUND IN DATABASE!');
    }
    
    // Check service providers
    console.log('\n🏢 SERVICE PROVIDERS:');
    const providers = await productionPool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, sp.created_at, u.email
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
    `);
    console.log(`   Total providers: ${providers.rows.length}\n`);
    
    if (providers.rows.length > 0) {
      console.log('   Recent providers:');
      providers.rows.slice(0, 10).forEach((prov, idx) => {
        console.log(`     ${idx + 1}. ID: ${prov.id} | ${prov.business_name} | User: ${prov.email} | Created: ${prov.created_at}`);
      });
    } else {
      console.log('   ⚠️  NO SERVICE PROVIDERS FOUND IN DATABASE!');
    }
    
    // Check services
    console.log('\n🎯 SERVICES:');
    const services = await productionPool.query(`
      SELECT s.id, s.title, s.provider_id, sp.business_name, s.created_at
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);
    console.log(`   Total services: ${services.rows.length}\n`);
    
    if (services.rows.length > 0) {
      console.log('   Recent services:');
      services.rows.forEach((svc, idx) => {
        console.log(`     ${idx + 1}. ${svc.title} | Provider: ${svc.business_name} | Created: ${svc.created_at}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await productionPool.end();
  }
}

checkDatabaseUsers();
