const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function checkSchema() {
  try {
    // Check favorites table
    const favoritesSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== FAVORITES TABLE SCHEMA ===');
    console.log(favoritesSchema.rows);
    
    // Check services table
    const servicesSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== SERVICES TABLE SCHEMA ===');
    console.log(servicesSchema.rows);
    
    // Check current favorites data
    const favoritesData = await pool.query('SELECT * FROM favorites LIMIT 5');
    console.log('\n=== CURRENT FAVORITES DATA (sample) ===');
    console.log(favoritesData.rows);
    
    // Check services data
    const servicesData = await pool.query('SELECT id, name, provider_id, price, category FROM services LIMIT 5');
    console.log('\n=== SERVICES DATA (sample) ===');
    console.log(servicesData.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
