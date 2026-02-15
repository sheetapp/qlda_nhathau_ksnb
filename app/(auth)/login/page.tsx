'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shrub, Loader2 } from 'lucide-react'
import { useEffect, Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if there's an error in the URL
    const urlError = searchParams.get('error')
    if (urlError === 'unauthorized') {
      setError('Tài khoản Google của bạn chưa được cấp quyền truy cập hệ thống. Vui lòng liên hệ Admin.')
    }

    // Clear any existing session to ensure a fresh login flow
    const clearSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.auth.signOut()
      }
    }
    clearSession()
  }, [supabase, searchParams])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Đã có lỗi xảy ra khi đăng nhập')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background font-sans px-4">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-[440px] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-card/70 backdrop-blur-2xl rounded-[32px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardHeader className="pt-12 pb-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
            <Shrub className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-base mt-2 text-muted-foreground">
            Đăng nhập để bắt đầu trải nghiệm Kiểm soát Tài chính Doanh nghiệp
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-12 px-8">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] font-bold text-lg"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
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
            )}
            {isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
          </Button>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest px-4 leading-relaxed">
              Báo cáo trực quan | Phê duyệt theo quy trình
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="absolute bottom-6 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
        Secure Authentication Gateway
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-medium animate-pulse">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  )
}
