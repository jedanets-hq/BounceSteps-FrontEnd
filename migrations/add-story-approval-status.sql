-- Add approval status to traveler_stories table
-- This migration adds status column for admin approval workflow

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'traveler_stories' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE traveler_stories 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
        
        -- Add index for faster queries
        CREATE INDEX idx_traveler_stories_status ON traveler_stories(status);
        
        -- Update existing stories to approved (backward compatibility)
        UPDATE traveler_stories SET status = 'approved' WHERE status IS NULL;
        
        RAISE NOTICE 'Added status column to traveler_stories table';
    ELSE
        RAISE NOTICE 'Status column already exists in traveler_stories table';
    END IF;
END $$;
