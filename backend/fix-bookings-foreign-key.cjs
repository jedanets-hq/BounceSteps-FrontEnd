const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function fixBookingsForeignKey() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing bookings foreign key constraint...\n');
    
    await client.query('BEGIN');
    
    // Step 1: Drop the incorrect foreign key constraint
    console.log('Step 1: Dropping incorrect foreign key constraint...');
    await client.query(`
      ALTER TABLE bookings 
      DROP CONSTRAINT IF EXISTS bookings_provider_id_fkey
    `);
    console.log('✅ Old constraint dropped');
    
    // Step 2: Add the correct foreign key constraint
    console.log('\nStep 2: Adding correct foreign key constraint...');
    await client.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_provider_id_fkey 
      FOREIGN KEY (provider_id) 
      REFERENCES service_providers(id) 
      ON DELETE CASCADE
    `);
    console.log('✅ New constraint added: provider_id -> service_providers.id');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Foreign key constraint fixed successfully!');
    console.log('   bookings.provider_id now references service_providers.id (not user_id)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixBookingsForeignKey();
