require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function checkConstraints() {
  try {
    console.log('Checking promotion_payments table constraints...\n');
    
    const result = await pool.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass 
        AND contype = 'c'
    `);
    
    console.log('CHECK Constraints found:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`\nConstraint: ${row.constraint_name}`);
      console.log(`Definition: ${row.definition}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraints();
