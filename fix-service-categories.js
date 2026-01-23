const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixServiceCategories() {
  try {
    console.log('🔧 FIXING SERVICE CATEGORIES\n');
    
    // Get all services with their providers
    const services = await pool.query(`
      SELECT 
        s.id, 
        s.title, 
        s.category as current_category,
        s.provider_id,
        sp.business_name,
        sp.service_categories
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      ORDER BY s.created_at DESC
    `);
    
    console.log(`Found ${services.rows.length} services to check\n`);
    
    for (const service of services.rows) {
      const providerCategories = service.service_categories;
      
      // If provider has categories, use the first one
      if (providerCategories && providerCategories.length > 0) {
        const correctCategory = providerCategories[0];
        
        if (service.current_category !== correctCategory) {
          console.log(`Updating service: ${service.title}`);
          console.log(`  Current: ${service.current_category}`);
          console.log(`  Correct: ${correctCategory}`);
          console.log(`  Provider: ${service.business_name}`);
          
          // Update the service category
          await pool.query(`
            UPDATE services 
            SET category = $1 
            WHERE id = $2
          `, [correctCategory, service.id]);
          
          console.log(`  ✅ Updated!\n`);
        } else {
          console.log(`✓ Service "${service.title}" already has correct category: ${correctCategory}\n`);
        }
      } else {
        console.log(`⚠️ Provider "${service.business_name}" has no categories, keeping "${service.current_category}"\n`);
      }
    }
    
    console.log('\n✅ DONE! Checking results...\n');
    
    // Show final results
    const updated = await pool.query(`
      SELECT 
        s.id, 
        s.title, 
        s.category,
        sp.business_name,
        sp.service_categories
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      ORDER BY s.created_at DESC
    `);
    
    console.log('Final service categories:');
    updated.rows.forEach(s => {
      console.log(`  ${s.title}: ${s.category} (Provider: ${s.business_name}, Categories: ${JSON.stringify(s.service_categories)})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixServiceCategories();
