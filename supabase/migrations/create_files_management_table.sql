-- Create a unified files table for all attachments across different business modules
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'Attachment' CHECK (type IN ('Tài liệu', 'Ảnh', 'Đính kèm', 'Khác')),
    file_name TEXT, -- Original PC path or filename
    file_url TEXT,  -- Public URL/Link
    table_name TEXT NOT NULL, -- The table this file is attached to (e.g., 'project_inflows')
    ref_id UUID NOT NULL,     -- The specific record ID in that table
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for better performance when querying by record
CREATE INDEX IF NOT EXISTS idx_files_ref ON public.files(table_name, ref_id);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplistic for now, matching app pattern)
CREATE POLICY "Enable read access for all authenticated users" ON public.files
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for all authenticated users" ON public.files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for users based on id" ON public.files
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for users based on id" ON public.files
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions if needed (Admin role usually has it, but following local convention if found)
GRANT ALL ON public.files TO authenticated;
GRANT ALL ON public.files TO service_role;
