-- Migration: Add payment_methods and contact_info columns to services table
-- Date: 2025-12-16

-- Add payment_methods column (JSONB for storing payment method details)
ALTER TABLE services ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}';

-- Add contact_info column (JSONB for storing contact information)
ALTER TABLE services ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN services.payment_methods IS 'JSON object containing payment methods: visa, paypal, google_pay, mobile_money with their details';
COMMENT ON COLUMN services.contact_info IS 'JSON object containing contact info: email, whatsapp with their details';

-- Example payment_methods structure:
-- {
--   "visa": { "enabled": true, "card_number": "****1234", "card_holder": "John Doe" },
--   "paypal": { "enabled": true, "email": "provider@email.com" },
--   "google_pay": { "enabled": false },
--   "mobile_money": { "enabled": true, "provider": "M-Pesa", "phone": "+255123456789" }
-- }

-- Example contact_info structure:
-- {
--   "email": { "enabled": true, "address": "provider@email.com" },
--   "whatsapp": { "enabled": true, "number": "+255123456789" }
-- }
