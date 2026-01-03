/**
 * Run migration to update bookings status constraint on PRODUCTION
 * This adds 'draft' status to allow pre-orders to be saved before submission
 */

const { Pool } = require('pg');

// Production DATABASE_URL from Render
const DATABASE_URL = 'postgresql://isafari_db_user:Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0@dpg-ct5bnhij1k6c73a5rvog-a.oregon-postgres.render.com/isafari_db';

console.log('🔄 Connecting to PRODUCTION database...');
console.log('   URL:', DATABASE_URL.substring(0, 50) + '...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
});

async function runMigration() {
  let client;
  
  try {
    console.log('\n📡 Attempting connection...');
    client = await pool.connect();
    console.log('✅ Connected to production database!\n');
    
    // Check current constraint
    console.log('📋 Checking current constraint...');
    const currentConstraint = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass AND contype = 'c'
    `);
    
    if (currentConstraint.rows.length > 0) {
      console.log('Current constraints:');
      currentConstraint.rows.forEach(row => {
        console.log('  - ' + row.conname + ': ' + row.definition);
      });
    } else {
      console.log('  No check constraints found on bookings table');
    }
    
    // Drop existing constraint
    console.log('\n🗑️ Dropping existing status constraint...');
    await client.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
    console.log('  ✅ Constraint dropped (if existed)');
    
    // Add new constraint with draft
    console.log('\n➕ Adding new constraint with draft status...');
    await client.query(`
      ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
      CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))
    `);
    console.log('  ✅ New constraint added');
    
    // Verify the change
    console.log('\n✅ Verifying new constraint...');
    const newConstraint = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass AND contype = 'c'
    `);
    
    if (newConstraint.rows.length > 0) {
      console.log('New constraints:');
      newConstraint.rows.forEach(row => {
        console.log('  - ' + row.conname + ': ' + row.definition);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('   Pre-orders can now be created with "draft" status.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Full error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err.message);
    process.exit(1);
  });
