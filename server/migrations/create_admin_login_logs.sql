-- Migration: Create admin_login_logs table
-- Purpose: Track admin user logins for auditing and security
-- Created: 2025-12-01

CREATE TABLE IF NOT EXISTS admin_login_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_info JSONB
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_user_id ON admin_login_logs(user_id);

-- Create index on login_timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_timestamp ON admin_login_logs(login_timestamp DESC);

-- Create index on user_email for email-based queries
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_email ON admin_login_logs(user_email);

COMMENT ON TABLE admin_login_logs IS 'Tracks all admin user login events for security auditing';
COMMENT ON COLUMN admin_login_logs.user_id IS 'Stack Auth user ID';
COMMENT ON COLUMN admin_login_logs.user_email IS 'Email address of the user who logged in';
COMMENT ON COLUMN admin_login_logs.login_timestamp IS 'When the login occurred (UTC)';
COMMENT ON COLUMN admin_login_logs.ip_address IS 'IP address of the client';
COMMENT ON COLUMN admin_login_logs.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN admin_login_logs.session_info IS 'Additional session metadata in JSON format';
