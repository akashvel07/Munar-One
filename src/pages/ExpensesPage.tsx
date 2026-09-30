import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, Plus, Trash2, Receipt, Fuel, Utensils,
  Hotel, Ticket, ParkingCircle, ShoppingBag, Wrench,
  AlertTriangle, MoreHorizontal, TrendingUp, User, Users,
  ArrowRight, X, Loader2, Calendar
} from 'lucide-react'
import { useExpenses, useBudget, useTripMembers } from '../hooks/useData'
import { useTripStore, useAuthStore } from '../store'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: Fuel, color: '#b08860' },
  { id: 'food', label: 'Food', icon: Utensils, color: '#75a047' },
  { id: 'hotel', label: 'Hotel', icon: Hotel, color: '#3d8a36' },
  { id: 'entry_fee', label: 'Entry Fee', icon: Ticket, color: '#93bb68' },
  { id: 'parking', label: 'Parking', icon: ParkingCircle, color: '#47632c' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#5c7f36' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#a37050' },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: '#dc2626' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: '#4d6b38' },
]

const PIE_COLORS = ['#3d8a36', '#75a047', '#b08860', '#93bb68', '#a37050', '#47632c', '#5c7f36', '#dc2626', '#4d6b38']

function AddExpenseModal({ members, onClose, onSave }: { members: any[]; onClose: () => void; onSave: (data: any) => Promise<void> }) {
  const { profile } = useAuthStore()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [paidBy, setPaidBy] = useState(profile?.id ?? '')
  const [splitEqual, setSplitEqual] = useState(true)
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Enter a description'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }

    const amountNum = parseFloat(amount)
    const splits = splitEqual
      ? members.map(m => ({ user_id: m.profiles.id, amount: amountNum / members.length }))
      : members.map(m => ({ user_id: m.profiles.id, amount: parseFloat(customSplits[m.profiles.id] || '0') }))

    setIsSaving(true)
    await onSave({ title, amount: amountNum, category, paid_by: paidBy, expense_date: date, notes, splits })
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg mx-auto bg-forest-900 border-t border-forest-700/50 rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-forest-700 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-forest-100 text-lg">Add Expense</h3>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="input-label">Description</label>
            <input type="text" placeholder="e.g. Lunch at Hotel" value={title} onChange={e => setTitle(e.target.value)} className="input-field" autoFocus />
          </div>

          <div>
            <label className="input-label">Amount (₹)</label>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="input-field text-xl font-bold" />
          </div>

          <div>
            <label className="input-label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-forest-600/30 border-forest-500/60 text-forest-200'
                      : 'border-forest-800/50 text-forest-500 hover:text-forest-300'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Paid By</label>
            <div className="flex gap-2">
              {members.map(m => (
                <button
                  key={m.profiles.id}
                  onClick={() => setPaidBy(m.profiles.id)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    paidBy === m.profiles.id
                      ? 'bg-forest-600/30 border-forest-500/60 text-forest-200'
                      : 'border-forest-800/50 text-forest-500 hover:text-forest-300'
                  }`}
                >
                  {m.profiles.display_name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Split</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSplitEqual(true)} className={`flex-1 py-2 rounded-xl border text-sm transition-all ${splitEqual ? 'bg-forest-600/30 border-forest-500/60 text-forest-200' : 'border-forest-800/50 text-forest-500'}`}>Equal</button>
              <button onClick={() => setSplitEqual(false)} className={`flex-1 py-2 rounded-xl border text-sm transition-all ${!splitEqual ? 'bg-forest-600/30 border-forest-500/60 text-forest-200' : 'border-forest-800/50 text-forest-500'}`}>Custom</button>
            </div>
            {!splitEqual && members.map(m => (
              <div key={m.profiles.id} className="flex items-center gap-3 mb-2">
                <span className="text-forest-400 text-sm flex-1">{m.profiles.display_name}</span>
                <input
                  type="number"
                  placeholder="₹0"
                  value={customSplits[m.profiles.id] ?? ''}
                  onChange={e => setCustomSplits(prev => ({ ...prev, [m.profiles.id]: e.target.value }))}
                  className="input-field w-28 py-2 text-right"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="input-label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="input-label">Notes (optional)</label>
            <input type="text" placeholder="Any notes" value={notes} onChange={e => setNotes(e.target.value)} className="input-field" />
          </div>

          <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full py-3.5">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Save Expense
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ExpensesPage() {
  const { tripId } = useTripStore()
  const { expenses, addExpense, deleteExpense } = useExpenses(tripId)
  const { budget } = useBudget(tripId)
  const { data: members } = useTripMembers(tripId)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'list' | 'analytics'>('summary')

  const totalSpent = expenses.reduce((s, e) => s + parseFloat(String(e.amount)), 0)
  const totalBudget = budget?.total_budget ?? 10000
  const remaining = totalBudget - totalSpent
  const spentPct = Math.min(100, (totalSpent / totalBudget) * 100)

  // Per-person spending
  const memberSpending = (members ?? []).map(m => {
    const paid = expenses.filter(e => e.paid_by === m.profiles.id).reduce((s, e) => s + parseFloat(String(e.amount)), 0)
    const owes = expenses.reduce((sum, e) => {
      const split = e.expense_splits?.find((s: any) => s.user_id === m.profiles.id)
      return sum + (split ? parseFloat(String(split.amount)) : 0)
    }, 0)
    return { ...m.profiles, paid, owes, net: paid - owes }
  })

  // Settlement
  const settlements: { from: string; to: string; amount: number }[] = []
  const debtors = memberSpending.filter(m => m.net < -0.01).map(m => ({ ...m, balance: -m.net }))
  const creditors = memberSpending.filter(m => m.net > 0.01).map(m => ({ ...m, balance: m.net }))
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const amount = Math.min(debtor.balance, creditor.balance)
      if (amount > 0.01) {
        settlements.push({ from: debtor.display_name, to: creditor.display_name, amount: parseFloat(amount.toFixed(2)) })
      }
    }
  }

  // Category breakdown
  const categoryData = CATEGORIES.map(cat => ({
    name: cat.label,
    amount: expenses.filter(e => e.category === cat.id).reduce((s, e) => s + parseFloat(String(e.amount)), 0),
    color: cat.color,
  })).filter(c => c.amount > 0)

  const handleAddExpense = async (data: any) => {
    await addExpense.mutateAsync(data)
    setShowAddModal(false)
    toast.success('Expense added!')
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-forest-100">Expenses</h1>
          <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-forest-900/50 p-1 rounded-xl mb-5">
          {(['summary', 'list', 'analytics'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                activeTab === t ? 'bg-forest-600/50 text-forest-100' : 'text-forest-500 hover:text-forest-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Budget overview */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-forest-400 text-sm font-medium">Trip Budget</span>
                <span className="text-forest-300 font-bold">₹{totalBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-forest-800 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${spentPct > 90 ? 'bg-red-500' : spentPct > 75 ? 'bg-yellow-500' : 'bg-forest-500'}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-earth-300 font-bold text-xl">₹{totalSpent.toLocaleString()}</div>
                  <div className="text-forest-600 text-xs">spent</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${remaining < 0 ? 'text-red-400' : 'text-forest-300'}`}>
                    ₹{Math.abs(remaining).toLocaleString()}
                  </div>
                  <div className="text-forest-600 text-xs">{remaining < 0 ? 'over budget' : 'remaining'}</div>
                </div>
              </div>
            </div>

            {/* Per-person */}
            <div className="glass-card p-4">
              <div className="section-header">Per Person</div>
              <div className="space-y-3">
                {memberSpending.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forest-700/60 flex items-center justify-center text-forest-300 text-sm font-bold flex-shrink-0">
                      {m.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-forest-200 text-sm font-medium">{m.display_name}</span>
                        <span className="text-forest-200 font-semibold">₹{m.paid.toLocaleString()}</span>
                      </div>
                      <div className="text-forest-500 text-xs">Paid · Share: ₹{m.owes.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement */}
            {settlements.length > 0 && (
              <div className="glass-card p-4 border border-earth-700/30">
                <div className="section-header">Settlement</div>
                {settlements.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-2">
                    <span className="text-forest-300 text-sm font-medium">{s.from}</span>
                    <ArrowRight className="w-4 h-4 text-forest-600" />
                    <span className="text-forest-300 text-sm font-medium">{s.to}</span>
                    <span className="ml-auto text-earth-300 font-bold">₹{s.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {settlements.length === 0 && memberSpending.length > 0 && (
              <div className="text-center py-4 text-forest-500 text-sm">
                ✓ All settled up!
              </div>
            )}
          </div>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-forest-700 mx-auto mb-3" />
                <p className="text-forest-500">No expenses yet</p>
              </div>
            ) : (
              expenses.map(expense => {
                const cat = CATEGORIES.find(c => c.id === expense.category)
                return (
                  <div key={expense.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${cat?.color}20` }}
                        >
                          {cat && <cat.icon className="w-4.5 h-4.5" style={{ color: cat.color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-forest-100 font-semibold truncate">{expense.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-forest-500 text-xs">{expense.profiles?.display_name} paid</span>
                            <span className="text-forest-700 text-xs">·</span>
                            <span className="text-forest-600 text-xs">{format(new Date(expense.expense_date), 'd MMM')}</span>
                          </div>
                          {expense.notes && <p className="text-forest-600 text-xs mt-1 truncate">{expense.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-earth-300 font-bold">₹{parseFloat(String(expense.amount)).toLocaleString()}</div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this expense?')) {
                              deleteExpense.mutateAsync(expense.id)
                              toast.success('Expense deleted')
                            }
                          }}
                          className="text-red-600 hover:text-red-400 mt-1 text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {categoryData.length > 0 ? (
              <>
                <div className="glass-card p-4">
                  <div className="section-header">By Category</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="amount">
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0c2110', border: '1px solid rgba(61,138,54,0.3)', borderRadius: 8 }}
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {categoryData.map(c => (
                      <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                          <span className="text-forest-400 text-sm">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-forest-500 text-xs">{((c.amount / totalSpent) * 100).toFixed(0)}%</span>
                          <span className="text-forest-200 text-sm font-medium">₹{c.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-forest-600">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                Add expenses to see analytics
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && members && (
          <AddExpenseModal
            members={members}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddExpense}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
