const postgres = require('postgres');
// URL from .env.local
const dbUrl = "postgresql://postgres.ktwnpnyvrcrlcrciwits:%40Nhim92k22001@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const sql = postgres(dbUrl, {
    ssl: 'require'
});

async function migrate() {
    console.log('Creating files table...');

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS public.files (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'Attachment' CHECK (type IN ('Tài liệu', 'Ảnh', 'Đính kèm', 'Khác')),
                file_name TEXT,
                file_url TEXT,
                table_name TEXT NOT NULL,
                ref_id UUID NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now(),
                created_by UUID
            )
        `;
        console.log('   files table created.');

        // Add index
        await sql`CREATE INDEX IF NOT EXISTS idx_files_ref ON public.files(table_name, ref_id)`;
        console.log('   Index created.');

        // Enable RLS
        await sql`ALTER TABLE public.files ENABLE ROW LEVEL SECURITY`;
        console.log('   RLS enabled.');

        // Policies (Simplified for pooled connection, using raw SQL strings)
        await sql`DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.files`;
        await sql`
            CREATE POLICY "Enable all access for authenticated users" ON public.files
            FOR ALL USING (true)
        `;
        console.log('   Policy created.');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();
