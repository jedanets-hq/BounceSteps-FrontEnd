/**
 * Initialize database tables for iSafari application
 */

const { pool } = require('../config/postgresql');

async function initializeTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('traveler', 'service_provider')),
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        auth_provider VARCHAR(20) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'both')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');
    
    // Create service_providers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_providers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100),
        description TEXT,
        location TEXT,
        service_location TEXT,
        country VARCHAR(100),
        region VARCHAR(100),
        district VARCHAR(100),
        area VARCHAR(100),
        ward VARCHAR(100),
        location_data JSONB,
        service_categories JSONB,
        is_verified BOOLEAN DEFAULT false,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_bookings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Service providers table ready');
    
    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
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
    console.log('✅ Services table ready');
    
    // Create bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
        service_type VARCHAR(100),
        booking_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed')),
        total_amount DECIMAL(10,2),
        booking_details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Bookings table ready');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
      CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
      CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
      CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
      CREATE INDEX IF NOT EXISTS idx_services_is_featured ON services(is_featured);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `);
    console.log('✅ Database indexes created');
    
    console.log('✅ Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { initializeTables };

// Run if called directly
if (require.main === module) {
  initializeTables()
    .then(() => {
      console.log('✅ Tables initialized successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to initialize tables:', error);
      process.exit(1);
    });
}
