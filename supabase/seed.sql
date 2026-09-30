-- ============================================================
-- MUNNAR TRIP DATABASE SEED
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Create auth users in Supabase
-- Run these via the Supabase Auth UI or API.
-- Below we only seed the profiles table (triggers auto-run handle_new_user).
-- Use Supabase Dashboard > Authentication > Users > "Add User" with:
--
--   Email: akash@munnartrip.local
--   Password: MunnarRide2026!
--   Metadata: {"username": "akash", "display_name": "Akash"}
--
--   Email: vinoth@munnartrip.local
--   Password: MunnarRide2026!
--   Metadata: {"username": "vinoth", "display_name": "Vinoth"}
--
-- OR use the Supabase Management API / seed script.
-- Passwords should be changed after first login via Settings > Security.
-- ============================================================

-- Ensure unique constraints exist even if tables were created in earlier runs
DO $$
BEGIN
  ALTER TABLE public.trips ADD CONSTRAINT trips_name_key UNIQUE (name);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.petrol_pumps ADD CONSTRAINT petrol_pumps_name_key UNIQUE (name);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.checklist_items ADD CONSTRAINT checklist_items_trip_id_title_key UNIQUE (trip_id, title);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- TRIP
-- ============================================================
INSERT INTO public.trips (name, start_date, end_date, description)
SELECT 
  'Munnar Bike Trip',
  '2026-10-02',
  '2026-10-04',
  'Akash & Vinoth''s 3-day motorcycle adventure through the Western Ghats and tea estates of Munnar, Kerala.'
WHERE NOT EXISTS (SELECT 1 FROM public.trips WHERE name = 'Munnar Bike Trip');

-- ============================================================
-- TRIP BUDGET (₹10,000)
-- ============================================================
INSERT INTO public.trip_budget (trip_id, total_budget, fuel_budget, stay_budget, food_budget, activities_budget, shopping_budget, emergency_budget)
SELECT id, 10000, 3000, 3500, 2000, 500, 500, 500 
FROM public.trips 
WHERE name = 'Munnar Bike Trip'
AND NOT EXISTS (
  SELECT 1 FROM public.trip_budget tb 
  JOIN public.trips t ON tb.trip_id = t.id 
  WHERE t.name = 'Munnar Bike Trip'
);

-- ============================================================
-- PLACES / DESTINATIONS
-- ============================================================
INSERT INTO public.places (name, slug, category, subcategory, description, latitude, longitude, altitude, distance_from_munnar, estimated_travel_time, recommended_duration, entry_fee, opening_time, closing_time, best_time, difficulty, rating, notes, is_verified, status) VALUES

-- MUNNAR TOWN
('Munnar Town', 'munnar-town', 'town', 'base', 'The main town of Munnar, the commercial and tourism hub nestled at the confluence of three mountain streams. Gateway to all attractions.', 10.0889, 77.0595, 1600, 0, 0, 120, 0.00, null, null, 'October to February', 'easy', null, 'Shops, ATMs, medical facilities, hotels, and restaurants available. Signal generally good.', true, 'active'),

-- TEA MUSEUM
('Munnar Tea Museum', 'tea-museum', 'museum', 'tea', 'Tata Tea Museum showcasing the history of tea cultivation in Munnar since 1880. Includes working machinery, exhibits, and tea tasting.', 10.0870, 77.0565, 1590, 1, 5, 90, 75.00, '09:00', '17:00', 'Any time during trip', 'easy', 4.2, 'Closed on Mondays. Entry includes tea tasting. Photography allowed inside.', true, 'active'),

-- MATTUPETTY DAM & LAKE
('Mattupetty Dam', 'mattupetty-dam', 'dam', 'scenic', 'A picturesque shola dam built in 1940, surrounded by dense shola forests and rolling hills. Boating available on the lake.', 10.1226, 77.0895, 1700, 13, 30, 120, 0.00, '09:00', '17:00', 'Morning preferred', 'easy', 4.4, 'Speed boat and pedal boat rides available for a fee (~₹200-400/person). Crowds peak on weekends.', true, 'active'),

('Mattupetty Lake', 'mattupetty-lake', 'lake', 'scenic', 'Serene artificial reservoir surrounded by eucalyptus and tea plantations. Perfect for photography and peaceful walks along the banks.', 10.1220, 77.0885, 1700, 13, 30, 60, 0.00, null, null, 'Early morning for mist', 'easy', 4.3, 'Best in early morning when mist covers the water. Free to visit the lakeside area.', true, 'active'),

