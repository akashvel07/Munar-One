-- ============================================================
-- MUNNAR BIKE TRIP — ALL-IN-ONE MASTER DATABASE SCHEMA & SEED
-- Paste and Run this in your Supabase SQL Editor
-- Total Budget: ₹10,000 | Trip Dates: Oct 2 - 4, 2026
-- Riders: Akash & Vinoth
-- ============================================================

-- 1. DROP EXISTING TABLES IN REVERSE ORDER
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.weather_snapshots CASCADE;
DROP TABLE IF EXISTS public.checklist_items CASCADE;
DROP TABLE IF EXISTS public.visited_places CASCADE;
DROP TABLE IF EXISTS public.saved_places CASCADE;
DROP TABLE IF EXISTS public.trip_budget CASCADE;
DROP TABLE IF EXISTS public.expense_splits CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.itinerary_items CASCADE;
DROP TABLE IF EXISTS public.ride_points CASCADE;
DROP TABLE IF EXISTS public.ride_sessions CASCADE;
DROP TABLE IF EXISTS public.fuel_logs CASCADE;
DROP TABLE IF EXISTS public.bikes CASCADE;
DROP TABLE IF EXISTS public.petrol_pumps CASCADE;
DROP TABLE IF EXISTS public.food_items CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.waterfalls CASCADE;
DROP TABLE IF EXISTS public.treks CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;
DROP TABLE IF EXISTS public.trip_members CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRIPS
CREATE TABLE public.trips (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRIP MEMBERS
CREATE TABLE public.trip_members (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- 6. PLACES
CREATE TABLE public.places (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  altitude INTEGER,
  distance_from_munnar DECIMAL(6, 2),
  estimated_travel_time INTEGER,
  recommended_duration INTEGER,
  entry_fee DECIMAL(8, 2),
  opening_time TIME,
  closing_time TIME,
  best_time TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'extreme')),
  rating DECIMAL(2, 1),
  image_url TEXT,
  official_url TEXT,
  notes TEXT,
  requires_permit BOOLEAN DEFAULT false,
  requires_guide BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'seasonal', 'unknown')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TREKS
CREATE TABLE public.treks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'hard', 'extreme')),
  distance_km DECIMAL(5, 2) NOT NULL,
  duration_min DECIMAL(4, 2) NOT NULL,
  duration_max DECIMAL(4, 2) NOT NULL,
  elevation_gain INTEGER,
  starting_altitude INTEGER,
  highest_point INTEGER,
  requires_permit BOOLEAN DEFAULT false,
  requires_guide BOOLEAN DEFAULT false,
  permit_cost DECIMAL(8, 2),
  recommended_start_time TIME,
  water_available BOOLEAN DEFAULT false,
  signal_available BOOLEAN DEFAULT false,
  what_to_carry TEXT[],
  safety_notes TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WATERFALLS
CREATE TABLE public.waterfalls (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_from_munnar DECIMAL(6, 2),
  trek_required BOOLEAN DEFAULT false,
  trek_distance_km DECIMAL(4, 2) DEFAULT 0,
  best_season TEXT,
  safety_notes TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RESTAURANTS
CREATE TABLE public.restaurants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cuisine TEXT[],
  category TEXT[],
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  phone TEXT,
  price_range TEXT CHECK (price_range IN ('budget', 'moderate', 'expensive')),
  opening_time TIME,
  closing_time TIME,
  serves_breakfast BOOLEAN DEFAULT false,
  serves_lunch BOOLEAN DEFAULT false,
  serves_dinner BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1),
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FOOD ITEMS
CREATE TABLE public.food_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  is_vegetarian BOOLEAN DEFAULT true,
  typical_price_min DECIMAL(7, 2),
  typical_price_max DECIMAL(7, 2),
  where_to_find TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PETROL PUMPS
