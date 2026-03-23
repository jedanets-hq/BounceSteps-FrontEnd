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

-- Create conversations view for easier querying
CREATE OR REPLACE VIEW conversations AS
SELECT DISTINCT
  CASE 
    WHEN m.sender_type = 'traveller' THEN m.traveller_id
    ELSE m.provider_id
  END as user_id,
  CASE 
    WHEN m.sender_type = 'traveller' THEN m.provider_id
    ELSE m.traveller_id
  END as other_user_id,
  m.service_id,
  s.title as service_title,
  MAX(m.created_at) as last_message_time,
  COUNT(CASE WHEN NOT m.is_read AND m.sender_type != 'traveller' THEN 1 END) as unread_count_traveller,
  COUNT(CASE WHEN NOT m.is_read AND m.sender_type != 'provider' THEN 1 END) as unread_count_provider
FROM messages m
LEFT JOIN services s ON m.service_id = s.id
GROUP BY 
  CASE WHEN m.sender_type = 'traveller' THEN m.traveller_id ELSE m.provider_id END,
  CASE WHEN m.sender_type = 'traveller' THEN m.provider_id ELSE m.traveller_id END,
  m.service_id,
  s.title;
