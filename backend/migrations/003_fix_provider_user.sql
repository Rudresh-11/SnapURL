ALTER TABLE users
ALTER COLUMN provider SET DEFAULT 'local';

-- Fill missing provider values
UPDATE users
SET provider = 'local'
WHERE provider IS NULL;