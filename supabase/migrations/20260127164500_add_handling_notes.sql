-- Add handling_notes to inquiries table
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS handling_notes TEXT;
