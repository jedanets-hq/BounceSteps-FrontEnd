-- Add is_featured and is_trending columns to services table
-- These columns allow admin to control which services appear on homepage

-- Add is_featured column (for home slides)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add is_trending column (for trending services section)
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_is_featured ON services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_is_trending ON services(is_trending) WHERE is_trending = true;

-- Add comments for documentation
COMMENT ON COLUMN services.is_featured IS 'Whether service appears in homepage featured slides';
COMMENT ON COLUMN services.is_trending IS 'Whether service appears in trending services section';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully added is_featured and is_trending columns to services table';
END $$;
