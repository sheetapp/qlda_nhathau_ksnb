-- Add parent_id to departments table for hierarchical structure
ALTER TABLE departments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES departments(id) ON DELETE CASCADE;

-- Create index for faster parent/child lookups
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
