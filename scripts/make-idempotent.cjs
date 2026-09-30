const fs = require('fs');
let sql = fs.readFileSync('supabase/schema.sql', 'utf8');

const legacyDrops = `
-- Drop any legacy policies from previous attempts
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Places are viewable by authenticated users" ON public.places;
DROP POLICY IF EXISTS "Treks viewable by authenticated users" ON public.treks;
DROP POLICY IF EXISTS "Waterfalls viewable by authenticated users" ON public.waterfalls;
DROP POLICY IF EXISTS "Restaurants viewable by authenticated users" ON public.restaurants;
DROP POLICY IF EXISTS "Food items viewable by authenticated users" ON public.food_items;
DROP POLICY IF EXISTS "Petrol pumps viewable by authenticated users" ON public.petrol_pumps;
DROP POLICY IF EXISTS "Trip members can view members" ON public.trip_members;
DROP POLICY IF EXISTS "Trip members can view trips" ON public.trips;
`;

if (!sql.includes('legacy policies from previous attempts')) {
  sql = legacyDrops + '\n' + sql;
}

fs.writeFileSync('supabase/schema.sql', sql);
console.log('Successfully added legacy policy drops to schema.sql');
