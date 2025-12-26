const { pool } = require('./config/postgresql');

async function testCategoryFix() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING CATEGORY FIX');
    console.log('='.repeat(60));

    // Test case-insensitive category matching
    console.log('\n🔍 Test: Accommodation services in Mbeya (case-insensitive)');
    
    const category = 'accommodation'; // lowercase from frontend
    const region = 'Mbeya';
    
    // Get all services
    const allServices = await pool.query(`
      SELECT s.id, s.title, s.category, s.region, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
    `);
    
    console.log(`Total active services: ${allServices.rows.length}`);
    
    // Filter by category (case-insensitive)
    const categoryLower = category.toLowerCase().trim();
    const categoryFiltered = allServices.rows.filter(s => {
      const serviceCategory = (s.category || '').toLowerCase().trim();
      return serviceCategory === categoryLower;
    });
    
    console.log(`After category filter "${category}": ${categoryFiltered.length} services`);
    
    // Filter by region (case-insensitive)
    const regionLower = region.toLowerCase().trim();
    const finalFiltered = categoryFiltered.filter(s => {
      const serviceRegion = (s.region || '').toLowerCase().trim();
      return serviceRegion === regionLower;
    });
    
    console.log(`After region filter "${region}": ${finalFiltered.length} services`);
    
    if (finalFiltered.length > 0) {
      console.log('\n✅ SERVICES FOUND:');
      finalFiltered.forEach(s => {
        console.log(`  - ${s.title} (${s.category}) | Provider: ${s.business_name}`);
      });
    } else {
      console.log('\n❌ NO SERVICES FOUND');
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testCategoryFix();
