const { Pool } = require('pg');
const fetch = require('node-fetch');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01',
  ssl: false
});

async function testProviderBadgeDisplay() {
  try {
    console.log('🔍 Testing Provider Badge Display...\n');

    // 1. Get provider with badge from database
    console.log('1️⃣ Getting provider with badge from database:');
    const dbResult = await pool.query(`
      SELECT 
        sp.id,
        sp.business_name,
        sp.user_id,
        pb.badge_type,
        pb.assigned_at
      FROM service_providers sp
      LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
      WHERE pb.badge_type IS NOT NULL
      LIMIT 1
    `);

    if (dbResult.rows.length === 0) {
      console.log('❌ No providers with badges found in database');
      return;
    }

    const provider = dbResult.rows[0];
    console.log(`✅ Found provider: ${provider.business_name}`);
    console.log(`   Provider ID: ${provider.id}`);
    console.log(`   Badge Type: ${provider.badge_type}`);
    console.log('');

    // 2. Test API endpoint for single provider
    console.log('2️⃣ Testing API endpoint for single provider:');
    const apiUrl = `http://localhost:5000/api/providers/${provider.id}`;
    console.log(`   Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success && data.provider) {
      console.log('✅ API Response successful');
      console.log(`   Business Name: ${data.provider.business_name}`);
      console.log(`   Badge Type: ${data.provider.badge_type || 'NO BADGE'}`);
      console.log(`   Badge Assigned: ${data.provider.badge_assigned_at || 'N/A'}`);
      
      if (data.provider.badge_type) {
        console.log('✅ Badge is included in API response!');
      } else {
        console.log('❌ Badge is NOT included in API response!');
      }
    } else {
      console.log('❌ API request failed:', data.message);
    }
    console.log('');

    // 3. Test API endpoint for all providers
    console.log('3️⃣ Testing API endpoint for all providers:');
    const allProvidersUrl = 'http://localhost:5000/api/providers';
    console.log(`   Fetching: ${allProvidersUrl}`);
    
    const allResponse = await fetch(allProvidersUrl);
    const allData = await allResponse.json();

    if (allData.success && allData.providers) {
      console.log(`✅ Found ${allData.providers.length} providers`);
      
      const providersWithBadges = allData.providers.filter(p => p.badge_type);
      console.log(`   Providers with badges: ${providersWithBadges.length}`);
      
      if (providersWithBadges.length > 0) {
        console.log('   Providers with badges:');
        providersWithBadges.forEach(p => {
          console.log(`     - ${p.business_name}: ${p.badge_type}`);
        });
      }
    } else {
      console.log('❌ API request failed:', allData.message);
    }
    console.log('');

    // 4. Test services API to see if provider badge is included
    console.log('4️⃣ Testing services API for provider badge:');
    const servicesUrl = 'http://localhost:5000/api/services?limit=5';
    console.log(`   Fetching: ${servicesUrl}`);
    
    const servicesResponse = await fetch(servicesUrl);
    const servicesData = await servicesResponse.json();

    if (servicesData.success && servicesData.services) {
      console.log(`✅ Found ${servicesData.services.length} services`);
      
      const servicesWithProviderBadge = servicesData.services.filter(s => s.provider_badge_type);
      console.log(`   Services with provider badge: ${servicesWithProviderBadge.length}`);
      
      if (servicesWithProviderBadge.length > 0) {
        console.log('   Services with provider badges:');
        servicesWithProviderBadge.slice(0, 3).forEach(s => {
          console.log(`     - ${s.title}`);
          console.log(`       Provider: ${s.business_name}`);
          console.log(`       Badge: ${s.provider_badge_type}`);
        });
      }
    } else {
      console.log('❌ API request failed:', servicesData.message);
    }

    console.log('\n✅ Badge display test complete!');
    
  } catch (error) {
    console.error('❌ Error testing badge display:', error);
  } finally {
    await pool.end();
  }
}

testProviderBadgeDisplay();
