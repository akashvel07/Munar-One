import React from 'react'
import { Bookmark, Mountain, Navigation } from 'lucide-react'
import { useSavedPlaces } from '../hooks/useData'
import { useTripStore, useLocationStore } from '../store'
import { mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'
import { useNavigate } from 'react-router-dom'

export default function SavedPage() {
  const { tripId } = useTripStore()
  const position = useLocationStore(s => s.position)
  const { savedPlaces, toggleSaved } = useSavedPlaces(tripId)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-forest-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-5">Saved Places</h1>

        {savedPlaces.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-12 h-12 text-forest-700 mx-auto mb-3" />
            <p className="text-forest-500 font-medium">No saved places yet</p>
            <p className="text-forest-600 text-sm mt-1">Tap the bookmark icon on any place to save it</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedPlaces.map((saved) => {
              const place = saved.places
              if (!place) return null
              return (
                <div
                  key={saved.id}
                  className="glass-card-hover p-4"
                  onClick={() => navigate(`/explore/${place.slug}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-forest-800/60 border border-forest-700/30 flex items-center justify-center flex-shrink-0">
                      <Mountain className="w-6 h-6 text-forest-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-forest-100 font-semibold truncate">{place.name}</h3>
                      <p className="text-forest-500 text-xs mt-0.5 capitalize">
                        {place.category.replace('_', ' ')}
                        {place.distance_from_munnar && ` · ${place.distance_from_munnar} km`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {place.latitude && place.longitude && (
                        <a
                          href={mapsUrlFromCurrentLocation(place.latitude, place.longitude, position?.latitude, position?.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="btn-icon"
                        >
                          <Navigation className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await toggleSaved.mutateAsync({ placeId: place.id, saved: false })
                        }}
                        className="btn-icon text-yellow-500 hover:text-yellow-300"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
