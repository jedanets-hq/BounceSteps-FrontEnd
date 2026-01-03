/**
 * Migrations to run on server startup
 * This ensures database schema is always up to date
 */

const { pool } = require('../config/postgresql');

async function runStartupMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Running startup migrations...');
    
    // Migration 1: Add 'draft' status to bookings constraint
    console.log('   📋 Checking bookings status constraint...');
    
    // Check if constraint exists and what values it allows
    const constraintCheck = await client.query(`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass 
      AND conname = 'bookings_status_check'
    `);
    
    const needsUpdate = constraintCheck.rows.length === 0 || 
      !constraintCheck.rows[0]?.definition?.includes('draft');
    
    if (needsUpdate) {
      console.log('   🔄 Updating bookings status constraint to include draft...');
      
      // Drop existing constraint if exists
      await client.query(`
        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check
      `);
      
      // Add new constraint with draft included
      await client.query(`
        ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))
      `);
      
      console.log('   ✅ Bookings status constraint updated!');
    } else {
      console.log('   ✅ Bookings status constraint already includes draft');
    }
    
    console.log('✅ Startup migrations completed!');
    
  } catch (error) {
    console.error('❌ Startup migration error:', error.message);
    // Don't throw - let server continue even if migration fails
  } finally {
    client.release();
  }
}

module.exports = { runStartupMigrations };
