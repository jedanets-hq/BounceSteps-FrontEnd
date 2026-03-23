-- Create messages table for traveller-provider chat
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  traveller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('traveller', 'provider')),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_traveller ON messages(traveller_id);
CREATE INDEX IF NOT EXISTS idx_messages_provider ON messages(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_service ON messages(service_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
