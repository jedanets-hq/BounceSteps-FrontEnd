const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function simpleCheck() {
  try {
    console.log('🔍 Simple Services Check\n');
    
    // Count all services
    const count = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`Total services: ${count.rows[0].count}\n`);
    
    // Get all services
    const services = await pool.query(`
      SELECT id, title, category, provider_id, region, district, area, status, is_active
      FROM services
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('Recent services:');
    services.rows.forEach(s => {
      console.log(`  ${s.id}: ${s.title}`);
      console.log(`     Category: ${s.category}`);
      console.log(`     Location: ${s.region}/${s.district}/${s.area}`);
      console.log(`     Status: ${s.status}, Active: ${s.is_active}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

simpleCheck();
