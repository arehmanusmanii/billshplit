import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Auto-create profile for OAuth sign-ins; upsert so re-logins don't fail
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name
          || data.user.email?.split('@')[0]
          || 'User',
        avatar_url: data.user.user_metadata?.avatar_url || null,
      }, { onConflict: 'id' })
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
