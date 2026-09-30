import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useAuthStore, useTripStore, useOfflineStore } from './store'
import { useGeolocation } from './hooks/useGeolocation'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const ItineraryPage = lazy(() => import('./pages/ItineraryPage'))
const BikePage = lazy(() => import('./pages/BikePage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'))
const ChecklistPage = lazy(() => import('./pages/ChecklistPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const FoodPage = lazy(() => import('./pages/FoodPage'))
const PlaceDetailPage = lazy(() => import('./pages/PlaceDetailPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setLoading, setInitialized, user, session } = useAuthStore()
  const { setCurrentTrip } = useTripStore()
  const { setOnline } = useOfflineStore()

  // Start GPS tracking globally
  useGeolocation()

  // Online/offline listener
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Initialize Supabase auth
  useEffect(() => {
    setLoading(true)

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setSession(session)

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (profile) setProfile(profile)

        // Load the trip for this user
        const { data: memberData } = await supabase
          .from('trip_members')
          .select('trip_id, trips(*)')
          .eq('user_id', session.user.id)
          .single()

        if (memberData?.trips) {
          setCurrentTrip(memberData.trips as any)
        }
      }
      setLoading(false)
      setInitialized(true)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle()
        if (profile) setProfile(profile)

        const { data: memberData } = await supabase
          .from('trip_members')
          .select('trip_id, trips(*)')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (memberData?.trips) setCurrentTrip(memberData.trips as any)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line

  return <>{children}</>
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, isLoading } = useAuthStore()

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-forest-500 text-sm">Loading trip…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function LoginRoute() {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/" replace />
  return <LoginPage />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInitializer>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#193b18',
                color: '#e8f2de',
                border: '1px solid rgba(61,138,54,0.3)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              },
            }}
          />

          <Routes>
            <Route path="/login" element={<LoginRoute />} />

            <Route path="/*" element={
              <AuthGuard>
                <AppShell>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/explore/:slug" element={<PlaceDetailPage />} />
                      <Route path="/itinerary" element={<ItineraryPage />} />
                      <Route path="/bike" element={<BikePage />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/emergency" element={<EmergencyPage />} />
                      <Route path="/checklist" element={<ChecklistPage />} />
                      <Route path="/saved" element={<SavedPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/food" element={<FoodPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </AppShell>
              </AuthGuard>
            } />
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
