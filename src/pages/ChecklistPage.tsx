import React from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Bike, User } from 'lucide-react'
import { useChecklist } from '../hooks/useData'
import { useTripStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function ChecklistPage() {
  const { tripId } = useTripStore()
  const { profile } = useAuthStore()
  const { items, toggleCheck } = useChecklist(tripId)

  const bikeItems = items.filter(i => i.category === 'bike')
  const personalItems = items.filter(i => i.category === 'personal')
  const documentsItems = items.filter(i => i.category === 'documents')

  const bikeChecked = bikeItems.filter(i => i.is_checked).length
  const personalChecked = personalItems.filter(i => i.is_checked).length

  const handleToggle = async (id: number, current: boolean) => {
    await toggleCheck.mutateAsync({ id, is_checked: !current })
    if (!current) toast.success('Checked! ✓', { duration: 1000 })
  }

  const renderGroup = (title: string, icon: React.ReactNode, items: any[], checked: number) => (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-forest-400">{icon}</div>
          <span className="font-display font-bold text-forest-100">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 bg-forest-800 rounded-full h-1.5">
            <div
              className="bg-forest-500 h-1.5 rounded-full transition-all"
              style={{ width: items.length > 0 ? `${(checked / items.length) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-forest-500 text-xs">{checked}/{items.length}</span>
        </div>
      </div>

      <div className="glass-card divide-y divide-forest-800/30">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleToggle(item.id, item.is_checked)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-forest-800/30 transition-colors text-left"
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              item.is_checked
                ? 'bg-forest-500 border-forest-400'
                : 'border-forest-600 hover:border-forest-400'
            }`}>
              {item.is_checked && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${item.is_checked ? 'text-forest-600 line-through' : 'text-forest-100'}`}>
                {item.title}
              </span>
              {item.is_checked && item.checked_by && (
                <div className="text-forest-700 text-xs mt-0.5">
                  ✓ {item.checked_at ? new Date(item.checked_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              )}
            </div>
          </motion.button>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-forest-600 text-sm">No items</div>
        )}
      </div>
    </div>
  )

  const totalItems = items.length
  const totalChecked = items.filter(i => i.is_checked).length

  return (
    <div className="min-h-screen bg-forest-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-1">Trip Checklist</h1>
        <p className="text-forest-500 text-sm mb-5">Shared with all trip members</p>

        {/* Progress */}
        <div className="glass-card p-4 mb-5 border border-forest-600/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-forest-400 text-sm">Overall Progress</span>
            <span className="text-forest-200 font-bold">{totalChecked}/{totalItems}</span>
          </div>
          <div className="w-full bg-forest-800 rounded-full h-2.5">
            <div
              className="bg-forest-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: totalItems > 0 ? `${(totalChecked / totalItems) * 100}%` : '0%' }}
            />
          </div>
          {totalChecked === totalItems && totalItems > 0 && (
            <div className="text-forest-400 text-xs mt-2 text-center">
              ✓ All items checked — ready to ride! 🏍
            </div>
          )}
        </div>

        {renderGroup('Bike', <Bike className="w-4 h-4" />, bikeItems, bikeChecked)}
        {renderGroup('Personal', <User className="w-4 h-4" />, personalItems, personalChecked)}
        {documentsItems.length > 0 && renderGroup('Documents', <CheckSquare className="w-4 h-4" />, documentsItems, documentsItems.filter(i => i.is_checked).length)}
      </div>
    </div>
  )
}
