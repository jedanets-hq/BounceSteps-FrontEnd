const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkDanProvider() {
  try {
    console.log('🔍 Checking Dan provider (ID 7)...\n');
    
    // Check if provider ID 7 exists
    const provider = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.is_active
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.id = 7
    `);
    
    if (provider.rows.length === 0) {
      console.log('❌ Provider ID 7 NOT FOUND in service_providers table\n');
      
      // Check if there's a user with provider role
      const users = await pool.query(`
        SELECT id, email, first_name, last_name, is_active
        FROM users
        WHERE email LIKE '%dan%' OR first_name LIKE '%dan%' OR last_name LIKE '%dan%'
      `);
      
      console.log(`Found ${users.rows.length} users matching "dan":\n`);
      users.rows.forEach(u => {
        console.log(`  User ID: ${u.id}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Name: ${u.first_name} ${u.last_name}`);
        console.log(`  Active: ${u.is_active}`);
        console.log('');
      });
      
      // Check if any of these users have a provider profile
      if (users.rows.length > 0) {
        for (const user of users.rows) {
          const providerProfile = await pool.query(
            'SELECT * FROM service_providers WHERE user_id = $1',
            [user.id]
          );
          
          if (providerProfile.rows.length > 0) {
            console.log(`✅ User ${user.id} (${user.email}) HAS provider profile:`);
            console.log(`   Provider ID: ${providerProfile.rows[0].id}`);
            console.log(`   Business: ${providerProfile.rows[0].business_name}`);
          } else {
            console.log(`❌ User ${user.id} (${user.email}) has NO provider profile`);
          }
          console.log('');
        }
      }
    } else {
      const p = provider.rows[0];
      console.log('✅ Provider ID 7 FOUND:\n');
      console.log(`  Provider ID: ${p.id}`);
      console.log(`  Business Name: ${p.business_name}`);
      console.log(`  User ID: ${p.user_id}`);
      console.log(`  Email: ${p.email}`);
      console.log(`  Name: ${p.first_name} ${p.last_name}`);
      console.log(`  User Active: ${p.is_active}`);
      console.log('');
      
      // Check services for this provider
      const services = await pool.query(
        'SELECT * FROM services WHERE provider_id = $1',
        [p.id]
      );
      
      console.log(`📦 Services for provider ${p.id}: ${services.rows.length}\n`);
      if (services.rows.length > 0) {
        services.rows.forEach(s => {
          console.log(`  - ${s.title} (${s.category}) - Active: ${s.is_active}`);
        });
      } else {
        console.log('  No services found');
      }
    }
    
    // List ALL providers
    console.log('\n\n📊 ALL PROVIDERS:\n');
    const allProviders = await pool.query(`
      SELECT sp.id, sp.business_name, sp.user_id, u.email, u.is_active
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY sp.id
    `);
    
    allProviders.rows.forEach(p => {
      console.log(`  ID: ${p.id}, Business: ${p.business_name}, User: ${p.user_id}, Email: ${p.email}, Active: ${p.is_active}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDanProvider();
