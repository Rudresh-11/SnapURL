-- Add google login fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20),
  ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Allow password_hash to be NULL (Google, OAuth users)
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS title VARCHAR(20),

ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS title VARCHAR(20) DEFAULT 'Untitled';

-- Drop the old UNIQUE constraint on username
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_username_key;