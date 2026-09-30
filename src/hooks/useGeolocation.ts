import { useEffect, useRef } from 'react'
import { useLocationStore } from '../store'

export function useGeolocation(options?: PositionOptions) {
  const { setPosition, setPermissionStatus, setWatchId, watchId } = useLocationStore()

  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable')
      return
    }

    // Request permission and start watching
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionStatus('granted')
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus('denied')
        } else {
          setPermissionStatus('unavailable')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        ...optionsRef.current,
      }
    )

    setWatchId(id)

    return () => {
      navigator.geolocation.clearWatch(id)
      setWatchId(null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return useLocationStore((s) => s.position)
}

export function useSingleLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    })
  })
}

export function formatAltitude(alt: number | null): string {
  if (alt === null) return '—'
  return `${Math.round(alt).toLocaleString()} m`
}

export function formatSpeed(speed: number | null): string {
  if (speed === null) return '—'
  return `${Math.round(speed * 3.6)} km/h` // m/s → km/h
}

export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function mapsUrl(lat: number, lng: number, label?: string): string {
  const dest = `${lat},${lng}`
  if (label) {
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`
}

export function mapsUrlFromCurrentLocation(
  destLat: number,
  destLng: number,
  currentLat?: number,
  currentLng?: number
): string {
  const dest = `${destLat},${destLng}`
  if (currentLat && currentLng) {
    return `https://www.google.com/maps/dir/${currentLat},${currentLng}/${dest}`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`
}
