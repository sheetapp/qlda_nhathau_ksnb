const postgres = require('postgres');
// URL from .env.local
const dbUrl = "postgresql://postgres.ktwnpnyvrcrlcrciwits:%40Nhim92k22001@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const sql = postgres(dbUrl, {
    ssl: 'require'
});

async function migrate() {
    console.log('Starting migration step-by-step...');

    try {
        console.log('1. Checking projects table...');
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Existing tables:', tables.map(t => t.table_name).join(', '));

        console.log('2. Adding project_id to dntt...');
        try {
            await sql`ALTER TABLE dntt ADD COLUMN project_id text REFERENCES projects(project_id) ON DELETE SET NULL`;
            console.log('   Added project_id to dntt.');
        } catch (e) {
            if (e.code === '42701') {
                console.log('   project_id already exists in dntt.');
            } else {
                console.error('   Failed to add project_id to dntt:', e.message);
            }
        }

        console.log('3. Creating project_inflows table...');
        await sql`
      CREATE TABLE IF NOT EXISTS project_inflows (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id text REFERENCES projects(project_id) ON DELETE CASCADE,
        amount numeric(15, 2) NOT NULL,
        date date NOT NULL,
        description text,
        type text,
        created_at timestamp with time zone DEFAULT now()
      )
    `;
        console.log('   project_inflows table ready.');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();
