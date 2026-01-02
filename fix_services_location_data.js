#!/usr/bin/env node
/**
 * FIX SERVICES LOCATION DATA
 * 
 * Problem: Services in database have NULL region/district values
 * Solution: Copy location data from their providers
 */

const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'iSafari-Global-Network',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function fixServicesLocationData() {
  console.log('🔧 FIXING SERVICES LOCATION DATA');
  console.log('================================\n');

  try {
    // Step 1: Check current state
    console.log('📊 Step 1: Checking current state...');
    const servicesCheck = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.region as service_region,
        s.district as service_district,
        s.area as service_area,
        sp.id as provider_id,
        sp.business_name,
        sp.region as provider_region,
        sp.district as provider_district,
        sp.area as provider_area
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.id
    `);

    console.log(`\nTotal services: ${servicesCheck.rows.length}\n`);

    let servicesWithoutLocation = 0;
    let servicesWithLocation = 0;

    servicesCheck.rows.forEach(row => {
      if (!row.service_region && !row.service_district) {
        servicesWithoutLocation++;
        console.log(`❌ Service ${row.id} "${row.title}": NO LOCATION`);
        console.log(`   Provider: ${row.business_name}`);
        console.log(`   Provider location: ${row.provider_region}, ${row.provider_district}, ${row.provider_area}`);
      } else {
        servicesWithLocation++;
        console.log(`✅ Service ${row.id} "${row.title}": ${row.service_region}, ${row.service_district}`);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Services WITH location: ${servicesWithLocation}`);
    console.log(`   ❌ Services WITHOUT location: ${servicesWithoutLocation}`);

    if (servicesWithoutLocation === 0) {
      console.log('\n✅ All services already have location data!');
      return;
    }

    // Step 2: Fix services by copying provider location
    console.log('\n🔧 Step 2: Fixing services without location...');
    
    const updateResult = await pool.query(`
      UPDATE services s
      SET 
        region = sp.region,
        district = sp.district,
        area = sp.area,
        country = COALESCE(sp.country, 'Tanzania'),
        location = COALESCE(sp.location, sp.district || ', ' || sp.region)
      FROM service_providers sp
      WHERE s.provider_id = sp.id
        AND (s.region IS NULL OR s.region = '')
    `);

    console.log(`✅ Updated ${updateResult.rowCount} services`);

    // Step 3: Verify fix
    console.log('\n📊 Step 3: Verifying fix...');
    const verifyCheck = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.region,
        s.district,
        s.area,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.region IS NULL OR s.region = ''
    `);

    if (verifyCheck.rows.length === 0) {
      console.log('✅ SUCCESS! All services now have location data');
    } else {
      console.log(`⚠️ WARNING: ${verifyCheck.rows.length} services still missing location:`);
      verifyCheck.rows.forEach(row => {
        console.log(`   - Service ${row.id} "${row.title}" (Provider: ${row.business_name})`);
      });
    }

    // Step 4: Show final state
    console.log('\n📊 Step 4: Final state of all services:');
    const finalCheck = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.region,
        s.district,
        s.area,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.id
    `);

    finalCheck.rows.forEach(row => {
      console.log(`\n   Service ${row.id}: ${row.title}`);
      console.log(`      Category: ${row.category}`);
      console.log(`      Location: ${row.region}, ${row.district}, ${row.area}`);
      console.log(`      Provider: ${row.business_name}`);
    });

    console.log('\n✅ FIX COMPLETE!');
    console.log('\nNext steps:');
    console.log('1. Test journey planner to see if providers now appear');
    console.log('2. If still not working, check frontend filtering logic');

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixServicesLocationData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
