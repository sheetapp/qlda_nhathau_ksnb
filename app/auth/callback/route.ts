import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Check if user exists in our 'users' table
            const { data: dbUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', user.email)
                .single()

            if (!dbUser) {
                // If not, create the user record
                await supabase.from('users').insert({
                    email: user.email,
                    fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                    avatarUrl: user.user_metadata?.avatar_url || null,
                    accessLevel: 4, // Default access level
                })
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/error`)
}
