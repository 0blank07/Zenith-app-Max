CREATE TABLE IF NOT EXISTS redeem_code_votes (
  code_id uuid PRIMARY KEY REFERENCES redeem_codes(id) ON DELETE CASCADE,
  worked_count integer NOT NULL DEFAULT 0 CHECK (worked_count >= 0),
  expired_count integer NOT NULL DEFAULT 0 CHECK (expired_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redeem_code_votes_updated_at
  ON redeem_code_votes(updated_at DESC);

CREATE TABLE IF NOT EXISTS redeem_code_vote_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES redeem_codes(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('worked', 'expired')),
  voter_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redeem_code_vote_logs_throttle
  ON redeem_code_vote_logs(code_id, voter_hash, created_at DESC);

DROP TRIGGER IF EXISTS redeem_code_votes_set_updated_at ON redeem_code_votes;
CREATE TRIGGER redeem_code_votes_set_updated_at
  BEFORE UPDATE ON redeem_code_votes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
