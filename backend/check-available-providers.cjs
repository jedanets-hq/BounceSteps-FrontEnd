const { pool } = require('./config/postgresql');

async function checkProviders() {
  try {
    console.log('🔍 Checking available providers...\n');
    
    // Get all providers
    const result = await pool.query(`
      SELECT sp.user_id, sp.business_name, sp.business_type, sp.location, 
             u.email, u.first_name, u.last_name, u.is_active
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.user_id
    `);
    
    console.log(`✅ Found ${result.rows.length} providers:\n`);
    
    result.rows.forEach((provider, index) => {
      console.log(`${index + 1}. Provider ID: ${provider.user_id}`);
      console.log(`   Business Name: ${provider.business_name}`);
      console.log(`   Type: ${provider.business_type}`);
      console.log(`   Location: ${provider.location}`);
      console.log(`   Owner: ${provider.first_name} ${provider.last_name} (${provider.email})`);
      console.log(`   Active: ${provider.is_active}`);
      console.log('');
    });
    
    // Check services
    const servicesResult = await pool.query(`
      SELECT id, title, category, provider_id, location, price
      FROM services
      WHERE is_active = true
      ORDER BY provider_id, id
    `);
    
    console.log(`\n📦 Found ${servicesResult.rows.length} active services:\n`);
    
    servicesResult.rows.forEach((service, index) => {
      console.log(`${index + 1}. Service ID: ${service.id}`);
      console.log(`   Title: ${service.title}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Provider ID: ${service.provider_id}`);
      console.log(`   Location: ${service.location}`);
      console.log(`   Price: TZS ${service.price}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProviders();
