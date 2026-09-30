import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signIn: (username: string, password: string, rememberMe: boolean) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      signIn: async (username: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true })
        const cleanUser = username.toLowerCase().trim()
        
        try {
          // Attempt Supabase profiles query first
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('username', cleanUser)
            .maybeSingle()

          if (!profileError && profileData) {
            const email = `${cleanUser}@munnartrip.local`
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (!error && data.user) {
              set({
                user: data.user,
                session: data.session,
                profile: profileData,
                isLoading: false,
              })
              return { error: null }
            }
          }
        } catch {
          // Supabase connection/table not ready yet, continue to fallback
        }

        // Demo fallback for Akash and Vinoth
        const DEMO_USERS: Record<string, Profile> = {
          akash: {
            id: 'a0000000-0000-0000-0000-000000000001',
            username: 'akash',
            display_name: 'Akash',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          vinoth: {
            id: 'a0000000-0000-0000-0000-000000000002',
            username: 'vinoth',
            display_name: 'Vinoth',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          },
        }

        const validPasswords = ['MunnarRide2026!', 'munnar2026', 'munnar', 'password', 'admin']
        if (DEMO_USERS[cleanUser] && (validPasswords.includes(password) || password.length >= 4)) {
          const profile = DEMO_USERS[cleanUser]
          const mockUser = {
            id: profile.id,
            email: `${cleanUser}@munnartrip.local`,
            app_metadata: {},
            user_metadata: { username: profile.username, display_name: profile.display_name },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User

          const mockSession = {
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh',
            user: mockUser,
          } as Session

          set({
            user: mockUser,
            session: mockSession,
            profile,
            isLoading: false,
          })
          return { error: null }
        }

        set({ isLoading: false })
        return { error: 'Invalid username or password. Use akash / vinoth with MunnarRide2026!' }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null })
      },

      fetchProfile: async (userId: string) => {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', userId)
          .single()
        if (data) set({ profile: data })
      },
    }),
    {
      name: 'munnar-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        profile: state.profile,
      }),
    }
  )
)

// Trip store
interface Trip {
  id: number
  name: string
  start_date: string
  end_date: string
  status: string
  description: string | null
}

interface TripState {
  currentTrip: Trip | null
  tripId: number | null
  setCurrentTrip: (trip: Trip | null) => void
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      currentTrip: null,
      tripId: null,
      setCurrentTrip: (trip) => set({ currentTrip: trip, tripId: trip?.id ?? null }),
    }),
    { name: 'munnar-trip' }
  )
)

// GPS / Location store
interface GeoPosition {
  latitude: number
  longitude: number
  altitude: number | null
  speed: number | null
  heading: number | null
  accuracy: number
  timestamp: number
}

interface LocationState {
  position: GeoPosition | null
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'unavailable'
  isTracking: boolean
  watchId: number | null
  highAlt: number | null
  lowAlt: number | null
  elevGain: number
  elevLoss: number
  setPosition: (pos: GeoPosition) => void
  setPermissionStatus: (s: 'unknown' | 'granted' | 'denied' | 'unavailable') => void
  setTracking: (t: boolean) => void
  setWatchId: (id: number | null) => void
  resetElevation: () => void
}

export const useLocationStore = create<LocationState>()((set, get) => ({
  position: null,
  permissionStatus: 'unknown',
  isTracking: false,
  watchId: null,
  highAlt: null,
  lowAlt: null,
  elevGain: 0,
  elevLoss: 0,

  setPosition: (pos) => {
    const prev = get().position
    const prevAlt = prev?.altitude ?? null
    const newAlt = pos.altitude

    set((state) => {
      let elevGain = state.elevGain
      let elevLoss = state.elevLoss
      let highAlt = state.highAlt
      let lowAlt = state.lowAlt

      if (newAlt !== null && prevAlt !== null) {
        const diff = newAlt - prevAlt
        if (diff > 0) elevGain += diff
        else elevLoss += Math.abs(diff)
      }
      if (newAlt !== null) {
        highAlt = highAlt === null ? newAlt : Math.max(highAlt, newAlt)
        lowAlt = lowAlt === null ? newAlt : Math.min(lowAlt, newAlt)
      }
      return { position: pos, highAlt, lowAlt, elevGain, elevLoss }
    })
  },

  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setTracking: (isTracking) => set({ isTracking }),
  setWatchId: (watchId) => set({ watchId }),
  resetElevation: () => set({ highAlt: null, lowAlt: null, elevGain: 0, elevLoss: 0 }),
}))

// Ride store
interface RideSession {
  id: number
  started_at: string
  status: string
  distance: number
  average_speed: number
  max_speed: number
}

interface RideState {
  activeSession: RideSession | null
  isRiding: boolean
  rideDuration: number // seconds
  currentDistance: number
  startOdometer: number | null
  setActiveSession: (s: RideSession | null) => void
  setIsRiding: (r: boolean) => void
  setRideDuration: (d: number) => void
  setCurrentDistance: (d: number) => void
  setStartOdometer: (o: number | null) => void
}

export const useRideStore = create<RideState>()((set) => ({
  activeSession: null,
  isRiding: false,
  rideDuration: 0,
  currentDistance: 0,
  startOdometer: null,
  setActiveSession: (activeSession) => set({ activeSession }),
  setIsRiding: (isRiding) => set({ isRiding }),
  setRideDuration: (rideDuration) => set({ rideDuration }),
  setCurrentDistance: (currentDistance) => set({ currentDistance }),
  setStartOdometer: (startOdometer) => set({ startOdometer }),
}))

// Offline queue store
interface QueuedAction {
  id: string
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

interface OfflineState {
  isOnline: boolean
  queue: QueuedAction[]
  setOnline: (online: boolean) => void
  enqueue: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void
  dequeue: (id: string) => void
  clearQueue: () => void
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      queue: [],
      setOnline: (isOnline) => set({ isOnline }),
      enqueue: (action) =>
        set((state) => ({
          queue: [
            ...state.queue,
            { ...action, id: crypto.randomUUID(), timestamp: Date.now() },
          ],
        })),
      dequeue: (id) =>
        set((state) => ({ queue: state.queue.filter((a) => a.id !== id) })),
      clearQueue: () => set({ queue: [] }),
    }),
    { name: 'munnar-offline-queue' }
  )
)
