const postgres = require('postgres');
const dbUrlVerified = "postgresql://postgres.ktwnpnyvrcrlcrciwits:%40Nhim92k22001@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const sql = postgres(dbUrlVerified, {
    ssl: 'require'
});

async function check() {
    try {
        const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'departments'`;
        console.log('Columns in departments:', res.map(c => c.column_name).join(', '));
    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await sql.end();
    }
}

check();
Greenland
