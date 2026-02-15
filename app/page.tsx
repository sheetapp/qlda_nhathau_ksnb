'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Shrub } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
  const supabase = createClient()

  useEffect(() => {
    // Clear any existing session to ensure a fresh login flow if they were redirected
    const clearSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.auth.signOut()
      }
    }
    clearSession()
  }, [supabase])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background font-sans px-4">
      {/* Premium Apple Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />

      <main className="relative z-10 flex flex-col items-center w-full max-sm animate-in fade-in zoom-in duration-1000">
        {/* Minimalist Logo Section */}
        <div className="mb-12 flex flex-col items-center">
          <div className="h-20 w-20 rounded-[28px] bg-secondary/50 shadow-2xl flex items-center justify-center mb-6 border border-border/50 backdrop-blur-sm ring-1 ring-border/25">
            <Shrub className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">KIỂM SOÁT NỘI BỘ</h1>
          <p className="text-muted-foreground mt-2 font-medium">QS - QC - HSE - HCVP - Tài chính KT</p>
        </div>

        {/* Action Section */}
        <div className="w-full flex justify-center">
          <Button
            onClick={handleGoogleLogin}
            className="w-auto px-8 h-12 rounded-xl bg-background hover:bg-muted/50 text-foreground border border-border/50 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.98] font-medium text-base"
            variant="outline"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập với Google
          </Button>
        </div>

        {/* Minimal Footer */}
        <div className="mt-20 text-center">
          <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em] mb-1">
            XÂY DỰNG - NỘI THẤT
          </p>
          <p className="text-[10px] text-foreground/40 font-medium">
            Phiên bản Tháng 1 năm 2026
          </p>
        </div>
      </main>

      <footer className="absolute bottom-8 text-[10px] font-medium text-foreground/60">
        © 2026 | KSNB | 0987 726 236
      </footer>
    </div>
  )
}