CREATE TABLE public.petrol_pumps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  brand TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  phone TEXT,
  has_petrol BOOLEAN DEFAULT true,
  has_diesel BOOLEAN DEFAULT true,
  has_ev_charging BOOLEAN DEFAULT false,
  opening_time TIME,
  closing_time TIME,
  is_24h BOOLEAN DEFAULT false,
  distance_from_munnar DECIMAL(6, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BIKES
CREATE TABLE public.bikes (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  model TEXT,
  registration_number TEXT,
  tank_capacity DECIMAL(5, 2),
  expected_mileage DECIMAL(5, 2),
  current_odometer DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FUEL LOGS
CREATE TABLE public.fuel_logs (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  bike_id BIGINT REFERENCES public.bikes(id),
  odometer DECIMAL(10, 2) NOT NULL,
  litres DECIMAL(6, 3) NOT NULL,
  price_per_litre DECIMAL(7, 2) NOT NULL,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  fuel_station TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. RIDE SESSIONS & POINTS
CREATE TABLE public.ride_sessions (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  bike_id BIGINT REFERENCES public.bikes(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  distance DECIMAL(8, 3),
  average_speed DECIMAL(6, 2),
  max_speed DECIMAL(6, 2),
  elevation_gain INTEGER,
  elevation_loss INTEGER,
  fuel_estimate DECIMAL(6, 3),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  route_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ride_points (
  id BIGSERIAL PRIMARY KEY,
  ride_session_id BIGINT NOT NULL REFERENCES public.ride_sessions(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(8, 2),
  speed DECIMAL(6, 2),
  heading DECIMAL(6, 2),
  accuracy DECIMAL(8, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ITINERARY ITEMS
CREATE TABLE public.itinerary_items (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  place_id BIGINT REFERENCES public.places(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  duration INTEGER,
  travel_time INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 16. EXPENSES & SPLITS
CREATE TABLE public.expenses (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  paid_by UUID NOT NULL REFERENCES public.profiles(id),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.expense_splits (
  id BIGSERIAL PRIMARY KEY,
  expense_id BIGINT NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  UNIQUE(expense_id, user_id)
);

-- 17. TRIP BUDGET (₹10,000 DEFAULT)
CREATE TABLE public.trip_budget (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT UNIQUE NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  total_budget DECIMAL(12, 2) NOT NULL DEFAULT 10000,
  fuel_budget DECIMAL(10, 2) DEFAULT 3000,
  stay_budget DECIMAL(10, 2) DEFAULT 3500,
  food_budget DECIMAL(10, 2) DEFAULT 2000,
  activities_budget DECIMAL(10, 2) DEFAULT 500,
  shopping_budget DECIMAL(10, 2) DEFAULT 500,
  emergency_budget DECIMAL(10, 2) DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. SAVED & VISITED PLACES
CREATE TABLE public.saved_places (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  place_id BIGINT REFERENCES public.places(id),
  trek_id BIGINT REFERENCES public.treks(id),
  waterfall_id BIGINT REFERENCES public.waterfalls(id),
  restaurant_id BIGINT REFERENCES public.restaurants(id),
  place_type TEXT NOT NULL CHECK (place_type IN ('place', 'trek', 'waterfall', 'restaurant', 'food', 'petrol')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id, place_id)
);

CREATE TABLE public.visited_places (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  place_id BIGINT NOT NULL REFERENCES public.places(id),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(trip_id, place_id)
);

-- 19. CHECKLIST ITEMS
CREATE TABLE public.checklist_items (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  checked_by UUID REFERENCES public.profiles(id),
  checked_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, title)
);

-- 20. WEATHER SNAPSHOTS
CREATE TABLE public.weather_snapshots (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  temperature DECIMAL(5, 2),
  feels_like DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(6, 2),
  rain_probability INTEGER,
  description TEXT,
  icon TEXT,
  visibility INTEGER,
  sunrise TIMESTAMPTZ,
  sunset TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ACTIVITY LOG
CREATE TABLE public.activity_log (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (PERMISSIVE FOR BOTH ANON & AUTH)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_select_all" ON public.trips FOR SELECT USING (true);
CREATE POLICY "trips_write_all" ON public.trips FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_members_select_all" ON public.trip_members FOR SELECT USING (true);
CREATE POLICY "trip_members_write_all" ON public.trip_members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "places_select_all" ON public.places FOR SELECT USING (true);
CREATE POLICY "places_write_all" ON public.places FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.treks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treks_select_all" ON public.treks FOR SELECT USING (true);
CREATE POLICY "treks_write_all" ON public.treks FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.waterfalls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waterfalls_select_all" ON public.waterfalls FOR SELECT USING (true);
CREATE POLICY "waterfalls_write_all" ON public.waterfalls FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "restaurants_select_all" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "restaurants_write_all" ON public.restaurants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_items_select_all" ON public.food_items FOR SELECT USING (true);
CREATE POLICY "food_items_write_all" ON public.food_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.petrol_pumps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "petrol_pumps_select_all" ON public.petrol_pumps FOR SELECT USING (true);
CREATE POLICY "petrol_pumps_write_all" ON public.petrol_pumps FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bikes_select_all" ON public.bikes FOR SELECT USING (true);
CREATE POLICY "bikes_write_all" ON public.bikes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fuel_logs_select_all" ON public.fuel_logs FOR SELECT USING (true);
CREATE POLICY "fuel_logs_write_all" ON public.fuel_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ride_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_sessions_select_all" ON public.ride_sessions FOR SELECT USING (true);
CREATE POLICY "ride_sessions_write_all" ON public.ride_sessions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ride_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_points_select_all" ON public.ride_points FOR SELECT USING (true);
CREATE POLICY "ride_points_write_all" ON public.ride_points FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itinerary_items_select_all" ON public.itinerary_items FOR SELECT USING (true);
CREATE POLICY "itinerary_items_write_all" ON public.itinerary_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_select_all" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "expenses_write_all" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_splits_select_all" ON public.expense_splits FOR SELECT USING (true);
CREATE POLICY "expense_splits_write_all" ON public.expense_splits FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.trip_budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_budget_select_all" ON public.trip_budget FOR SELECT USING (true);
CREATE POLICY "trip_budget_write_all" ON public.trip_budget FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_places_select_all" ON public.saved_places FOR SELECT USING (true);
CREATE POLICY "saved_places_write_all" ON public.saved_places FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.visited_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visited_places_select_all" ON public.visited_places FOR SELECT USING (true);
CREATE POLICY "visited_places_write_all" ON public.visited_places FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_items_select_all" ON public.checklist_items FOR SELECT USING (true);
CREATE POLICY "checklist_items_write_all" ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.weather_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather_snapshots_select_all" ON public.weather_snapshots FOR SELECT USING (true);
CREATE POLICY "weather_snapshots_write_all" ON public.weather_snapshots FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_log_select_all" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "activity_log_write_all" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_items; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_splits; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_logs; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.visited_places; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bikes; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_sessions; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_budget; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- ============================================================
-- SEED DATA: PROFILES (Akash & Vinoth)
-- ============================================================
INSERT INTO public.profiles (id, username, display_name, avatar_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'akash', 'Akash', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('a0000000-0000-0000-0000-000000000002', 'vinoth', 'Vinoth', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- ============================================================
-- SEED DATA: TRIP (Munnar Bike Trip)
-- ============================================================
INSERT INTO public.trips (id, name, start_date, end_date, description, created_by) VALUES
(1, 'Munnar Bike Trip', '2026-10-02', '2026-10-04', 'Akash & Vinoth''s 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Restart sequence if needed
SELECT setval('public.trips_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.trips));

-- ============================================================
-- SEED DATA: TRIP MEMBERS
-- ============================================================
INSERT INTO public.trip_members (trip_id, user_id, role) VALUES
(1, 'a0000000-0000-0000-0000-000000000001', 'admin'),
(1, 'a0000000-0000-0000-0000-000000000002', 'member')
ON CONFLICT (trip_id, user_id) DO NOTHING;

-- ============================================================
-- SEED DATA: TRIP BUDGET (₹10,000)
-- ============================================================
INSERT INTO public.trip_budget (trip_id, total_budget, fuel_budget, stay_budget, food_budget, activities_budget, shopping_budget, emergency_budget) VALUES
(1, 10000, 3000, 3500, 2000, 500, 500, 500)
ON CONFLICT (trip_id) DO UPDATE SET total_budget = 10000, fuel_budget = 3000, stay_budget = 3500, food_budget = 2000;

-- ============================================================
-- SEED DATA: DEFAULT BIKES
-- ============================================================
INSERT INTO public.bikes (id, trip_id, owner_id, name, model, registration_number, tank_capacity, expected_mileage, current_odometer) VALUES
(1, 1, 'a0000000-0000-0000-0000-000000000001', 'KTM Duke 200', 'Duke 200 (BS6)', 'TN 38 BX 2026', 13.4, 35.0, 14200.0)
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.bikes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.bikes));

-- ============================================================
-- SEED DATA: 26 MUNNAR PLACES
-- ============================================================
INSERT INTO public.places (name, slug, category, subcategory, description, latitude, longitude, altitude, distance_from_munnar, estimated_travel_time, recommended_duration, entry_fee, opening_time, closing_time, best_time, difficulty, rating, notes, is_verified, status) VALUES
('Munnar Town', 'munnar-town', 'town', 'base', 'The main town of Munnar, the commercial and tourism hub nestled at the confluence of three mountain streams. Gateway to all attractions.', 10.0889, 77.0595, 1600, 0, 0, 120, 0.00, null, null, 'October to February', 'easy', null, 'Shops, ATMs, medical facilities, hotels, and restaurants available. Signal generally good.', true, 'active'),
('Munnar Tea Museum', 'tea-museum', 'museum', 'tea', 'Tata Tea Museum showcasing the history of tea cultivation in Munnar since 1880. Includes working machinery, exhibits, and tea tasting.', 10.0870, 77.0565, 1590, 1, 5, 90, 75.00, '09:00', '17:00', 'Any time during trip', 'easy', 4.2, 'Closed on Mondays. Entry includes tea tasting. Photography allowed inside.', true, 'active'),
('Mattupetty Dam', 'mattupetty-dam', 'dam', 'scenic', 'A picturesque shola dam built in 1940, surrounded by dense shola forests and rolling hills. Boating available on the lake.', 10.1226, 77.0895, 1700, 13, 30, 120, 0.00, '09:00', '17:00', 'Morning preferred', 'easy', 4.4, 'Speed boat and pedal boat rides available for a fee (~₹200-400/person). Crowds peak on weekends.', true, 'active'),
('Mattupetty Lake', 'mattupetty-lake', 'lake', 'scenic', 'Serene artificial reservoir surrounded by eucalyptus and tea plantations. Perfect for photography and peaceful walks along the banks.', 10.1220, 77.0885, 1700, 13, 30, 60, 0.00, null, null, 'Early morning for mist', 'easy', 4.3, 'Best in early morning when mist covers the water. Free to visit the lakeside area.', true, 'active'),
('Echo Point', 'echo-point', 'viewpoint', 'natural', 'Famous for its natural echo effect. A stunning valley viewpoint where your shouts echo back from the surrounding mountains. Located between Munnar and Top Station.', 10.1367, 77.0980, 1800, 15, 35, 60, 0.00, '07:00', '18:00', 'Early morning', 'easy', 4.0, 'Crowds can be very heavy on weekends. Best visited early morning on weekdays. Echo works best when crowds are thin.', true, 'active'),
('Kundala Lake', 'kundala-lake', 'lake', 'scenic', 'A crescent-shaped artificial lake at high altitude, surrounded by tea plantations. Pedal boat rides and arch bridge viewpoint. Near Top Station route.', 10.1567, 77.0876, 1800, 21, 45, 90, 0.00, null, null, 'Afternoon light is excellent', 'easy', 4.2, 'Free entry. Pedal boats available for ~₹100-200. Tea estates surrounding the lake are beautiful for photography.', true, 'active'),
('Top Station', 'top-station', 'viewpoint', 'mountain', 'The highest point accessible by road in Munnar at ~1,700m. Offers panoramic views of the Western Ghats and Tamil Nadu plains. Also the highest point of the former Kannan Devan Hills Railway.', 10.2073, 77.1213, 1700, 32, 75, 90, 0.00, '06:00', '18:00', 'Clear mornings, avoid monsoon', 'easy', 4.5, 'Road can be narrow and steep — take care on bikes. Views blocked during monsoon by clouds. No petrol station beyond Kundala Lake.', true, 'active'),
('Eravikulam National Park', 'eravikulam-national-park', 'nature', 'wildlife', 'UNESCO World Heritage tentative-list site. Home to the endangered Nilgiri Tahr, rhododendron forests, and the sacred Anamudi peak. One of India''s most biodiverse protected areas.', 10.1667, 77.0833, 2000, 12, 28, 240, 125.00, '07:30', '16:00', 'October to January (dry season)', 'easy', 4.6, 'Park closed Feb-March for Tahr calving season. Book tickets in advance online — they sell out. Vehicles not allowed inside. Free shuttle buses run from gate. No bikes inside park.', true, 'active'),
('Pothamedu View Point', 'pothamedu-viewpoint', 'viewpoint', 'scenic', 'A sweeping 180° panoramic viewpoint overlooking tea, coffee, and cardamom plantations. One of the best sunset spots in Munnar.', 10.0815, 77.0451, 1640, 3, 10, 60, 10.00, '08:00', '18:00', 'Sunset (5-6 PM)', 'easy', 4.3, 'Small entry fee. Excellent for sunset photography. Walking path through tea estates.', true, 'active'),
('Attukad Waterfalls', 'attukad-waterfalls', 'waterfall', 'natural', 'One of the most spectacular waterfalls near Munnar. The waterfall drops dramatically through dense forest. Visible from the road.', 10.0614, 77.0431, 1480, 9, 22, 60, 0.00, null, null, 'After monsoon (Oct-Nov) for full flow', 'easy', 4.4, 'Water flow depends heavily on recent rainfall. Best after monsoon. Slippery rocks — exercise caution. Do not cross the river during heavy rains.', true, 'active'),
('Lakkam Waterfalls', 'lakkam-waterfalls', 'waterfall', 'natural', 'Beautiful multi-tiered waterfall inside a Kerala Forest Department area near Marayoor. A short trek leads to the falls through shola forest.', 10.3195, 77.1587, 1100, 40, 80, 120, 10.00, '08:00', '17:00', 'October to December', 'easy', 4.2, 'Small entry fee. 500m easy walk from parking. Water flow best October-December. Forest department collects fees.', true, 'active'),
('Nyayamakad Waterfalls', 'nyayamakad-waterfalls', 'waterfall', 'natural', 'A dramatic waterfall in the dense shola forests above Marayoor. Higher altitude and less crowded than Attukad. Requires a short forest trek.', 10.3289, 77.1876, 1200, 45, 90, 150, 0.00, null, null, 'October to January', 'moderate', 4.1, 'No formal entry fee but donation expected. Less accessible than other falls — track condition varies. Forest area — stay on marked paths.', false, 'active'),
('Chinnakanal Waterfalls', 'chinnakanal-waterfalls', 'waterfall', 'natural', 'Impressive waterfall near Chinnakanal village on the Munnar-Udumalpet road. The waterfall cascades down from the roadside, making it easily accessible.', 10.0287, 77.0931, 1250, 18, 40, 45, 0.00, null, null, 'Post-monsoon', 'easy', 4.0, 'Freely accessible. Visible directly from roadside. Slippery area — use caution on wet rocks.', true, 'active'),
('Lockhart Gap', 'lockhart-gap', 'viewpoint', 'mountain', 'A high mountain pass connecting Munnar to Marayoor, offering jaw-dropping views into deep valleys. A biker''s paradise with dramatic curves and mountain scenery.', 10.2127, 77.1450, 1900, 28, 55, 45, 0.00, null, null, 'Clear mornings', 'easy', 4.5, 'Excellent road for motorcycle riding. Views into Tamil Nadu plains on clear days. Can be foggy/misty in mornings — use headlights. No fuel stops between Munnar and Marayoor.', true, 'active'),
('Marayoor Sandalwood Forest', 'marayoor-sandalwood', 'forest', 'protected', 'One of the only natural sandalwood forests in Kerala, protected by the forest department. Ancient dolmens (megalithic burial chambers) also found nearby.', 10.2987, 77.1534, 1100, 41, 85, 120, 15.00, '08:00', '17:00', 'Morning', 'easy', 4.0, 'Entry by permit only — obtain from Forest Range Office. Guided tour mandatory. Phones may need to be surrendered. Book in advance.', true, 'active'),
('Blossom International Park', 'blossom-park', 'garden', 'leisure', 'Well-maintained garden with flowering plants, a children''s park, and boating facility. Popular with families. One of the major developed tourist spots.', 10.0876, 77.0623, 1580, 1, 5, 90, 50.00, '09:00', '18:00', 'Morning', 'easy', 3.8, 'Entry fee applies. Boating extra. Can get crowded on weekends. Better for a relaxed visit in the morning.', true, 'active'),
('Photo Point', 'photo-point', 'viewpoint', 'scenic', 'A designated viewpoint on the road between Munnar and Top Station offering beautiful views of the valley and tea plantations. Excellent for photography.', 10.1450, 77.1015, 1750, 17, 38, 30, 0.00, null, null, 'Morning light', 'easy', 4.1, 'Free roadside viewpoint. Best in morning light. Popular spot for photos. Can be crowded. Safe to park bikes at the side.', true, 'active'),
('Kanthalloor', 'kanthalloor', 'town', 'village', 'Scenic hill village known for apple orchards, peach gardens, and strawberry farms. Situated at around 1200m, it has a completely different microclimate from Munnar.', 10.3567, 77.2345, 1200, 55, 110, 120, 0.00, null, null, 'January to March (fruit season)', 'easy', 4.2, 'Access road is narrow — drive carefully on bikes. Seasonal fruit: apples, peaches, grapes depending on season. October may have limited fruit but beautiful scenery.', true, 'active'),
('Vattavada', 'vattavada', 'village', 'scenic', 'Remote, scenic hamlet at the highest motorable point in the Idukki district. Known for vegetable farming at altitude, wild strawberries, and stunning views.', 10.2876, 77.2134, 1850, 62, 120, 150, 0.00, null, null, 'Year-round', 'easy', 4.4, 'Very remote — limited phone signal and no petrol pump. Roads are narrow mountain paths — experienced riders only. Carry sufficient fuel (check range before leaving Munnar). Worth it for the views.', true, 'active'),
('Anamudi Peak', 'anamudi-peak', 'trek', 'peak', 'The highest peak in the Western Ghats at 2,695m. Trekking is restricted and requires permission from Kerala Forest Department. Managed through Eravikulam National Park.', 10.1703, 77.0637, 2695, 12, 30, 480, null, '06:00', '14:00', 'November to February', 'hard', 4.8, 'PERMIT REQUIRED — Apply to DFO Eravikulam at least 2 weeks in advance. Maximum 25 trekkers per day. Strenuous trek for experienced trekkers only. Check current permit status before planning.', false, 'seasonal'),
('Devikulam', 'devikulam', 'lake', 'scenic', 'A small hill station near Munnar with a beautiful lake, waterfalls, and colonial-era tea estates. Less crowded than main Munnar spots.', 10.0534, 77.0887, 1800, 5, 15, 90, 0.00, null, null, 'Any time', 'easy', 4.1, 'A good alternative to crowded viewpoints. Peaceful and scenic. Easy bike ride from Munnar.', true, 'active'),
('Anayirankal Dam', 'anayirankal-dam', 'dam', 'scenic', 'Remote and scenic dam near Munnar with excellent views. Off the typical tourist circuit — less crowded. Good stop on the route toward Vattavada.', 10.1987, 77.1234, 1820, 20, 50, 60, 0.00, null, null, 'Morning', 'easy', 4.0, 'Less visited than Mattupetty. Roads approaching can be narrow. Beautiful for photography.', false, 'active'),
('NDDB Indo-Swiss Dairy Farm', 'indo-swiss-dairy', 'attraction', 'agricultural', 'Working dairy farm established with Swiss collaboration. You can see Jersey and Brown Swiss cattle, milking operations, and the pastoral landscape.', 10.1198, 77.0856, 1690, 12, 30, 60, 0.00, '10:00', '17:00', 'Morning', 'easy', 3.9, 'Free entry to the farm area. Good photo opportunity. Combine with Mattupetty visit as it is nearby.', true, 'active'),
('Chinnakanal', 'chinnakanal', 'viewpoint', 'scenic', 'Scenic area between Munnar and Udumalpet highway. Known for beautiful valleys, the Chinnakanal waterfall, and rolling hills. Good for bikers.', 10.0289, 77.0923, 1260, 18, 40, 60, 0.00, null, null, 'Any time', 'easy', 4.0, 'Pleasant motorcycle route. Roadside viewpoints available. Combine with the waterfall visit.', true, 'active'),
('Gap Road (Munnar–Marayoor)', 'gap-road', 'road', 'biking', 'One of the most scenic motorcycle roads in Kerala — the highway through Lockhart Gap connecting Munnar to Marayoor. Hairpin bends, mountain views, tea estates, and shola forests.', 10.2000, 77.1300, 1700, 25, 55, 0, 0.00, null, null, 'Clear morning', 'moderate', 4.8, 'Best motorcycle road in the region. Steep sections — use engine braking on descents. Carry water and sufficient fuel. Morning for clearest views. Can be foggy/misty.', true, 'active'),
('Rajamala Trek', 'rajamala-trek', 'trek', 'forest', 'The main trekking trail inside Eravikulam National Park (part of the park visit). Walk through high-altitude shola grasslands with excellent chance of spotting Nilgiri Tahr.', 10.1667, 77.0820, 2000, 12, 28, 180, 125.00, '07:30', '15:00', 'November to January', 'moderate', 4.7, 'Entry fee covers the walk. Trail well-maintained. Do not leave marked path. No private vehicles inside — take park shuttle. Highest chance of seeing Nilgiri Tahr early morning.', true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: WATERFALLS
-- ============================================================
INSERT INTO public.waterfalls (name, slug, description, latitude, longitude, distance_from_munnar, trek_required, trek_distance_km, best_season, safety_notes, status) VALUES
('Attukad Waterfalls', 'attukad-falls', 'Dramatic waterfall near Munnar visible from the road.', 10.0614, 77.0431, 9, false, 0, 'October–December', 'Slippery rocks. Do not cross during heavy rain.', 'active'),
('Lakkam Waterfalls', 'lakkam-falls', 'Multi-tiered waterfall inside Marayoor Forest Reserve.', 10.3195, 77.1587, 40, true, 0.5, 'October–December', 'Stay on marked paths. Forest permit required.', 'active'),
('Nyayamakad Waterfalls', 'nyayamakad-falls', 'Remote high-altitude waterfall with dense forest surroundings.', 10.3289, 77.1876, 45, true, 1.5, 'October–January', 'Less maintained trail. Not recommended alone.', 'active'),
('Chinnakanal Waterfalls', 'chinnakanal-falls', 'Easily accessible roadside waterfall on Munnar-Udumalpet highway.', 10.0287, 77.0931, 18, false, 0, 'September–November', 'Slippery near rocks. Take care on wet surfaces.', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: RESTAURANTS
-- ============================================================
INSERT INTO public.restaurants (name, slug, cuisine, category, description, latitude, longitude, address, price_range, serves_breakfast, serves_lunch, serves_dinner, is_vegetarian, status) VALUES
('Rapsy Restaurant', 'rapsy-restaurant', ARRAY['kerala', 'indian'], ARRAY['local', 'budget'], 'Popular local restaurant serving authentic Kerala meals, appam, stew, and rice dishes. Frequented by locals and budget travellers.', 10.0875, 77.0603, 'Munnar Town', 'budget', true, true, true, false, 'active'),
('Hotel Zion', 'hotel-zion', ARRAY['kerala', 'north-indian'], ARRAY['local', 'moderate'], 'Well-known restaurant in Munnar town serving both Kerala and North Indian cuisine. Clean, comfortable seating.', 10.0882, 77.0597, 'Munnar Town', 'moderate', false, true, true, false, 'active'),
('The Greens Restaurant', 'greens-restaurant', ARRAY['kerala', 'continental'], ARRAY['multi-cuisine', 'moderate'], 'Scenic restaurant with views of the valley. Serves Kerala meals, continental dishes, and fresh juices.', 10.0876, 77.0621, 'Munnar Town', 'moderate', true, true, true, false, 'active'),
('SR Restaurant', 'sr-restaurant', ARRAY['kerala'], ARRAY['local', 'budget'], 'Budget-friendly South Indian and Kerala cuisine. Good for a quick meal. Known for fresh fish curry.', 10.0869, 77.0589, 'Munnar Town', 'budget', true, true, false, false, 'active'),
('Cloud Street Café', 'cloud-street-cafe', ARRAY['cafe', 'continental'], ARRAY['cafe', 'snacks'], 'Modern café with good coffee, sandwiches, and light snacks. Good WiFi. Popular with young travellers.', 10.0878, 77.0601, 'Munnar Town', 'moderate', true, false, false, true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: FOOD ITEMS
-- ============================================================
INSERT INTO public.food_items (name, slug, description, category, is_vegetarian, typical_price_min, typical_price_max, where_to_find) VALUES
('Kerala Sadya', 'kerala-sadya', 'Traditional Kerala feast served on banana leaf. Includes rice, sambar, rasam, aviyal, thoran, pachadi, pickle, papad, and payasam. Usually served on Sundays and special occasions.', 'meal', true, 150, 350, 'Kerala restaurants, temple feasts, hotel dining'),
('Appam and Stew', 'appam-stew', 'Soft, lacy rice-flour pancakes with a crispy edge and soft centre, served with a fragrant coconut milk stew with vegetables or chicken.', 'breakfast', false, 60, 150, 'Local restaurants and hotels for breakfast'),
('Puttu and Kadala Curry', 'puttu-kadala', 'Steamed rice flour cylinders layered with coconut, served with spicy black chickpea curry. Classic Kerala breakfast.', 'breakfast', true, 40, 100, 'Tea shops and small restaurants in Munnar'),
('Idiyappam', 'idiyappam', 'Delicate string hoppers made from rice flour pressed through a mold, served with coconut milk and egg or vegetable curry.', 'breakfast', false, 50, 120, 'Local hotels and restaurants for breakfast'),
('Kerala Parotta', 'kerala-parotta', 'Flaky, multi-layered flatbread made by folding ghee-coated dough. Usually served with beef or chicken curry in Kerala.', 'main', false, 30, 80, 'Roadside eateries and local restaurants'),
('Karimeen Pollichathu', 'karimeen-pollichathu', 'Pearl spot fish marinated in spices and coconut, wrapped in banana leaf and pan-fried. A celebrated Kerala delicacy.', 'seafood', false, 200, 500, 'Restaurants in Munnar, better availability in Kochi'),
('Kerala Fish Curry', 'kerala-fish-curry', 'Tangy, fiery curry made with fish in coconut milk and kudampuli (Gamboge). The quintessential Kerala lunch.', 'main', false, 80, 200, 'Most non-vegetarian restaurants'),
('Pazham Pori', 'pazham-pori', 'Ripe banana slices coated in a sweetened batter and deep fried to golden perfection. A popular Kerala snack.', 'snack', true, 10, 30, 'Tea shops, roadside stalls, bakeries throughout Munnar'),
('Unniyappam', 'unniyappam', 'Small, round sweet fritters made from rice flour, jaggery, and ripe banana. Temple offering and popular snack.', 'snack', true, 10, 20, 'Bakeries and sweet shops'),
('Banana Chips', 'banana-chips', 'Thin, crispy chips made from raw Kerala bananas fried in coconut oil. Iconic Kerala snack and a popular take-home souvenir.', 'snack', true, 50, 150, 'Supermarkets, shops throughout Munnar'),
('Munnar Tea', 'munnar-tea', 'Fresh aromatic tea grown in the high-altitude estates of Munnar. Available in multiple varieties: Dust, CTC, Orthodox, Green, and specialty blends.', 'beverage', true, 50, 500, 'Tea Museum shop, supermarkets, estate shops, roadside stalls'),
('Homemade Chocolate', 'homemade-chocolate', 'Munnar is known for small-batch handmade chocolates infused with cardamom, ginger, pepper, and other local spices.', 'sweet', true, 100, 400, 'Chocolate shops in Munnar town, Tea Museum area'),
('Cardamom', 'cardamom', 'Freshly harvested green cardamom from the estates around Munnar. One of the finest in the world due to altitude and climate.', 'spice', true, 100, 500, 'Spice shops, markets in Munnar town'),
('Wild Honey', 'wild-honey', 'Raw honey collected from wild rock beehives in the forest cliffs. Sold by local tribal communities. Thick, dark, and aromatic.', 'condiment', true, 200, 600, 'Local markets, Marayoor area, tribal vendors on roadsides')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: PETROL PUMPS
-- ============================================================
INSERT INTO public.petrol_pumps (name, brand, latitude, longitude, address, has_petrol, has_diesel, is_24h, distance_from_munnar, status) VALUES
('BPCL Munnar', 'BPCL', 10.0876, 77.0621, 'Munnar Town, Near Bus Stand', true, true, false, 0.5, 'active'),
('Indian Oil Munnar', 'Indian Oil', 10.0854, 77.0545, 'Old Munnar, NH 85', true, true, false, 1.2, 'active'),
('HP Petrol Pump', 'HP', 10.0823, 77.0489, 'Bodimettu Road, Munnar', true, true, false, 2.5, 'active'),
('Marayoor Petrol Pump', 'Indian Oil', 10.2934, 77.1489, 'Marayoor Town', true, true, false, 42.0, 'active')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DATA: TREKS
-- ============================================================
INSERT INTO public.treks (name, slug, difficulty, distance_km, duration_min, duration_max, elevation_gain, starting_altitude, highest_point, requires_permit, requires_guide, recommended_start_time, water_available, signal_available, what_to_carry, safety_notes, description, latitude, longitude, status) VALUES
('Rajamala (Eravikulam) Trek', 'rajamala-trek', 'moderate', 3.5, 2, 3, 400, 1800, 2200, true, false, '07:30', false, false, ARRAY['Water 1.5L', 'Sunscreen', 'Rain jacket', 'Good shoes'], 'Do not stray from marked path. Nilgiri Tahr are wild animals — keep distance. No food inside park.', 'Well-marked trail through high-altitude shola grasslands. Part of Eravikulam National Park visit. Excellent chance of spotting Nilgiri Tahr up close.', 10.1667, 77.0820, 'active'),
('Top Station Shola Trek', 'top-station-trek', 'easy', 2, 1, 2, 150, 1600, 1750, false, false, '08:00', false, false, ARRAY['Water', 'Snacks', 'Camera', 'Windcheater'], 'Road is windy — secure bike. Fog can roll in suddenly.', 'Short walk from Top Station viewpoint into the bordering shola forest. Excellent views of Kerala-Tamil Nadu border hills.', 10.2073, 77.1213, 'active'),
('Meesapulimala Trek', 'meesapulimala-trek', 'hard', 14, 7, 9, 900, 1800, 2640, true, true, '05:30', false, false, ARRAY['3L water', 'High-energy food', 'Rain gear', 'Trekking poles', 'First aid'], 'Advance permit required from forest department. Only with licensed guide. Strenuous — good fitness required. Weather changes rapidly at this altitude.', 'One of the most challenging treks in Kerala. Meesapulimala is the 2nd highest peak in Kerala at 2,640m. Through rolling grasslands, rhododendron forests, and high shola. Stunning 360° summit views.', 10.1289, 77.0534, 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: CHECKLIST ITEMS
-- ============================================================
INSERT INTO public.checklist_items (trip_id, category, title, order_index) VALUES
(1, 'bike', 'Check fuel level & top-up at BPCL Munnar', 1),
(1, 'bike', 'Check engine oil & coolant levels', 2),
(1, 'bike', 'Check tyre pressure (Front 29 psi / Rear 32 psi)', 3),
(1, 'bike', 'Check front & rear disc brakes + lever play', 4),
(1, 'bike', 'Clean, inspect & lubricate drive chain', 5),
(1, 'bike', 'Verify headlight (high/low), tail light & indicators', 6),
(1, 'bike', 'Tubeless tyre puncture repair kit & portable inflator', 7),
(1, 'bike', 'Spare clutch lever & basic toolkit', 8),
(1, 'personal', 'DOT/ECE certified full-face helmet with clear visor', 1),
(1, 'personal', 'Armoured riding jacket (breathable + rain liner)', 2),
(1, 'personal', 'Riding gloves with knuckle protection', 3),
(1, 'personal', 'Waterproof rain gear (jacket + pant set)', 4),
(1, 'personal', 'Riding boots or sturdy ankle-high shoes', 5),
(1, 'personal', 'High-capacity power bank (20,000 mAh)', 6),
(1, 'personal', 'First-aid kit (bandages, antiseptic, pain relievers, ORS)', 7),
(1, 'personal', '2x Insulated water bottles (minimum 2L)', 8),
(1, 'personal', 'Energy bars, glucose biscuits & dry fruits', 9),
(1, 'personal', 'Emergency cash ₹3,000 in small denominations', 10),
(1, 'personal', 'UV sunglasses & high-SPF sunscreen', 11),
(1, 'documents', 'Original Driving Licence + digital copy in DigiLocker', 1),
(1, 'documents', 'Vehicle Registration Certificate (RC)', 2),
(1, 'documents', 'Valid bike insurance policy papers', 3),
(1, 'documents', 'Pollution Under Control (PUC) certificate', 4),
(1, 'documents', 'Government Photo ID (Aadhaar / Voter ID)', 5),
(1, 'documents', 'Munnar hotel & tent stay booking confirmations', 6),
(1, 'documents', 'Offline emergency contact numbers saved on phone', 7)
ON CONFLICT (trip_id, title) DO NOTHING;

-- Done!
