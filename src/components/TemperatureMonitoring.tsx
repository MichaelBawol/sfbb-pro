import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  ThermometerIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react'
import { TemperatureLog, TEMP_THRESHOLDS } from '../types'
import BottomSheet from './BottomSheet'

type TempType = TemperatureLog['type']

const tempTypeLabels: Record<TempType, string> = {
  fridge: 'Fridge',
  freezer: 'Freezer',
  hot_hold: 'Hot Hold',
  delivery: 'Delivery',
  dishwasher: 'Dishwasher',
  probe_calibration: 'Probe Calibration',
}

const tempTypeColors: Record<TempType, string> = {
  fridge: 'bg-blue-100 text-blue-700',
  freezer: 'bg-cyan-100 text-cyan-700',
  hot_hold: 'bg-orange-100 text-orange-700',
  delivery: 'bg-purple-100 text-purple-700',
  dishwasher: 'bg-pink-100 text-pink-700',
  probe_calibration: 'bg-slate-100 text-slate-700',
}

export default function TemperatureMonitoring() {
  const { temperatureLogs, appliances, addTemperatureLog } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'fridge' as TempType,
    applianceId: '',
    temperature: '',
    boilingTemp: '',
    iceTemp: '',
    notes: '',
  })

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().slice(0, 5)

  const todayLogs = temperatureLogs
    .filter(log => log.date === today)
    .sort((a, b) => b.time.localeCompare(a.time))

  const compliantCount = todayLogs.filter(l => l.isCompliant).length
  const nonCompliantCount = todayLogs.length - compliantCount

  const checkCompliance = (type: TempType, temp: number): boolean => {
    const thresholds = type === 'fridge' ? TEMP_THRESHOLDS.fridge :
      type === 'freezer' ? TEMP_THRESHOLDS.freezer :
      type === 'hot_hold' ? TEMP_THRESHOLDS.hot_hold :
      type === 'delivery' ? TEMP_THRESHOLDS.delivery_chilled :
      null

    if (!thresholds) return true
    return temp >= thresholds.min && temp <= thresholds.max
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedAppliance = appliances.find(a => a.id === formData.applianceId)
    const temp = parseFloat(formData.temperature)

    const log: Omit<TemperatureLog, 'id'> = {
      type: formData.type,
      applianceId: formData.applianceId || undefined,
      applianceName: selectedAppliance?.name || tempTypeLabels[formData.type],
      temperature: formData.type !== 'probe_calibration' ? temp : undefined,
      boilingTemp: formData.type === 'probe_calibration' ? parseFloat(formData.boilingTemp) : undefined,
      iceTemp: formData.type === 'probe_calibration' ? parseFloat(formData.iceTemp) : undefined,
      time: now,
      date: today,
      loggedBy: 'Current User',
      notes: formData.notes || undefined,
      isCompliant: formData.type === 'probe_calibration'
        ? true
        : checkCompliance(formData.type, temp),
    }

    addTemperatureLog(log)
    setShowForm(false)
    setFormData({
      type: 'fridge',
      applianceId: '',
      temperature: '',
      boilingTemp: '',
      iceTemp: '',
      notes: '',
    })
  }

  const getAppliancesForType = (type: TempType) => {
    const typeMap: Record<string, string> = {
      fridge: 'fridge',
      freezer: 'freezer',
      hot_hold: 'hot_hold',
      dishwasher: 'dishwasher',
      probe_calibration: 'probe',
    }
    return appliances.filter(a => a.type === typeMap[type])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Temperature</h1>
        <p className="text-slate-500">Track all temperature readings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2 mx-auto">
            <ThermometerIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-center text-slate-900">{todayLogs.length}</p>
          <p className="text-xs text-center text-slate-500">Today</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-2 mx-auto">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-center text-emerald-600">{compliantCount}</p>
          <p className="text-xs text-center text-slate-500">OK</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2 mx-auto">
            <XCircleIcon className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-center text-red-600">{nonCompliantCount}</p>
          <p className="text-xs text-center text-slate-500">Issues</p>
        </div>
      </div>

      {/* Today's Logs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Today's Logs</h2>
        </div>

        {todayLogs.length === 0 ? (
          <div className="p-8 text-center">
            <ThermometerIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No logs yet today</p>
            <p className="text-sm text-slate-400">Tap + to add a reading</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-4 p-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  log.isCompliant ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {log.type === 'probe_calibration' ? (
                    <ThermometerIcon className="w-6 h-6 text-slate-600" />
                  ) : (
                    <span className={`text-lg font-bold ${log.isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.temperature}°
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{log.applianceName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tempTypeColors[log.type]}`}>
                      {tempTypeLabels[log.type]}
                    </span>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                </div>
                {log.isCompliant ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-sfbb-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 active:bg-sfbb-700 transition-transform z-40"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      {/* Add Temperature Bottom Sheet */}
      <BottomSheet
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Log Temperature"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Selection - Large touch-friendly buttons */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(tempTypeLabels) as TempType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type, applianceId: '' })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.type === type
                      ? 'bg-sfbb-100 border-2 border-sfbb-500'
                      : 'bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    formData.type === type ? 'text-sfbb-700' : 'text-slate-700'
                  }`}>
                    {tempTypeLabels[type]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Appliance Selection */}
          {getAppliancesForType(formData.type).length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block">Appliance</label>
              <div className="grid grid-cols-2 gap-2">
                {getAppliancesForType(formData.type).map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, applianceId: app.id })}
                    className={`p-4 rounded-xl text-left transition-all ${
                      formData.applianceId === app.id
                        ? 'bg-sfbb-100 border-2 border-sfbb-500'
                        : 'bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      formData.applianceId === app.id ? 'text-sfbb-700' : 'text-slate-700'
                    }`}>
                      {app.name}
                    </span>
                    {app.location && (
                      <span className="text-xs text-slate-400 block mt-0.5">{app.location}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Temperature Input */}
          {formData.type === 'probe_calibration' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Ice Water (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={formData.iceTemp}
                  onChange={e => setFormData({ ...formData, iceTemp: e.target.value })}
                  className="input text-center text-2xl font-bold"
                  placeholder="0"
                  required
                />
                <p className="text-xs text-slate-400 mt-1 text-center">Target: -1 to 1°C</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Boiling (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={formData.boilingTemp}
                  onChange={e => setFormData({ ...formData, boilingTemp: e.target.value })}
                  className="input text-center text-2xl font-bold"
                  placeholder="100"
                  required
                />
                <p className="text-xs text-slate-400 mt-1 text-center">Target: 99 to 101°C</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                className="input text-center text-4xl font-bold h-20"
                placeholder="0.0"
                required
              />
              {formData.type in TEMP_THRESHOLDS && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Target: {TEMP_THRESHOLDS[formData.type as keyof typeof TEMP_THRESHOLDS].min}°C to{' '}
                  {TEMP_THRESHOLDS[formData.type as keyof typeof TEMP_THRESHOLDS].max}°C
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full py-4 text-lg"
          >
            Save Reading
          </button>

          {/* Bottom padding for safe area */}
          <div className="h-4" />
        </form>
      </BottomSheet>
    </div>
  )
}
