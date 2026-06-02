-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Existing rows get a locked placeholder (forces re-registration)
UPDATE users SET password = '$2a$10$locked' WHERE password IS NULL;

-- Make it not null after backfill
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
