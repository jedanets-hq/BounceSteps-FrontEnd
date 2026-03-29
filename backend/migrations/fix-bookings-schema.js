/**
 * Migration to fix bookings table schema
 * Adds missing columns that the booking creation code expects
 */

const { pool } = require('../config/postgresql');

async function fixBookingsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing bookings table schema...\n');
    
    // Check and add service_id column
    console.log('📋 Checking service_id column...');
    const serviceIdCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'service_id'
    `);
    
    if (serviceIdCheck.rows.length === 0) {
      console.log('➕ Adding service_id column...');
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
      `);
      console.log('✅ service_id column added');
    } else {
      console.log('✅ service_id column already exists');
    }
    
    // Check and add travel_date column
    console.log('\n📋 Checking travel_date column...');
    const travelDateCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'travel_date'
    `);
    
    if (travelDateCheck.rows.length === 0) {
      console.log('➕ Adding travel_date column...');
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN travel_date DATE
      `);
      console.log('✅ travel_date column added');
    } else {
      console.log('✅ travel_date column already exists');
    }
    
    // Check and add participants column
    console.log('\n📋 Checking participants column...');
    const participantsCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'participants'
    `);
    
    if (participantsCheck.rows.length === 0) {
      console.log('➕ Adding participants column...');
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN participants INTEGER DEFAULT 1
      `);
      console.log('✅ participants column added');
    } else {
      console.log('✅ participants column already exists');
    }
    
    // Check and add total_price column
    console.log('\n📋 Checking total_price column...');
    const totalPriceCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'total_price'
    `);
    
    if (totalPriceCheck.rows.length === 0) {
      console.log('➕ Adding total_price column...');
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN total_price DECIMAL(10,2)
      `);
      console.log('✅ total_price column added');
    } else {
      console.log('✅ total_price column already exists');
    }
    
    // Check and add special_requests column
    console.log('\n📋 Checking special_requests column...');
    const specialRequestsCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'special_requests'
    `);
    
    if (specialRequestsCheck.rows.length === 0) {
      console.log('➕ Adding special_requests column...');
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN special_requests TEXT
      `);
      console.log('✅ special_requests column added');
    } else {
      console.log('✅ special_requests column already exists');
    }
    
    // Check and add denormalized service columns
    const denormalizedColumns = [
      { name: 'service_title', type: 'VARCHAR(255)' },
      { name: 'service_description', type: 'TEXT' },
      { name: 'service_images', type: 'JSONB' },
      { name: 'service_location', type: 'TEXT' },
      { name: 'service_price', type: 'DECIMAL(10,2)' },
      { name: 'service_category', type: 'VARCHAR(100)' },
      { name: 'business_name', type: 'VARCHAR(255)' },
      { name: 'provider_phone', type: 'VARCHAR(20)' },
      { name: 'provider_email', type: 'VARCHAR(255)' },
      { name: 'traveler_first_name', type: 'VARCHAR(100)' },
      { name: 'traveler_last_name', type: 'VARCHAR(100)' }
    ];
    
    for (const col of denormalizedColumns) {
      console.log(`\n📋 Checking ${col.name} column...`);
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = $1
      `, [col.name]);
      
      if (colCheck.rows.length === 0) {
        console.log(`➕ Adding ${col.name} column...`);
        await client.query(`
          ALTER TABLE bookings 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`✅ ${col.name} column added`);
      } else {
        console.log(`✅ ${col.name} column already exists`);
      }
    }
    
    console.log('\n✅ Bookings schema fix completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { fixBookingsSchema };

// Run if called directly
if (require.main === module) {
  fixBookingsSchema()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
