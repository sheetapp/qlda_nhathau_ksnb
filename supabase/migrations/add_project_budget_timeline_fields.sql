-- Add Budget Control Fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_planned_budget numeric DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contingency_budget numeric DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'VND';

-- Add Timeline Tracking Fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS planned_duration integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_start_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_end_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percent numeric DEFAULT 0;

-- Optional: Add comments to columns
COMMENT ON COLUMN projects.total_planned_budget IS 'Tổng mức đầu tư được duyệt';
COMMENT ON COLUMN projects.contingency_budget IS 'Ngân sách dự phòng';
COMMENT ON COLUMN projects.currency_code IS 'Mã tiền tệ (VND, USD, etc.)';
COMMENT ON COLUMN projects.planned_duration IS 'Tổng số ngày thi công dự kiến';
COMMENT ON COLUMN projects.actual_start_date IS 'Ngày thực tế khởi công';
COMMENT ON COLUMN projects.actual_end_date IS 'Ngày thực tế nghiệm thu bàn giao';
COMMENT ON COLUMN projects.progress_percent IS '% hoàn thành tổng thể';
