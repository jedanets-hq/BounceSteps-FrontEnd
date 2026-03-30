-- Add service_id column to favorites table
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS service_id INTEGER;

-- Add foreign key constraint for service_id
ALTER TABLE favorites 
ADD CONSTRAINT fk_favorites_service 
FOREIGN KEY (service_id) 
REFERENCES services(id) 
ON DELETE CASCADE;

-- Make provider_id nullable since we can favorite either provider or service
ALTER TABLE favorites ALTER COLUMN provider_id DROP NOT NULL;

-- Add check constraint to ensure either provider_id or service_id is set (not both, not neither)
ALTER TABLE favorites 
ADD CONSTRAINT chk_favorites_type 
CHECK (
  (provider_id IS NOT NULL AND service_id IS NULL) OR 
  (provider_id IS NULL AND service_id IS NOT NULL)
);

-- Update unique constraint to include service_id
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_provider_id_key;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS unique_user_provider;

-- Create new unique constraint for user-provider combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_provider 
ON favorites(user_id, provider_id) 
WHERE provider_id IS NOT NULL;

-- Create unique constraint for user-service combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_service 
ON favorites(user_id, service_id) 
WHERE service_id IS NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_service_id ON favorites(service_id);
