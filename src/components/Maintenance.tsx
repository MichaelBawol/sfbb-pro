import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  WrenchIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  ThermometerIcon,
} from 'lucide-react'
import BottomSheet from './BottomSheet'
import StaffSelector, { useLastStaff } from './StaffSelector'

const MAINTENANCE_TYPES = [
  { value: 'repair', label: 'Repair', color: 'red' },
  { value: 'service', label: 'Scheduled Service', color: 'blue' },
  { value: 'inspection', label: 'Inspection', color: 'amber' },
] as const

export default function Maintenance() {
  const { maintenanceLogs, addMaintenanceLog, appliances, temperatureLogs, addTemperatureLog } = useAppContext()
  const { getLastStaff } = useLastStaff()
  const [showForm, setShowForm] = useState(false)
  const [showCalibrationForm, setShowCalibrationForm] = useState(false)
  const [calibrationData, setCalibrationData] = useState({
    iceTemp: '',
    boilingTemp: '',
    performedBy: '',
  })
  const [formData, setFormData] = useState({
    applianceId: '',
    applianceName: '',
    type: 'service' as 'repair' | 'service' | 'inspection',
    description: '',
    performedBy: '',
    cost: '',
    nextServiceDate: '',
  })

  // Set default staff when forms open
  useEffect(() => {
    if (showForm && !formData.performedBy) {
      setFormData(prev => ({ ...prev, performedBy: getLastStaff() }))
    }
  }, [showForm])

  useEffect(() => {
    if (showCalibrationForm && !calibrationData.performedBy) {
      setCalibrationData(prev => ({ ...prev, performedBy: getLastStaff() }))
    }
  }, [showCalibrationForm])

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  // Get probe calibration records
  const calibrationLogs = temperatureLogs
    .filter(log => log.type === 'probe_calibration')
    .sort((a, b) => b.date.localeCompare(a.date))

  const lastCalibration = calibrationLogs[0]
  const daysSinceCalibration = lastCalibration
    ? Math.floor((new Date().getTime() - new Date(lastCalibration.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

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

  const resetCalibrationForm = () => {
    setCalibrationData({
      iceTemp: '',
      boilingTemp: '',
      performedBy: '',
    })
    setShowCalibrationForm(false)
  }

  const handleCalibrationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!calibrationData.iceTemp || !calibrationData.boilingTemp || !calibrationData.performedBy) return

    const iceTemp = parseFloat(calibrationData.iceTemp)
    const boilingTemp = parseFloat(calibrationData.boilingTemp)

    // Check if calibration is within acceptable range
    const iceOk = iceTemp >= -1 && iceTemp <= 1
    const boilingOk = boilingTemp >= 99 && boilingTemp <= 101
    const isCompliant = iceOk && boilingOk

    addTemperatureLog({
      type: 'probe_calibration',
      applianceName: 'Probe Thermometer',
      iceTemp,
      boilingTemp,
      time: now,
      date: today,
      loggedBy: calibrationData.performedBy,
      isCompliant,
    })

    resetCalibrationForm()
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

      {/* Probe Calibration Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <ThermometerIcon className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-slate-900">Probe Calibration</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className={`p-4 rounded-xl ${
            daysSinceCalibration === null ? 'bg-slate-50' :
            daysSinceCalibration <= 7 ? 'bg-emerald-50' :
            daysSinceCalibration <= 14 ? 'bg-amber-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {daysSinceCalibration === null ? 'No calibration recorded' :
                   daysSinceCalibration === 0 ? 'Calibrated today' :
                   daysSinceCalibration === 1 ? 'Calibrated yesterday' :
                   `Calibrated ${daysSinceCalibration} days ago`}
                </p>
                {lastCalibration && (
                  <p className="text-sm text-slate-500 mt-1">
                    Ice: {lastCalibration.iceTemp}°C • Boiling: {lastCalibration.boilingTemp}°C
                  </p>
                )}
              </div>
              {daysSinceCalibration !== null && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  daysSinceCalibration <= 7 ? 'bg-emerald-100' :
                  daysSinceCalibration <= 14 ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {daysSinceCalibration <= 7 ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangleIcon className={`w-5 h-5 ${
                      daysSinceCalibration <= 14 ? 'text-amber-600' : 'text-red-600'
                    }`} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Calibrate Button */}
          <button
            onClick={() => setShowCalibrationForm(true)}
            className="w-full py-3 bg-violet-100 text-violet-700 rounded-xl font-semibold active:bg-violet-200 flex items-center justify-center gap-2"
          >
            <ThermometerIcon className="w-5 h-5" />
            Calibrate Probe
          </button>

          {/* Recent Calibrations */}
          {calibrationLogs.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Recent Calibrations</p>
              <div className="space-y-2">
                {calibrationLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(log.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ice: {log.iceTemp}°C • Boiling: {log.boilingTemp}°C • {log.loggedBy}
                      </p>
                    </div>
                    {log.isCompliant ? (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Calibrate weekly using ice water (0°C) and boiling water (100°C)
          </p>
        </div>
      </div>

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

          <StaffSelector
            value={formData.performedBy}
            onChange={val => setFormData({ ...formData, performedBy: val })}
            label="Performed By"
            required
          />

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

      {/* Probe Calibration Form */}
      <BottomSheet
        isOpen={showCalibrationForm}
        onClose={resetCalibrationForm}
        title="Calibrate Probe Thermometer"
      >
        <form onSubmit={handleCalibrationSubmit} className="p-4 space-y-4">
          <div className="bg-violet-50 p-4 rounded-xl">
            <p className="text-sm text-violet-700">
              Test your probe in ice water and boiling water to verify accuracy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ice Water (°C) *</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={calibrationData.iceTemp}
                onChange={e => setCalibrationData({ ...calibrationData, iceTemp: e.target.value })}
                className="input text-center text-2xl font-bold"
                placeholder="0"
                required
              />
              <p className="text-xs text-slate-400 mt-1 text-center">Target: -1 to 1°C</p>
            </div>
            <div>
              <label className="label">Boiling Water (°C) *</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={calibrationData.boilingTemp}
                onChange={e => setCalibrationData({ ...calibrationData, boilingTemp: e.target.value })}
                className="input text-center text-2xl font-bold"
                placeholder="100"
                required
              />
              <p className="text-xs text-slate-400 mt-1 text-center">Target: 99 to 101°C</p>
            </div>
          </div>

          <StaffSelector
            value={calibrationData.performedBy}
            onChange={val => setCalibrationData({ ...calibrationData, performedBy: val })}
            label="Performed By"
            required
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetCalibrationForm}
              className="flex-1 py-4 bg-slate-100 rounded-xl font-semibold text-slate-700 active:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!calibrationData.iceTemp || !calibrationData.boilingTemp || !calibrationData.performedBy}
              className="flex-1 py-4 bg-violet-600 rounded-xl font-semibold text-white active:bg-violet-700 disabled:opacity-50"
            >
              Save Calibration
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
