"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { login, signup } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/client'

function StyledInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-transparent px-3 py-1 text-sm outline-none transition-all duration-200",
        "border-white/10 bg-white/5 text-white placeholder:text-white/30",
        "focus:border-yellow-400/50 focus:bg-white/10 focus:ring-1 focus:ring-yellow-400/30",
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
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8])
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
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
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isTop ? 'left-0' : 'right-0'} h-[2px] w-[40%] bg-gradient-to-r from-transparent via-yellow-400 to-transparent`}
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
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Background — yellow glows replacing purple */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 via-amber-600/15 to-black" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[50vh] rounded-b-full bg-yellow-400/15 blur-[80px]"
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vh] h-[80vh] rounded-t-full bg-amber-500/10 blur-[80px]"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Traveling light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <LightBeam delay={0} />
              <LightBeam delay={0.6} />
              <LightBeam delay={1.2} />
              <LightBeam delay={1.8} />
            </div>

            {/* Card glow on hover */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-yellow-400/5 via-yellow-400/10 to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glass card */}
            <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.07] shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Logo + header */}
              <div className="text-center space-y-1 mb-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-12 h-12 rounded-full overflow-hidden border border-white/10 flex items-center justify-center relative"
                >
                  <Image src="/logo.png" alt="Billshplit" width={48} height={48} className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-white"
                >
                  {mode === 'signin' ? 'Welcome back' : 'Join Billshplit'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 text-xs"
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
                    className="text-rose-400 text-xs text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4"
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Form */}
              <form action={mode === 'signin' ? login : signup} onSubmit={() => setIsLoading(true)} className="space-y-3">
                <div className="relative">
                  <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200", focusedInput === 'email' ? 'text-yellow-400' : 'text-white/30')} />
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

                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <StyledInput
                        name="fullName"
                        type="text"
                        placeholder="Full name"
                        onFocus={() => setFocusedInput('name')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200", focusedInput === 'password' ? 'text-yellow-400' : 'text-white/30')} />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/btn mt-2"
                >
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-lg blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-yellow-400 hover:bg-yellow-300 text-black font-semibold h-10 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="w-4 h-4 border-2 border-black/50 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                          {mode === 'signin' ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-grow border-t border-white/5" />
                <span className="text-xs text-white/30">or</span>
                <div className="flex-grow border-t border-white/5" />
              </div>

              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-white/70 text-xs">Continue with Google</span>
              </motion.button>

              {/* Mode toggle */}
              <p className="text-center text-xs text-white/40 mt-5">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
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
