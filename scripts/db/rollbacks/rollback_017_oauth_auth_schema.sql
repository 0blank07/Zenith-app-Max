-- Rollback Migration 017: Multi-Provider OAuth Authentication Schema
-- Safe rollback for ZenithFCM

-- 1. Drop sessions table and triggers
DROP TRIGGER IF EXISTS sessions_set_updated_at ON sessions;
DROP TABLE IF EXISTS sessions CASCADE;

-- 2. Drop oauth_accounts table and triggers
DROP TRIGGER IF EXISTS oauth_accounts_set_updated_at ON oauth_accounts;
DROP TABLE IF EXISTS oauth_accounts CASCADE;

-- 3. Safely revert users table customizations
-- Delete OAuth-only users (role = 'user') to satisfy legacy role check constraint
DELETE FROM users WHERE role = 'user';

-- Revert role check constraint back to ('admin', 'editor') and default to 'editor'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'editor';

-- Drop added columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS display_name;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;

-- Restore email NOT NULL constraint if legacy schema required it
UPDATE users SET email = '' WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Restore password_hash NOT NULL constraint if legacy schema required it
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
