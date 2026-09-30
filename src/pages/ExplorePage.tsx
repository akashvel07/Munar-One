import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MapPin, Compass, Clock, Navigation, Bookmark, Plus,
  ChevronDown, X, Mountain, Droplets, Utensils, Eye, TreePine,
  Waves, Building2, ShoppingBag, Fuel, Star, CheckCircle,
  Info, AlertCircle, ExternalLink
} from 'lucide-react'
import { usePlaces, useSavedPlaces, useVisitedPlaces } from '../hooks/useData'
import { useTripStore, useLocationStore } from '../store'
import { mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'
import { useNavigate } from 'react-router-dom'
import AddToItineraryModal from '../components/AddToItineraryModal'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Mountain },
  { id: 'viewpoint', label: 'Viewpoints', icon: Eye },
  { id: 'waterfall', label: 'Waterfalls', icon: Droplets },
  { id: 'trek', label: 'Treks', icon: Mountain },
  { id: 'tea_estate', label: 'Tea Estates', icon: TreePine },
  { id: 'lake', label: 'Lakes', icon: Waves },
  { id: 'dam', label: 'Dams', icon: Building2 },
  { id: 'forest', label: 'Forests', icon: TreePine },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'petrol', label: 'Petrol', icon: Fuel },
]

const DIFFICULTIES = ['easy', 'moderate', 'hard']
const DISTANCES = [
  { label: '< 5 km', max: 5 },
  { label: '5–15 km', min: 5, max: 15 },
  { label: '15–30 km', min: 15, max: 30 },
  { label: '30+ km', min: 30 },
]

function PlaceSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-40 shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-5 shimmer rounded w-3/4" />
        <div className="h-4 shimmer rounded w-1/2" />
        <div className="h-4 shimmer rounded w-full" />
      </div>
    </div>
  )
}

