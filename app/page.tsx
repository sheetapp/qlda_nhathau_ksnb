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
    <div className="min-h-screen flex bg-[#f8f9fa] font-sans overflow-hidden">
      {/* Left Side: Architectural Image (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110"
          style={{
            backgroundImage: `url('/bground.png')`,
          }}
        />
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center px-4 sm:px-8 py-12 relative bg-white lg:bg-transparent">
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] lg:shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 lg:p-14 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          {/* Logo & Header */}
          <div className="space-y-3">
            <p className="font-medium text-[#f15a24] text-lg tracking-tight">QUẢN LÝ DỰ ÁN </p>
            <h1 className="text-[35px] tracking-tight text-[#1a1a1a] leading-tight">XÂY DỰNG - NỘI THẤT</h1>
            <p className="text-gray-400 font-medium ml-1">Đơn giản -  Hiệu quả - Kịp thời</p>
          </div>

          {/* Action Section */}
          <div className="space-y-6 pt-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-[60px] rounded-xl bg-[#f15a24] hover:bg-[#d94a1a] text-white font-medium text-lg shadow-lg shadow-[#f15a24]/20 transition-all hover:scale-[1.01] active:scale-[0.99] border-none flex items-center justify-center gap-3"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="white" fillOpacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="white" fillOpacity="0.8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="white" fillOpacity="0.8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng nhập với Google
            </Button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-[1.5px] bg-gray-50" />
              <span className="text-[12px] font-medium text-gray-300 whitespace-nowrap px-2 tracking-widest">v.01.19 </span>
              <div className="flex-1 h-[1.5px] bg-gray-50" />
            </div>
          </div>

          <div className="pt-10 flex flex-col gap-2 border-t border-gray-50">
            <p className="text-[12px] font-medium text-gray-300 tracking-widest">
              QLDA XD ©2026
            </p>
            <p className="text-[12px] text-gray-400 font-medium">
              Hotline: 0989 256 894
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
