import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debug() {
    console.log('Testing pyc fetch...')
    const { data, error } = await adminClient
        .from('pyc')
        .select(`
            *,
            projects (
                project_name
            ),
            pyc_detail (*),
            author:users!created_by (
                full_name,
                avatar_url
            ),
            approver:users!approved_by (
                full_name,
                avatar_url
            )
        `)
        .limit(1)

    if (error) {
        console.error('ERROR DETECTED:')
        console.error(JSON.stringify(error, null, 2))
    } else {
        console.log('Fetch successful!')
        console.log('Query structure:', Object.keys(data[0]))
    }
}

debug()