-- ECHO POINT
('Echo Point', 'echo-point', 'viewpoint', 'natural', 'Famous for its natural echo effect. A stunning valley viewpoint where your shouts echo back from the surrounding mountains. Located between Munnar and Top Station.', 10.1367, 77.0980, 1800, 15, 35, 60, 0.00, '07:00', '18:00', 'Early morning', 'easy', 4.0, 'Crowds can be very heavy on weekends. Best visited early morning on weekdays. Echo works best when crowds are thin.', true, 'active'),

-- KUNDALA LAKE
('Kundala Lake', 'kundala-lake', 'lake', 'scenic', 'A crescent-shaped artificial lake at high altitude, surrounded by tea plantations. Pedal boat rides and arch bridge viewpoint. Near Top Station route.', 10.1567, 77.0876, 1800, 21, 45, 90, 0.00, null, null, 'Afternoon light is excellent', 'easy', 4.2, 'Free entry. Pedal boats available for ~₹100-200. Tea estates surrounding the lake are beautiful for photography.', true, 'active'),

-- TOP STATION
('Top Station', 'top-station', 'viewpoint', 'mountain', 'The highest point accessible by road in Munnar at ~1,700m. Offers panoramic views of the Western Ghats and Tamil Nadu plains. Also the highest point of the former Kannan Devan Hills Railway.', 10.2073, 77.1213, 1700, 32, 75, 90, 0.00, '06:00', '18:00', 'Clear mornings, avoid monsoon', 'easy', 4.5, 'Road can be narrow and steep — take care on bikes. Views blocked during monsoon by clouds. No petrol station beyond Kundala Lake.', true, 'active'),

-- ERAVIKULAM NATIONAL PARK
('Eravikulam National Park', 'eravikulam-national-park', 'nature', 'wildlife', 'UNESCO World Heritage tentative-list site. Home to the endangered Nilgiri Tahr, rhododendron forests, and the sacred Anamudi peak. One of India''s most biodiverse protected areas.', 10.1667, 77.0833, 2000, 12, 28, 240, 125.00, '07:30', '16:00', 'October to January (dry season)', 'easy', 4.6, 'Park closed Feb-March for Tahr calving season. Book tickets in advance online — they sell out. Vehicles not allowed inside. Free shuttle buses run from gate. No bikes inside park.', true, 'active'),

-- POTHAMEDU VIEW POINT
('Pothamedu View Point', 'pothamedu-viewpoint', 'viewpoint', 'scenic', 'A sweeping 180° panoramic viewpoint overlooking tea, coffee, and cardamom plantations. One of the best sunset spots in Munnar.', 10.0815, 77.0451, 1640, 3, 10, 60, 10.00, '08:00', '18:00', 'Sunset (5-6 PM)', 'easy', 4.3, 'Small entry fee. Excellent for sunset photography. Walking path through tea estates.', true, 'active'),

-- ATTUKAD WATERFALLS
('Attukad Waterfalls', 'attukad-waterfalls', 'waterfall', 'natural', 'One of the most spectacular waterfalls near Munnar. The waterfall drops dramatically through dense forest. Visible from the road.', 10.0614, 77.0431, 1480, 9, 22, 60, 0.00, null, null, 'After monsoon (Oct-Nov) for full flow', 'easy', 4.4, 'Water flow depends heavily on recent rainfall. Best after monsoon. Slippery rocks — exercise caution. Do not cross the river during heavy rains.', true, 'active'),

-- LAKKAM WATERFALLS
('Lakkam Waterfalls', 'lakkam-waterfalls', 'waterfall', 'natural', 'Beautiful multi-tiered waterfall inside a Kerala Forest Department area near Marayoor. A short trek leads to the falls through shola forest.', 10.3195, 77.1587, 1100, 40, 80, 120, 10.00, '08:00', '17:00', 'October to December', 'easy', 4.2, 'Small entry fee. 500m easy walk from parking. Water flow best October-December. Forest department collects fees.', true, 'active'),

-- NYAYAMAKAD WATERFALLS
('Nyayamakad Waterfalls', 'nyayamakad-waterfalls', 'waterfall', 'natural', 'A dramatic waterfall in the dense shola forests above Marayoor. Higher altitude and less crowded than Attukad. Requires a short forest trek.', 10.3289, 77.1876, 1200, 45, 90, 150, 0.00, null, null, 'October to January', 'moderate', 4.1, 'No formal entry fee but donation expected. Less accessible than other falls — track condition varies. Forest area — stay on marked paths.', false, 'active'),