function DifficultyBadge({ level }: { level: string | null }) {
  if (!level) return null
  const dots = ['easy', 'moderate', 'hard', 'extreme']
  const count = dots.indexOf(level) + 1
  const color = level === 'easy' ? 'text-green-400' : level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= count ? 'bg-current' : 'bg-forest-800'} ${color}`} />
      ))}
      <span className={`text-xs ml-1 capitalize ${color}`}>{level}</span>
    </div>
  )
}

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedDistance, setSelectedDistance] = useState<{ min?: number; max?: number } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [addToItinerary, setAddToItinerary] = useState<{ id: number; name: string; lat?: number; lng?: number } | null>(null)

  const { tripId } = useTripStore()
  const position = useLocationStore(s => s.position)
  const navigate = useNavigate()

  const filters = useMemo(() => ({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: search || undefined,
    difficulty: selectedDifficulty || undefined,
    maxDistance: selectedDistance?.max,
  }), [search, selectedCategory, selectedDifficulty, selectedDistance])

  const { data: places, isLoading } = usePlaces(filters)
  const { isSaved, toggleSaved } = useSavedPlaces(tripId)
  const { isVisited } = useVisitedPlaces(tripId)

  const handleSave = useCallback(async (placeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleSaved.mutateAsync({ placeId, saved: !isSaved(placeId) })
  }, [isSaved, toggleSaved])

  const activeFilterCount = [selectedDifficulty, selectedDistance].filter(Boolean).length

  return (
    <div className="min-h-screen bg-forest-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-forest-950/95 backdrop-blur-xl border-b border-forest-800/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-3">Explore Munnar</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-forest-500" />
          <input
            type="search"
            placeholder="Search Munnar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-4"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500 hover:text-forest-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scroll-x -mx-1 px-1 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-forest-500/30 text-forest-200 border border-forest-500/50'
                  : 'bg-forest-900/60 text-forest-500 border border-forest-800/50 hover:text-forest-300'
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter button */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-forest-500 text-sm">
            {isLoading ? 'Loading…' : `${places?.length ?? 0} places`}
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              activeFilterCount > 0 || showFilters
                ? 'bg-forest-600/30 text-forest-200 border border-forest-600/40'
                : 'text-forest-500 hover:text-forest-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-forest-500 rounded-full text-[10px] flex items-center justify-center text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3 border-t border-forest-800/50 mt-2">
                {/* Difficulty */}
                <div>
                  <div className="text-forest-500 text-xs mb-2">Difficulty</div>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                          selectedDifficulty === d
                            ? 'bg-forest-500/30 border-forest-500/50 text-forest-200'
                            : 'border-forest-800/50 text-forest-500 hover:text-forest-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <div className="text-forest-500 text-xs mb-2">Distance from Munnar</div>
                  <div className="flex flex-wrap gap-2">
                    {DISTANCES.map(d => (
                      <button
                        key={d.label}
                        onClick={() => setSelectedDistance(
                          selectedDistance?.max === d.max && selectedDistance?.min === (d as {min?: number; max?: number}).min
                            ? null
                            : { min: (d as {min?: number; max?: number}).min, max: d.max }
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selectedDistance?.max === d.max && selectedDistance?.min === (d as {min?: number; max?: number}).min
                            ? 'bg-forest-500/30 border-forest-500/50 text-forest-200'
                            : 'border-forest-800/50 text-forest-500 hover:text-forest-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setSelectedDifficulty(null); setSelectedDistance(null) }}
                    className="text-red-400 text-xs hover:text-red-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Place grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <PlaceSkeleton key={i} />)}
          </div>
        ) : places?.length === 0 ? (
          <div className="text-center py-16">
            <Compass className="w-12 h-12 text-forest-700 mx-auto mb-3" />
            <p className="text-forest-500 font-medium">No places found</p>
            <p className="text-forest-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {places?.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="glass-card-hover overflow-hidden"
                onClick={() => navigate(`/explore/${place.slug}`)}
              >
                {/* Image */}
                <div className="relative h-40 bg-forest-900/80 overflow-hidden">
                  {place.image_url ? (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mountain className="w-12 h-12 text-forest-700" />
                    </div>
                  )}

                  {/* Overlay badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {place.status !== 'active' && (
                      <span className="badge-red text-[10px]">
                        {place.status === 'closed' ? 'Closed' : place.status === 'seasonal' ? 'Seasonal' : 'Status unknown'}
                      </span>
                    )}
                    {isVisited(place.id) && (
                      <span className="bg-green-900/80 text-green-300 border border-green-700/50 rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> Visited
                      </span>
                    )}
                  </div>

                  {/* Save button */}
                  <button
                    onClick={(e) => handleSave(place.id, e)}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSaved(place.id) ? 'bg-forest-500/80 text-white' : 'bg-forest-950/60 text-forest-400 hover:text-forest-200'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved(place.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Altitude pill */}
                  {place.altitude && (
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-forest-950/70 rounded-full px-2 py-0.5">
                      <Mountain className="w-2.5 h-2.5 text-forest-400" />
                      <span className="text-forest-300 text-[10px] font-medium">{place.altitude.toLocaleString()} m</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5">
                  <h3 className="font-bold text-forest-100 leading-tight mb-1">{place.name}</h3>

                  <div className="flex items-center gap-3 mb-2">
                    {place.distance_from_munnar && (
                      <div className="flex items-center gap-1 text-forest-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {place.distance_from_munnar} km
                      </div>
                    )}
                    {place.estimated_travel_time && (
                      <div className="flex items-center gap-1 text-forest-500 text-xs">
                        <Clock className="w-3 h-3" />
                        ~{place.estimated_travel_time} min
                      </div>
                    )}
                    {place.entry_fee !== null && place.entry_fee !== undefined && (
                      <div className="text-forest-500 text-xs">
                        {place.entry_fee === 0 ? 'Free' : `₹${place.entry_fee}`}
                      </div>
                    )}
                  </div>

                  {place.difficulty && <DifficultyBadge level={place.difficulty} />}

                  {place.description && (
                    <p className="text-forest-500 text-xs mt-2 line-clamp-2">{place.description}</p>
                  )}

                  {/* Info note */}
                  {!place.is_verified && (
                    <div className="flex items-center gap-1.5 mt-2 text-yellow-600 text-[10px]">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      Verify hours & fees before visiting
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {place.latitude && place.longitude && (
                      <a
                        href={mapsUrlFromCurrentLocation(place.latitude, place.longitude, position?.latitude, position?.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-secondary py-1.5 px-3 text-xs flex-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Directions
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAddToItinerary({ id: place.id, name: place.name, lat: place.latitude ?? undefined, lng: place.longitude ?? undefined })
                      }}
                      className="btn-secondary py-1.5 px-3 text-xs flex-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Itinerary
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Itinerary Modal */}
      <AnimatePresence>
        {addToItinerary && (
          <AddToItineraryModal
            place={addToItinerary}
            onClose={() => setAddToItinerary(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
