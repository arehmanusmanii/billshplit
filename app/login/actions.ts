"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not sign up user')
  }

  // Create public profile using the Admin client to bypass RLS, or directly if they are logged in.
  // Actually, since they just signed up, they are signed in (if email confirmation is off in Supabase).
  // Let's safely use supabaseAdmin just in case.
  if (data.user) {
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: data.user.id,
      full_name: fullName || email.split('@')[0],
    })
    
    if (profileError) {
       console.error("Profile creation error:", profileError);
       // we continue anyway
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
