-- Migration 017: Multi-Provider OAuth Authentication Schema (Google, Discord, Facebook)
-- Safe, idempotent DDL for ZenithFCM

-- 1. Ensure required extensions and timestamp helper function exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Adapt existing users table (Backward Compatible)
-- Create users table if not already present (e.g., in clean test environments)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text,
  password_hash text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  is_active boolean NOT NULL DEFAULT TRUE,
  session_version integer NOT NULL DEFAULT 1 CHECK (session_version >= 1),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Make password_hash and email nullable for OAuth-first users (idempotent in Postgres)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add display_name column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text DEFAULT '';

-- Add avatar_url column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Backfill display_name from existing name if blank
UPDATE users
SET display_name = name
WHERE (display_name IS NULL OR display_name = '') AND (name IS NOT NULL AND name <> '');

-- Ensure defaults on name and display_name
ALTER TABLE users ALTER COLUMN display_name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- Update role constraint to allow 'user' alongside 'admin' and 'editor'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'user'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- Ensure unique index on lower-case email
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email))
  WHERE email IS NOT NULL;

-- 3. Create oauth_accounts table for multi-provider identities
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'discord', 'facebook')),
  provider_user_id text NOT NULL,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT oauth_accounts_provider_uid_unique UNIQUE (provider, provider_user_id),
  CONSTRAINT oauth_accounts_user_provider_unique UNIQUE (user_id, provider)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'oauth_accounts_user_provider_unique'
  ) THEN
    ALTER TABLE oauth_accounts ADD CONSTRAINT oauth_accounts_user_provider_unique UNIQUE (user_id, provider);
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id
  ON oauth_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_uid
  ON oauth_accounts(provider, provider_user_id);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_email
  ON oauth_accounts(LOWER(email))
  WHERE email IS NOT NULL;

DROP TRIGGER IF EXISTS oauth_accounts_set_updated_at ON oauth_accounts;
CREATE TRIGGER oauth_accounts_set_updated_at
  BEFORE UPDATE ON oauth_accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. Create sessions table for database-backed session management
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  user_agent text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT sessions_token_unique UNIQUE (session_token)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_session_token
  ON sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);

DROP TRIGGER IF EXISTS sessions_set_updated_at ON sessions;
CREATE TRIGGER sessions_set_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
