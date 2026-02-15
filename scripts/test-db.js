const postgres = require('postgres');
// Trying the direct DATABASE_URL from .env.local with manual fixes
const dbUrl = "postgresql://postgres.ktwnpnyvrcrlcrciwits:%40Nhim92k22001@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const sql = postgres(dbUrl, {
    ssl: 'require',
    connect_timeout: 10
});

async function test() {
    try {
        console.log('Testing connection to Supabase...');
        const result = await sql`SELECT version()`;
        console.log('Connection successful!', result[0]);

        console.log('Creating files table...');
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
        console.log('Table files created.');

        await sql`CREATE INDEX IF NOT EXISTS idx_files_ref ON public.files(table_name, ref_id)`;
        await sql`ALTER TABLE public.files ENABLE ROW LEVEL SECURITY`;

        // Grant permissions
        await sql`GRANT ALL ON public.files TO postgres, authenticated, service_role`;

        console.log('All done!');
    } catch (err) {
        console.error('Test failed:', err);
        // Try to explain the error
        if (err.message.includes('Tenant or user not found')) {
            console.log('HINT: This error often means the Supabase project reference in the username is wrong or the pooler is misconfigured.');
        }
    } finally {
        await sql.end();
    }
}

test();
