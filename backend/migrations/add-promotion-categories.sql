-- Add promotion categories columns to services table
-- These columns enable different levels of service promotion

-- Add search priority (0-100, higher = better ranking in search results)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS search_priority INTEGER DEFAULT 0 CHECK (search_priority >= 0 AND search_priority <= 100);

-- Add category priority (0-100, higher = appears first in category listings)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category_priority INTEGER DEFAULT 0 CHECK (category_priority >= 0 AND category_priority <= 100);

-- Add enhanced listing flag (shows more details, larger images)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_enhanced_listing BOOLEAN DEFAULT FALSE;

-- Add increased visibility flag (appears in more sections)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS has_increased_visibility BOOLEAN DEFAULT FALSE;

-- Add carousel priority (0-100, higher = appears first in homepage carousel)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS carousel_priority INTEGER DEFAULT 0 CHECK (carousel_priority >= 0 AND carousel_priority <= 100);

-- Add maximum visibility flag (appears everywhere possible)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS has_maximum_visibility BOOLEAN DEFAULT FALSE;

-- Add promotion expiration date
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_services_search_priority ON services(search_priority DESC);
CREATE INDEX IF NOT EXISTS idx_services_category_priority ON services(category_priority DESC);
CREATE INDEX IF NOT EXISTS idx_services_carousel_priority ON services(carousel_priority DESC);
CREATE INDEX IF NOT EXISTS idx_services_promotion_expires ON services(promotion_expires_at);

-- Add comment explaining the promotion system
COMMENT ON COLUMN services.search_priority IS 'Priority in search results (0-100, higher = better ranking)';
COMMENT ON COLUMN services.category_priority IS 'Priority in category listings (0-100, higher = appears first)';
COMMENT ON COLUMN services.is_enhanced_listing IS 'Shows enhanced details with larger images';
COMMENT ON COLUMN services.has_increased_visibility IS 'Appears in more sections across the platform';
COMMENT ON COLUMN services.carousel_priority IS 'Priority in homepage carousel (0-100, higher = appears first)';
COMMENT ON COLUMN services.has_maximum_visibility IS 'Maximum visibility across all platform sections';
COMMENT ON COLUMN services.promotion_expires_at IS 'Date when promotion settings expire and reset to defaults';
