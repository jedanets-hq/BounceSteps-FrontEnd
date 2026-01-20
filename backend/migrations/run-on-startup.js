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
    
    // Migration 2: Add auth_provider column for Google Sign-In tracking
    console.log('   📋 Checking auth_provider column...');
    
    const authProviderCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'auth_provider'
    `);
    
    if (authProviderCheck.rows.length === 0) {
      console.log('   🔄 Adding auth_provider column...');
      
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
      
      console.log('   ✅ auth_provider column added!');
    } else {
      console.log('   ✅ auth_provider column already exists');
    }
    
    // Migration 3: Create services table if it doesn't exist
    console.log('   📋 Checking services table...');
    
    const servicesTableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'services'
    `);
    
    if (servicesTableCheck.rows.length === 0) {
      console.log('   🔄 Creating services table...');
      
      await client.query(`
        CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          location TEXT,
          price DECIMAL(10,2),
          currency VARCHAR(10) DEFAULT 'TZS',
          images JSONB,
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          is_featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
        CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
        CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
        CREATE INDEX IF NOT EXISTS idx_services_is_featured ON services(is_featured);
      `);
      
      console.log('   ✅ Services table created!');
    } else {
      console.log('   ✅ Services table already exists');
    }
    
    // Migration 4: Add service_id column to bookings if it doesn't exist
    console.log('   📋 Checking bookings.service_id column...');
    
    const serviceIdCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'service_id'
    `);
    
    if (serviceIdCheck.rows.length === 0) {
      console.log('   🔄 Adding service_id column to bookings...');
      
      await client.query(`
        ALTER TABLE bookings 
        ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
      `);
      
      // Create index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id)
      `);
      
      console.log('   ✅ service_id column added to bookings!');
    } else {
      console.log('   ✅ bookings.service_id column already exists');
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