-- CHINNAKANAL WATERFALLS
('Chinnakanal Waterfalls', 'chinnakanal-waterfalls', 'waterfall', 'natural', 'Impressive waterfall near Chinnakanal village on the Munnar-Udumalpet road. The waterfall cascades down from the roadside, making it easily accessible.', 10.0287, 77.0931, 1250, 18, 40, 45, 0.00, null, null, 'Post-monsoon', 'easy', 4.0, 'Freely accessible. Visible directly from roadside. Slippery area — use caution on wet rocks.', true, 'active'),

-- LOCKHART GAP
('Lockhart Gap', 'lockhart-gap', 'viewpoint', 'mountain', 'A high mountain pass connecting Munnar to Marayoor, offering jaw-dropping views into deep valleys. A biker''s paradise with dramatic curves and mountain scenery.', 10.2127, 77.1450, 1900, 28, 55, 45, 0.00, null, null, 'Clear mornings', 'easy', 4.5, 'Excellent road for motorcycle riding. Views into Tamil Nadu plains on clear days. Can be foggy/misty in mornings — use headlights. No fuel stops between Munnar and Marayoor.', true, 'active'),

-- MARAYOOR SANDALWOOD FOREST
('Marayoor Sandalwood Forest', 'marayoor-sandalwood', 'forest', 'protected', 'One of the only natural sandalwood forests in Kerala, protected by the forest department. Ancient dolmens (megalithic burial chambers) also found nearby.', 10.2987, 77.1534, 1100, 41, 85, 120, 15.00, '08:00', '17:00', 'Morning', 'easy', 4.0, 'Entry by permit only — obtain from Forest Range Office. Guided tour mandatory. Phones may need to be surrendered. Book in advance.', true, 'active'),

-- BLOSSOM PARK
('Blossom International Park', 'blossom-park', 'garden', 'leisure', 'Well-maintained garden with flowering plants, a children''s park, and boating facility. Popular with families. One of the major developed tourist spots.', 10.0876, 77.0623, 1580, 1, 5, 90, 50.00, '09:00', '18:00', 'Morning', 'easy', 3.8, 'Entry fee applies. Boating extra. Can get crowded on weekends. Better for a relaxed visit in the morning.', true, 'active'),

-- PHOTO POINT
('Photo Point', 'photo-point', 'viewpoint', 'scenic', 'A designated viewpoint on the road between Munnar and Top Station offering beautiful views of the valley and tea plantations. Excellent for photography.', 10.1450, 77.1015, 1750, 17, 38, 30, 0.00, null, null, 'Morning light', 'easy', 4.1, 'Free roadside viewpoint. Best in morning light. Popular spot for photos. Can be crowded. Safe to park bikes at the side.', true, 'active'),

-- KANTHALLOOR
('Kanthalloor', 'kanthalloor', 'town', 'village', 'Scenic hill village known for apple orchards, peach gardens, and strawberry farms. Situated at around 1200m, it has a completely different microclimate from Munnar.', 10.3567, 77.2345, 1200, 55, 110, 120, 0.00, null, null, 'January to March (fruit season)', 'easy', 4.2, 'Access road is narrow — drive carefully on bikes. Seasonal fruit: apples, peaches, grapes depending on season. October may have limited fruit but beautiful scenery.', true, 'active'),

-- VATTAVADA
('Vattavada', 'vattavada', 'village', 'scenic', 'Remote, scenic hamlet at the highest motorable point in the Idukki district. Known for vegetable farming at altitude, wild strawberries, and stunning views.', 10.2876, 77.2134, 1850, 62, 120, 150, 0.00, null, null, 'Year-round', 'easy', 4.4, 'Very remote — limited phone signal and no petrol pump. Roads are narrow mountain paths — experienced riders only. Carry sufficient fuel (check range before leaving Munnar). Worth it for the views.', true, 'active'),

