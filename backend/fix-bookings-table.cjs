const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixBookingsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 FIXING BOOKINGS TABLE\n');
    
    await client.query('BEGIN');
    
    // Check if service_id column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'service_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ service_id column is MISSING');
      console.log('✅ Adding service_id column...');
      
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
      `);
      
      console.log('✅ service_id column added successfully');
    } else {
      console.log('✅ service_id column already exists');
    }
    
    // Check for other missing columns
    const requiredColumns = [
      { name: 'travel_date', type: 'TIMESTAMP', nullable: true },
      { name: 'participants', type: 'INTEGER DEFAULT 1', nullable: true },
      { name: 'total_price', type: 'NUMERIC(10,2)', nullable: true },
      { name: 'special_requests', type: 'TEXT', nullable: true },
      { name: 'service_title', type: 'VARCHAR(255)', nullable: true },
      { name: 'service_description', type: 'TEXT', nullable: true },
      { name: 'service_images', type: 'JSONB', nullable: true },
      { name: 'service_location', type: 'VARCHAR(255)', nullable: true },
      { name: 'business_name', type: 'VARCHAR(255)', nullable: true },
      { name: 'provider_phone', type: 'VARCHAR(50)', nullable: true },
      { name: 'provider_email', type: 'VARCHAR(255)', nullable: true },
      { name: 'traveler_first_name', type: 'VARCHAR(100)', nullable: true },
      { name: 'traveler_last_name', type: 'VARCHAR(100)', nullable: true }
    ];
    
    for (const col of requiredColumns) {
      const check = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = $1
      `, [col.name]);
      
      if (check.rows.length === 0) {
        console.log(`   Adding ${col.name} column...`);
        await client.query(`
          ALTER TABLE bookings 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`   ✅ ${col.name} added`);
      }
    }
    
    await client.query('COMMIT');
    
    // Verify final structure
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);
    
    console.log('\n✅ FINAL BOOKINGS TABLE STRUCTURE:');
    finalCheck.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ BOOKINGS TABLE FIXED SUCCESSFULLY');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

fixBookingsTable();
