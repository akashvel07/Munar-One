import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, Navigation, Fuel, AlertTriangle,
  Gauge, Mountain, Route, Battery, Clock, TrendingUp,
  TrendingDown, Zap, Plus, ChevronRight, Info, Loader2,
  Settings, Check
} from 'lucide-react'
import {
  useRideStore, useLocationStore, useTripStore, useAuthStore
} from '../store'
import { useBikes, useFuelLogs } from '../hooks/useData'
import { formatAltitude, calculateDistance } from '../hooks/useGeolocation'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import AddFuelModal from '../components/AddFuelModal'

function RideModeOverlay() {
  const position = useLocationStore(s => s.position)
  const { activeSession, rideDuration, currentDistance, setIsRiding, setActiveSession } = useRideStore()
  const [isStopConfirm, setIsStopConfirm] = useState(false)
  const { tripId } = useTripStore()
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const start = Date.now() - (rideDuration * 1000)
    durationInterval.current = setInterval(() => {
      useRideStore.getState().setRideDuration(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => { if (durationInterval.current) clearInterval(durationInterval.current) }
  }, [])

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStop = async () => {
    if (!activeSession) return
    await supabase
      .from('ride_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        distance: currentDistance,
      })
      .eq('id', activeSession.id)

    setIsRiding(false)
    setActiveSession(null)
    toast.success(`Ride saved! ${currentDistance.toFixed(1)} km`)
  }

  const speedKmh = position?.speed ? Math.round(position.speed * 3.6) : 0

  return (
    <div className="ride-mode safe-top">
      {/* Speed - largest element */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {/* Speed */}
        <div className="text-center">
          <div className="font-display font-black text-[80px] leading-none text-forest-100 tabular-nums">
            {speedKmh}
          </div>
          <div className="text-forest-500 text-sm font-medium tracking-widest mt-1">KM/H</div>
        </div>

        {/* Stats row */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-forest-200 tabular-nums">
              {position?.altitude ? Math.round(position.altitude).toLocaleString() : '—'}
            </div>
            <div className="text-forest-600 text-xs mt-0.5">ALTITUDE m</div>
          </div>
          <div className="text-center border-x border-forest-800/50">
            <div className="font-display text-3xl font-bold text-forest-200 tabular-nums">
              {currentDistance.toFixed(1)}
            </div>
            <div className="text-forest-600 text-xs mt-0.5">KM DIST</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-forest-200 tabular-nums">
              {formatDuration(rideDuration)}
            </div>
            <div className="text-forest-600 text-xs mt-0.5">ELAPSED</div>
          </div>
        </div>

        {/* GPS accuracy */}
        {position && (
          <div className="text-forest-700 text-xs">
            GPS ±{Math.round(position.accuracy)}m
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-safe space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://www.google.com/maps/search/petrol+pump/@${position?.latitude ?? 10.0889},${position?.longitude ?? 77.0595},14z`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-3.5 text-sm"
          >
            <Fuel className="w-4 h-4" />
            Nearest Pump
          </a>
          <a
            href="tel:112"
            className="btn-danger py-3.5 text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency
          </a>
        </div>

        {/* Stop button */}
        <AnimatePresence mode="wait">
          {isStopConfirm ? (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
              <button onClick={() => setIsStopConfirm(false)} className="btn-secondary flex-1 py-3.5">Cancel</button>
              <button onClick={handleStop} className="btn-danger flex-1 py-3.5 text-base font-bold">
                <Square className="w-5 h-5" /> Stop & Save
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="stop"
              onClick={() => setIsStopConfirm(true)}
              className="w-full py-4 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-300 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              <Square className="w-6 h-6" />
              STOP RIDE
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function BikePage() {
  const { tripId } = useTripStore()
  const { bikes, saveBike } = useBikes(tripId)
  const { fuelLogs, addFuelLog } = useFuelLogs(tripId)
  const position = useLocationStore(s => s.position)
  const { isRiding, setIsRiding, setActiveSession, setCurrentDistance, setRideDuration } = useRideStore()
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'ride' | 'fuel' | 'mileage' | 'bike'>('ride')
  const [showFuelModal, setShowFuelModal] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null)

  // Track distance during ride
  useEffect(() => {
    if (!isRiding || !position) return

    const curr = { lat: position.latitude, lng: position.longitude }
    if (lastPosition.current) {
      const d = calculateDistance(lastPosition.current.lat, lastPosition.current.lng, curr.lat, curr.lng)
      if (d > 0.01 && d < 1) { // filter GPS jumps > 1km
        useRideStore.getState().setCurrentDistance(
          useRideStore.getState().currentDistance + d
        )
      }
    }
    lastPosition.current = curr
  }, [position?.latitude, position?.longitude, isRiding])

  // Mileage calculation
  const mileageHistory: { fill: number; distance: number; mileage: number; station: string }[] = []
  for (let i = 1; i < fuelLogs.length; i++) {
    const prev = fuelLogs[i - 1]
    const curr = fuelLogs[i]
    const distance = curr.odometer - prev.odometer
    const fuel = curr.litres
    if (distance > 0 && fuel > 0) {
      mileageHistory.push({
        fill: i,
        distance: parseFloat(String(distance)),
        mileage: parseFloat((distance / fuel).toFixed(1)),
        station: curr.fuel_station ?? `Fillup ${i}`,
      })
    }
  }

  const avgMileage = mileageHistory.length > 0
    ? (mileageHistory.reduce((s, m) => s + m.mileage, 0) / mileageHistory.length).toFixed(1)
    : null

  const totalFuel = fuelLogs.reduce((s, l) => s + parseFloat(String(l.litres)), 0)
  const totalFuelCost = fuelLogs.reduce((s, l) => s + parseFloat(String(l.total_amount)), 0)

  // Last known fuel
  const lastLog = fuelLogs[fuelLogs.length - 1]
  const myBike = bikes.find(b => b.owner_id === user?.id)
  const tankCapacity = myBike?.tank_capacity ?? 12
  const estimatedRemaining = lastLog ? Math.max(0, tankCapacity - totalFuel) : null
  const estimatedRange = estimatedRemaining && avgMileage
    ? (estimatedRemaining * parseFloat(avgMileage)).toFixed(0)
    : null

  const startRide = async () => {
    if (!tripId || !user) { toast.error('Not authenticated'); return }
    setIsStarting(true)
    try {
      const { data, error } = await supabase.from('ride_sessions').insert({
        trip_id: tripId,
        user_id: user.id,
        bike_id: myBike?.id ?? null,
        started_at: new Date().toISOString(),
        status: 'active',
      }).select().single()

      if (error) throw error
      setActiveSession(data)
      setIsRiding(true)
      setCurrentDistance(0)
      setRideDuration(0)
      lastPosition.current = null
      toast.success('Ride started!')
    } catch {
      toast.error('Failed to start ride')
    } finally {
      setIsStarting(false)
    }
  }

  if (isRiding) return <RideModeOverlay />

  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-4">Bike & Fuel</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-forest-900/50 p-1 rounded-xl mb-5">
          {(['ride', 'fuel', 'mileage', 'bike'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                tab === t ? 'bg-forest-600/50 text-forest-100' : 'text-forest-500 hover:text-forest-300'
              }`}
            >
              {t === 'mileage' ? 'Mileage' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* RIDE TAB */}
        {tab === 'ride' && (
          <div className="space-y-4">
            {/* Start ride */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startRide}
              disabled={isStarting}
              className="w-full py-8 bg-gradient-to-br from-forest-600/40 to-forest-700/30 border border-forest-500/40 rounded-2xl flex flex-col items-center gap-3 text-forest-100 hover:border-forest-400/60 transition-all"
            >
              {isStarting ? (
                <Loader2 className="w-10 h-10 animate-spin text-forest-400" />
              ) : (
                <Play className="w-10 h-10 text-forest-400" />
              )}
              <span className="font-display text-xl font-bold">START RIDE</span>
              <span className="text-forest-500 text-sm">GPS tracking & altitude recording</span>
            </motion.button>

            {/* Current stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="w-4 h-4 text-forest-500" />
                  <span className="stat-label">Altitude</span>
                </div>
                <div className="stat-value">{formatAltitude(position?.altitude ?? null)}</div>
                {position && <div className="text-forest-600 text-xs">±{Math.round(position.accuracy)}m</div>}
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-forest-500" />
                  <span className="stat-label">Speed</span>
                </div>
                <div className="stat-value">
                  {position?.speed !== null && position?.speed !== undefined
                    ? Math.round(position.speed * 3.6)
                    : '—'}
                  <span className="text-forest-500 text-sm font-normal"> km/h</span>
                </div>
              </div>

              {estimatedRange && (
                <div className="stat-card col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-earth-400" />
                      <span className="stat-label">Estimated Range</span>
                    </div>
                    {parseFloat(estimatedRange) < 50 && (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low range!
                      </div>
                    )}
                  </div>
                  <div className="stat-value text-earth-300">{estimatedRange}<span className="text-earth-500 text-sm font-normal"> km</span></div>
                  <div className="text-forest-600 text-xs mt-1">
                    Based on avg {avgMileage} km/L
                    {estimatedRemaining && ` · ~${estimatedRemaining.toFixed(1)}L remaining`}
                  </div>
                  {parseFloat(estimatedRange) < 50 && (
                    <a
                      href={`https://www.google.com/maps/search/petrol+pump/@${position?.latitude ?? 10.0889},${position?.longitude ?? 77.0595},14z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-earth py-2 px-4 text-sm mt-3 inline-flex"
                    >
                      <Navigation className="w-4 h-4" />
                      Find Petrol Pump
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FUEL TAB */}
        {tab === 'fuel' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card text-center">
                <div className="stat-value text-earth-300">{totalFuel.toFixed(1)}<span className="text-forest-500 text-sm"> L</span></div>
                <div className="stat-label">Total Fuel</div>
              </div>
              <div className="stat-card text-center">
                <div className="stat-value text-earth-300">₹{Math.round(totalFuelCost).toLocaleString()}</div>
                <div className="stat-label">Fuel Cost</div>
              </div>
              <div className="stat-card text-center">
                <div className="stat-value">{fuelLogs.length}</div>
                <div className="stat-label">Fill-ups</div>
              </div>
            </div>

            <button
              onClick={() => setShowFuelModal(true)}
              className="btn-primary w-full py-3.5"
            >
              <Plus className="w-5 h-5" />
              Log Fuel Fill-up
            </button>

            <div className="space-y-3">
              {fuelLogs.length === 0 ? (
                <div className="text-center py-10 text-forest-600">
                  <Fuel className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No fuel logs yet</p>
                </div>
              ) : (
                fuelLogs.map((log, idx) => (
                  <div key={log.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-forest-200 font-semibold">{log.fuel_station ?? 'Fuel Station'}</div>
                        <div className="text-forest-500 text-sm mt-1">
                          {log.litres}L @ ₹{log.price_per_litre}/L
                        </div>
                        {log.odometer && (
                          <div className="text-forest-600 text-xs mt-0.5">{log.odometer} km odometer</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-earth-300 font-bold">₹{parseFloat(String(log.total_amount)).toLocaleString()}</div>
                        <div className="text-forest-600 text-xs mt-1">{format(new Date(log.timestamp), 'd MMM, h:mm a')}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MILEAGE TAB */}
        {tab === 'mileage' && (
          <div className="space-y-4">
            {avgMileage ? (
              <>
                <div className="glass-card p-5 text-center border border-forest-600/20">
                  <div className="text-forest-500 text-xs font-bold uppercase tracking-widest mb-2">Actual Mileage</div>
                  <div className="font-display text-5xl font-extrabold text-forest-200">{avgMileage}</div>
                  <div className="text-forest-500 text-sm mt-1">km/L average</div>
                  <p className="text-forest-600 text-xs mt-3 leading-relaxed">
                    Based on your recorded fill-ups. Mountain terrain, elevation and riding style affect mileage.
                  </p>
                </div>

                {mileageHistory.length > 1 && (
                  <div className="glass-card p-4">
                    <div className="section-header">Mileage History</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={mileageHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,138,54,0.1)" />
                        <XAxis dataKey="station" tick={{ fontSize: 10, fill: '#638561' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#638561' }} unit=" km/L" />
                        <Tooltip
                          contentStyle={{ background: '#0c2110', border: '1px solid rgba(61,138,54,0.3)', borderRadius: 8 }}
                          labelStyle={{ color: '#a8be96' }}
                        />
                        <Line type="monotone" dataKey="mileage" stroke="#3d8a36" strokeWidth={2} dot={{ r: 3, fill: '#3d8a36' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-forest-700 mx-auto mb-3" />
                <p className="text-forest-500 font-medium">Not enough data yet</p>
                <p className="text-forest-600 text-sm mt-1">Log at least 2 fuel fill-ups to calculate mileage</p>
              </div>
            )}
          </div>
        )}

        {/* BIKE TAB */}
        {tab === 'bike' && (
          <div className="space-y-4">
            {bikes.length === 0 ? (
              <div className="text-center py-10 text-forest-600">
                <Settings className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No bikes configured</p>
                <p className="text-xs mt-1">Go to Settings to add your bike details</p>
              </div>
            ) : (
              bikes.map(bike => (
                <div key={bike.id} className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-forest-100 font-bold">{bike.name}</h3>
                      {bike.model && <p className="text-forest-400 text-sm mt-0.5">{bike.model}</p>}
                      {bike.registration_number && <p className="text-forest-500 text-xs mt-0.5">{bike.registration_number}</p>}
                    </div>
                    <div className="badge-green">
                      {bike.profiles?.display_name ?? 'Owner'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {bike.tank_capacity && (
                      <div>
                        <div className="text-forest-500 text-xs">Tank</div>
                        <div className="text-forest-200 font-semibold text-sm">{bike.tank_capacity}L</div>
                      </div>
                    )}
                    {bike.expected_mileage && (
                      <div>
                        <div className="text-forest-500 text-xs">Expected</div>
                        <div className="text-forest-200 font-semibold text-sm">{bike.expected_mileage} km/L</div>
                      </div>
                    )}
                    {bike.current_odometer && (
                      <div>
                        <div className="text-forest-500 text-xs">Odometer</div>
                        <div className="text-forest-200 font-semibold text-sm">{bike.current_odometer.toLocaleString()} km</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFuelModal && (
          <AddFuelModal
            bikes={bikes}
            onClose={() => setShowFuelModal(false)}
            onSave={async (data) => {
              await addFuelLog.mutateAsync(data)
              setShowFuelModal(false)
              toast.success('Fuel log saved!')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
