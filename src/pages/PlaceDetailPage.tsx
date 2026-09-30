import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Mountain, MapPin, Clock, DollarSign, Calendar,
  Navigation, Bookmark, CheckCircle2, AlertCircle, Info,
  Plus, ExternalLink, Star, Phone, Shield
} from 'lucide-react'
import { usePlace, useSavedPlaces, useVisitedPlaces } from '../hooks/useData'
import { useTripStore, useLocationStore } from '../store'
import { mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'
import AddToItineraryModal from '../components/AddToItineraryModal'
import toast from 'react-hot-toast'

export default function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { tripId } = useTripStore()
  const position = useLocationStore(s => s.position)
  const [showItinerary, setShowItinerary] = useState(false)

  const { data: place, isLoading } = usePlace(slug ?? '')
  const { isSaved, toggleSaved } = useSavedPlaces(tripId)
  const { isVisited, toggleVisited } = useVisitedPlaces(tripId)

  const handleSave = async () => {
    if (!place) return
    await toggleSaved.mutateAsync({ placeId: place.id, saved: !isSaved(place.id) })
    toast.success(isSaved(place.id) ? 'Removed from saved' : 'Saved!')
  }

  const handleVisit = async () => {
    if (!place) return
    await toggleVisited.mutateAsync({ placeId: place.id, visited: !isVisited(place.id) })
    toast.success(isVisited(place.id) ? 'Marked as not visited' : 'Marked as visited! ✓')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="h-64 shimmer" />
        <div className="p-4 space-y-3">
          <div className="h-8 skeleton rounded-xl w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
          <div className="h-20 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-12 h-12 text-forest-700 mx-auto mb-3" />
          <p className="text-forest-500">Place not found</p>
          <button onClick={() => navigate('/explore')} className="btn-secondary mt-4 py-2 px-4">← Back to Explore</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero */}
      <div className="relative h-72">
        {place.image_url ? (
          <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-forest-900 flex items-center justify-center">
            <Mountain className="w-20 h-20 text-forest-700" />
          </div>
        )}
        <div className="hero-overlay absolute inset-0" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-forest-950/60 backdrop-blur-sm border border-forest-700/40 flex items-center justify-center text-forest-200 z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`absolute top-4 right-4 w-10 h-10 rounded-xl backdrop-blur-sm border flex items-center justify-center z-10 transition-all ${
            isSaved(place.id) ? 'bg-forest-500/80 border-forest-400/50 text-white' : 'bg-forest-950/60 border-forest-700/40 text-forest-300'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved(place.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-green text-xs capitalize">{place.category.replace('_', ' ')}</span>
            {place.status !== 'active' && (
              <span className="badge-red text-xs capitalize">{place.status}</span>
            )}
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">{place.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {place.altitude && (
            <div className="stat-card text-center">
              <Mountain className="w-4 h-4 text-forest-500 mx-auto mb-1" />
              <div className="text-forest-200 font-bold">{place.altitude.toLocaleString()}m</div>
              <div className="text-forest-600 text-[10px]">Altitude</div>
            </div>
          )}
          {place.distance_from_munnar && (
            <div className="stat-card text-center">
              <MapPin className="w-4 h-4 text-forest-500 mx-auto mb-1" />
              <div className="text-forest-200 font-bold">{place.distance_from_munnar} km</div>
              <div className="text-forest-600 text-[10px]">From Munnar</div>
            </div>
          )}
          {place.estimated_travel_time && (
            <div className="stat-card text-center">
              <Clock className="w-4 h-4 text-forest-500 mx-auto mb-1" />
              <div className="text-forest-200 font-bold">~{place.estimated_travel_time}m</div>
              <div className="text-forest-600 text-[10px]">Drive time</div>
            </div>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <div className="glass-card p-4">
            <p className="text-forest-300 text-sm leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="glass-card p-4 space-y-3">
          <div className="section-header mb-3">Details</div>
          {place.opening_time && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-400 text-sm"><Clock className="w-3.5 h-3.5" /> Opening hours</div>
              <span className="text-forest-200 text-sm font-medium">{place.opening_time.slice(0,5)} – {place.closing_time?.slice(0,5)}</span>
            </div>
          )}
          {place.entry_fee !== null && place.entry_fee !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-400 text-sm"><DollarSign className="w-3.5 h-3.5" /> Entry fee</div>
              <span className="text-forest-200 text-sm font-medium">{place.entry_fee === 0 ? 'Free' : `₹${place.entry_fee}`}</span>
            </div>
          )}
          {place.recommended_duration && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-400 text-sm"><Calendar className="w-3.5 h-3.5" /> Recommended stay</div>
              <span className="text-forest-200 text-sm font-medium">
                {place.recommended_duration >= 60 ? `${Math.floor(place.recommended_duration/60)}h` : `${place.recommended_duration}m`}
              </span>
            </div>
          )}
          {place.best_time && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-400 text-sm"><Star className="w-3.5 h-3.5" /> Best time</div>
              <span className="text-forest-200 text-sm font-medium text-right max-w-[60%]">{place.best_time}</span>
            </div>
          )}
          {place.requires_permit && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              Permit required — check in advance
            </div>
          )}
          {place.requires_guide && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              Registered guide required
            </div>
          )}
        </div>

        {/* Notes / safety */}
        {place.notes && (
          <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-300 text-sm leading-relaxed">{place.notes}</p>
          </div>
        )}

        {!place.is_verified && (
          <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-700/30 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-xs">Opening times, fees, and availability may have changed. Verify before visiting.</p>
          </div>
        )}

        {/* GPS coordinates */}
        {place.latitude && place.longitude && (
          <div className="glass-card p-3">
            <div className="text-forest-500 text-xs font-mono">
              {place.latitude.toFixed(5)}°N, {place.longitude.toFixed(5)}°E
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pb-4">
          {place.latitude && place.longitude && (
            <a
              href={mapsUrlFromCurrentLocation(place.latitude, place.longitude, position?.latitude, position?.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-3.5"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </a>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowItinerary(true)}
              className="btn-secondary py-3"
            >
              <Plus className="w-4 h-4" />
              Add to Itinerary
            </button>
            <button
              onClick={handleVisit}
              className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border text-sm ${
                isVisited(place.id)
                  ? 'bg-forest-500/30 border-forest-500/60 text-forest-200'
                  : 'border-forest-700/50 text-forest-500 hover:text-forest-300 bg-forest-900/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isVisited(place.id) ? 'Visited ✓' : 'Mark Visited'}
            </button>
          </div>

          {place.official_url && (
            <a
              href={place.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full py-3"
            >
              <ExternalLink className="w-4 h-4" />
              Official Website
            </a>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showItinerary && (
          <AddToItineraryModal
            place={{ id: place.id, name: place.name, lat: place.latitude ?? undefined, lng: place.longitude ?? undefined }}
            onClose={() => setShowItinerary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
