-- Create provider_followers table
CREATE TABLE IF NOT EXISTS provider_followers (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, follower_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_provider_followers_provider ON provider_followers(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_followers_follower ON provider_followers(follower_id);

-- Add comment
COMMENT ON TABLE provider_followers IS 'Tracks which travelers follow which service providers';
