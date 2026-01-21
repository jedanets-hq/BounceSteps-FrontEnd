/**
 * COMPLETE SYSTEM FIX - All Missing Tables and Relationships
 * This migration creates ALL missing tables for the complete workflow
 */

const { pool } = require('../config/postgresql');

async function fixCompleteSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 FIXING COMPLETE SYSTEM - Creating all missing tables...\n');
    
    // ============================================
    // 1. FIX SERVICES TABLE - Add missing columns
    // ============================================
    console.log('📋 1. Fixing services table...');
    
    // Check if services table exists
    const servicesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'services'
    `);
    
    if (servicesCheck.rows.length === 0) {
      // Create services table
      await client.query(`
        CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          location TEXT,
          country VARCHAR(100) DEFAULT 'Tanzania',
          region VARCHAR(100),
          district VARCHAR(100),
          area VARCHAR(100),
          price DECIMAL(10,2),
          currency VARCHAR(10) DEFAULT 'TZS',
          images JSONB,
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          average_rating DECIMAL(3,2) DEFAULT 0.00,
          review_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ Services table created');
    } else {
      // Add missing columns to existing services table
      const columnsToAdd = [
        { name: 'country', type: 'VARCHAR(100)', default: "'Tanzania'" },
        { name: 'region', type: 'VARCHAR(100)', default: 'NULL' },
        { name: 'district', type: 'VARCHAR(100)', default: 'NULL' },
        { name: 'area', type: 'VARCHAR(100)', default: 'NULL' },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'average_rating', type: 'DECIMAL(3,2)', default: '0.00' },
        { name: 'review_count', type: 'INTEGER', default: '0' }
      ];
      
      for (const col of columnsToAdd) {
        const colCheck = await client.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'services' AND column_name = $1
        `, [col.name]);
        
        if (colCheck.rows.length === 0) {
          await client.query(`
            ALTER TABLE services ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
          `);
          console.log(`   ✅ Added ${col.name} column to services`);
        }
      }
    }
    
    // Create indexes for services
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_region ON services(region);
      CREATE INDEX IF NOT EXISTS idx_services_district ON services(district);
      CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
      CREATE INDEX IF NOT EXISTS idx_services_is_featured ON services(is_featured);
    `);
    console.log('   ✅ Services indexes created\n');
    
    // ============================================
    // 2. FIX BOOKINGS TABLE - Add missing columns
    // ============================================
    console.log('📋 2. Fixing bookings table...');
    
    const bookingsColumnsToAdd = [
      { name: 'service_id', type: 'INTEGER', references: 'REFERENCES services(id) ON DELETE CASCADE' },
      { name: 'participants', type: 'INTEGER', default: '1' },
      { name: 'travel_date', type: 'TIMESTAMP', default: 'NULL' },
      { name: 'special_requests', type: 'TEXT', default: 'NULL' },
      { name: 'traveler_first_name', type: 'VARCHAR(100)', default: 'NULL' },
      { name: 'traveler_last_name', type: 'VARCHAR(100)', default: 'NULL' },
      { name: 'service_title', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'service_images', type: 'JSONB', default: 'NULL' },
      { name: 'service_description', type: 'TEXT', default: 'NULL' },
      { name: 'service_location', type: 'TEXT', default: 'NULL' },
      { name: 'business_name', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'provider_phone', type: 'VARCHAR(20)', default: 'NULL' },
      { name: 'provider_email', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'total_price', type: 'DECIMAL(10,2)', default: 'NULL' }
    ];
    
    for (const col of bookingsColumnsToAdd) {
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = $1
      `, [col.name]);
      
      if (colCheck.rows.length === 0) {
        if (col.references) {
          await client.query(`
            ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type} ${col.references}
          `);
        } else {
          await client.query(`
            ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
          `);
        }
        console.log(`   ✅ Added ${col.name} column to bookings`);
      }
    }
    
    // Create indexes for bookings
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);
    `);
    console.log('   ✅ Bookings indexes created\n');
    
    // ============================================
    // 3. CREATE CART TABLE
    // ============================================
    console.log('📋 3. Creating cart table...');
    
    const cartCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'cart'
    `);
    
    if (cartCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE cart (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
          quantity INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, service_id)
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
        CREATE INDEX IF NOT EXISTS idx_cart_service_id ON cart(service_id);
      `);
      
      console.log('   ✅ Cart table created\n');
    } else {
      console.log('   ✅ Cart table already exists\n');
    }
    
    // ============================================
    // 4. CREATE FAVORITES TABLE
    // ============================================
    console.log('📋 4. Creating favorites table...');
    
    const favoritesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'favorites'
    `);
    
    if (favoritesCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, service_id)
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_service_id ON favorites(service_id);
      `);
      
      console.log('   ✅ Favorites table created\n');
    } else {
      console.log('   ✅ Favorites table already exists\n');
    }
    
    // ============================================
    // 5. CREATE REVIEWS/RATINGS TABLE
    // ============================================
    console.log('📋 5. Creating reviews table...');
    
    const reviewsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reviews'
    `);
    
    if (reviewsCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
          provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, service_id)
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
      `);
      
      console.log('   ✅ Reviews table created\n');
    } else {
      console.log('   ✅ Reviews table already exists\n');
    }
    
    // ============================================
    // 6. CREATE MULTI-TRIP JOURNEYS TABLE
    // ============================================
    console.log('📋 6. Creating multi-trip journeys table...');
    
    const journeysCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'multi_trip_journeys'
    `);
    
    if (journeysCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE multi_trip_journeys (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          journey_name VARCHAR(255) NOT NULL,
          destinations JSONB NOT NULL,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          travelers INTEGER DEFAULT 1,
          budget DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'booked', 'completed', 'cancelled')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_multi_trip_user_id ON multi_trip_journeys(user_id);
        CREATE INDEX IF NOT EXISTS idx_multi_trip_status ON multi_trip_journeys(status);
        CREATE INDEX IF NOT EXISTS idx_multi_trip_start_date ON multi_trip_journeys(start_date);
      `);
      
      console.log('   ✅ Multi-trip journeys table created\n');
    } else {
      console.log('   ✅ Multi-trip journeys table already exists\n');
    }
    
    // ============================================
    // 7. CREATE JOURNEY SERVICES JUNCTION TABLE
    // ============================================
    console.log('📋 7. Creating journey_services junction table...');
    
    const journeyServicesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'journey_services'
    `);
    
    if (journeyServicesCheck.rows.length === 0) {
      await client.query(`
        CREATE TABLE journey_services (
          id SERIAL PRIMARY KEY,
          journey_id INTEGER REFERENCES multi_trip_journeys(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
          destination_index INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(journey_id, service_id)
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_journey_services_journey_id ON journey_services(journey_id);
        CREATE INDEX IF NOT EXISTS idx_journey_services_service_id ON journey_services(service_id);
      `);
      
      console.log('   ✅ Journey services junction table created\n');
    } else {
      console.log('   ✅ Journey services junction table already exists\n');
    }
    
    // ============================================
    // 8. FIX SERVICE_PROVIDERS TABLE
    // ============================================
    console.log('📋 8. Fixing service_providers table...');
    
    const providerColumnsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)', default: 'NULL' },
      { name: 'email', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'is_premium', type: 'BOOLEAN', default: 'false' }
    ];
    
    for (const col of providerColumnsToAdd) {
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'service_providers' AND column_name = $1
      `, [col.name]);
      
      if (colCheck.rows.length === 0) {
        await client.query(`
          ALTER TABLE service_providers ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
        `);
        console.log(`   ✅ Added ${col.name} column to service_providers`);
      }
    }
    console.log('   ✅ Service providers table fixed\n');
    
    console.log('✅✅✅ COMPLETE SYSTEM FIX DONE! All tables created successfully!\n');
    
  } catch (error) {
    console.error('❌ Complete system fix error:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { fixCompleteSystem };
