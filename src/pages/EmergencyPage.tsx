import React from 'react'
import { motion } from 'framer-motion'
import { Phone, AlertTriangle, MapPin, Siren, HeartPulse, Flame, Share2, Copy } from 'lucide-react'
import { useLocationStore } from '../store'
import toast from 'react-hot-toast'

const EMERGENCY_CONTACTS = [
  { label: 'Police', number: '100', icon: Siren, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700/40' },
  { label: 'Ambulance', number: '108', icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700/40' },
  { label: 'Fire & Rescue', number: '101', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/40' },
  { label: 'Tourist Helpline', number: '1800-425-4747', icon: Phone, color: 'text-forest-400', bg: 'bg-forest-900/40 border-forest-700/40' },
]

const NEARBY_HOSPITALS = [
  { name: 'Government District Hospital', location: 'Munnar Town', phone: '04865-231025', distance: '2 km' },
  { name: 'Ernakulam Medical Centre', location: 'Idukki', phone: '04868-222222', distance: '42 km' },
]

const NEARBY_POLICE = [
  { name: 'Munnar Police Station', location: 'Munnar Town', phone: '04865-231110', distance: '1.5 km' },
  { name: 'Marayoor Police Station', location: 'Marayoor', phone: '04865-252020', distance: '40 km' },
]

export default function EmergencyPage() {
  const position = useLocationStore(s => s.position)

  const coordString = position
    ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
    : null

  const shareLocation = async () => {
    if (!position) { toast.error('GPS location not available'); return }
    const mapsUrl = `https://maps.google.com/?q=${position.latitude},${position.longitude}`
    const msg = `🆘 My current location:\n${mapsUrl}\nCoords: ${coordString}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Location', text: msg })
      } catch {}
    } else {
      await navigator.clipboard.writeText(msg)
      toast.success('Location copied to clipboard!')
    }
  }

  const copyCoords = async () => {
    if (!coordString) { toast.error('GPS not available'); return }
    await navigator.clipboard.writeText(coordString)
    toast.success('Coordinates copied!')
  }

  return (
    <div className="min-h-screen bg-forest-950 pb-8">
      {/* Header */}
      <div className="bg-red-950/40 border-b border-red-800/40 px-4 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-red-200">Emergency</h1>
            <p className="text-red-400 text-xs">In case of emergency, call immediately</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Current Location */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-forest-400" />
            <span className="text-forest-300 font-semibold text-sm">Your Current Location</span>
          </div>

          {position ? (
            <>
              <div className="font-mono text-forest-200 text-lg mb-1">{coordString}</div>
              {position.altitude && (
                <div className="text-forest-500 text-sm mb-3">Altitude: {Math.round(position.altitude)} m · Accuracy: ±{Math.round(position.accuracy)} m</div>
              )}
              <div className="flex gap-2">
                <button onClick={shareLocation} className="btn-primary flex-1 py-2.5 text-sm">
                  <Share2 className="w-4 h-4" /> Share Location
                </button>
                <button onClick={copyCoords} className="btn-secondary py-2.5 px-4">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <a
                href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full py-2.5 text-sm mt-2"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </>
          ) : (
            <div className="text-yellow-400 text-sm">
              ⚠ GPS location unavailable — enable location permissions for emergency sharing
            </div>
          )}
        </div>

        {/* Emergency numbers */}
        <div>
          <div className="section-header">Emergency Numbers</div>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((contact) => (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number}`}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${contact.bg}`}
              >
                <contact.icon className={`w-6 h-6 ${contact.color}`} />
                <span className="text-forest-200 text-sm font-semibold">{contact.label}</span>
                <span className={`font-display text-xl font-extrabold ${contact.color}`}>{contact.number}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Nearby Hospitals */}
        <div>
          <div className="section-header">Nearby Hospitals</div>
          <div className="space-y-2">
            {NEARBY_HOSPITALS.map((h) => (
              <div key={h.name} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-forest-200 font-semibold text-sm">{h.name}</div>
                    <div className="text-forest-500 text-xs mt-0.5">{h.location} · {h.distance}</div>
                  </div>
                  <a href={`tel:${h.phone}`} className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Police */}
        <div>
          <div className="section-header">Police Stations</div>
          <div className="space-y-2">
            {NEARBY_POLICE.map((p) => (
              <div key={p.name} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-forest-200 font-semibold text-sm">{p.name}</div>
                    <div className="text-forest-500 text-xs mt-0.5">{p.location} · {p.distance}</div>
                  </div>
                  <a href={`tel:${p.phone}`} className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety note */}
        <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-xs leading-relaxed">
            Munnar mountain roads may have limited signal. If possible, find higher ground for better reception. 
            Always inform someone of your planned route before setting out.
          </p>
        </div>
      </div>
    </div>
  )
}
