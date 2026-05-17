import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Create the redirect response first, then attach cookies to it
  const response = NextResponse.redirect(`${origin}/`)

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Write directly onto the redirect response so the browser
            // receives the session cookies in the same round-trip
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name
          || data.user.email?.split('@')[0]
          || 'User',
        avatar_url: data.user.user_metadata?.avatar_url || null,
      }, { onConflict: 'id' })
    }
  }

  return response
}
