-- Add missing columns for admin portal functionality

-- Add is_verified column to service_providers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='service_providers' AND column_name='is_verified') THEN
    ALTER TABLE service_providers ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='service_providers' AND column_name='business_type') THEN
    ALTER TABLE service_providers ADD COLUMN business_type VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='service_providers' AND column_name='location') THEN
    ALTER TABLE service_providers ADD COLUMN location VARCHAR(255);
  END IF;
END $$;

-- Add likes_count, comments_count and is_featured to traveler_stories table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='traveler_stories' AND column_name='likes_count') THEN
    ALTER TABLE traveler_stories ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='traveler_stories' AND column_name='comments_count') THEN
    ALTER TABLE traveler_stories ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='traveler_stories' AND column_name='is_featured') THEN
    ALTER TABLE traveler_stories ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_service_providers_verified ON service_providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_traveler_stories_likes ON traveler_stories(likes_count);
CREATE INDEX IF NOT EXISTS idx_traveler_stories_featured ON traveler_stories(is_featured);


-- Add booking_id to payments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='payments' AND column_name='booking_id') THEN
    ALTER TABLE payments ADD COLUMN booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for booking_id
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
