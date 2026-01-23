/**
 * FIX EXISTING SERVICES LOCATION DATA
 * 
 * This script updates all existing services to inherit location data
 * from their provider's profile (service_providers table).
 * 
 * This ensures all services have proper location data for strict filtering.
 */

require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/models');

async function fixExistingServicesLocation() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('FIXING EXISTING SERVICES LOCATION DATA');
    console.log('='.repeat(80) + '\n');

    await client.query('BEGIN');

    // Step 1: Check services without location
    console.log('📋 Step 1: Checking services without location data...');
    const servicesWithoutLocation = await client.query(`
      SELECT s.id, s.title, s.provider_id, sp.business_name, sp.region, sp.district, sp.area
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.region IS NULL OR s.region = '' OR s.district IS NULL OR s.district = ''
    `);

    console.log(`   Found ${servicesWithoutLocation.rows.length} services without location data\n`);

    if (servicesWithoutLocation.rows.length === 0) {
      console.log('✅ All services already have location data!');
      await client.query('COMMIT');
      return;
    }

    // Show services that will be updated
    console.log('📋 Services to be updated:');
    servicesWithoutLocation.rows.forEach((service, idx) => {
      console.log(`\n   ${idx + 1}. ${service.title}`);
      console.log(`      Provider: ${service.business_name}`);
      console.log(`      Will inherit location: ${service.district || 'N/A'}, ${service.region || 'N/A'}`);
    });

    // Step 2: Update services with provider location
    console.log('\n\n📋 Step 2: Updating services with provider location...');
    const updateResult = await client.query(`
      UPDATE services s
      SET 
        region = COALESCE(NULLIF(TRIM(s.region), ''), TRIM(sp.region), ''),
        district = COALESCE(NULLIF(TRIM(s.district), ''), TRIM(sp.district), ''),
        area = COALESCE(NULLIF(TRIM(s.area), ''), TRIM(sp.area), TRIM(sp.ward), ''),
        country = COALESCE(NULLIF(TRIM(s.country), ''), TRIM(sp.country), 'Tanzania'),
        updated_at = CURRENT_TIMESTAMP
      FROM service_providers sp
      WHERE s.provider_id = sp.user_id
        AND (
          s.region IS NULL OR s.region = '' 
          OR s.district IS NULL OR s.district = ''
        )
    `);

    console.log(`   ✅ Updated ${updateResult.rowCount} services`);

    // Step 3: Verify the update
    console.log('\n📋 Step 3: Verifying updates...');
    const verifyResult = await client.query(`
      SELECT s.id, s.title, s.provider_id, s.region, s.district, s.area, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.id IN (
        SELECT id FROM services 
        WHERE region IS NULL OR region = '' OR district IS NULL OR district = ''
      )
    `);

    if (verifyResult.rows.length === 0) {
      console.log('   ✅ All services now have location data!');
    } else {
      console.log(`   ⚠️  ${verifyResult.rows.length} services still missing location data:`);
      verifyResult.rows.forEach((service, idx) => {
        console.log(`\n   ${idx + 1}. ${service.title}`);
        console.log(`      Provider: ${service.business_name}`);
        console.log(`      Location: ${service.district || 'MISSING'}, ${service.region || 'MISSING'}`);
      });
    }

    // Step 4: Show final statistics
    console.log('\n📋 Step 4: Final statistics...');
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN region IS NOT NULL AND region != '' THEN 1 END) as with_region,
        COUNT(CASE WHEN district IS NOT NULL AND district != '' THEN 1 END) as with_district,
        COUNT(CASE WHEN area IS NOT NULL AND area != '' THEN 1 END) as with_area
      FROM services
    `);

    const stats = statsResult.rows[0];
    console.log(`\n   Total Services: ${stats.total_services}`);
    console.log(`   With Region: ${stats.with_region} (${Math.round(stats.with_region / stats.total_services * 100)}%)`);
    console.log(`   With District: ${stats.with_district} (${Math.round(stats.with_district / stats.total_services * 100)}%)`);
    console.log(`   With Area: ${stats.with_area} (${Math.round(stats.with_area / stats.total_services * 100)}%)`);

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(80));
    console.log('✅ LOCATION DATA FIX COMPLETE!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixExistingServicesLocation();
