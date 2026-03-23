const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderServicesData() {
  try {
    console.log('🔍 Testing provider services data structure...\n');
    
    // Get first provider with services
    const providerResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name
      FROM service_providers sp
      WHERE EXISTS (SELECT 1 FROM services s WHERE s.provider_id = sp.id AND s.is_active = true)
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No providers with services found');
      process.exit(0);
    }
    
    const provider = providerResult.rows[0];
    console.log('📋 Testing with provider:', {
      id: provider.id,
      user_id: provider.user_id,
      business_name: provider.business_name
    });
    console.log('');
    
    // Get services with the EXACT query from providers.js
    const servicesResult = await pool.query(`
      SELECT s.id,
             s.title,
             s.category,
             s.price,
             s.location,
             s.region,
             s.district,
             s.area,
             s.duration,
             s.max_participants,
             s.status,
             s.is_active,
             s.is_featured,
             s.created_at,
             s.description,
             CASE 
               WHEN s.images IS NULL OR s.images = '' OR s.images = '[]' THEN '[]'::jsonb
               WHEN s.images::text ~ '^\\[.*\\]$' THEN s.images::jsonb
               ELSE jsonb_build_array(s.images)
             END as images,
             s.amenities,
             s.payment_methods,
             s.contact_info,
             $2 as provider_user_id,
             sp.business_name,
             sp.id as provider_id,
             COUNT(DISTINCT b.id) as review_count,
             AVG(b.rating) as average_rating
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.provider_id = $1 AND s.is_active = true
      GROUP BY s.id, sp.id, sp.business_name
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [provider.id, provider.user_id]);
    
    if (servicesResult.rows.length === 0) {
      console.log('❌ No services found for this provider');
      process.exit(0);
    }
    
    const service = servicesResult.rows[0];
    console.log('📦 Service data returned from backend:');
    console.log(JSON.stringify(service, null, 2));
    console.log('');
    
    console.log('✅ Key fields check:');
    console.log('   - service.id:', service.id);
    console.log('   - service.title:', service.title);
    console.log('   - service.provider_user_id:', service.provider_user_id);
    console.log('   - service.provider_id:', service.provider_id);
    console.log('   - service.business_name:', service.business_name);
    console.log('');
    
    if (service.provider_user_id) {
      console.log('✅ provider_user_id is present and has value:', service.provider_user_id);
    } else {
      console.log('❌ provider_user_id is MISSING or NULL!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderServicesData();
