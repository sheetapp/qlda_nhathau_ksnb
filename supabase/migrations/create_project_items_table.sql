-- Create Project Items (Hạng mục) table
CREATE TABLE IF NOT EXISTS project_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE,
    wbs_code TEXT, -- Mã hạng mục (WBS)
    item_name TEXT NOT NULL, -- Tên hạng mục
    unit TEXT, -- Đơn vị tính
    quantity DECIMAL(15,2) DEFAULT 0, -- Khối lượng
    planned_start_date DATE, -- Ngày bắt đầu kế hoạch
    duration_days INTEGER DEFAULT 0, -- Số ngày thực hiện
    planned_end_date DATE, -- Ngày kết thúc kế hoạch
    actual_start_date DATE, -- Ngày bắt đầu thực tế
    actual_end_date DATE, -- Ngày kết thúc thực tế
    completed_quantity DECIMAL(15,2) DEFAULT 0, -- Khối lượng đã hoàn thành
    responsible_user_id TEXT, -- Nhân sự phụ trách (email hoặc ID)
    planned_cost DECIMAL(15,2) DEFAULT 0, -- Chi phí kế hoạch
    actual_cost DECIMAL(15,2) DEFAULT 0, -- Chi phí thực tế
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add project_item_id to tasks table to link tasks to items
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_item_id UUID REFERENCES project_items(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read for project_items" ON project_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage project_items" ON project_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON project_items(project_id);

-- Comment
COMMENT ON TABLE project_items IS 'Bảng quản lý Hạng mục trong dự án (Dự án -> Hạng mục -> Công việc)';
