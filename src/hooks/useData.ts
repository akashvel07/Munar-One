import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTripStore, useAuthStore } from '../store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001'

export async function getEffectiveUserId(): Promise<string> {
  const storeUser = useAuthStore.getState().user
  if (storeUser?.id) return storeUser.id

  try {
    const authUser = (await supabase.auth.getUser()).data.user
    if (authUser?.id) return authUser.id
  } catch {
    // ignore
  }

  return DEFAULT_USER_ID
}

export function getEffectiveTripId(tripId?: number | null): number {
  return tripId || useTripStore.getState().tripId || Number(import.meta.env.VITE_TRIP_ID) || 1
}

const DEFAULT_MEMBERS = [
  { id: 1, user_id: 'a0000000-0000-0000-0000-000000000001', role: 'admin', profiles: { id: 'a0000000-0000-0000-0000-000000000001', username: 'akash', display_name: 'Akash', avatar_url: null } },
  { id: 2, user_id: 'a0000000-0000-0000-0000-000000000002', role: 'member', profiles: { id: 'a0000000-0000-0000-0000-000000000002', username: 'vinoth', display_name: 'Vinoth', avatar_url: null } },
]

// ===== TRIP =====
export function useTrip() {
  const { currentTrip, setCurrentTrip, tripId } = useTripStore()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_members(user_id, role, profiles(username, display_name))')
        .eq('id', effectiveTripId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    staleTime: 30000,
  })

  useEffect(() => {
    if (data) setCurrentTrip(data)
  }, [data]) // eslint-disable-line

  return { trip: data || currentTrip, isLoading, error }
}

// ===== PLACES =====
export function usePlaces(filters?: {
  category?: string
  search?: string
  difficulty?: string
  maxDistance?: number
}) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: async () => {
      let q = supabase.from('places').select('*').order('name')

      if (filters?.category && filters.category !== 'all') {
        q = q.eq('category', filters.category)
      }
      if (filters?.search) {
        q = q.ilike('name', `%${filters.search}%`)
      }
      if (filters?.difficulty) {
        q = q.eq('difficulty', filters.difficulty)
      }
      if (filters?.maxDistance) {
        q = q.lte('distance_from_munnar', filters.maxDistance)
      }

      const { data, error } = await q
      if (error) throw error
      return data
    },
    staleTime: 60000,
  })
}

export function usePlace(slug: string) {
  return useQuery({
    queryKey: ['place', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

// ===== ITINERARY =====
export function useItinerary(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data, isLoading } = useQuery({
    queryKey: ['itinerary', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itinerary_items')
        .select('*, profiles!created_by(username, display_name), places(name, latitude, longitude)')
        .eq('trip_id', effectiveTripId)
        .order('day_date', { ascending: true })
        .order('order_index', { ascending: true })
      if (error) throw error
      return data
    },
  })

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`itinerary-${effectiveTripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_items',
          filter: `trip_id=eq.${effectiveTripId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['itinerary', effectiveTripId] })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [effectiveTripId]) // eslint-disable-line

  const addItem = useMutation({
    mutationFn: async (item: {
      day_date: string
      title: string
      start_time?: string
      end_time?: string
      duration?: number
      notes?: string
      place_id?: number
      latitude?: number
      longitude?: number
      order_index?: number
      category?: string
    }) => {
      const tripIdNum = getEffectiveTripId(tripId)
      const userId = await getEffectiveUserId()

      const { data, error } = await supabase.from('itinerary_items').insert({
        trip_id: tripIdNum,
        created_by: userId,
        ...item,
      }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['itinerary', effectiveTripId] }),
  })

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; [key: string]: unknown }) => {
      const userId = await getEffectiveUserId()
      const { data, error } = await supabase
        .from('itinerary_items')
        .update({ ...updates, updated_by: userId })
        .eq('id', id)
        .select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['itinerary', effectiveTripId] }),
  })

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('itinerary_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['itinerary', effectiveTripId] }),
  })

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: number; is_completed: boolean }) => {
      const userId = await getEffectiveUserId()
      const { error } = await supabase
        .from('itinerary_items')
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
          completed_by: is_completed ? userId : null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['itinerary', effectiveTripId] }),
  })

  return { items: data ?? [], isLoading, addItem, updateItem, deleteItem, toggleComplete }
}

