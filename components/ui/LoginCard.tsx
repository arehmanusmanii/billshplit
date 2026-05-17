"use client"

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { login, signup } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/client'

function StyledInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border px-3 py-1 text-sm outline-none transition-all duration-200",
        "border-black/10 bg-gray-50 text-black placeholder:text-gray-400",
        "focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-400/20",
        className
      )}
      {...props}
    />
  )
}

type Mode = 'signin' | 'signup'

export function LoginCard({ message }: { message?: string }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [6, -6])
  const rotateY = useTransform(mouseX, [-300, 300], [-6, 6])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (mode === 'signin') {
        await login(formData)
      } else {
        await signup(formData)
      }
    })
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const LightBeam = ({ delay }: { delay: number }) => {
    const isHorizontal = delay === 0 || delay === 1.2
    if (isHorizontal) {
      const isTop = delay === 0
      return (
        <motion.div
          className={`absolute ${isTop ? 'top-0 left-0' : 'bottom-0 right-0'} h-[2px] w-[40%] bg-gradient-to-r from-transparent via-yellow-400 to-transparent`}
          animate={{ [isTop ? 'left' : 'right']: ['-40%', '100%'] }}
          transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, delay }}
        />
      )
    }
    const isRight = delay === 0.6
    return (
      <motion.div
        className={`absolute ${isRight ? 'top-0 right-0' : 'bottom-0 left-0'} h-[40%] w-[2px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent`}
        animate={{ [isRight ? 'top' : 'bottom']: ['-40%', '100%'] }}
        transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, delay }}
      />
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 relative overflow-hidden flex items-center justify-center px-4">
      {/* Soft yellow glow spots on white background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] rounded-b-full bg-yellow-400/10 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[35vh] rounded-b-full bg-yellow-300/10 blur-[60px]"
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50vw] h-[30vh] rounded-t-full bg-amber-300/10 blur-[60px]"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 8 }}
        >
          <div className="relative group">
            {/* Traveling yellow light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <LightBeam delay={0} />
              <LightBeam delay={0.6} />
              <LightBeam delay={1.2} />
              <LightBeam delay={1.8} />
            </div>

            {/* Card */}
            <div className="relative bg-white rounded-2xl p-7 border border-black/[0.06] shadow-xl overflow-hidden">

              {/* Logo + branding */}
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-14 h-14 rounded-2xl overflow-hidden border border-black/10 flex items-center justify-center relative mb-3 shadow-sm"
                >
                  <Image src="/logo.png" alt="Billshplit" width={56} height={56} className="object-cover" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-black tracking-tight"
                >
                  Billshplit
                </motion.h1>
                <motion.p
                  key={mode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-sm mt-0.5"
                >
                  {mode === 'signin' ? 'Sign in to settle your debts' : 'Create your account'}
                </motion.p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-rose-600 text-xs text-center bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-4"
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div className="relative">
                  <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200", focusedInput === 'email' ? 'text-yellow-500' : 'text-gray-300')} />
                  <StyledInput
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                    className="pl-9"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>

                {/* Full name — signup only */}
                <AnimatePresence initial={false}>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="relative pt-0">
                        <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200", focusedInput === 'name' ? 'text-yellow-500' : 'text-gray-300')} />
                        <StyledInput
                          name="fullName"
                          type="text"
                          placeholder="Full name"
                          className="pl-9"
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                <div className="relative">
                  <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200", focusedInput === 'password' ? 'text-yellow-500' : 'text-gray-300')} />
                  <StyledInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    className="pl-9 pr-9"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold h-11 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm mt-1"
                >
                  <AnimatePresence mode="wait">
                    {isPending ? (
                      <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-grow border-t border-black/5" />
                <span className="text-xs text-gray-300">or</span>
                <div className="flex-grow border-t border-black/5" />
              </div>

              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 border border-black/10 h-11 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-gray-600 text-sm font-medium">Continue with Google</span>
              </motion.button>

              {/* Mode toggle */}
              <p className="text-center text-xs text-gray-400 mt-5">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-black font-semibold hover:text-yellow-600 transition-colors underline underline-offset-2"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
