import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware disabled - uncomment below to enable Supabase auth
  // Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  // in your Vercel environment variables

  // import { updateSession } from '@/lib/supabase/middleware'
  // return await updateSession(request)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