// ===== EXPENSES =====
export function useExpenses(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, profiles!paid_by(username, display_name), expense_splits(user_id, amount, settled, profiles(username, display_name))')
        .eq('trip_id', effectiveTripId)
        .order('expense_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`expenses-${effectiveTripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${effectiveTripId}` },
        () => qc.invalidateQueries({ queryKey: ['expenses', effectiveTripId] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_splits' },
        () => qc.invalidateQueries({ queryKey: ['expenses', effectiveTripId] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [effectiveTripId]) // eslint-disable-line

  const addExpense = useMutation({
    mutationFn: async (expense: {
      title: string
      amount: number
      category: string
      paid_by: string
      expense_date: string
      notes?: string
      splits: { user_id: string; amount: number }[]
    }) => {
      const userId = await getEffectiveUserId()

      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .insert({
          trip_id: effectiveTripId,
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          paid_by: expense.paid_by || userId,
          expense_date: expense.expense_date,
          notes: expense.notes,
          created_by: userId,
        })
        .select().single()

      if (expError) throw expError

      if (expense.splits && expense.splits.length > 0) {
        const { error: splitError } = await supabase.from('expense_splits').insert(
          expense.splits.map((s) => ({ expense_id: expData.id, ...s }))
        )
        if (splitError) console.warn('Expense splits notice:', splitError.message)
      }

      return expData
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', effectiveTripId] }),
  })

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', effectiveTripId] }),
  })

  return { expenses: data ?? [], isLoading, addExpense, deleteExpense }
}

// ===== FUEL LOGS =====
export function useFuelLogs(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data, isLoading } = useQuery({
    queryKey: ['fuel', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_logs')
        .select('*, profiles(username, display_name), bikes(name, model, expected_mileage)')
        .eq('trip_id', effectiveTripId)
        .order('timestamp', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const addFuelLog = useMutation({
    mutationFn: async (log: {
      bike_id?: number
      odometer: number
      litres: number
      price_per_litre: number
      fuel_station?: string
      latitude?: number
      longitude?: number
      notes?: string
    }) => {
      const userId = await getEffectiveUserId()
      const totalAmount = log.litres * log.price_per_litre
      const { data, error } = await supabase.from('fuel_logs').insert({
        trip_id: effectiveTripId,
        user_id: userId,
        total_amount: totalAmount,
        ...log,
      }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel', effectiveTripId] }),
  })

  return { fuelLogs: data ?? [], isLoading, addFuelLog }
}

// ===== BIKES =====
export function useBikes(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data } = useQuery({
    queryKey: ['bikes', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bikes')
        .select('*, profiles!owner_id(username, display_name)')
        .eq('trip_id', effectiveTripId)
      if (error) throw error
      return data
    },
  })

  const saveBike = useMutation({
    mutationFn: async (bike: {
      id?: number
      name: string
      model?: string
      registration_number?: string
      tank_capacity?: number
      expected_mileage?: number
      current_odometer?: number
    }) => {
      const userId = await getEffectiveUserId()

      if (bike.id) {
        const { data, error } = await supabase
          .from('bikes').update(bike).eq('id', bike.id).select().single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('bikes').insert({ ...bike, trip_id: effectiveTripId, owner_id: userId }).select().single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bikes', effectiveTripId] }),
  })

  return { bikes: data ?? [], saveBike }
}

// ===== CHECKLIST =====
export function useChecklist(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data } = useQuery({
    queryKey: ['checklist', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('trip_id', effectiveTripId)
        .order('order_index')
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`checklist-${effectiveTripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items', filter: `trip_id=eq.${effectiveTripId}` },
        () => qc.invalidateQueries({ queryKey: ['checklist', effectiveTripId] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [effectiveTripId]) // eslint-disable-line

  const toggleCheck = useMutation({
    mutationFn: async ({ id, is_checked }: { id: number; is_checked: boolean }) => {
      const userId = await getEffectiveUserId()
      const { error } = await supabase.from('checklist_items').update({
        is_checked,
        checked_by: is_checked ? userId : null,
        checked_at: is_checked ? new Date().toISOString() : null,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', effectiveTripId] }),
  })

  return { items: data ?? [], toggleCheck }
}

// ===== ACTIVITY LOG =====
export function useActivityLog(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data } = useQuery({
    queryKey: ['activity', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, profiles!user_id(username, display_name)')
        .eq('trip_id', effectiveTripId)
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw error
      return data
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    const channel = supabase
      .channel(`activity-${effectiveTripId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `trip_id=eq.${effectiveTripId}` },
        () => qc.invalidateQueries({ queryKey: ['activity', effectiveTripId] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [effectiveTripId]) // eslint-disable-line

  const logActivity = useCallback(async (action: string, entityType?: string, entityId?: number, metadata?: Record<string, unknown>) => {
    const userId = await getEffectiveUserId()
    await supabase.from('activity_log').insert({
      trip_id: effectiveTripId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
  }, [effectiveTripId])

  return { activities: data ?? [], logActivity }
}

// ===== VISITED PLACES =====
export function useVisitedPlaces(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data } = useQuery({
    queryKey: ['visited', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visited_places')
        .select('*')
        .eq('trip_id', effectiveTripId)
      if (error) throw error
      return data
    },
  })

  const toggleVisited = useMutation({
    mutationFn: async ({ placeId, visited }: { placeId: number; visited: boolean }) => {
      const userId = await getEffectiveUserId()

      if (visited) {
        const { error } = await supabase.from('visited_places').insert({
          trip_id: effectiveTripId,
          user_id: userId,
          place_id: placeId,
        })
        if (error && !error.message.includes('duplicate')) throw error
      } else {
        const { error } = await supabase
          .from('visited_places')
          .delete()
          .eq('trip_id', effectiveTripId)
          .eq('place_id', placeId)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visited', effectiveTripId] }),
  })

  return {
    visitedPlaces: data ?? [],
    isVisited: (placeId: number) => (data ?? []).some((v) => v.place_id === placeId),
    toggleVisited,
  }
}

// ===== SAVED PLACES =====
export function useSavedPlaces(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const { data } = useQuery({
    queryKey: ['saved', effectiveTripId],
    queryFn: async () => {
      const userId = await getEffectiveUserId()
      const { data, error } = await supabase
        .from('saved_places')
        .select('*, places(*)')
        .eq('trip_id', effectiveTripId)
        .eq('user_id', userId)
      if (error) throw error
      return data
    },
  })

  const toggleSaved = useMutation({
    mutationFn: async ({ placeId, saved }: { placeId: number; saved: boolean }) => {
      const userId = await getEffectiveUserId()

      if (saved) {
        const { error } = await supabase.from('saved_places').insert({
          trip_id: effectiveTripId,
          user_id: userId,
          place_id: placeId,
          place_type: 'place',
        })
        if (error && !error.message.includes('duplicate')) throw error
      } else {
        const { error } = await supabase
          .from('saved_places')
          .delete()
          .eq('trip_id', effectiveTripId)
          .eq('user_id', userId)
          .eq('place_id', placeId)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved', effectiveTripId] }),
  })

  return {
    savedPlaces: data ?? [],
    isSaved: (placeId: number) => (data ?? []).some((s) => s.place_id === placeId),
    toggleSaved,
  }
}

// ===== BUDGET =====
export function useBudget(tripId: number | null) {
  const qc = useQueryClient()
  const effectiveTripId = getEffectiveTripId(tripId)

  const defaultBudget = {
    id: 1,
    trip_id: effectiveTripId,
    total_budget: 10000,
    fuel_budget: 3000,
    stay_budget: 3500,
    food_budget: 2000,
    activities_budget: 500,
    shopping_budget: 500,
    emergency_budget: 500,
  }

  const { data } = useQuery({
    queryKey: ['budget', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_budget')
        .select('*')
        .eq('trip_id', effectiveTripId)
        .maybeSingle()
      if (error || !data) return defaultBudget
      return data
    },
  })

  const saveBudget = useMutation({
    mutationFn: async (budget: {
      total_budget: number
      fuel_budget?: number
      stay_budget?: number
      food_budget?: number
      activities_budget?: number
      shopping_budget?: number
      emergency_budget?: number
    }) => {
      const { data: existing } = await supabase.from('trip_budget').select('id').eq('trip_id', effectiveTripId).maybeSingle()

      if (existing) {
        const { error } = await supabase.from('trip_budget').update(budget).eq('trip_id', effectiveTripId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('trip_budget').insert({ trip_id: effectiveTripId, ...budget })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget', effectiveTripId] }),
  })

  return { budget: data ?? defaultBudget, saveBudget }
}

// ===== WEATHER =====
const OWM_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function fetchWeather(lat: number, lon: number) {
  if (!OWM_API_KEY) return null

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

export function useWeather(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: !!(lat && lon && OWM_API_KEY),
    staleTime: 600000, // 10 min
    retry: 1,
  })
}

// ===== TRIP MEMBERS / PROFILES =====
export function useTripMembers(tripId: number | null) {
  const effectiveTripId = getEffectiveTripId(tripId)
  return useQuery({
    queryKey: ['members', effectiveTripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_members')
        .select('*, profiles(id, username, display_name, avatar_url)')
        .eq('trip_id', effectiveTripId)
      if (error || !data || data.length === 0) return DEFAULT_MEMBERS
      return data
    },
    staleTime: 30000,
  })
}
