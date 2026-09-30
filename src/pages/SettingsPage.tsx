import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Bike, DollarSign, Key, LogOut,
  Save, Loader2, ChevronRight, Moon, Bell, Shield
} from 'lucide-react'
import { useAuthStore, useTripStore } from '../store'
import { useBikes, useBudget } from '../hooks/useData'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { profile, signOut } = useAuthStore()
  const { tripId } = useTripStore()
  const { bikes, saveBike } = useBikes(tripId)
  const { budget, saveBudget } = useBudget(tripId)
  const [tab, setTab] = useState<'profile' | 'bike' | 'budget' | 'password'>('profile')

  // Profile
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Bike (for current user)
  const myBike = bikes.find(b => b.owner_id === profile?.id)
  const [bikeName, setBikeName] = useState(myBike?.name ?? '')
  const [bikeModel, setBikeModel] = useState(myBike?.model ?? '')
  const [bikeReg, setBikeReg] = useState(myBike?.registration_number ?? '')
  const [tankCap, setTankCap] = useState(String(myBike?.tank_capacity ?? ''))
  const [expectedMileage, setExpectedMileage] = useState(String(myBike?.expected_mileage ?? ''))
  const [currentOdo, setCurrentOdo] = useState(String(myBike?.current_odometer ?? ''))
  const [isSavingBike, setIsSavingBike] = useState(false)

  // Budget (10k total budget: fuel 3000, food 2000, stay 3500, other/emergency 1500)
  const [totalBudget, setTotalBudget] = useState(String(budget?.total_budget ?? 10000))
  const [fuelBudget, setFuelBudget] = useState(String(budget?.fuel_budget ?? 3000))
  const [foodBudget, setFoodBudget] = useState(String(budget?.food_budget ?? 2000))
  const [stayBudget, setStayBudget] = useState(String(budget?.stay_budget ?? 3500))
  const [isSavingBudget, setIsSavingBudget] = useState(false)

  useEffect(() => {
    if (budget) {
      setTotalBudget(String(budget.total_budget ?? 10000))
      setFuelBudget(String(budget.fuel_budget ?? 3000))
      setFoodBudget(String(budget.food_budget ?? 2000))
      setStayBudget(String(budget.stay_budget ?? 3500))
    }
  }, [budget])

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [isChangingPw, setIsChangingPw] = useState(false)

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', profile!.id)
    if (error) toast.error('Failed to update profile')
    else toast.success('Profile updated!')
    setIsSavingProfile(false)
  }

  const handleSaveBike = async () => {
    if (!bikeName.trim()) { toast.error('Enter bike name'); return }
    setIsSavingBike(true)
    await saveBike.mutateAsync({
      id: myBike?.id,
      name: bikeName,
      model: bikeModel || undefined,
      registration_number: bikeReg || undefined,
      tank_capacity: tankCap ? parseFloat(tankCap) : undefined,
      expected_mileage: expectedMileage ? parseFloat(expectedMileage) : undefined,
      current_odometer: currentOdo ? parseFloat(currentOdo) : undefined,
    })
    toast.success('Bike saved!')
    setIsSavingBike(false)
  }

  const handleSaveBudget = async () => {
    setIsSavingBudget(true)
    await saveBudget.mutateAsync({
      total_budget: parseFloat(totalBudget),
      fuel_budget: parseFloat(fuelBudget),
      food_budget: parseFloat(foodBudget),
      stay_budget: parseFloat(stayBudget),
    })
    toast.success('Budget updated!')
    setIsSavingBudget(false)
  }

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setIsChangingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) toast.error('Failed to change password')
    else {
      toast.success('Password changed!')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
    setIsChangingPw(false)
  }

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bike', label: 'My Bike', icon: Bike },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'password', label: 'Security', icon: Shield },
  ] as const

  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-forest-100 mb-4">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-forest-900/50 p-1 rounded-xl mb-5 overflow-x-auto scroll-x">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id ? 'bg-forest-600/50 text-forest-100' : 'text-forest-500 hover:text-forest-300'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-forest-700/60 border border-forest-600/40 flex items-center justify-center text-forest-200 text-2xl font-bold">
                  {profile?.display_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-forest-100 font-bold text-lg">{profile?.display_name}</div>
                  <div className="text-forest-500 text-sm">@{profile?.username}</div>
                </div>
              </div>

              <div>
                <label className="input-label">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="input-field"
                />
              </div>

              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="btn-primary w-full py-3 mt-4">
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>

            <button onClick={signOut} className="btn-danger w-full py-3.5">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        )}

        {/* BIKE TAB */}
        {tab === 'bike' && (
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="input-label">Bike Name *</label>
              <input type="text" placeholder="e.g. Akash's Royal Enfield" value={bikeName} onChange={e => setBikeName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="input-label">Model</label>
              <input type="text" placeholder="e.g. Royal Enfield Himalayan 450" value={bikeModel} onChange={e => setBikeModel(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="input-label">Registration Number</label>
              <input type="text" placeholder="KL 07 AB 1234" value={bikeReg} onChange={e => setBikeReg(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Tank Capacity (L)</label>
                <input type="number" step="0.5" placeholder="15" value={tankCap} onChange={e => setTankCap(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Expected Mileage</label>
                <input type="number" step="0.5" placeholder="km/L" value={expectedMileage} onChange={e => setExpectedMileage(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="input-label">Current Odometer (km)</label>
              <input type="number" placeholder="e.g. 15234" value={currentOdo} onChange={e => setCurrentOdo(e.target.value)} className="input-field" />
            </div>
            <button onClick={handleSaveBike} disabled={isSavingBike} className="btn-primary w-full py-3">
              {isSavingBike ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Bike
            </button>
          </div>
        )}

        {/* BUDGET TAB */}
        {tab === 'budget' && (
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="input-label">Total Trip Budget (₹)</label>
              <input type="number" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} className="input-field text-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Fuel (₹)</label>
                <input type="number" value={fuelBudget} onChange={e => setFuelBudget(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Food (₹)</label>
                <input type="number" value={foodBudget} onChange={e => setFoodBudget(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Stay (₹)</label>
                <input type="number" value={stayBudget} onChange={e => setStayBudget(e.target.value)} className="input-field" />
              </div>
            </div>
            <button onClick={handleSaveBudget} disabled={isSavingBudget} className="btn-primary w-full py-3">
              {isSavingBudget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Budget
            </button>
          </div>
        )}

        {/* PASSWORD TAB */}
        {tab === 'password' && (
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="input-label">New Password</label>
              <input type="password" placeholder="Min 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input type="password" placeholder="Confirm password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="input-field" />
            </div>
            <button onClick={handleChangePassword} disabled={isChangingPw} className="btn-primary w-full py-3">
              {isChangingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
