import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, StickyNote, Plus, Loader2 } from 'lucide-react'
import { useItinerary } from '../hooks/useData'
import { useTripStore } from '../store'
import { format, addDays } from 'date-fns'
import toast from 'react-hot-toast'

interface Props {
  place: { id: number; name: string; lat?: number; lng?: number }
  onClose: () => void
}

const TRIP_START = new Date('2026-10-02')
const TRIP_DAYS = [
  { date: TRIP_START, label: '2 Oct — Day 1' },
  { date: addDays(TRIP_START, 1), label: '3 Oct — Day 2' },
  { date: addDays(TRIP_START, 2), label: '4 Oct — Day 3' },
]

export default function AddToItineraryModal({ place, onClose }: Props) {
  const { tripId } = useTripStore()
  const { addItem } = useItinerary(tripId)

  const [selectedDate, setSelectedDate] = useState(format(TRIP_START, 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!tripId) { toast.error('No trip selected'); return }
    setIsSubmitting(true)
    try {
      const endHour = parseInt(startTime.split(':')[0]) + Math.floor(duration / 60)
      const endMin = parseInt(startTime.split(':')[1]) + (duration % 60)
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

      await addItem.mutateAsync({
        day_date: selectedDate,
        title: place.name,
        place_id: place.id,
        start_time: startTime,
        end_time: endTime,
        duration,
        notes: notes || undefined,
        latitude: place.lat,
        longitude: place.lng,
        category: 'place',
        order_index: 99,
      })

      toast.success(`${place.name} added to itinerary!`)
      onClose()
    } catch (err) {
      toast.error('Failed to add to itinerary')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg bg-forest-900 border-t border-forest-700/50 rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-forest-700 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-forest-100 text-lg">Add to Itinerary</h3>
            <p className="text-forest-400 text-sm mt-0.5">{place.name}</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Day selector */}
          <div>
            <label className="input-label">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Day
            </label>
            <div className="flex gap-2">
              {TRIP_DAYS.map((day) => {
                const val = format(day.date, 'yyyy-MM-dd')
                return (
                  <button
                    key={val}
                    onClick={() => setSelectedDate(val)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      selectedDate === val
                        ? 'bg-forest-500/30 border-forest-500/60 text-forest-200'
                        : 'border-forest-700/50 text-forest-500 hover:text-forest-300'
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Start time */}
          <div>
            <label className="input-label">
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="input-label">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120, 180, 240].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    duration === d
                      ? 'bg-forest-500/30 border-forest-500/60 text-forest-200'
                      : 'border-forest-700/50 text-forest-500 hover:text-forest-300'
                  }`}
                >
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">
              <StickyNote className="w-3.5 h-3.5 inline mr-1.5" />
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              className="input-field resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Adding…</>
            ) : (
              <><Plus className="w-5 h-5" /> Add to Itinerary</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
