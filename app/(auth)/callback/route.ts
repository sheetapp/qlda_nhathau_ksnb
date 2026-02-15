import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Logic to auto-create user in public.users if not exists
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Use a clean Supabase client with Service Role Key for admin tasks (bypassing RLS)
        const adminClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        // Check if user exists
        const { data: existingUser } = await adminClient
          .from('users')
          .select('email')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          // Create new user with default values
          const { error: insertError } = await adminClient
            .from('users')
            .insert({
              email: user.email,
              full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'New User',
              avatar_url: user.user_metadata.avatar_url,
              access_level: 4, // Default to Staff
              created_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error auto-registering user:', insertError)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
