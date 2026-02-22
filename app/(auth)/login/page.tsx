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
    <div className="min-h-screen flex bg-[#f8f9fa] font-sans overflow-hidden">
      {/* Left Side: Architectural Image (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110"
          style={{
            backgroundImage: `url('/bground.png')`,
          }}
        />
        {/* Subtle overlay to soften the image if needed, matching the light airy feel of the reference */}
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center px-4 sm:px-8 py-12 relative bg-white lg:bg-transparent">
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] lg:shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 lg:p-14 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          {/* Logo & Header */}
          <div className="space-y-3">
            <p className="font-medium text-[#f15a24] text-lg tracking-tight">Your logo</p>
            <h1 className="text-[44px] tracking-tight text-[#1a1a1a] leading-tight">Login</h1>
          </div>

          {/* Form Fields */}
          <div className="space-y-7">
            <div className="space-y-2.5">
              <label className="text-[15px] font-medium text-gray-700 ml-0.5">Email</label>
              <input
                type="email"
                placeholder="username@gmail.com"
                className="w-full h-[54px] px-5 rounded-xl border-gray-100 bg-gray-50/30 border-2 focus:border-[#f15a24]/50 focus:bg-white transition-all outline-none text-gray-800 placeholder:text-gray-300 font-normal"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[15px] font-medium text-gray-700 ml-0.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full h-[54px] px-5 rounded-xl border-gray-100 bg-gray-50/30 border-2 focus:border-[#f15a24]/50 focus:bg-white transition-all outline-none text-gray-800 placeholder:text-gray-300 font-normal"
                />
                <button className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button className="text-[14px] font-medium text-[#f15a24] hover:text-[#d94a1a] transition-colors tracking-tight">
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              className="w-full h-[56px] rounded-xl bg-[#f15a24] hover:bg-[#d94a1a] text-white font-medium text-lg shadow-lg shadow-[#f15a24]/20 transition-all hover:scale-[1.01] active:scale-[0.99] border-none"
            >
              Sign in
            </Button>
          </div>

          {/* Social Logins */}
          <div className="space-y-8">
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-[1.5px] bg-gray-50" />
              <span className="text-[12px] font-medium text-gray-300 whitespace-nowrap px-2 tracking-widest">Or Continue With</span>
              <div className="flex-1 h-[1.5px] bg-gray-50" />
            </div>

            <div className="flex justify-center items-center gap-10">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="p-3.5 rounded-full hover:bg-gray-50 transition-all transform hover:scale-110 active:scale-95 bg-white border border-gray-50 shadow-sm"
              >
                <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-gray-200" />}>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#f15a24]" />
                  ) : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                </Suspense>
              </button>

              <button className="p-3.5 rounded-full hover:bg-gray-50 transition-all transform hover:scale-110 active:scale-95 bg-white border border-gray-50 shadow-sm">
                <svg className="h-6 w-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </button>

              <button className="p-3.5 rounded-full hover:bg-gray-50 transition-all transform hover:scale-110 active:scale-95 bg-white border border-gray-50 shadow-sm">
                <svg className="h-6 w-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <p className="text-center text-[15px] text-gray-500 pt-4">
            Don't have an account yet? <button className="font-medium text-[#f15a24] hover:underline transition-all underline-offset-4">Register for free</button>
          </p>
        </div>
      </div>
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
