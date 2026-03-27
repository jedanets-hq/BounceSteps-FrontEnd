-- Migration: Add date_of_birth column to users table
-- Date: 2024-03-27
-- Description: Add date_of_birth field to store user's birth date for age verification

-- Add date_of_birth column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add comment to the column
COMMENT ON COLUMN users.date_of_birth IS 'User date of birth for age verification (18+ required for travelers)';
