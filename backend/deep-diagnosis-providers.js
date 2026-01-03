#!/usr/bin/env node

/**
 * DEEP DIAGNOSIS: Provider Visibility Issue
 * 
 * Tatizo: Providers wanakufa kuonekana kwa sehemu sahihi, kategori sahihi, na location sahihi
 * Mfano: Mbeya CBD - Accommodation - "No Providers Found" lakini kuna providers waliojisajili hapo
 * 
 * Hii script itachambua:
 * 1. Database schema - jinsi data inavyosaved
 * 2. Actual data - providers na services zao
 * 3. Filtering logic - jinsi backend inafilter
 * 4. Frontend requests - jinsi frontend inaomba
 */

const { pool } = require('./backend/config/postgresql');

async function runDiagnosis() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEEP DIAGNOSIS: PROVIDER VISIBILITY ISSUE');
    console.log('='.repeat(80) + '\n');

    // 1. Check database schema
    console.log('📋 STEP 1: DATABASE SCHEMA');
    console.log('-'.repeat(80));
    
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tableCheck.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // 2. Check services table structure
    console.log('\n📋 STEP 2: SERVICES TABLE STRUCTURE');
    console.log('-'.repeat(80));
    
    const servicesSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    
    console.log('Services table columns:');
    servicesSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // 3. Count total services
    console.log('\n📊 STEP 3: TOTAL SERVICES COUNT');
    console.log('-'.repeat(80));
    
    const totalServices = await pool.query('SELECT COUNT(*) as count FROM services');
    console.log(`Total services in database: ${totalServices.rows[0].count}`);

    // 4. Check services by category
    console.log('\n🏷️ STEP 4: SERVICES BY CATEGORY');
    console.log('-'.repeat(80));
    
    const servicesByCategory = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM services
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('Services by category:');
    servicesByCategory.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} services`);
    });

    // 5. Check services by region
    console.log('\n📍 STEP 5: SERVICES BY REGION');
    console.log('-'.repeat(80));
    
    const servicesByRegion = await pool.query(`
      SELECT region, COUNT(*) as count
      FROM services
      WHERE region IS NOT NULL
      GROUP BY region
      ORDER BY count DESC
    `);
    
    console.log('Services by region:');
    servicesByRegion.rows.forEach(row => {
      console.log(`  - ${row.region}: ${row.count} services`);
    });

    // 6. Check MBEYA specifically
    console.log('\n🔎 STEP 6: MBEYA SERVICES ANALYSIS');
    console.log('-'.repeat(80));
    
    const mbeyaServices = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id, is_active
      FROM services
      WHERE region ILIKE '%mbeya%' OR district ILIKE '%mbeya%'
      ORDER BY created_at DESC
    `);
    
    console.log(`Total services in Mbeya region: ${mbeyaServices.rows.length}`);
    
    if (mbeyaServices.rows.length > 0) {
      console.log('\nMbeya services details:');
      mbeyaServices.rows.forEach(service => {
        console.log(`  ID: ${service.id}`);
        console.log(`    Title: ${service.title}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Region: ${service.region}`);
        console.log(`    District: ${service.district}`);
        console.log(`    Area: ${service.area}`);
        console.log(`    Provider ID: ${service.provider_id}`);
        console.log(`    Active: ${service.is_active}`);
        console.log('');
      });
    }

    // 7. Check Mbeya Accommodation services
    console.log('\n🏨 STEP 7: MBEYA ACCOMMODATION SERVICES');
    console.log('-'.repeat(80));
    
    const mbeyaAccommodation = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id, is_active
      FROM services
      WHERE (region ILIKE '%mbeya%' OR district ILIKE '%mbeya%')
        AND category ILIKE '%accommodation%'
      ORDER BY created_at DESC
    `);
    
    console.log(`Accommodation services in Mbeya: ${mbeyaAccommodation.rows.length}`);
    
    if (mbeyaAccommodation.rows.length > 0) {
      console.log('\nMbeya Accommodation services:');
      mbeyaAccommodation.rows.forEach(service => {
        console.log(`  - ${service.title} (${service.category}) - Region: ${service.region}, District: ${service.district}, Area: ${service.area}`);
      });
    } else {
      console.log('❌ NO ACCOMMODATION SERVICES FOUND IN MBEYA!');
    }

    // 8. Check providers in Mbeya
    console.log('\n👤 STEP 8: PROVIDERS IN MBEYA');
    console.log('-'.repeat(80));
    
    const mbeyaProviders = await pool.query(`
      SELECT id, business_name, region, district, area, is_verified
      FROM service_providers
      WHERE region ILIKE '%mbeya%' OR district ILIKE '%mbeya%'
      ORDER BY created_at DESC
    `);
    
    console.log(`Total providers in Mbeya: ${mbeyaProviders.rows.length}`);
    
    if (mbeyaProviders.rows.length > 0) {
      console.log('\nMbeya providers:');
      mbeyaProviders.rows.forEach(provider => {
        console.log(`  - ${provider.business_name} (ID: ${provider.id})`);
        console.log(`    Region: ${provider.region}, District: ${provider.district}, Area: ${provider.area}`);
        console.log(`    Verified: ${provider.is_verified}`);
      });
    }

    // 9. Check services without region
    console.log('\n⚠️ STEP 9: SERVICES WITHOUT REGION (PROBLEMATIC)');
    console.log('-'.repeat(80));
    
    const servicesNoRegion = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services
      WHERE region IS NULL OR region = ''
      LIMIT 20
    `);
    
    console.log(`Services without region: ${servicesNoRegion.rows.length}`);
    
    if (servicesNoRegion.rows.length > 0) {
      console.log('\nFirst 20 services without region:');
      servicesNoRegion.rows.forEach(service => {
        console.log(`  - ${service.title} (Category: ${service.category})`);
        console.log(`    Region: ${service.region || 'NULL'}, District: ${service.district}, Area: ${service.area}`);
      });
    }

    // 10. Test filtering logic
    console.log('\n🧪 STEP 10: TEST FILTERING LOGIC');
    console.log('-'.repeat(80));
    
    // Simulate frontend request: Mbeya, Mbeya CBD, Accommodation
    const testRegion = 'Mbeya';
    const testDistrict = 'Mbeya CBD';
    const testCategory = 'Accommodation';
    
    console.log(`Testing filter: Region="${testRegion}", District="${testDistrict}", Category="${testCategory}"`);
    
    const testFilter = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services
      WHERE is_active = true
        AND category ILIKE $1
        AND region ILIKE $2
        AND (district ILIKE $3 OR district IS NULL OR district = '')
      ORDER BY created_at DESC
    `, [`%${testCategory}%`, `%${testRegion}%`, `%${testDistrict}%`]);
    
    console.log(`Results: ${testFilter.rows.length} services found`);
    
    if (testFilter.rows.length > 0) {
      console.log('\nFiltered services:');
      testFilter.rows.forEach(service => {
        console.log(`  - ${service.title}`);
        console.log(`    Category: ${service.category}, Region: ${service.region}, District: ${service.district}`);
      });
    } else {
      console.log('❌ NO SERVICES FOUND WITH THIS FILTER!');
      
      // Debug: Check what's actually in the database
      console.log('\n🔍 DEBUG: Checking actual data...');
      
      const debugCheck = await pool.query(`
        SELECT DISTINCT category, region, district
        FROM services
        WHERE is_active = true
        ORDER BY region, district, category
      `);
      
      console.log('\nActual combinations in database:');
      debugCheck.rows.forEach(row => {
        console.log(`  - Category: "${row.category}", Region: "${row.region}", District: "${row.district}"`);
      });
    }

    // 11. Check provider services relationship
    console.log('\n🔗 STEP 11: PROVIDER-SERVICES RELATIONSHIP');
    console.log('-'.repeat(80));
    
    const providerServiceCount = await pool.query(`
      SELECT sp.id, sp.business_name, COUNT(s.id) as service_count
      FROM service_providers sp
      LEFT JOIN services s ON sp.id = s.provider_id
      WHERE sp.region ILIKE '%mbeya%' OR sp.district ILIKE '%mbeya%'
      GROUP BY sp.id, sp.business_name
      ORDER BY service_count DESC
    `);
    
    console.log('Mbeya providers and their service counts:');
    providerServiceCount.rows.forEach(row => {
      console.log(`  - ${row.business_name} (ID: ${row.id}): ${row.service_count} services`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ DIAGNOSIS ERROR:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runDiagnosis();
