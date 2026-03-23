const { pool } = require('./models');

async function fixExistingServicesCategories() {
  try {
    console.log('🔧 Fixing existing services categories...\n');
    
    // Step 1: Get all services with "General" category
    const generalServices = await pool.query(`
      SELECT s.id, s.title, s.category, s.provider_id, sp.business_name, sp.service_categories
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.category = 'General' OR s.category ILIKE '%general%'
    `);
    
    console.log(`📦 Found ${generalServices.rows.length} services with "General" category\n`);
    
    if (generalServices.rows.length === 0) {
      console.log('✅ No services need fixing!');
      await pool.end();
      process.exit(0);
      return;
    }
    
    // Step 2: Update each service with provider's first category
    let updated = 0;
    let skipped = 0;
    
    for (const service of generalServices.rows) {
      console.log(`\n📝 Service: ${service.title}`);
      console.log(`   Provider: ${service.business_name}`);
      console.log(`   Current category: ${service.category}`);
      console.log(`   Provider categories:`, service.service_categories);
      
      // Get provider's first category
      let newCategory = 'Tours & Activities'; // Default fallback
      
      if (service.service_categories) {
        let categories = service.service_categories;
        
        // Parse if it's a string
        if (typeof categories === 'string') {
          try {
            categories = JSON.parse(categories);
          } catch (e) {
            console.log(`   ⚠️ Could not parse categories: ${e.message}`);
          }
        }
        
        // Get first category if array
        if (Array.isArray(categories) && categories.length > 0) {
          newCategory = categories[0];
        }
      }
      
      console.log(`   New category: ${newCategory}`);
      
      // Update service
      if (newCategory !== service.category) {
        await pool.query(`
          UPDATE services
          SET category = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newCategory, service.id]);
        
        console.log(`   ✅ Updated!`);
        updated++;
      } else {
        console.log(`   ⏭️ Skipped (same category)`);
        skipped++;
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} services`);
    console.log(`   ⏭️ Skipped: ${skipped} services`);
    console.log(`\n✅ Done!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

fixExistingServicesCategories();
