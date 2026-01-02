require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./config/postgresql');

/**
 * This script fixes services that have location string but missing region/district/area fields.
 * It parses the location string and extracts the components.
 */
async function fixServicesLocations() {
  try {
    console.log('🔧 FIXING SERVICES LOCATIONS...\n');
    
    // Get all services with their provider info
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.location,
        s.region,
        s.district,
        s.area,
        sp.region as provider_region,
        sp.district as provider_district,
        sp.area as provider_area
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.region IS NULL OR s.region = '' OR s.district IS NULL OR s.district = ''
    `);
    
    console.log(`Found ${result.rows.length} services that need location fix:\n`);
    
    let fixedCount = 0;
    
    for (const service of result.rows) {
      console.log(`\n📍 Service ID ${service.id}: ${service.title}`);
      console.log(`   Current location: ${service.location || 'NULL'}`);
      console.log(`   Current region: ${service.region || 'NULL'}`);
      console.log(`   Current district: ${service.district || 'NULL'}`);
      console.log(`   Current area: ${service.area || 'NULL'}`);
      console.log(`   Provider region: ${service.provider_region || 'NULL'}`);
      console.log(`   Provider district: ${service.provider_district || 'NULL'}`);
      
      let newRegion = service.region || '';
      let newDistrict = service.district || '';
      let newArea = service.area || '';
      
      // Try to extract from location string
      if (service.location) {
        const parts = service.location.split(',').map(p => p.trim()).filter(Boolean);
        
        // Common patterns:
        // "Area, District, Region, Tanzania"
        // "Street, Ward, District, Region, Tanzania"
        // "District, Region, Tanzania"
        // "Region, Tanzania"
        
        // Remove "Tanzania" if present
        const filteredParts = parts.filter(p => p.toLowerCase() !== 'tanzania');
        
        if (filteredParts.length >= 1) {
          // Last part is usually region
          newRegion = newRegion || filteredParts[filteredParts.length - 1];
        }
        if (filteredParts.length >= 2) {
          // Second to last is usually district
          newDistrict = newDistrict || filteredParts[filteredParts.length - 2];
        }
        if (filteredParts.length >= 3) {
          // Third to last is usually area/ward
          newArea = newArea || filteredParts[filteredParts.length - 3];
        }
      }
      
      // Fallback to provider location if still empty
      if (!newRegion && service.provider_region) {
        newRegion = service.provider_region;
      }
      if (!newDistrict && service.provider_district) {
        newDistrict = service.provider_district;
      }
      if (!newArea && service.provider_area) {
        newArea = service.provider_area;
      }
      
      // Update if we have new values
      if (newRegion || newDistrict || newArea) {
        console.log(`   ✅ Updating to: region="${newRegion}", district="${newDistrict}", area="${newArea}"`);
        
        await pool.query(`
          UPDATE services 
          SET region = $1, district = $2, area = $3, updated_at = NOW()
          WHERE id = $4
        `, [newRegion, newDistrict, newArea, service.id]);
        
        fixedCount++;
      } else {
        console.log(`   ⚠️ Could not extract location data`);
      }
    }
    
    console.log(`\n\n✅ DONE! Fixed ${fixedCount} services.\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixServicesLocations();
