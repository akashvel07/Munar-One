import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Coffee, Leaf, Fish, ShoppingBag, Navigation, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useLocationStore } from '../store'

export default function FoodPage() {
  const [search, setSearch] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const position = useLocationStore(s => s.position)

  const { data: foodItems, isLoading } = useQuery({
    queryKey: ['food_items', search, vegOnly],
    queryFn: async () => {
      let q = supabase.from('food_items').select('*').order('name')
      if (search) q = q.ilike('name', `%${search}%`)
      if (vegOnly) q = q.eq('is_vegetarian', true)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    staleTime: 60000,
  })

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('restaurants').select('*').order('name')
      if (error) throw error
      return data
    },
    staleTime: 60000,
  })

  return (
    <div className="min-h-screen bg-forest-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-1">Food Guide</h1>
        <p className="text-forest-500 text-sm mb-4">Kerala & Munnar specialities</p>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-500" />
            <input
              type="search"
              placeholder="Search food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              vegOnly ? 'bg-green-900/40 border-green-600/50 text-green-300' : 'border-forest-800/50 text-forest-500'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Veg
          </button>
        </div>

        {/* Must-try Foods */}
        <div className="section-header">Must-Try Dishes</div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(foodItems ?? []).map((food, idx) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-forest-100 font-semibold text-sm leading-tight">{food.name}</h3>
                  <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                    food.is_vegetarian ? 'bg-green-900/40 text-green-400 border border-green-700/30' : 'bg-red-900/30 text-red-400 border border-red-700/30'
                  }`}>
                    {food.is_vegetarian ? '🟢 Veg' : '🔴 Non-veg'}
                  </span>
                </div>
                <p className="text-forest-500 text-xs line-clamp-2 leading-relaxed">{food.description}</p>
                {(food.typical_price_min || food.typical_price_max) && (
                  <div className="text-earth-400 text-xs mt-1.5 font-medium">
                    ₹{food.typical_price_min}
                    {food.typical_price_max && food.typical_price_max !== food.typical_price_min ? `–${food.typical_price_max}` : ''}
                  </div>
                )}
                {food.where_to_find && (
                  <p className="text-forest-600 text-[10px] mt-1">{food.where_to_find}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Restaurants */}
        <div className="section-header">Restaurants</div>
        <div className="space-y-3">
          {(restaurants ?? []).map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-forest-100 font-semibold">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {r.price_range && (
                      <span className="text-forest-500 text-xs">
                        {r.price_range === 'budget' ? '₹' : r.price_range === 'moderate' ? '₹₹' : '₹₹₹'}
                      </span>
                    )}
                    {r.cuisine && <span className="text-forest-600 text-xs">{r.cuisine.slice(0,2).join(', ')}</span>}
                  </div>
                  {r.description && <p className="text-forest-500 text-xs mt-1.5 line-clamp-2">{r.description}</p>}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {r.serves_breakfast && <span className="badge-green text-[10px]">Breakfast</span>}
                    {r.serves_lunch && <span className="badge-green text-[10px]">Lunch</span>}
                    {r.serves_dinner && <span className="badge-green text-[10px]">Dinner</span>}
                    {r.is_vegetarian && <span className="bg-green-900/30 text-green-400 border border-green-700/30 rounded-full px-2 py-0.5 text-[10px]">Veg</span>}
                  </div>
                </div>
                {r.latitude && r.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon flex-shrink-0"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
