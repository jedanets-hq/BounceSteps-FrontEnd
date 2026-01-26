const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function debugProviders() {
  try {
    console.log('🔍 DEBUGGING PROVIDERS LOCATION ISSUE\n');
    
    // Test: MWANZA - ILEMELA - BUZURUGA
    const region = 'MWANZA';
    const district = 'ILEMELA';
    const ward = 'BUZURUGA';
    
    console.log(`📍 Testing: ${region} - ${district} - ${ward}\n`);
    
    // 1. Check all services
    const allServices = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services
      WHERE status = 'active' AND is_active = true
      LIMIT 10
    `);
    
    console.log(`1. Total active services: ${allServices.rows.length}`);
    allServices.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category})`);
      console.log(`     Location: ${s.region} - ${s.district} - ${s.area}`);
    });
    
    // 2. Filter by region
    const regionServices = await pool.query(`
      SELECT id, title, category, region, district, area
      FROM services
      WHERE status = 'active' AND is_active = true
        AND LOWER(region) = LOWER($1)
    `, [region]);
    
    console.log(`\n2. Services in ${region}: ${regionServices.rows.length}`);
    regionServices.rows.forEach(s => {
      console.log(`   - ${s.title}: ${s.region} - ${s.district} - ${s.area}`);
    });
    
    // 3. Filter by district
    const districtServices = await pool.query(`
      SELECT id, title, category, region, district, area
      FROM services
      WHERE status = 'active' AND is_active = true
        AND LOWER(region) = LOWER($1)
        AND (LOWER(district) = LOWER($2) OR LOWER(area) = LOWER($2))
    `, [region, district]);
    
    console.log(`\n3. Services in ${district}: ${districtServices.rows.length}`);
    districtServices.rows.forEach(s => {
      console.log(`   - ${s.title}: ${s.region} - ${s.district} - ${s.area}`);
    });
    
    // 4. Check location data quality
    const locationCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN region IS NULL OR region = '' THEN 1 END) as no_region,
        COUNT(CASE WHEN district IS NULL OR district = '' THEN 1 END) as no_district,
        COUNT(CASE WHEN area IS NULL OR area = '' THEN 1 END) as no_area
      FROM services
      WHERE status = 'active' AND is_active = true
    `);
    
    const stats = locationCheck.rows[0];
    console.log(`\n4. Location Data Quality:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Missing region: ${stats.no_region}`);
    console.log(`   Missing district: ${stats.no_district}`);
    console.log(`   Missing area: ${stats.no_area}`);
    
    // 5. Check providers
    const providers = await pool.query(`
      SELECT sp.user_id, sp.business_name, sp.region, sp.district, sp.area
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      LIMIT 10
    `);
    
    console.log(`\n5. Active providers: ${providers.rows.length}`);
    providers.rows.forEach(p => {
      console.log(`   - ${p.business_name}`);
      console.log(`     Location: ${p.region} - ${p.district} - ${p.area}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugProviders();
