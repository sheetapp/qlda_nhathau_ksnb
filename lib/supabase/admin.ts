import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with service role key.
 * Used for administrative operations that bypass RLS.
 * 
 * NOTE: This is initialized lazily to avoid build-time errors when 
 * environment variables are not yet available.
 */
export function createAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        // During build time, variables might be missing. 
        // We return a proxy or handle it gracefully to avoid crashing the build.
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ Missing Supabase admin credentials. Using dummy client for build.')
        }

        // Return a minimal proxy to avoid "is not a module" or null pointer errors
        return createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            serviceRoleKey || 'placeholder-key'
        )
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Global instance for reuse in runtime
let adminInstance: SupabaseClient | null = null

export const getAdminClient = (): SupabaseClient => {
    if (!adminInstance) {
        adminInstance = createAdminClient()
    }
    return adminInstance
}
