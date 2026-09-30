import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePlaces } from '../hooks/useData'
import { useLocationStore } from '../store'
import { Navigation, Mountain, Droplets, Eye, TreePine } from 'lucide-react'
import { mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MUNNAR_CENTER: [number, number] = [10.0889, 77.0595]

const CATEGORY_COLORS: Record<string, string> = {
  viewpoint: '#75a047',
  waterfall: '#3b82f6',
  trek: '#f59e0b',
  tea_estate: '#22c55e',
  lake: '#06b6d4',
  dam: '#8b5cf6',
  forest: '#16a34a',
  restaurant: '#f97316',
  petrol: '#ef4444',
  default: '#3d8a36',
}

function createCircleIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid rgba(255,255,255,0.8);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

function LocationMarker() {
  const position = useLocationStore(s => s.position)
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], map.getZoom())
    }
  }, []) // Only center on mount

  if (!position) return null

  return (
    <CircleMarker
      center={[position.latitude, position.longitude]}
      radius={8}
      pathOptions={{ color: '#3d8a36', fillColor: '#75a047', fillOpacity: 0.9, weight: 2 }}
    >
      <Popup>
        <div className="text-sm font-medium">You are here</div>
        {position.altitude && <div className="text-xs text-gray-500">{Math.round(position.altitude)} m altitude</div>}
      </Popup>
    </CircleMarker>
  )
}

export default function MapPage() {
  const { data: places, isLoading } = usePlaces()
  const position = useLocationStore(s => s.position)
  const permStatus = useLocationStore(s => s.permissionStatus)

  const center: [number, number] = position
    ? [position.latitude, position.longitude]
    : MUNNAR_CENTER

  return (
    <div className="flex flex-col h-full min-h-screen bg-forest-950">
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <h1 className="font-display text-2xl font-bold text-forest-100">Map</h1>
        {permStatus === 'denied' && (
          <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> Location permission denied — showing Munnar centre
          </p>
        )}
      </div>

      <div className="flex-1 px-4 pb-4 min-h-0">
        <div className="h-full min-h-[60vh] rounded-2xl overflow-hidden border border-forest-700/30">
          {isLoading ? (
            <div className="h-full shimmer rounded-2xl" />
          ) : (
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationMarker />

              {places?.map(place => {
                if (!place.latitude || !place.longitude) return null
                const color = CATEGORY_COLORS[place.category] ?? CATEGORY_COLORS.default
                return (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={createCircleIcon(color)}
                  >
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <div className="font-bold text-sm mb-1">{place.name}</div>
                        <div className="text-xs text-gray-500 capitalize mb-2">{place.category.replace('_', ' ')}</div>
                        {place.altitude && (
                          <div className="text-xs text-gray-600 mb-1">⛰ {place.altitude} m</div>
                        )}
                        {place.distance_from_munnar && (
                          <div className="text-xs text-gray-600 mb-2">{place.distance_from_munnar} km from Munnar</div>
                        )}
                        <a
                          href={mapsUrlFromCurrentLocation(place.latitude, place.longitude, position?.latitude, position?.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#3d8a36',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textDecoration: 'none',
                          }}
                        >
                          Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'default').slice(0, 6).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5 bg-forest-900/60 rounded-full px-2.5 py-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-forest-400 text-xs capitalize">{cat.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
