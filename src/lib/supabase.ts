import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'munnar-trip-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
      trips: {
        Row: {
          id: number
          name: string
          start_date: string
          end_date: string
          description: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      trip_members: {
        Row: {
          id: number
          trip_id: number
          user_id: string
          role: string
          joined_at: string
        }
      }
      places: {
        Row: {
          id: number
          name: string
          slug: string
          category: string
          subcategory: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          altitude: number | null
          distance_from_munnar: number | null
          estimated_travel_time: number | null
          recommended_duration: number | null
          entry_fee: number | null
          opening_time: string | null
          closing_time: string | null
          best_time: string | null
          difficulty: string | null
          rating: number | null
          image_url: string | null
          official_url: string | null
          notes: string | null
          requires_permit: boolean
          requires_guide: boolean
          is_verified: boolean
          status: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
