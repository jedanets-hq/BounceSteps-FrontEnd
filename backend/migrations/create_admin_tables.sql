-- ═══════════════════════════════════════════════════════════════════════════
-- 🔐 Admin Portal Database Tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'finance_admin')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROVIDER BADGES TABLE (Single Badge System)
CREATE TABLE IF NOT EXISTS provider_badges (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE UNIQUE,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('verified', 'premium', 'top_rated', 'eco_friendly', 'local_expert')),
    assigned_by INTEGER REFERENCES admin_users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT one_badge_per_provider UNIQUE(provider_id)
);

-- VERIFICATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('identity', 'business', 'badge')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    documents JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT
);

-- PAYMENTS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES service_providers(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    platform_commission DECIMAL(10,2),
    provider_payout DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refunded_by INTEGER REFERENCES admin_users(id),
    refunded_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by INTEGER REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_provider_badges_provider ON provider_badges(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_provider ON verification_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Insert default super admin (password: Admin@123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO admin_users (email, password, full_name, role, is_active)
VALUES ('admin@isafari.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7LjqKNCYSS', 'Super Admin', 'super_admin', TRUE)
ON CONFLICT (email) DO NOTHING;
