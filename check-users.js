const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkUsers() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: users, error } = await supabase
        .from('users')
        .select('email, full_name, access_level')

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log('Users in database:')
    console.table(users)
}

checkUsers()
