/**
 * Migration: Fix Service Locations
 * 
 * This migration updates all existing services to inherit location data
 * from their provider's profile (service_providers table).
 * 
 * This ensures all services have proper location data for strict filtering.
 */

const { pool } = require('../config/postgresql');

async function fixServiceLocations() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting service location fix migration...\n');
    
    // Step 1: Check how many services need fixing
    console.log('📊 Checking services that need location updates...');
    const checkResult = await client.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.region IS NULL OR s.region = '' OR s.district IS NULL OR s.district = ''
    `);
    
    const servicesToFix = parseInt(checkResult.rows[0].count);
    console.log(`   Found ${servicesToFix} services that need location updates\n`);
    
    if (servicesToFix === 0) {
      console.log('✅ All services already have location data!');
      return;
    }
    
    // Step 2: Update services to inherit location from provider profile
    console.log('🔄 Updating services with provider location data...');
    const updateResult = await client.query(`
      UPDATE services s
      SET 
        region = COALESCE(NULLIF(TRIM(s.region), ''), TRIM(sp.region), ''),
        district = COALESCE(NULLIF(TRIM(s.district), ''), TRIM(sp.district), ''),
        area = COALESCE(NULLIF(TRIM(s.area), ''), TRIM(sp.area), TRIM(sp.ward), ''),
        location = COALESCE(
          NULLIF(TRIM(s.location), ''), 
          TRIM(sp.service_location), 
          TRIM(sp.location),
          CONCAT_WS(', ',
            NULLIF(TRIM(sp.area), ''),
            NULLIF(TRIM(sp.district), ''),
            NULLIF(TRIM(sp.region), ''),
            'Tanzania'
          )
        ),
        country = COALESCE(NULLIF(TRIM(s.country), ''), TRIM(sp.country), 'Tanzania'),
        updated_at = CURRENT_TIMESTAMP
      FROM service_providers sp
      WHERE s.provider_id = sp.user_id
        AND (
          s.region IS NULL OR TRIM(s.region) = '' OR 
          s.district IS NULL OR TRIM(s.district) = ''
        )
      RETURNING s.id, s.title, s.region, s.district, s.area, s.location
    `);
    
    console.log(`✅ Updated ${updateResult.rows.length} services\n`);
    
    // Step 3: Show sample of updated services
    if (updateResult.rows.length > 0) {
      console.log('📋 Sample of updated services:');
      updateResult.rows.slice(0, 5).forEach((service, i) => {
        console.log(`   ${i + 1}. ${service.title}`);
        console.log(`      Full Location: ${service.location}`);
        console.log(`      Hierarchical: ${service.area} → ${service.district} → ${service.region}`);
      });
      
      if (updateResult.rows.length > 5) {
        console.log(`   ... and ${updateResult.rows.length - 5} more\n`);
      }
    }
    
    // Step 4: Verify all services now have location data
    console.log('🔍 Verifying all services have location data...');
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.region IS NULL OR s.region = '' OR s.district IS NULL OR s.district = ''
    `);
    
    const remainingIssues = parseInt(verifyResult.rows[0].count);
    
    if (remainingIssues === 0) {
      console.log('✅ SUCCESS: All services now have location data!\n');
    } else {
      console.log(`⚠️ WARNING: ${remainingIssues} services still missing location data\n`);
      
      // Show services that still have issues
      const issuesResult = await client.query(`
        SELECT s.id, s.title, s.provider_id, sp.business_name
        FROM services s
        LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
        WHERE s.region IS NULL OR s.region = '' OR s.district IS NULL OR s.district = ''
        LIMIT 10
      `);
      
      console.log('Services with missing location data:');
      issuesResult.rows.forEach((service, i) => {
        console.log(`   ${i + 1}. ${service.title} (Provider: ${service.business_name || 'N/A'})`);
      });
    }
    
    // Step 5: Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Services needing updates: ${servicesToFix}`);
    console.log(`Services updated: ${updateResult.rows.length}`);
    console.log(`Services still missing data: ${remainingIssues}`);
    console.log('═'.repeat(60));
    
    if (remainingIssues === 0) {
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    } else {
      console.log('⚠️ MIGRATION COMPLETED WITH WARNINGS');
      console.log('   Some services still need manual review');
    }
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  fixServiceLocations()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixServiceLocations };
