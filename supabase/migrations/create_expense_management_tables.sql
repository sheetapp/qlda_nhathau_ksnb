-- Create Expense Categories table
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name TEXT NOT NULL, -- Loại chi phí
    group_name TEXT NOT NULL, -- Nhóm chi phí
    project_id TEXT, -- Mã dự án (có thể là ID hoặc Code tùy theo thiết kế, để text cho linh hoạt)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add approved_by to dntt table for the approver avatar/name feature
ALTER TABLE dntt ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE dntt ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES users(id); -- Optional, for more robust joins

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public read for expense_categories" ON expense_categories FOR SELECT USING (true);

-- Authenticated insert/update/delete
CREATE POLICY "Authenticated users can manage expense_categories" ON expense_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE expense_categories IS 'Bảng quản lý danh mục chi phí (Loại chi phí, Nhóm chi phí)';
