-- ═══════════════════════════════════════════════════════════════════════════
-- 🗄️  iSafari Local Database Setup Script
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this script in PostgreSQL to create your local database
-- Command: psql -U postgres -f setup-local-database.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Create database
DROP DATABASE IF EXISTS "bouncesteps-db";
CREATE DATABASE "bouncesteps-db";

-- Connect to the database
\c "bouncesteps-db";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('traveler', 'service_provider', 'admin')),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    profile_picture TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICE PROVIDERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE service_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone VARCHAR(50),
    business_email VARCHAR(255),
    business_website VARCHAR(255),
    business_logo TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICES TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    location VARCHAR(255),
    region VARCHAR(100),
    district VARCHAR(100),
    area VARCHAR(100),
    images TEXT[],
    amenities TEXT[],
    availability JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    promotion_type VARCHAR(50),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    payment_methods JSONB,
    contact_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CART TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BOOKINGS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FAVORITES TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PLANS TABLE (Trip Planning)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    plan_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRAVELER STORIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE traveler_stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    location VARCHAR(255),
    trip_date DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- MULTI-TRIP PLANS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE multi_trip_plans (
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
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_location ON services(location);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT SAMPLE DATA (Optional - for testing)
-- ═══════════════════════════════════════════════════════════════════════════

-- Sample Admin User
INSERT INTO users (email, password, user_type, full_name, phone, is_verified, is_active)
VALUES ('admin@isafari.com', '$2b$10$YourHashedPasswordHere', 'admin', 'Admin User', '+255123456789', TRUE, TRUE);

-- Sample Service Provider
INSERT INTO users (email,