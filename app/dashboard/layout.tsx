import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DynamicHeader } from '@/components/dynamic-header'
import { UserNav } from '@/components/user-nav'

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
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - Cố định bên trái */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar - Header chính */}
        <header className="min-h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 py-3 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <DynamicHeader />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl text-foreground/60 hover:text-primary hover:bg-primary/5">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="h-8 w-[1px] bg-border mx-1" />

            <UserNav user={userData} />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
