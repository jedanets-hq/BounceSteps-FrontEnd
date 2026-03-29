/**
 * Add services table and related tables to the database
 */

require('dotenv').config();
const { pool } = require('../models');

async function addServicesTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding services and related tables...');
    
    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'TZS',
        duration VARCHAR(100),
        max_participants INTEGER,
        location VARCHAR(255),
        region VARCHAR(100),
        district VARCHAR(100),
        area VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Tanzania',
        images TEXT,
        amenities TEXT,
        availability JSONB,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
        promotion_type VARCHAR(50),
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_bookings INTEGER DEFAULT 0,
        payment_methods TEXT,
        contact_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Services table created');
    
    // Create cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, service_id)
      )
    `);
    console.log('✅ Cart table created');
    
    // Create favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, provider_id)
      )
    `);
    console.log('✅ Favorites table created');
    
    // Create plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        plan_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Plans table created');
    
    // Create traveler_stories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS traveler_stories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        images TEXT,
        location VARCHAR(255),
        trip_date DATE,
        is_featured BOOLEAN DEFAULT FALSE,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Traveler stories table created');
    
    // Create multi_trip_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS multi_trip_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        destinations JSONB,
        services JSONB,
        total_budget DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Multi-trip plans table created');
    
    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
      CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
      CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);
      CREATE INDEX IF NOT EXISTS idx_traveler_stories_user ON traveler_stories(user_id);
    `);
    console.log('✅ Database indexes created');
    
    console.log('✅ All tables and indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { addServicesTables };

// Run if called directly
if (require.main === module) {
  addServicesTables()
    .then(() => {
      console.log('✅ Services tables added successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add services tables:', error);
      process.exit(1);
    });
}
