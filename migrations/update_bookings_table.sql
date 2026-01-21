-- Update bookings table to support pre-orders with service_id
-- This allows bookings to reference specific services

-- Add service_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE;
    COMMENT ON COLUMN bookings.service_id IS 'Reference to the service being booked';
  END IF;
END $$;

-- Add participants column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'participants'
  ) THEN
    ALTER TABLE bookings ADD COLUMN participants INTEGER DEFAULT 1;
    COMMENT ON COLUMN bookings.participants IS 'Number of people participating in the booking';
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Add comment
COMMENT ON TABLE bookings IS 'Bookings and pre-orders for services';
