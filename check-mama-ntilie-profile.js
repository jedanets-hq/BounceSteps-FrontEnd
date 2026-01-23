const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkMamaNtilieProfile() {
  try {
    console.log('🔍 CHECKING MAMA NTILIE PROFILE\n');
    
    // Get full provider profile
    const provider = await pool.query(`
      SELECT 
        sp.*,
        u.email,
        u.first_name,
        u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.email = 'mama@gmail.com'
    `);
    
    if (provider.rows.length === 0) {
      console.log('Provider not found');
      return;
    }
    
    const p = provider.rows[0];
    console.log('Provider Profile:');
    console.log(`  User ID: ${p.user_id}`);
    console.log(`  Email: ${p.email}`);
    console.log(`  Business Name: ${p.business_name}`);
    console.log(`  Service Categories: ${JSON.stringify(p.service_categories)}`);
    console.log(`  Region: ${p.region}`);
    console.log(`  District: ${p.district}`);
    console.log(`  Area: ${p.area}`);
    console.log(`  Location: ${p.location}`);
    console.log('');
    
    // Check when services were created
    const services = await pool.query(`
      SELECT id, title, category, created_at
      FROM services
      WHERE provider_id = $1
      ORDER BY created_at ASC
    `, [p.user_id]);
    
    console.log(`Services created by this provider (${services.rows.length}):`);
    services.rows.forEach(s => {
      console.log(`  ${s.created_at}: ${s.title} - ${s.category}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMamaNtilieProfile();
