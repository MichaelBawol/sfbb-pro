import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  WrenchIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
} from 'lucide-react'
import BottomSheet from './BottomSheet'

const MAINTENANCE_TYPES = [
  { value: 'repair', label: 'Repair', color: 'red' },
  { value: 'service', label: 'Scheduled Service', color: 'blue' },
  { value: 'inspection', label: 'Inspection', color: 'amber' },
] as const

export default function Maintenance() {
  const { maintenanceLogs, addMaintenanceLog, appliances } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    applianceId: '',
    applianceName: '',
    type: 'service' as 'repair' | 'service' | 'inspection',
    description: '',
    performedBy: '',
    cost: '',
    nextServiceDate: '',
  })

  const today = new Date().toISOString().split('T')[0]

  // Find upcoming services (within next 30 days)
  const upcomingServices = maintenanceLogs
    .filter(log => log.nextServiceDate && log.nextServiceDate >= today)
    .sort((a, b) => (a.nextServiceDate || '').localeCompare(b.nextServiceDate || ''))
    .slice(0, 5)

  // Sort logs by date (most recent first)
  const sortedLogs = [...maintenanceLogs].sort((a, b) => b.date.localeCompare(a.date))

  const resetForm = () => {
    setFormData({
      applianceId: '',
      applianceName: '',
      type: 'service',
      description: '',
      performedBy: '',
      cost: '',
      nextServiceDate: '',
    })
    setShowForm(false)
  }

  const handleApplianceSelect = (applianceId: string) => {
    if (applianceId === 'other') {
      setFormData({ ...formData, applianceId: '', applianceName: '' })
    } else {
      const appliance = appliances.find(a => a.id === applianceId)
      setFormData({
        ...formData,
        applianceId,
        applianceName: appliance?.name || '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applianceName || !formData.description || !formData.performedBy) return

    addMaintenanceLog({
      date: today,
      applianceId: formData.applianceId || undefined,
      applianceName: formData.applianceName,
      type: formData.type,
      description: formData.description,
      performedBy: formData.performedBy,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      nextServiceDate: formData.nextServiceDate || undefined,
    })

    resetForm()
  }

  const getTypeConfig = (type: string) => {
    return MAINTENANCE_TYPES.find(t => t.value === type) || MAINTENANCE_TYPES[1]
  }

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date(today).getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="text-slate-500">Equipment repairs and servicing</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <WrenchIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{maintenanceLogs.length}</p>
              <p className="text-sm text-slate-500">Total records</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{upcomingServices.length}</p>
              <p className="text-sm text-slate-500">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Maintenance Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-4 bg-sfbb-600 rounded-2xl font-semibold text-white active:bg-sfbb-700 flex items-center justify-center gap-2 shadow-sm"
      >
        <PlusIcon className="w-5 h-5" />
        Log Maintenance
      </button>

      {/* Upcoming Services */}
      {upcomingServices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Upcoming Services</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingServices.map(log => {
              const daysUntil = getDaysUntil(log.nextServiceDate!)
              return (
                <div key={log.id} className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    daysUntil <= 7 ? 'bg-red-100' : daysUntil <= 14 ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <CalendarIcon className={`w-5 h-5 ${
                      daysUntil <= 7 ? 'text-red-600' : daysUntil <= 14 ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{log.applianceName}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(log.nextServiceDate!).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    daysUntil <= 7 ? 'bg-red-100 text-red-700' : daysUntil <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Maintenance History */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Maintenance History</h2>
        </div>

        {maintenanceLogs.length === 0 ? (
          <div className="p-8 text-center">
            <WrenchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No maintenance records yet</p>
            <p className="text-sm text-slate-400">Tap the button above to log maintenance</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedLogs.slice(0, 10).map(log => {
              const typeConfig = getTypeConfig(log.type)
              return (
                <div key={log.id} className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-full bg-${typeConfig.color}-100 flex items-center justify-center flex-shrink-0`}>
                    {log.type === 'repair' ? (
                      <AlertTriangleIcon className={`w-5 h-5 text-${typeConfig.color}-600`} />
                    ) : log.type === 'inspection' ? (
                      <CheckCircleIcon className={`w-5 h-5 text-${typeConfig.color}-600`} />
                    ) : (
                      <WrenchIcon className={`w-5 h-5 text-${typeConfig.color}-600`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{log.applianceName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${typeConfig.color}-100 text-${typeConfig.color}-700`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{log.description}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(log.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} • {log.performedBy}
                    </p>
                  </div>
                  {log.cost && (
                    <p className="text-sm font-medium text-slate-600">£{log.cost.toFixed(2)}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Maintenance Form */}
      <BottomSheet
        isOpen={showForm}
        onClose={resetForm}
        title="Log Maintenance"
        fullScreen
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Equipment *</label>
            {appliances.length > 0 ? (
              <>
                <select
                  value={formData.applianceId || 'other'}
                  onChange={e => handleApplianceSelect(e.target.value)}
                  className="input mb-2"
                >
                  <option value="">Select equipment...</option>
                  {appliances.map(appliance => (
                    <option key={appliance.id} value={appliance.id}>
                      {appliance.name}
                    </option>
                  ))}
                  <option value="other">Other (enter manually)</option>
                </select>
                {formData.applianceId === '' && (
                  <input
                    type="text"
                    value={formData.applianceName}
                    onChange={e => setFormData({ ...formData, applianceName: e.target.value })}
                    className="input"
                    placeholder="Enter equipment name"
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={formData.applianceName}
                onChange={e => setFormData({ ...formData, applianceName: e.target.value })}
                className="input"
                placeholder="Enter equipment name"
                required
              />
            )}
          </div>

          <div>
            <label className="label">Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {MAINTENANCE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-3 rounded-xl text-center transition-colors ${
                    formData.type === type.value
                      ? `bg-${type.color}-100 text-${type.color}-700 font-medium`
                      : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Describe the work done..."
              required
            />
          </div>

          <div>
            <label className="label">Performed By *</label>
            <input
              type="text"
              value={formData.performedBy}
              onChange={e => setFormData({ ...formData, performedBy: e.target.value })}
              className="input"
              placeholder="Engineer/company name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cost (£)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Next Service Date</label>
              <input
                type="date"
                value={formData.nextServiceDate}
                onChange={e => setFormData({ ...formData, nextServiceDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 rounded-xl font-semibold text-slate-700 active:bg-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.applianceName || !formData.description || !formData.performedBy}
              className="flex-1 py-4 bg-sfbb-600 rounded-xl font-semibold text-white active:bg-sfbb-700 disabled:opacity-50"
            >
              Save Record
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
