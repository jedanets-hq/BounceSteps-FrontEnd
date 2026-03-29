-- Fix database schema for bookings errors
-- Run this script if you're getting "column sp.business_phone does not exist" errors

-- Add business_phone column to service_providers if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_providers' AND column_name = 'business_phone'
    ) THEN
        ALTER TABLE service_providers ADD COLUMN business_phone VARCHAR(50);
        RAISE NOTICE 'Added business_phone column';
    ELSE
        RAISE NOTICE 'business_phone column already exists';
    END IF;
END $$;

-- Add business_email column to service_providers if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_providers' AND column_name = 'business_email'
    ) THEN
        ALTER TABLE service_providers ADD COLUMN business_email VARCHAR(255);
        RAISE NOTICE 'Added business_email column';
    ELSE
        RAISE NOTICE 'business_email column already exists';
    END IF;
END $$;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'service_providers' 
    AND column_name IN ('business_phone', 'business_email')
ORDER BY column_name;
