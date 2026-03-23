-- ═══════════════════════════════════════════════════════════════════════════
-- 💳 Payment System Tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ADMIN PAYMENT ACCOUNTS TABLE
-- Stores admin's bank account or card details for receiving payments
CREATE TABLE IF NOT EXISTS admin_payment_accounts (
    id SERIAL PRIMARY KEY,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('bank_account', 'visa_card', 'mastercard', 'mobile_money')),
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255),
    card_last_four VARCHAR(4),
    expiry_date VARCHAR(7), -- MM/YYYY format
    mobile_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROMOTION PAYMENTS TABLE
-- Tracks payments made by providers for promotions/verifications
CREATE TABLE IF NOT EXISTS promotion_payments (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('verification', 'featured_listing', 'premium_badge', 'top_placement')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    
    -- Provider's payment details
    provider_card_number VARCHAR(19) NOT NULL, -- Stored encrypted in production
    provider_card_holder VARCHAR(255) NOT NULL,
    provider_card_expiry VARCHAR(7),
    provider_card_cvv VARCHAR(4), -- Should be encrypted, never stored in production
    
    -- Admin account that received payment
    admin_account_id INTEGER REFERENCES admin_payment_accounts(id),
    
    -- Payment status and tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    transaction_reference VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    
    -- Metadata
    description TEXT,
    duration_days INTEGER, -- How long the promotion lasts
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Audit fields
    processed_by INTEGER REFERENCES admin_users(id),
    processed_at TIMESTAMP,
    refunded_by INTEGER REFERENCES admin_users(id),
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROMOTION PRICING TABLE
-- Defines pricing for different promotion types
CREATE TABLE IF NOT EXISTS promotion_pricing (
    id SERIAL PRIMARY KEY,
    promotion_type VARCHAR(50) NOT NULL UNIQUE CHECK (promotion_type IN ('verification', 'featured_listing', 'premium_badge', 'top_placement')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    duration_days INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default promotion pricing
INSERT INTO promotion_pricing (promotion_type, price, currency, duration_days, description, is_active)
VALUES 
    ('verification', 50000.00, 'TZS', 365, 'Provider verification badge - valid for 1 year', TRUE),
    ('featured_listing', 100000.00, 'TZS', 30, 'Featured listing on homepage - 30 days', TRUE),
    ('premium_badge', 75000.00, 'TZS', 90, 'Premium provider badge - 90 days', TRUE),
    ('top_placement', 150000.00, 'TZS', 30, 'Top placement in search results - 30 days', TRUE)
ON CONFLICT (promotion_type) DO NOTHING;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_payment_accounts_active ON admin_payment_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_payment_accounts_primary ON admin_payment_accounts(is_primary);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_provider ON promotion_payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_status ON promotion_payments(status);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_type ON promotion_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_promotion_pricing_type ON promotion_pricing(promotion_type);

-- Add trigger to update updated_at timestamp (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END
$$;

DROP TRIGGER IF EXISTS update_admin_payment_accounts_updated_at ON admin_payment_accounts;
CREATE TRIGGER update_admin_payment_accounts_updated_at BEFORE UPDATE ON admin_payment_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotion_payments_updated_at ON promotion_payments;
CREATE TRIGGER update_promotion_payments_updated_at BEFORE UPDATE ON promotion_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotion_pricing_updated_at ON promotion_pricing;
CREATE TRIGGER update_promotion_pricing_updated_at BEFORE UPDATE ON promotion_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
