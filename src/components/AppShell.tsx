import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Compass, Calendar, Bike, DollarSign, Map, Coffee,
  Bookmark, CheckSquare, AlertTriangle, Settings, LogOut,
  Mountain, User, ChevronRight, Wifi, WifiOff, Bell, X
} from 'lucide-react'
import { useAuthStore, useTripStore, useOfflineStore } from '../store'
import { format } from 'date-fns'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', mobileLabel: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore', mobileLabel: 'Explore' },
  { to: '/itinerary', icon: Calendar, label: 'Itinerary', mobileLabel: 'Plan' },
  { to: '/bike', icon: Bike, label: 'Bike & Fuel', mobileLabel: 'Bike' },
  { to: '/expenses', icon: DollarSign, label: 'Expenses', mobileLabel: 'Money' },
]

const SIDEBAR_EXTRAS = [
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/food', icon: Coffee, label: 'Food' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/emergency', icon: AlertTriangle, label: 'Emergency' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuthStore()
  const { currentTrip } = useTripStore()
  const { isOnline, queue } = useOfflineStore()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  useEffect(() => {
    setShowOfflineBanner(!isOnline)
  }, [isOnline])

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : '??'

  const tripDays = currentTrip
    ? Math.ceil(
        (new Date(currentTrip.end_date).getTime() - new Date(currentTrip.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1
    : 0

  const currentDay = currentTrip
    ? Math.max(1, Math.min(tripDays, Math.ceil(
        (Date.now() - new Date(currentTrip.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1))
    : 1

  return (
    <div className="flex h-screen h-dvh bg-forest-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest-900/50 border-r border-forest-800/50 h-full">
        {/* Logo */}
        <div className="p-5 border-b border-forest-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-600/40 border border-forest-500/30 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-forest-400" />
            </div>
            <div>
              <div className="font-display font-bold text-forest-100 text-sm">Munnar Trip</div>
              <div className="text-forest-500 text-xs">
                {currentTrip
                  ? `${format(new Date(currentTrip.start_date), 'd MMM')} — ${format(new Date(currentTrip.end_date), 'd MMM')}`
                  : '2 Oct — 4 Oct 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Trip status pill */}
        {currentTrip && (
          <div className="px-5 pt-4">
            <div className="flex items-center gap-2 bg-forest-800/40 rounded-xl p-3">
              <div className={`w-2 h-2 rounded-full ${
                currentTrip.status === 'active' ? 'bg-green-400 animate-pulse' :
                currentTrip.status === 'upcoming' ? 'bg-yellow-400' : 'bg-gray-400'
              }`} />
              <div>
                <div className="text-forest-300 text-xs font-medium capitalize">{currentTrip.status}</div>
                <div className="text-forest-500 text-xs">Day {currentDay} of {tripDays}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-0.5">
            {[...NAV_ITEMS, ...SIDEBAR_EXTRAS].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-forest-600/30 text-forest-200 border border-forest-600/30'
                      : 'text-forest-400 hover:bg-forest-800/50 hover:text-forest-200'
                  }`
                }
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                {'label' in item ? item.label : ''}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-forest-800/50">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-forest-800/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-600/50 border border-forest-500/30 flex items-center justify-center text-forest-300 font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left">
              <div className="text-forest-200 text-sm font-medium">{profile?.display_name}</div>
              <div className="text-forest-500 text-xs">@{profile?.username}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-forest-600 group-hover:text-forest-400 transition-colors" />
          </button>

          {/* Profile dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-2 bg-forest-800 border border-forest-700/50 rounded-xl overflow-hidden"
              >
                <NavLink to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-forest-300 hover:bg-forest-700/50 text-sm transition-colors" onClick={() => setShowProfileMenu(false)}>
                  <User className="w-4 h-4" /> Profile
                </NavLink>
                <NavLink to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-forest-300 hover:bg-forest-700/50 text-sm transition-colors" onClick={() => setShowProfileMenu(false)}>
                  <Settings className="w-4 h-4" /> Settings
                </NavLink>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-950/30 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Offline banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="bg-yellow-900/80 border-b border-yellow-700/50 overflow-hidden flex-shrink-0"
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <WifiOff className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-300 text-sm flex-1">
                  Offline mode — {queue.length > 0 ? `${queue.length} changes pending sync` : 'Changes will sync when connection returns'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-forest-950/95 backdrop-blur-xl border-t border-forest-800/60 safe-bottom">
        <div className="flex items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-forest-400' : 'text-forest-600'}`} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-1.5 bg-forest-600/20 rounded-lg -z-10"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-forest-300' : 'text-forest-600'}`}>
                  {item.mobileLabel}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