-- ANAMUDI
('Anamudi Peak', 'anamudi-peak', 'trek', 'peak', 'The highest peak in the Western Ghats at 2,695m. Trekking is restricted and requires permission from Kerala Forest Department. Managed through Eravikulam National Park.', 10.1703, 77.0637, 2695, 12, 30, 480, null, '06:00', '14:00', 'November to February', 'hard', 4.8, 'PERMIT REQUIRED — Apply to DFO Eravikulam at least 2 weeks in advance. Maximum 25 trekkers per day. Strenuous trek for experienced trekkers only. Check current permit status before planning.', false, 'seasonal'),

-- DEVIKULAM
('Devikulam', 'devikulam', 'lake', 'scenic', 'A small hill station near Munnar with a beautiful lake, waterfalls, and colonial-era tea estates. Less crowded than main Munnar spots.', 10.0534, 77.0887, 1800, 5, 15, 90, 0.00, null, null, 'Any time', 'easy', 4.1, 'A good alternative to crowded viewpoints. Peaceful and scenic. Easy bike ride from Munnar.', true, 'active'),

-- ANAYIRANKAL DAM
('Anayirankal Dam', 'anayirankal-dam', 'dam', 'scenic', 'Remote and scenic dam near Munnar with excellent views. Off the typical tourist circuit — less crowded. Good stop on the route toward Vattavada.', 10.1987, 77.1234, 1820, 20, 50, 60, 0.00, null, null, 'Morning', 'easy', 4.0, 'Less visited than Mattupetty. Roads approaching can be narrow. Beautiful for photography.', false, 'active'),

-- INDO SWISS DAIRY FARM
('NDDB Indo-Swiss Dairy Farm', 'indo-swiss-dairy', 'attraction', 'agricultural', 'Working dairy farm established with Swiss collaboration. You can see Jersey and Brown Swiss cattle, milking operations, and the pastoral landscape.', 10.1198, 77.0856, 1690, 12, 30, 60, 0.00, '10:00', '17:00', 'Morning', 'easy', 3.9, 'Free entry to the farm area. Good photo opportunity. Combine with Mattupetty visit as it is nearby.', true, 'active'),

-- CHINNAKANAL
('Chinnakanal', 'chinnakanal', 'viewpoint', 'scenic', 'Scenic area between Munnar and Udumalpet highway. Known for beautiful valleys, the Chinnakanal waterfall, and rolling hills. Good for bikers.', 10.0289, 77.0923, 1260, 18, 40, 60, 0.00, null, null, 'Any time', 'easy', 4.0, 'Pleasant motorcycle route. Roadside viewpoints available. Combine with the waterfall visit.', true, 'active'),

-- GAP ROAD / MUNNAR-MARAYOOR HIGHWAY
('Gap Road (Munnar–Marayoor)', 'gap-road', 'road', 'biking', 'One of the most scenic motorcycle roads in Kerala — the highway through Lockhart Gap connecting Munnar to Marayoor. Hairpin bends, mountain views, tea estates, and shola forests.', 10.2000, 77.1300, 1700, 25, 55, 0, 0.00, null, null, 'Clear morning', 'moderate', 4.8, 'Best motorcycle road in the region. Steep sections — use engine braking on descents. Carry water and sufficient fuel. Morning for clearest views. Can be foggy/misty.', true, 'active'),

