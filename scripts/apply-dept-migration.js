const postgres = require('postgres');
// Using DIRECT connection host and port 5432
const dbUrlVerified = "postgresql://postgres:%40Nhim92k22001@db.ktwnpnyvrcrlcrciwits.supabase.co:5432/postgres";

const sql = postgres(dbUrlVerified, {
    ssl: 'require'
});

async function run() {
    try {
        console.log('Applying migration via direct connection...');
        await sql`ALTER TABLE departments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES departments(id) ON DELETE CASCADE`;
        await sql`CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id)`;
        console.log('Migration successful!');

        const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'departments'`;
        console.log('Columns in departments:', res.map(c => c.column_name).join(', '));
    } catch (error) {
        console.error('Operation failed:', error);
    } finally {
        await sql.end();
    }
}

run();
