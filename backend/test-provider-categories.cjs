const { pool } = require('./models');

async function testProviderCategories() {
  try {
    console.log('🔍 Testing provider service_categories...\n');
    
    // Get all service providers with their categories
    const result = await pool.query(`
      SELECT sp.user_id, sp.business_name, sp.service_categories, u.email
      FROM service_providers sp
      INNER JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
      LIMIT 10
    `);
    
    console.log(`📦 Found ${result.rows.length} service providers:\n`);
    
    result.rows.forEach((provider, i) => {
      console.log(`${i + 1}. ${provider.business_name} (${provider.email})`);
      console.log('   service_categories:', provider.service_categories);
      console.log('   Type:', typeof provider.service_categories);
      console.log('   Is Array:', Array.isArray(provider.service_categories));
      
      if (provider.service_categories) {
        if (typeof provider.service_categories === 'string') {
          try {
            const parsed = JSON.parse(provider.service_categories);
            console.log('   Parsed:', parsed);
          } catch (e) {
            console.log('   Parse error:', e.message);
          }
        }
      }
      console.log('');
    });
    
    // Get services and their categories
    console.log('\n📋 Services and their categories:\n');
    const servicesResult = await pool.query(`
      SELECT s.id, s.title, s.category, sp.business_name, sp.service_categories as provider_categories
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);
    
    servicesResult.rows.forEach((service, i) => {
      console.log(`${i + 1}. ${service.title}`);
      console.log(`   Provider: ${service.business_name}`);
      console.log(`   Service Category: ${service.category}`);
      console.log(`   Provider Categories:`, service.provider_categories);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testProviderCategories();
