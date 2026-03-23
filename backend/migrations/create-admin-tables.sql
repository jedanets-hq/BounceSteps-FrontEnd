-- ═══════════════════════════════════════════════════════════════════════════
-- 🔐 ADMIN PORTAL TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create provider_badges table
CREATE TABLE IF NOT EXISTS provider_badges (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'verified', 'premium', 'top_rated', 'eco_friendly', 'local_expert'
  assigned_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  notes TEXT,
  UNIQUE(provider_id) -- Only ONE badge per provider
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_badges_provider_id ON provider_badges(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_badges_badge_type ON provider_badges(badge_type);

-- Insert default super admin (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (email, password, full_name, role, permissions, is_active)
VALUES (
  'admin@isafari.global',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgONyK', -- admin123
  'Super Administrator',
  'super_admin',
  '["*"]'::jsonb,
  true
)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE admin_users IS 'Admin portal users with role-based access control';
COMMENT ON TABLE admin_audit_log IS 'Audit log for all admin actions';
COMMENT ON TABLE provider_badges IS 'Provider badges (only ONE badge per provider)';
