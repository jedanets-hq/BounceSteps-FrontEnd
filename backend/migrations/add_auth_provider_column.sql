-- Migration: Add auth_provider column to users table
-- This column tracks how users authenticate (email, google, or both)

-- Add auth_provider column with CHECK constraint
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email' 
CHECK (auth_provider IN ('email', 'google', 'both'));

-- Update existing users with google_id to have auth_provider = 'google'
UPDATE users 
SET auth_provider = 'google' 
WHERE google_id IS NOT NULL AND password IS NULL;

-- Update existing users with both google_id and password to have auth_provider = 'both'
UPDATE users 
SET auth_provider = 'both' 
WHERE google_id IS NOT NULL AND password IS NOT NULL;

-- Create index for auth_provider filtering (used in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- Ensure user_type has proper constraint (if not already exists)
DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_user_type_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_user_type_check 
        CHECK (user_type IN ('traveler', 'service_provider', 'admin'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN users.auth_provider IS 'Authentication method: email (password), google (OAuth), or both (linked accounts)';
