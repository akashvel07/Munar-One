import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mountain, Navigation, Fuel, MapPin, Clock, Zap,
  TrendingUp, CheckCircle2, CloudRain, Wind, Thermometer,
  ArrowRight, Play, Plus, Coffee, AlertTriangle, Activity,
  Compass, Calendar, Bike, DollarSign, Bookmark, Wifi, WifiOff
} from 'lucide-react'
import { useAuthStore, useTripStore, useLocationStore } from '../store'
import { useActivityLog, useExpenses, useVisitedPlaces, usePlaces, useWeather, useItinerary, useFuelLogs, useBudget } from '../hooks/useData'
import { formatAltitude, formatSpeed, mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'
import { format, isToday, differenceInDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { profile } = useAuthStore()
  const { currentTrip, tripId } = useTripStore()
  const position = useLocationStore((s) => s.position)
  const permStatus = useLocationStore((s) => s.permissionStatus)
  const navigate = useNavigate()

  const { activities } = useActivityLog(tripId)
  const { expenses } = useExpenses(tripId)
  const { budget } = useBudget(tripId)
  const { visitedPlaces } = useVisitedPlaces(tripId)
  const { data: places } = usePlaces()
  const { items: itinerary } = useItinerary(tripId)
  const { fuelLogs } = useFuelLogs(tripId)
  const { data: weather } = useWeather(
    position?.latitude ?? 10.0889,
    position?.longitude ?? 77.0595
  )

  // Trip status calculations
  const today = new Date()
  const startDate = currentTrip ? new Date(currentTrip.start_date) : new Date('2026-10-02')
  const endDate = currentTrip ? new Date(currentTrip.end_date) : new Date('2026-10-04')
  const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const daysUntilTrip = differenceInDays(startDate, today)
  const currentDay = Math.max(1, Math.min(tripDays, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1))

  // Expense totals
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(String(e.amount)), 0)
  const totalFuel = expenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + parseFloat(String(e.amount)), 0)

  // Today's itinerary
  const todayItems = itinerary.filter(item => isToday(new Date(item.day_date)))
  const nextItem = todayItems.find(item => !item.is_completed && item.start_time)

  // Fuel range estimate
  const fuelLitres = fuelLogs.length > 0 ? fuelLogs[fuelLogs.length - 1]?.litres ?? 0 : 0
  const lastFuelLog = fuelLogs[fuelLogs.length - 1]
  const estimatedRange = lastFuelLog ? (fuelLitres * 42) : null

  const totalPlaces = places?.length ?? 32
  const visitedCount = visitedPlaces.length

  const quickActions = [
    { icon: Compass, label: 'Explore', to: '/explore', color: 'bg-forest-700/50 text-forest-300' },
    { icon: Calendar, label: 'Itinerary', to: '/itinerary', color: 'bg-forest-700/50 text-forest-300' },
    { icon: Play, label: 'Start Ride', to: '/bike', color: 'bg-forest-500/30 text-forest-200 border border-forest-500/50', highlight: true },
    { icon: Fuel, label: 'Fuel Log', to: '/bike?tab=fuel', color: 'bg-forest-700/50 text-forest-300' },
    { icon: DollarSign, label: 'Expenses', to: '/expenses', color: 'bg-forest-700/50 text-forest-300' },
    { icon: Coffee, label: 'Food', to: '/food', color: 'bg-forest-700/50 text-forest-300' },
    { icon: MapPin, label: 'Nearby', to: '/map', color: 'bg-forest-700/50 text-forest-300' },
    { icon: AlertTriangle, label: 'Emergency', to: '/emergency', color: 'bg-red-900/40 text-red-300 border border-red-800/30' },
  ]

  return (
    <div className="min-h-screen bg-forest-950 pb-safe">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-forest-900 to-forest-950 pt-safe">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-forest-400 text-sm font-medium mb-0.5">{getGreeting()},</p>
              <h1 className="font-display text-3xl font-extrabold text-forest-50">
                {profile?.display_name ?? 'Rider'} 🏔
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  currentTrip?.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : currentTrip?.status === 'upcoming'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {currentTrip?.status === 'active' ? 'ACTIVE' :
                   currentTrip?.status === 'upcoming' ? `${daysUntilTrip}D TO GO` : 'COMPLETED'}
                </span>
                <span className="text-forest-500 text-xs">DAY {currentDay} / {tripDays}</span>
              </div>
            </div>

            {/* Altitude + GPS */}
            <div className="text-right">
              {position?.altitude !== null && position?.altitude !== undefined ? (
                <div>
                  <div className="font-display text-2xl font-bold text-forest-200">
                    {Math.round(position.altitude).toLocaleString()}
                  </div>
                  <div className="text-forest-500 text-xs">metres ASL</div>
                </div>
              ) : (
                <div className="text-forest-600 text-xs text-right">
                  {permStatus === 'denied' ? 'GPS denied' :
                   permStatus === 'unavailable' ? 'GPS N/A' : 'Locating…'}
                </div>
              )}
              {position && (
                <div className="text-forest-600 text-[10px] mt-0.5">
                  ±{Math.round(position.accuracy)}m
                </div>
              )}
            </div>
          </div>

          {/* Weather strip */}
          {weather ? (
            <div className="mt-4 flex items-center gap-4 bg-forest-800/40 rounded-xl px-4 py-2.5 border border-forest-700/30">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-forest-400" />
                <span className="text-forest-200 font-semibold">{Math.round(weather.main.temp)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span className="text-forest-300 text-sm">{weather.clouds?.all ?? 0}% cloud</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-forest-400" />
                <span className="text-forest-300 text-sm">{Math.round(weather.wind?.speed * 3.6)} km/h</span>
              </div>
              <div className="ml-auto text-forest-400 text-xs capitalize">{weather.weather?.[0]?.description}</div>
            </div>
          ) : (
            <div className="mt-4 bg-forest-800/20 rounded-xl px-4 py-2.5 border border-forest-800/30 text-forest-600 text-sm">
              {import.meta.env.VITE_WEATHER_API_KEY ? 'Loading weather…' : 'Add weather API key for live data'}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 space-y-6 mt-2">
        {/* Next Itinerary Item */}
        {nextItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border border-forest-600/20"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-forest-500">Next Stop</span>
              <span className="text-forest-400 text-xs">{nextItem.start_time?.slice(0, 5)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-forest-100 font-bold text-lg leading-tight">{nextItem.title}</h3>
                {nextItem.places && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-500" />
                    <span className="text-forest-400 text-sm">{nextItem.travel_time ? `~${nextItem.travel_time} min drive` : 'Check map'}</span>
                  </div>
                )}
              </div>
              {nextItem.latitude && nextItem.longitude && (
                <a
                  href={mapsUrlFromCurrentLocation(nextItem.latitude, nextItem.longitude, position?.latitude, position?.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2 px-4 text-sm flex-shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                  Go
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div>
          <div className="section-header">Trip Stats</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-forest-500" />
                <span className="stat-label">Places Visited</span>
              </div>
              <div className="stat-value">{visitedCount}<span className="text-forest-600 text-base font-medium"> / {totalPlaces}</span></div>
              <div className="w-full bg-forest-800 rounded-full h-1 mt-2">
                <div
                  className="bg-forest-500 h-1 rounded-full transition-all"
                  style={{ width: `${totalPlaces > 0 ? (visitedCount / totalPlaces) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-earth-500" />
                <span className="stat-label">Total Spent</span>
              </div>
              <div className="stat-value text-earth-300">₹{totalExpenses.toLocaleString()}</div>
              <div className="text-forest-600 text-xs mt-1">Budget: ₹{(budget?.total_budget ?? 10000).toLocaleString()}</div>
            </div>

            {position?.speed !== null && position?.speed !== undefined && (
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-forest-500" />
                  <span className="stat-label">Current Speed</span>
                </div>
                <div className="stat-value">{Math.round((position.speed ?? 0) * 3.6)}<span className="text-forest-500 text-base"> km/h</span></div>
              </div>
            )}

            {estimatedRange && (
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="w-4 h-4 text-forest-500" />
                  <span className="stat-label">Fuel Range</span>
                </div>
                <div className="stat-value">{Math.round(estimatedRange)}<span className="text-forest-500 text-base"> km</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="section-header">Quick Actions</div>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Plan */}
        {todayItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="section-header mb-0">Today's Plan</div>
              <button onClick={() => navigate('/itinerary')} className="text-forest-500 text-xs hover:text-forest-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {todayItems.slice(0, 4).map((item, idx) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.is_completed ? 'bg-forest-900/20 border-forest-800/20 opacity-60' : 'glass-card border-forest-700/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.is_completed ? 'bg-forest-500' : 'bg-forest-700 border border-forest-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${item.is_completed ? 'text-forest-600 line-through' : 'text-forest-200'}`}>
                      {item.title}
                    </div>
                    {item.start_time && (
                      <div className="text-forest-500 text-xs">{item.start_time.slice(0, 5)}</div>
                    )}
                  </div>
                  {item.is_completed && <CheckCircle2 className="w-4 h-4 text-forest-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="section-header mb-0">Recent Activity</div>
            </div>
            <div className="glass-card divide-y divide-forest-800/30">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-forest-800/60 border border-forest-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-forest-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-forest-300 text-sm leading-tight">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-forest-600 text-xs">{activity.profiles?.display_name}</span>
                      <span className="text-forest-700 text-xs">·</span>
                      <span className="text-forest-600 text-xs">
                        {format(new Date(activity.created_at), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming trip countdown */}
        {currentTrip?.status === 'upcoming' && daysUntilTrip > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-5 text-center border border-forest-600/20"
          >
            <Mountain className="w-8 h-8 text-forest-400 mx-auto mb-3" />
            <div className="font-display text-4xl font-extrabold text-forest-200 mb-1">{daysUntilTrip}</div>
            <div className="text-forest-400 text-sm">days until Munnar</div>
            <div className="text-forest-600 text-xs mt-1">
              {format(startDate, 'EEEE, d MMMM yyyy')}
            </div>
          </motion.div>
        )}

        <div className="h-6" />
      </div>
    </div>
  )
}