-- SHOLA FOREST TREK NEAR ERAVIKULAM
('Rajamala Trek', 'rajamala-trek', 'trek', 'forest', 'The main trekking trail inside Eravikulam National Park (part of the park visit). Walk through high-altitude shola grasslands with excellent chance of spotting Nilgiri Tahr.', 10.1667, 77.0820, 2000, 12, 28, 180, 125.00, '07:30', '15:00', 'November to January', 'moderate', 4.7, 'Entry fee covers the walk. Trail well-maintained. Do not leave marked path. No private vehicles inside — take park shuttle. Highest chance of seeing Nilgiri Tahr early morning.', true, 'active')

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- WATERFALLS
-- ============================================================
INSERT INTO public.waterfalls (name, slug, description, latitude, longitude, distance_from_munnar, trek_required, trek_distance_km, best_season, safety_notes, status) VALUES
('Attukad Waterfalls', 'attukad-falls', 'Dramatic waterfall near Munnar visible from the road.', 10.0614, 77.0431, 9, false, 0, 'October–December', 'Slippery rocks. Do not cross during heavy rain.', 'active'),
('Lakkam Waterfalls', 'lakkam-falls', 'Multi-tiered waterfall inside Marayoor Forest Reserve.', 10.3195, 77.1587, 40, true, 0.5, 'October–December', 'Stay on marked paths. Forest permit required.', 'active'),
('Nyayamakad Waterfalls', 'nyayamakad-falls', 'Remote high-altitude waterfall with dense forest surroundings.', 10.3289, 77.1876, 45, true, 1.5, 'October–January', 'Less maintained trail. Not recommended alone.', 'active'),
('Chinnakanal Waterfalls', 'chinnakanal-falls', 'Easily accessible roadside waterfall on Munnar-Udumalpet highway.', 10.0287, 77.0931, 18, false, 0, 'September–November', 'Slippery near rocks. Take care on wet surfaces.', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RESTAURANTS
-- ============================================================
INSERT INTO public.restaurants (name, slug, cuisine, category, description, latitude, longitude, address, price_range, serves_breakfast, serves_lunch, serves_dinner, is_vegetarian, status) VALUES
('Rapsy Restaurant', 'rapsy-restaurant', ARRAY['kerala', 'indian'], ARRAY['local', 'budget'], 'Popular local restaurant serving authentic Kerala meals, appam, stew, and rice dishes. Frequented by locals and budget travellers.', 10.0875, 77.0603, 'Munnar Town', 'budget', true, true, true, false, 'active'),
('Hotel Zion', 'hotel-zion', ARRAY['kerala', 'north-indian'], ARRAY['local', 'moderate'], 'Well-known restaurant in Munnar town serving both Kerala and North Indian cuisine. Clean, comfortable seating.', 10.0882, 77.0597, 'Munnar Town', 'moderate', false, true, true, false, 'active'),
('The Greens Restaurant', 'greens-restaurant', ARRAY['kerala', 'continental'], ARRAY['multi-cuisine', 'moderate'], 'Scenic restaurant with views of the valley. Serves Kerala meals, continental dishes, and fresh juices.', 10.0876, 77.0621, 'Munnar Town', 'moderate', true, true, true, false, 'active'),
('SR Restaurant', 'sr-restaurant', ARRAY['kerala'], ARRAY['local', 'budget'], 'Budget-friendly South Indian and Kerala cuisine. Good for a quick meal. Known for fresh fish curry.', 10.0869, 77.0589, 'Munnar Town', 'budget', true, true, false, false, 'active'),
('Cloud Street Café', 'cloud-street-cafe', ARRAY['cafe', 'continental'], ARRAY['cafe', 'snacks'], 'Modern café with good coffee, sandwiches, and light snacks. Good WiFi. Popular with young travellers.', 10.0878, 77.0601, 'Munnar Town', 'moderate', true, false, false, true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- FOOD ITEMS (Kerala Specialities)
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
-- PETROL PUMPS
-- ============================================================
INSERT INTO public.petrol_pumps (name, brand, latitude, longitude, address, has_petrol, has_diesel, is_24h, distance_from_munnar, status)
SELECT v.name, v.brand, v.latitude, v.longitude, v.address, v.has_petrol, v.has_diesel, v.is_24h, v.distance_from_munnar, v.status
FROM (VALUES
  ('BPCL Munnar', 'BPCL', 10.0876, 77.0621, 'Munnar Town, Near Bus Stand', true, true, false, 0.5, 'active'),
  ('Indian Oil Munnar', 'Indian Oil', 10.0854, 77.0545, 'Old Munnar, NH 85', true, true, false, 1.2, 'active'),
  ('HP Petrol Pump', 'HP', 10.0823, 77.0489, 'Bodimettu Road, Munnar', true, true, false, 2.5, 'active'),
  ('Marayoor Petrol Pump', 'Indian Oil', 10.2934, 77.1489, 'Marayoor Town', true, true, false, 42.0, 'active')
) AS v(name, brand, latitude, longitude, address, has_petrol, has_diesel, is_24h, distance_from_munnar, status)
WHERE NOT EXISTS (SELECT 1 FROM public.petrol_pumps p WHERE p.name = v.name);

-- ============================================================
-- TREKS
-- ============================================================
INSERT INTO public.treks (name, slug, difficulty, distance_km, duration_min, duration_max, elevation_gain, starting_altitude, highest_point, requires_permit, requires_guide, recommended_start_time, water_available, signal_available, what_to_carry, safety_notes, description, latitude, longitude, status) VALUES
('Rajamala (Eravikulam) Trek', 'rajamala-trek', 'moderate', 3.5, 2, 3, 400, 1800, 2200, true, false, '07:30', false, false, ARRAY['Water 1.5L', 'Sunscreen', 'Rain jacket', 'Good shoes'], 'Do not stray from marked path. Nilgiri Tahr are wild animals — keep distance. No food inside park.', 'Well-marked trail through high-altitude shola grasslands. Part of Eravikulam National Park visit. Excellent chance of spotting Nilgiri Tahr up close.', 10.1667, 77.0820, 'active'),

('Top Station Shola Trek', 'top-station-trek', 'easy', 2, 1, 2, 150, 1600, 1750, false, false, '08:00', false, false, ARRAY['Water', 'Snacks', 'Camera', 'Windcheater'], 'Road is windy — secure bike. Fog can roll in suddenly.', 'Short walk from Top Station viewpoint into the bordering shola forest. Excellent views of Kerala-Tamil Nadu border hills.', 10.2073, 77.1213, 'active'),

('Meesapulimala Trek', 'meesapulimala-trek', 'hard', 14, 7, 9, 900, 1800, 2640, true, true, '05:30', false, false, ARRAY['3L water', 'High-energy food', 'Rain gear', 'Trekking poles', 'First aid'], 'Advance permit required from forest department. Only with licensed guide. Strenuous — good fitness required. Weather changes rapidly at this altitude.', 'One of the most challenging treks in Kerala. Meesapulimala is the 2nd highest peak in Kerala at 2,640m. Through rolling grasslands, rhododendron forests, and high shola. Stunning 360° summit views.', 10.1289, 77.0534, 'active')

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CHECKLIST ITEMS (default shared checklist)
-- Will be associated with the trip after trip_members are created
-- ============================================================

INSERT INTO public.checklist_items (trip_id, category, title, order_index)
SELECT t.id, c.cat, c.title, c.idx
FROM public.trips t
CROSS JOIN (VALUES
  ('bike', 'Check fuel level', 1),
  ('bike', 'Check engine oil', 2),
  ('bike', 'Check tyre pressure (front & rear)', 3),
  ('bike', 'Check brakes (front & rear)', 4),
  ('bike', 'Check chain tension & lubrication', 5),
  ('bike', 'Check lights (headlight, tail, indicators)', 6),
  ('bike', 'Carry puncture repair kit', 7),
  ('bike', 'Carry spare clutch & brake levers', 8),
  ('personal', 'Helmet (with visor)', 1),
  ('personal', 'Riding jacket', 2),
  ('personal', 'Gloves', 3),
  ('personal', 'Rain gear (jacket + pants)', 4),
  ('personal', 'Riding boots or ankle-covering shoes', 5),
  ('personal', 'Power bank (fully charged)', 6),
  ('personal', 'First-aid kit', 7),
  ('personal', 'Water bottles (2L each)', 8),
  ('personal', 'Energy snacks', 9),
  ('personal', 'Cash (ATMs limited in remote areas)', 10),
  ('personal', 'Sunscreen and sunglasses', 11),
  ('documents', 'Driving licence', 1),
  ('documents', 'Vehicle registration certificate (RC)', 2),
  ('documents', 'Vehicle insurance', 3),
  ('documents', 'National ID (Aadhaar)', 4),
  ('documents', 'Hotel booking confirmations', 5),
  ('documents', 'Emergency contact numbers saved offline', 6)
) AS c(cat, title, idx)
WHERE t.name = 'Munnar Bike Trip'
AND NOT EXISTS (
  SELECT 1 FROM public.checklist_items ci 
  WHERE ci.trip_id = t.id AND ci.title = c.title
);

-- ============================================================
-- END OF SEED
-- ============================================================
-- After running this seed:
-- 1. Create users via Supabase Dashboard (Authentication > Users):
--    akash@munnartrip.local / MunnarRide2026!  (metadata: username=akash, display_name=Akash)
--    vinoth@munnartrip.local / MunnarRide2026! (metadata: username=vinoth, display_name=Vinoth)
-- 2. Get the user IDs from auth.users
-- 3. Run:
--    INSERT INTO public.trip_members (trip_id, user_id, role)
--    SELECT t.id, '<AKASH_USER_ID>', 'admin' FROM trips t WHERE t.name = 'Munnar Bike Trip';
--    INSERT INTO public.trip_members (trip_id, user_id, role)
--    SELECT t.id, '<VINOTH_USER_ID>', 'member' FROM trips t WHERE t.name = 'Munnar Bike Trip';
-- ============================================================
