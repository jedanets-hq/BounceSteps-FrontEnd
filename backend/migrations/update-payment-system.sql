-- ═══════════════════════════════════════════════════════════════════════════
-- 💳 Payment System Update - Add Missing Tables and Columns
-- ═══════════════════════════════════════════════════════════════════════════

-- ADMIN PAYMENT ACCOUNTS TABLE (New)
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

-- PROMOTION PRICING TABLE (New)
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

-- Update existing promotion_payments table to add missing columns
DO $$
BEGIN
    -- Add admin_account_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'admin_account_id') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN admin_account_id INTEGER REFERENCES admin_payment_accounts(id);
    END IF;

    -- Add provider card details if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'provider_card_number') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN provider_card_number VARCHAR(19);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'provider_card_holder') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN provider_card_holder VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'provider_card_expiry') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN provider_card_expiry VARCHAR(7);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'provider_card_cvv') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN provider_card_cvv VARCHAR(4);
    END IF;

    -- Add transaction_reference if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'transaction_reference') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN transaction_reference VARCHAR(255) UNIQUE;
    END IF;

    -- Add description if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'description') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN description TEXT;
    END IF;

    -- Add duration_days if not exists (different from promotion_duration_days)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'duration_days') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN duration_days INTEGER;
    END IF;

    -- Add start_date and end_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'start_date') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN start_date TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'end_date') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN end_date TIMESTAMP;
    END IF;

    -- Add processed_by and processed_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'processed_by') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN processed_by INTEGER REFERENCES admin_users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotion_payments' AND column_name = 'processed_at') THEN
        ALTER TABLE promotion_payments 
        ADD COLUMN processed_at TIMESTAMP;
    END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_promotion_payments_promotion_type ON promotion_payments(promotion_type);
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
END $$;

DROP TRIGGER IF EXISTS update_admin_payment_accounts_updated_at ON admin_payment_accounts;
CREATE TRIGGER update_admin_payment_accounts_updated_at BEFORE UPDATE ON admin_payment_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotion_pricing_updated_at ON promotion_pricing;
CREATE TRIGGER update_promotion_pricing_updated_at BEFORE UPDATE ON promotion_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
