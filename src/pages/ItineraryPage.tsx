import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Plus, Clock, CheckCircle2, Navigation,
  Edit3, Trash2, MapPin, GripVertical, AlertTriangle,
  ChevronDown, ChevronUp, MoreHorizontal, X, Save, Loader2
} from 'lucide-react'
import { useItinerary } from '../hooks/useData'
import { useTripStore, useAuthStore, useLocationStore } from '../store'
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import { mapsUrlFromCurrentLocation } from '../hooks/useGeolocation'
import toast from 'react-hot-toast'

const TRIP_DATES = [
  new Date('2026-10-02'),
  new Date('2026-10-03'),
  new Date('2026-10-04'),
]

function TimeConflictWarning({ items }: { items: any[] }) {
  const conflicts: string[] = []

  for (let i = 0; i < items.length - 1; i++) {
    const curr = items[i]
    const next = items[i + 1]
    if (curr.end_time && next.start_time && curr.end_time > next.start_time) {
      conflicts.push(`Time overlap: ${curr.title} and ${next.title}`)
    }
  }

  if (conflicts.length === 0) return null

  return (
    <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 mb-3">
      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-yellow-300 text-sm font-medium">Schedule Conflict</p>
        {conflicts.map((c, i) => <p key={i} className="text-yellow-500 text-xs">{c}</p>)}
      </div>
    </div>
  )
}

