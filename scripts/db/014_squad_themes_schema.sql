CREATE TABLE IF NOT EXISTS squad_themes (
  id text PRIMARY KEY,
  name text NOT NULL,
  background_url text NOT NULL,
  class_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS squad_themes_created_at_idx ON squad_themes (created_at DESC);
