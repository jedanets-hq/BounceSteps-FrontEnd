const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Debug: Log all database-related env vars
console.log('🔍 Environment Check:');
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// PostgreSQL connection configuration
// ALWAYS use DATABASE_URL if it exists (for Render/production)
let poolConfig;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL (Render, Heroku, etc.)
  console.log('🔗 Using DATABASE_URL for connection');
  console.log('  Connection string starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  };
} else {
  // Local development: Use individual environment variables
  console.log('🔗 Using individual DB env vars for connection (DATABASE_URL not found)');
  console.log('  DB_HOST:', process.env.DB_HOST || 'localhost (default)');
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iSafari-Global-Network',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  };
}

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Database initialization queries
const initQueries = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    user_type VARCHAR(20) CHECK (user_type IN ('traveler', 'service_provider')) NOT NULL,
    google_id VARCHAR(255),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Service providers profile table
  `CREATE TABLE IF NOT EXISTS service_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    service_location VARCHAR(255),
    country VARCHAR(100),
    region VARCHAR(100),
    district VARCHAR(100),
    area VARCHAR(100),
    ward VARCHAR(100),
    location_data JSONB,
    service_categories TEXT[],
    license_number VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Services table
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'TZS',
    duration INTEGER,
    max_participants INTEGER,
    location VARCHAR(255),
    country VARCHAR(100),
    region VARCHAR(100),
    district VARCHAR(100),
    area VARCHAR(100),
    images TEXT[],
    amenities TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP NULL,
    featured_priority INTEGER DEFAULT 0,
    promotion_type VARCHAR(50),
    promotion_location VARCHAR(100),
    views_count INTEGER DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    payment_methods JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Bookings table
  `CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    traveler_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    participants INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Reviews table
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    traveler_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    payment_type VARCHAR(50) CHECK (payment_type IN ('premium_membership', 'featured_service', 'booking_payment')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TZS',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    description TEXT,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Notifications table
  `CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Traveler stories table
  `CREATE TABLE IF NOT EXISTS traveler_stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    story TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    highlights TEXT[],
    media JSONB,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Story likes table
  `CREATE TABLE IF NOT EXISTS story_likes (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES traveler_stories(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id)
  )`,

  // Story comments table
  `CREATE TABLE IF NOT EXISTS story_comments (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES traveler_stories(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Service promotions table
  `CREATE TABLE IF NOT EXISTS service_promotions (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    promotion_type VARCHAR(50) CHECK (promotion_type IN ('featured', 'trending', 'search_boost')) NOT NULL,
    promotion_location VARCHAR(100),
    duration_days INTEGER NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Add payment_methods and contact_info columns to services table if they don't exist
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}'`,
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'`,

  // Create indexes for better performance
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)`,
  `CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(rating DESC, total_bookings DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers(country, region)`,
  `CREATE INDEX IF NOT EXISTS idx_service_providers_region_district ON service_providers(region, district, ward)`,
  `CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category, is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured, featured_until)`,
  `CREATE INDEX IF NOT EXISTS idx_services_promotion ON services(promotion_type, promotion_location)`,
  `CREATE INDEX IF NOT EXISTS idx_services_location ON services(location)`,
  `CREATE INDEX IF NOT EXISTS idx_services_country_region ON services(country, region, district)`,
  `CREATE INDEX IF NOT EXISTS idx_services_price ON services(price)`,
  `CREATE INDEX IF NOT EXISTS idx_services_rating ON services(average_rating DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_traveler_id ON bookings(traveler_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_traveler_id ON reviews(traveler_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type, payment_status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_traveler_stories_user_id ON traveler_stories(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_traveler_stories_approved ON traveler_stories(is_approved, is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_traveler_stories_created ON traveler_stories(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id)`,
  `CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id)`,
  `CREATE INDEX IF NOT EXISTS idx_story_comments_user_id ON story_comments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_service_promotions_service_id ON service_promotions(service_id)`,
  `CREATE INDEX IF NOT EXISTS idx_service_promotions_expires ON service_promotions(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_service_promotions_type ON service_promotions(promotion_type)`,

  // Create function to update updated_at timestamp
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql'`,

  // Create triggers for updated_at
  `DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
  `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers`,
  `CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_services_updated_at ON services`,
  `CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings`,
  `CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_payments_updated_at ON payments`,
  `CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_traveler_stories_updated_at ON traveler_stories`,
  `CREATE TRIGGER update_traveler_stories_updated_at BEFORE UPDATE ON traveler_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  
  `DROP TRIGGER IF EXISTS update_story_comments_updated_at ON story_comments`,
  `CREATE TRIGGER update_story_comments_updated_at BEFORE UPDATE ON story_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
];

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing PostgreSQL database tables...');
    
    for (const query of initQueries) {
      await client.query(query);
    }
    
    console.log('✅ PostgreSQL database initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Connect and initialize
const connectPostgreSQL = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'iSafari-Global-Network'}`);
    client.release();
    
    // Initialize tables
    await initializeDatabase();
    
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectPostgreSQL,
  initializeDatabase
};