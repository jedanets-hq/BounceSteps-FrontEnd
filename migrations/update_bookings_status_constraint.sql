-- Migration: Update bookings status constraint to include 'draft'
-- This allows pre-orders to start as draft before being submitted to provider

-- Drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new constraint with 'draft' status included
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'));

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'bookings'::regclass AND contype = 'c';
