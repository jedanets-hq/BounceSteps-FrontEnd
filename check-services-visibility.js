const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkServicesVisibility() {
  try {
    console.log('🔍 CHECKING SERVICES VISIBILITY ISSUES\n');
    
    // 1. Check total services
    const totalServices = await pool.query(`
      SELECT COUNT(*) as total FROM services
    `);
    console.log(`📊 Total services in database: ${totalServices.rows[0].total}\n`);
    
    // 2. Check active services
    const activeServices = await pool.query(`
      SELECT COUNT(*) as total FROM services 
      WHERE status = 'active' AND is_active = true
    `);
    console.log(`✅ Active services: ${activeServices.rows[0].total}\n`);
    
    // 3. Check services with location data
    const servicesWithLocation = await pool.query(`
      SELECT 
        id, title, category, provider_id,
        region, district, area,
        status, is_active
      FROM services
      WHERE status = 'active' AND is_active = true
      ORDER BY created_at DESC
    `);
    
    console.log(`📍 Services with location data (${servicesWithLocation.rows.length}):`);
    servicesWithLocation.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category})`);
      console.log(`     Region: "${s.region}", District: "${s.district}", Area: "${s.area}"`);
      console.log(`     Provider ID: ${s.provider_id}`);
    });
    console.log('');
    
    // 4. Check provider profiles
    const providers = await pool.query(`
      SELECT 
        sp.user_id, sp.business_name,
        sp.region, sp.district, sp.area,
        sp.service_categories,
        u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
    `);
    
    console.log(`👥 Provider profiles (${providers.rows.length}):`);
    providers.rows.forEach(p => {
      console.log(`   - ${p.business_name} (${p.email})`);
      console.log(`     Region: "${p.region}", District: "${p.district}", Area: "${p.area}"`);
      console.log(`     Categories: ${JSON.stringify(p.service_categories)}`);
    });
    console.log('');
    
    // 5. Check for location mismatches
    const locationMismatches = await pool.query(`
      SELECT 
        s.id, s.title, s.category,
        s.region as service_region, s.district as service_district, s.area as service_area,
        sp.region as provider_region, sp.district as provider_district, sp.area as provider_area,
        CASE 
          WHEN LOWER(TRIM(s.region)) != LOWER(TRIM(sp.region)) THEN 'Region mismatch'
          WHEN LOWER(TRIM(s.district)) != LOWER(TRIM(sp.district)) THEN 'District mismatch'
          ELSE 'Match'
        END as match_status
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
    `);
    
    console.log(`🔍 Location matching analysis:`);
    locationMismatches.rows.forEach(m => {
      console.log(`   - ${m.title}:`);
      console.log(`     Service: ${m.service_region}/${m.service_district}/${m.service_area}`);
      console.log(`     Provider: ${m.provider_region}/${m.provider_district}/${m.provider_area}`);
      console.log(`     Status: ${m.match_status}`);
    });
    console.log('');
    
    // 6. Check category mismatches
    const categoryCheck = await pool.query(`
      SELECT 
        s.id, s.title, s.category,
        sp.service_categories,
        CASE 
          WHEN sp.service_categories IS NULL THEN 'NULL categories'
          WHEN sp.service_categories::text = '[]' THEN 'Empty categories'
          WHEN sp.service_categories::jsonb @> to_jsonb(s.category::text) THEN 'Category match'
          ELSE 'Category mismatch'
        END as category_status
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
    `);
    
    console.log(`📂 Category matching analysis:`);
    categoryCheck.rows.forEach(c => {
      console.log(`   - ${c.title} (${c.category}):`);
      console.log(`     Provider categories: ${JSON.stringify(c.service_categories)}`);
      console.log(`     Status: ${c.category_status}`);
    });
    console.log('');
    
    // 7. Test the actual query used in the API
    console.log(`🧪 Testing actual API query (no filters):`);
    const apiQuery = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area,
             sp.service_categories as provider_service_categories
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND (
          sp.service_categories IS NULL 
          OR sp.service_categories::text = '[]'
          OR sp.service_categories::jsonb @> to_jsonb(s.category::text)
        )
        AND LOWER(TRIM(s.region)) = LOWER(TRIM(sp.region))
        AND LOWER(TRIM(s.district)) = LOWER(TRIM(sp.district))
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    
    console.log(`   Results: ${apiQuery.rows.length} services found`);
    if (apiQuery.rows.length > 0) {
      apiQuery.rows.forEach(s => {
        console.log(`   ✅ ${s.title} - ${s.category} - ${s.region}/${s.district}`);
      });
    } else {
      console.log(`   ❌ NO SERVICES RETURNED - This is the problem!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkServicesVisibility();
