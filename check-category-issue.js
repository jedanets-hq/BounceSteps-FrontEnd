const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkCategoryIssue() {
  try {
    console.log('🔍 CHECKING CATEGORY ISSUE\n');
    
    // Check all services with their actual categories
    const services = await pool.query(`
      SELECT 
        s.id, 
        s.title, 
        s.category,
        s.provider_id,
        sp.business_name,
        sp.service_categories
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      ORDER BY s.created_at DESC
    `);
    
    console.log(`Total services: ${services.rows.length}\n`);
    
    services.rows.forEach(s => {
      console.log(`Service: ${s.title}`);
      console.log(`  ID: ${s.id}`);
      console.log(`  Category in DB: "${s.category}"`);
      console.log(`  Provider: ${s.business_name}`);
      console.log(`  Provider Categories: ${JSON.stringify(s.service_categories)}`);
      console.log('');
    });
    
    // Check if there are services in other categories
    const categoryCounts = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM services
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('Category Distribution:');
    categoryCounts.rows.forEach(c => {
      console.log(`  ${c.category}: ${c.count} services`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategoryIssue();
