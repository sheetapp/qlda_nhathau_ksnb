import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile from the 'users' table
  const { data: profile } = await supabase
    .from('users')
    .select('email, full_name, position, avatar_url')
    .eq('email', user.email)
    .single()

  const userData = {
    email: user.email,
    full_name: profile?.full_name || user.email?.split('@')[0] || 'User',
    position: profile?.position || 'Administrator',
    avatar_url: profile?.avatar_url,
  }

  return (
    <DashboardShell user={userData}>
      {children}
    </DashboardShell>
  )
}
