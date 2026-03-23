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
    console.log('📋 Checking bookings status constraint...');
    
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
      console.log('🔄 Updating bookings status constraint to include draft...');
      
      // Drop existing constraint if exists
      await client.query(`
        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check
      `);
      
      // Add new constraint with draft included
      await client.query(`
        ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))
      `);
      
      console.log('✅ Bookings status constraint updated!');
    } else {
      console.log('✅ Bookings status constraint already includes draft');
    }
    
    // Migration 2: Add auth_provider column for Google Sign-In tracking
    console.log('📋 Checking auth_provider column...');
    
    const authProviderCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'auth_provider'
    `);
    
    if (authProviderCheck.rows.length === 0) {
      console.log('🔄 Adding auth_provider column...');
      
      // Add auth_provider column with CHECK constraint
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email' 
        CHECK (auth_provider IN ('email', 'google', 'both'))
      `);
      
      // Update existing users with google_id to have auth_provider = 'google'
      await client.query(`
        UPDATE users 
        SET auth_provider = 'google' 
        WHERE google_id IS NOT NULL AND password IS NULL
      `);
      
      // Update existing users with both google_id and password to have auth_provider = 'both'
      await client.query(`
        UPDATE users 
        SET auth_provider = 'both' 
        WHERE google_id IS NOT NULL AND password IS NOT NULL
      `);
      
      // Create index for auth_provider filtering
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider)
      `);
      
      console.log('✅ auth_provider column added!');
    } else {
      console.log('✅ auth_provider column already exists');
    }
    
    console.log('✅ Startup migrations completed!');
    
    // Migration 3: Create messages table if not exists
    console.log('📋 Checking messages table...');
    
    const messagesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      )
    `);
    
    if (!messagesTableCheck.rows[0].exists) {
      console.log('🔄 Creating messages table...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          traveller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
          sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('traveller', 'provider')),
          message_text TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_messages_traveller ON messages(traveller_id);
        CREATE INDEX IF NOT EXISTS idx_messages_provider ON messages(provider_id);
        CREATE INDEX IF NOT EXISTS idx_messages_service ON messages(service_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
      `);
      
      console.log('✅ Messages table created!');
    } else {
      console.log('✅ Messages table already exists');
    }
    
    console.log('✅ All startup migrations completed!');
    
  } catch (error) {
    console.error('❌ Startup migration error:', error.message);
    // Don't throw - let server continue even if migration fails
  } finally {
    client.release();
  }
}

module.exports = { runStartupMigrations };
