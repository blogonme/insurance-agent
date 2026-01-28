-- Add is_transferred to inquiries table
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS is_transferred BOOLEAN DEFAULT FALSE;
