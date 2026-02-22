-- Create Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    project_id TEXT REFERENCES projects(project_id) ON DELETE SET NULL,
    manager_name TEXT,
    manager_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read for warehouses" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage warehouses" ON warehouses
    FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_project_id ON warehouses(project_id);

-- Comment
COMMENT ON TABLE warehouses IS 'Bảng quản lý danh mục Kho bãi trong hệ thống';
