import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  TrashIcon,
  PlusIcon,
  ScaleIcon,
} from 'lucide-react'
import BottomSheet from './BottomSheet'
import StaffSelector, { useLastStaff } from './StaffSelector'

const WASTE_REASONS = [
  'Expired/Out of date',
  'Spoiled/Off',
  'Preparation waste',
  'Customer return',
  'Overproduction',
  'Damaged packaging',
  'Temperature abuse',
  'Cross-contamination risk',
  'Quality not acceptable',
  'Dropped/Spillage',
  'Other',
]

export default function WasteManagement() {
  const { wasteLogs, addWasteLog } = useAppContext()
  const { getLastStaff } = useLastStaff()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    reason: '',
    cost: '',
    loggedBy: '',
  })

  // Set default staff when form opens
  useEffect(() => {
    if (showForm && !formData.loggedBy) {
      setFormData(prev => ({ ...prev, loggedBy: getLastStaff() }))
    }
  }, [showForm])

  const today = new Date().toISOString().split('T')[0]
  const todayLogs = wasteLogs.filter(w => w.date === today)
  const todayCost = todayLogs.reduce((sum, w) => sum + (w.cost || 0), 0)

  // Group logs by date
  const logsByDate = wasteLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {} as Record<string, typeof wasteLogs>)

  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a))

  const resetForm = () => {
    setFormData({ itemName: '', quantity: '', reason: '', cost: '', loggedBy: '' })
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.itemName || !formData.quantity || !formData.reason || !formData.loggedBy) return

    addWasteLog({
      date: today,
      time: new Date().toTimeString().slice(0, 5),
      itemName: formData.itemName,
      quantity: formData.quantity,
      reason: formData.reason,
      loggedBy: formData.loggedBy,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
    })

    resetForm()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Waste Management</h1>
        <p className="text-slate-500">Track and monitor food waste</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{todayLogs.length}</p>
              <p className="text-sm text-slate-500">Items today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <ScaleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">£{todayCost.toFixed(2)}</p>
              <p className="text-sm text-slate-500">Cost today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Waste Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-4 bg-sfbb-600 rounded-2xl font-semibold text-white active:bg-sfbb-700 flex items-center justify-center gap-2 shadow-sm"
      >
        <PlusIcon className="w-5 h-5" />
        Log Waste
      </button>

      {/* Waste Logs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Waste Log</h2>
        </div>

        {wasteLogs.length === 0 ? (
          <div className="p-8 text-center">
            <TrashIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No waste logged yet</p>
            <p className="text-sm text-slate-400">Tap the button above to log waste</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedDates.slice(0, 7).map(date => (
              <div key={date}>
                <div className="px-4 py-2 bg-slate-50">
                  <p className="text-sm font-medium text-slate-600">
                    {date === today ? 'Today' : new Date(date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                {logsByDate[date].map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{log.itemName}</p>
                      <p className="text-sm text-slate-500">{log.quantity}</p>
                      <p className="text-sm text-slate-400">{log.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{log.time}</p>
                      {log.cost && (
                        <p className="text-sm font-medium text-red-600">£{log.cost.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Waste Form */}
      <BottomSheet
        isOpen={showForm}
        onClose={resetForm}
        title="Log Waste"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Item Name *</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={e => setFormData({ ...formData, itemName: e.target.value })}
              className="input"
              placeholder="e.g., Chicken breast, Lettuce"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Quantity *</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              className="input"
              placeholder="e.g., 2kg, 5 portions, 1 box"
              required
            />
          </div>

          <div>
            <label className="label">Reason *</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {WASTE_REASONS.map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setFormData({ ...formData, reason })}
                  className={`p-3 rounded-xl text-sm text-left transition-colors ${
                    formData.reason === reason
                      ? 'bg-sfbb-100 text-sfbb-700 font-medium'
                      : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <StaffSelector
            value={formData.loggedBy}
            onChange={val => setFormData({ ...formData, loggedBy: val })}
            label="Logged By"
            required
          />

          <div>
            <label className="label">Estimated Cost (£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={e => setFormData({ ...formData, cost: e.target.value })}
              className="input"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 rounded-xl font-semibold text-slate-700 active:bg-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.itemName || !formData.quantity || !formData.reason || !formData.loggedBy}
              className="flex-1 py-4 bg-sfbb-600 rounded-xl font-semibold text-white active:bg-sfbb-700 disabled:opacity-50"
            >
              Log Waste
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