function ItineraryItemCard({ item, onDelete, onToggle, onEdit }: {
  item: any
  onDelete: (id: number) => void
  onToggle: (id: number, val: boolean) => void
  onEdit: (item: any) => void
}) {
  const position = useLocationStore(s => s.position)
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      className={`relative flex items-start gap-3 ${item.is_completed ? 'opacity-60' : ''}`}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <button
          onClick={() => onToggle(item.id, !item.is_completed)}
          className="focus:outline-none"
          aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
            item.is_completed ? 'bg-forest-500 border-forest-400' : 'border-forest-600 hover:border-forest-400'
          }`}>
            {item.is_completed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </button>
        <div className="w-0.5 flex-1 bg-forest-800/60 mt-1 min-h-[24px]" />
      </div>

      {/* Card */}
      <div className={`flex-1 glass-card mb-3 overflow-hidden ${
        item.is_completed ? 'border-forest-800/20' : 'border-forest-700/20'
      }`}>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold leading-tight ${item.is_completed ? 'text-forest-600 line-through' : 'text-forest-100'}`}>
                {item.title}
              </h4>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                {item.start_time && (
                  <div className="flex items-center gap-1 text-forest-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {item.start_time.slice(0, 5)}
                    {item.end_time && <span> – {item.end_time.slice(0, 5)}</span>}
                  </div>
                )}
                {item.duration && (
                  <div className="text-forest-600 text-xs">
                    {item.duration >= 60 ? `${Math.floor(item.duration / 60)}h ${item.duration % 60 > 0 ? `${item.duration % 60}m` : ''}`.trim() : `${item.duration}m`}
                  </div>
                )}
              </div>

              {item.notes && (
                <p className="text-forest-500 text-xs mt-1.5 leading-relaxed">{item.notes}</p>
              )}

              {item.places && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 text-forest-600" />
                  <span className="text-forest-600 text-xs">{item.places.name}</span>
                </div>
              )}

              {item.completed_by && item.is_completed && (
                <div className="text-forest-700 text-xs mt-1">
                  ✓ {item.profiles?.display_name ?? 'Someone'} at {format(new Date(item.completed_at), 'h:mm a')}
                </div>
              )}
            </div>

            {/* Actions menu */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="btn-icon w-7 h-7 flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Expanded actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-3 border-t border-forest-800/30 mt-3">
                  {item.latitude && item.longitude && (
                    <a
                      href={mapsUrlFromCurrentLocation(item.latitude, item.longitude, position?.latitude, position?.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-1.5 px-3 text-xs flex-1"
                    >
                      <Navigation className="w-3 h-3" /> Navigate
                    </a>
                  )}
                  <button onClick={() => { onEdit(item); setShowActions(false) }} className="btn-secondary py-1.5 px-3 text-xs flex-1">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => { onDelete(item.id); setShowActions(false) }} className="btn-danger py-1.5 px-3 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function AddItemForm({ date, onCancel, onSave }: { date: string; onCancel: () => void; onSave: (item: any) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Enter a title'); return }
    setIsSaving(true)
    await onSave({ day_date: date, title, start_time: startTime, duration, notes })
    setIsSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card p-4 mb-3 border border-forest-600/30"
    >
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Activity title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input-field"
          autoFocus
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="input-label text-[10px]">Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field py-2" />
          </div>
          <div className="flex-1">
            <label className="input-label text-[10px]">Duration</label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="input-field py-2">
              <option value={30}>30 min</option>
              <option value={60}>1 hr</option>
              <option value={90}>1.5 hr</option>
              <option value={120}>2 hr</option>
              <option value={180}>3 hr</option>
              <option value={240}>4 hr</option>
              <option value={360}>6 hr</option>
              <option value={480}>Full day</option>
            </select>
          </div>
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="input-field resize-none text-sm"
          rows={2}
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1 py-2.5 text-sm">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button onClick={onCancel} className="btn-secondary py-2.5 px-4 text-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ItineraryPage() {
  const { tripId } = useTripStore()
  const { items, isLoading, addItem, deleteItem, updateItem, toggleComplete } = useItinerary(tripId)
  const [activeDay, setActiveDay] = useState(0)
  const [addingFor, setAddingFor] = useState<string | null>(null)

  const selectedDate = TRIP_DATES[activeDay]
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayItems = items.filter(item => item.day_date === dateStr).sort((a, b) => {
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time)
    return a.order_index - b.order_index
  })

  const completedCount = dayItems.filter(i => i.is_completed).length
  const totalKm = dayItems.reduce((sum, i) => sum + (i.travel_time ? i.travel_time * 0.6 : 0), 0) // rough estimate

  const handleToggle = async (id: number, val: boolean) => {
    await toggleComplete.mutateAsync({ id, is_completed: val })
    toast.success(val ? 'Marked as done! ✓' : 'Marked as pending')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this itinerary item?')) return
    await deleteItem.mutateAsync(id)
    toast.success('Removed from itinerary')
  }

  const handleAdd = async (data: any) => {
    await addItem.mutateAsync(data)
    setAddingFor(null)
    toast.success('Added to itinerary!')
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-forest-950/80 backdrop-blur-xl border-b border-forest-700/30">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-forest-100 mb-4">Itinerary</h1>

          {/* Day tabs */}
          <div className="flex gap-2">
            {TRIP_DATES.map((date, idx) => {
              const dayItems_ = items.filter(i => i.day_date === format(date, 'yyyy-MM-dd'))
              const done = dayItems_.filter(i => i.is_completed).length
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    activeDay === idx
                      ? 'bg-forest-600/30 border-forest-500/60 text-forest-100'
                      : 'border-forest-800/50 text-forest-500 hover:text-forest-300'
                  }`}
                >
                  <div className="text-xs font-bold">
                    {isToday(date) ? 'TODAY' : isTomorrow(date) ? 'TOMORROW' : format(date, 'EEE').toUpperCase()}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-70">{format(date, 'd MMM')}</div>
                  {dayItems_.length > 0 && (
                    <div className="text-[10px] mt-1 opacity-60">{done}/{dayItems_.length}</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day summary */}
        {dayItems.length > 0 && (
          <div className="px-4 pb-3 flex items-center gap-4 text-xs text-forest-500">
            <span>{dayItems.length} stops</span>
            <span>·</span>
            <span>{completedCount} completed</span>
            {totalKm > 0 && <><span>·</span><span>~{Math.round(totalKm)} km est.</span></>}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {/* Conflict warnings */}
        <TimeConflictWarning items={dayItems} />

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        ) : dayItems.length === 0 && addingFor !== dateStr ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-forest-700 mx-auto mb-3" />
            <p className="text-forest-500 font-medium">No plans yet</p>
            <p className="text-forest-600 text-sm mt-1">Add activities for {format(selectedDate, 'd MMMM')}</p>
          </div>
        ) : (
          <div>
            {dayItems.map((item) => (
              <ItineraryItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onEdit={() => {}} // TODO: edit modal
              />
            ))}
          </div>
        )}

        {/* Add item form */}
        <AnimatePresence>
          {addingFor === dateStr && (
            <AddItemForm date={dateStr} onCancel={() => setAddingFor(null)} onSave={handleAdd} />
          )}
        </AnimatePresence>

        {/* Add button */}
        {addingFor !== dateStr && (
          <button
            onClick={() => setAddingFor(dateStr)}
            className="w-full py-3 border-2 border-dashed border-forest-800/60 hover:border-forest-600/60 rounded-2xl text-forest-500 hover:text-forest-300 transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        )}
      </div>
    </div>
  )
}
