import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Fuel, MapPin, StickyNote, Loader2 } from 'lucide-react'
import { useLocationStore } from '../store'

interface Props {
  bikes: any[]
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export default function AddFuelModal({ bikes, onClose, onSave }: Props) {
  const position = useLocationStore(s => s.position)
  const [bikeId, setBikeId] = useState<number | ''>('')
  const [odometer, setOdometer] = useState('')
  const [litres, setLitres] = useState('')
  const [pricePerLitre, setPricePerLitre] = useState('103')
  const [station, setStation] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!odometer || parseFloat(odometer) <= 0) errs.odometer = 'Enter valid odometer reading'
    if (!litres || parseFloat(litres) <= 0) errs.litres = 'Enter litres filled'
    if (!pricePerLitre || parseFloat(pricePerLitre) <= 0) errs.price = 'Enter price per litre'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSaving(true)
    await onSave({
      bike_id: bikeId || undefined,
      odometer: parseFloat(odometer),
      litres: parseFloat(litres),
      price_per_litre: parseFloat(pricePerLitre),
      fuel_station: station || undefined,
      latitude: position?.latitude,
      longitude: position?.longitude,
      notes: notes || undefined,
    })
    setIsSaving(false)
  }

  const total = litres && pricePerLitre
    ? (parseFloat(litres) * parseFloat(pricePerLitre)).toFixed(2)
    : '0.00'

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg mx-auto bg-forest-900 border-t border-forest-700/50 rounded-t-3xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-forest-700 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-forest-100 text-lg">Log Fuel Fill-up</h3>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          {bikes.length > 0 && (
            <div>
              <label className="input-label">Bike</label>
              <select value={bikeId} onChange={e => setBikeId(e.target.value ? Number(e.target.value) : '')} className="input-field">
                <option value="">Select bike</option>
                {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Odometer Reading (km)</label>
            <input
              type="number"
              placeholder="e.g. 15234"
              value={odometer}
              onChange={e => setOdometer(e.target.value)}
              className={`input-field ${errors.odometer ? 'border-red-600' : ''}`}
            />
            {errors.odometer && <p className="text-red-400 text-xs mt-1">{errors.odometer}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Litres Filled</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.5"
                value={litres}
                onChange={e => setLitres(e.target.value)}
                className={`input-field ${errors.litres ? 'border-red-600' : ''}`}
              />
              {errors.litres && <p className="text-red-400 text-xs mt-1">{errors.litres}</p>}
            </div>
            <div>
              <label className="input-label">Price / Litre (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="103.00"
                value={pricePerLitre}
                onChange={e => setPricePerLitre(e.target.value)}
                className={`input-field ${errors.price ? 'border-red-600' : ''}`}
              />
            </div>
          </div>

          {/* Total preview */}
          <div className="flex items-center justify-between bg-forest-800/40 rounded-xl px-4 py-3">
            <span className="text-forest-400 text-sm">Total Amount</span>
            <span className="text-earth-300 font-bold text-lg">₹{parseFloat(total).toLocaleString()}</span>
          </div>

          <div>
            <label className="input-label"><MapPin className="w-3.5 h-3.5 inline mr-1" />Fuel Station (optional)</label>
            <input
              type="text"
              placeholder="Station name or location"
              value={station}
              onChange={e => setStation(e.target.value)}
              className="input-field"
            />
            {position && (
              <div className="text-forest-600 text-xs mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location will be saved from GPS
              </div>
            )}
          </div>

          <div>
            <label className="input-label"><StickyNote className="w-3.5 h-3.5 inline mr-1" />Notes</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fuel className="w-5 h-5" />}
            Save Fill-up
          </button>
        </div>
      </motion.div>
    </div>
  )
}
