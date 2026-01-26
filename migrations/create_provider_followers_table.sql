-- Create provider_followers table for follow functionality
CREATE TABLE IF NOT EXISTS provider_followers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_followers_user_id ON provider_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_followers_provider_id ON provider_followers(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_followers_created_at ON provider_followers(created_at);

-- Add comment
COMMENT ON TABLE provider_followers IS 'Stores which travelers follow which service providers';
