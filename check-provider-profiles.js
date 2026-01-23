const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkProviders() {
  try {
    console.log('👥 Provider Profiles Check\n');
    
    // Get providers
    const providers = await pool.query(`
      SELECT 
        sp.user_id, 
        sp.business_name,
        sp.region, 
        sp.district, 
        sp.area,
        sp.service_categories,
        u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
    `);
    
    console.log(`Total providers: ${providers.rows.length}\n`);
    
    providers.rows.forEach(p => {
      console.log(`Provider: ${p.business_name} (${p.email})`);
      console.log(`  User ID: ${p.user_id}`);
      console.log(`  Location: ${p.region}/${p.district}/${p.area}`);
      console.log(`  Categories: ${JSON.stringify(p.service_categories)}`);
      console.log('');
    });
    
    // Now check if services match providers
    console.log('\n🔍 Checking Service-Provider Matches:\n');
    
    const matches = await pool.query(`
      SELECT 
        s.id, s.title, s.category,
        s.region as s_region, s.district as s_district, s.area as s_area,
        sp.region as p_region, sp.district as p_district, sp.area as p_area,
        sp.service_categories,
        CASE 
          WHEN LOWER(TRIM(s.region)) = LOWER(TRIM(sp.region)) THEN '✅'
          ELSE '❌'
        END as region_match,
        CASE 
          WHEN LOWER(TRIM(s.district)) = LOWER(TRIM(sp.district)) THEN '✅'
          ELSE '❌'
        END as district_match
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
    `);
    
    matches.rows.forEach(m => {
      console.log(`Service: ${m.title} (${m.category})`);
      console.log(`  Service Location: ${m.s_region}/${m.s_district}/${m.s_area}`);
      console.log(`  Provider Location: ${m.p_region}/${m.p_district}/${m.p_area}`);
      console.log(`  Region Match: ${m.region_match}`);
      console.log(`  District Match: ${m.district_match}`);
      console.log(`  Provider Categories: ${JSON.stringify(m.service_categories)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProviders();
