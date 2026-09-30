import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mountain, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store'
import { useTripStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { user, signIn } = useAuthStore()
  const { setCurrentTrip } = useTripStore()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter your username and password')
      return
    }
    setIsLoading(true)
    const { error } = await signIn(username.trim(), password, rememberMe)
    if (error) {
      toast.error(error)
      setIsLoading(false)
      return
    }

    // Load the trip with graceful fallback
    try {
      const { data: memberData } = await supabase
        .from('trip_members')
        .select('trip_id, trips(*)')
        .maybeSingle()

      if (memberData?.trips) {
        setCurrentTrip(memberData.trips as any)
      } else {
        setCurrentTrip({
          id: 1,
          name: 'Munnar Bike Trip',
          start_date: '2026-10-02',
          end_date: '2026-10-04',
          description: "Akash & Vinoth's 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.",
          status: 'upcoming',
        } as any)
      }
    } catch {
      setCurrentTrip({
        id: 1,
        name: 'Munnar Bike Trip',
        start_date: '2026-10-02',
        end_date: '2026-10-04',
        description: "Akash & Vinoth's 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.",
        status: 'upcoming',
      } as any)
    }

    toast.success('Welcome back to the Ride! 🏔🏍')
    setIsLoading(false)
    navigate('/', { replace: true })
  }

  const handleQuickLogin = async (riderName: 'akash' | 'vinoth') => {
    setUsername(riderName)
    setPassword('MunnarRide2026!')
    setIsLoading(true)
    const { error } = await signIn(riderName, 'MunnarRide2026!', true)
    if (error) {
      toast.error(error)
      setIsLoading(false)
      return
    }
    try {
      const { data: memberData } = await supabase
        .from('trip_members')
        .select('trip_id, trips(*)')
        .maybeSingle()

      if (memberData?.trips) {
        setCurrentTrip(memberData.trips as any)
      } else {
        setCurrentTrip({
          id: 1,
          name: 'Munnar Bike Trip',
          start_date: '2026-10-02',
          end_date: '2026-10-04',
          description: "Akash & Vinoth's 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.",
          status: 'upcoming',
        } as any)
      }
    } catch {
      setCurrentTrip({
        id: 1,
        name: 'Munnar Bike Trip',
        start_date: '2026-10-02',
        end_date: '2026-10-04',
        description: "Akash & Vinoth's 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.",
        status: 'upcoming',
      } as any)
    }

    toast.success(`Welcome ${riderName === 'akash' ? 'Akash' : 'Vinoth'}! 🏔🏍`)
    setIsLoading(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center relative overflow-hidden bg-transparent">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 80%, rgba(61,138,54,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(36,87,33,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(25,59,24,0.5) 0%, transparent 70%)
            `,
          }}
        />
        {/* Animated mountain silhouettes */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-15"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            d="M0,320 L0,200 L120,120 L240,180 L360,80 L480,140 L600,60 L720,130 L840,50 L960,120 L1080,80 L1200,150 L1320,100 L1440,160 L1440,320 Z"
            fill="#1e451d"
          />
          <path
            d="M0,320 L0,250 L180,170 L360,220 L540,140 L720,200 L900,160 L1080,210 L1260,170 L1440,220 L1440,320 Z"
            fill="#245721"
          />
          <path
            d="M0,320 L0,280 L240,230 L480,260 L720,230 L960,250 L1200,240 L1440,260 L1440,320 Z"
            fill="#2d6e28"
          />
        </svg>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-forest-400/30"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 4) * 15}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest-600/30 border border-forest-500/30 mb-5"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Mountain className="w-8 h-8 text-forest-400" />
          </motion.div>

          <motion.h1
            className="font-display text-5xl font-extrabold text-forest-50 tracking-tight mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            MUNNAR
          </motion.h1>

          <motion.p
            className="text-forest-400 text-sm font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your Mountain Trip Companion
          </motion.p>

          <motion.div
            className="inline-flex items-center gap-2 mt-3 bg-forest-800/50 border border-forest-700/40 rounded-full px-4 py-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-earth-400 animate-pulse" />
            <span className="text-earth-300 text-xs font-semibold tracking-widest">
              2 OCT — 4 OCT 2026
            </span>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.div
          className="glass-card p-6 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="input-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="akash or vinoth"
                className="input-field"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500 hover:text-forest-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                  ${rememberMe
                    ? 'bg-forest-500 border-forest-400'
                    : 'bg-transparent border-forest-600 group-hover:border-forest-500'
                  }`}>
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-forest-400 text-sm group-hover:text-forest-300 transition-colors">
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  SIGN IN
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Rider Select */}
          <div className="mt-6 pt-5 border-t border-forest-800/60">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-forest-400 mb-1">
              ⚡ 1-Tap Sign In
            </p>
            <p className="text-center text-[11px] text-forest-500 mb-3">
              Tap a rider below to enter immediately:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('akash')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-forest-800/60 hover:bg-forest-700/70 border border-forest-600/50 text-forest-100 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                Ride as Akash
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('vinoth')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-forest-800/60 hover:bg-forest-700/70 border border-forest-600/50 text-forest-100 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                Ride as Vinoth
              </button>
            </div>
            <div className="mt-3 text-center">
              <span className="text-[11px] text-forest-500 font-mono">
                Manual password: <code className="text-forest-300 font-semibold">MunnarRide2026!</code>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-forest-600 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Built for Akash & Vinoth · Munnar 2026
        </motion.p>
      </motion.div>
    </div>
  )
}
