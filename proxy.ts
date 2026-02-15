import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Additional check: If user is authenticated by Auth, check if they exist in our 'users' table
  // Additional check has been removed to allow auto-registration
  const userExists = true

  // Redirect logic
  const isAuthPage = request.nextUrl.pathname === '/login'
  const isHomePage = request.nextUrl.pathname === '/'
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // If user is not logged in OR does not exist in DB, and tries to access dashboard, send to login
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Special case: Logged in via Auth but NOT in DB
  if (user && !userExists && isDashboardPage) {
    // Redirect to login with error param so the user knows why they can't enter
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  // If user is logged in (both Auth and DB) and tries to access login or home, send to dashboard
  if (user && userExists && (isAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}