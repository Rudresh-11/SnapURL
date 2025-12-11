-- ===========================
-- USERS TABLE UPDATES
-- ===========================

-- Add provider column (safe)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20);

-- Add google_id column if missing
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id TEXT;

-- Add UNIQUE constraint for google_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_google_id_key'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
    END IF;
END$$;

-- Allow password_hash to be NULL for OAuth users
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- Drop UNIQUE constraint on username (safe)
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_username_key;

-- Allow username to be NULL for Google users
ALTER TABLE users
  ALTER COLUMN username DROP NOT NULL;


-- ===========================
-- URLS TABLE UPDATES
-- ===========================

-- Add title column IF NOT EXISTS without default
ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Set default if missing
ALTER TABLE urls
  ALTER COLUMN title SET DEFAULT 'Untitled';

-- Backfill null titles (safe)
UPDATE urls
SET title = 'Untitled'
WHERE title IS NULL;
