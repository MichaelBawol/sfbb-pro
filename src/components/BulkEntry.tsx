import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  CalendarIcon,
  ThermometerIcon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  Loader2Icon,
} from 'lucide-react'
import { TemperatureLog, TEMP_THRESHOLDS } from '../types'
import StaffSelector, { useLastStaff } from './StaffSelector'

type TempType = TemperatureLog['type']

export default function BulkEntry() {
  const { appliances, addTemperatureLog, addChecklist, checklistTemplates } = useAppContext()
  const { getLastStaff } = useLastStaff()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Date range
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [staffName, setStaffName] = useState('')

  // Set default staff on mount
  useEffect(() => {
    const lastStaff = getLastStaff()
    if (lastStaff) setStaffName(lastStaff)
  }, [])

  // Temperature settings
  const [includeFridge, setIncludeFridge] = useState(true)
  const [includeFreezer, setIncludeFreezer] = useState(true)
  const [fridgeTemp, setFridgeTemp] = useState('3')
  const [freezerTemp, setFreezerTemp] = useState('-20')

  // Checklist settings
  const [includeOpening, setIncludeOpening] = useState(true)
  const [includeClosing, setIncludeClosing] = useState(true)

  const checkCompliance = (type: TempType, temp: number): boolean => {
    const thresholds = type === 'fridge' ? TEMP_THRESHOLDS.fridge :
      type === 'freezer' ? TEMP_THRESHOLDS.freezer : null
    if (!thresholds) return true
    return temp >= thresholds.min && temp <= thresholds.max
  }

  const getDatesBetween = (start: string, end: string): string[] => {
    const dates: string[] = []
    const currentDate = new Date(start)
    const endDate = new Date(end)

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
      return
    }

    if (!staffName.trim()) {
      setError('Please enter a staff name')
      return
    }

    const dates = getDatesBetween(startDate, endDate)
    const totalDays = dates.length

    if (totalDays > 60) {
      setError('Maximum date range is 60 days')
      return
    }

    setIsSubmitting(true)

    try {
      let tempCount = 0
      let checkCount = 0

      // Create temperature logs
      for (const date of dates) {
        if (includeFridge) {
          const temp = parseFloat(fridgeTemp)
          const fridgeAppliances = appliances.filter(a => a.type === 'fridge')

          if (fridgeAppliances.length > 0) {
            for (const appliance of fridgeAppliances) {
              await addTemperatureLog({
                type: 'fridge',
                applianceId: appliance.id,
                applianceName: appliance.name,
                temperature: temp,
                time: '09:00',
                date,
                loggedBy: staffName,
                isCompliant: checkCompliance('fridge', temp),
              })
              tempCount++
            }
          } else {
            await addTemperatureLog({
              type: 'fridge',
              applianceName: 'Fridge',
              temperature: temp,
              time: '09:00',
              date,
              loggedBy: staffName,
              isCompliant: checkCompliance('fridge', temp),
            })
            tempCount++
          }
        }

        if (includeFreezer) {
          const temp = parseFloat(freezerTemp)
          const freezerAppliances = appliances.filter(a => a.type === 'freezer')

          if (freezerAppliances.length > 0) {
            for (const appliance of freezerAppliances) {
              await addTemperatureLog({
                type: 'freezer',
                applianceId: appliance.id,
                applianceName: appliance.name,
                temperature: temp,
                time: '09:00',
                date,
                loggedBy: staffName,
                isCompliant: checkCompliance('freezer', temp),
              })
              tempCount++
            }
          } else {
            await addTemperatureLog({
              type: 'freezer',
              applianceName: 'Freezer',
              temperature: temp,
              time: '09:00',
              date,
              loggedBy: staffName,
              isCompliant: checkCompliance('freezer', temp),
            })
            tempCount++
          }
        }

        // Create checklists
        if (includeOpening && checklistTemplates.openingChecks.length > 0) {
          await addChecklist({
            type: 'opening',
            date,
            items: checklistTemplates.openingChecks.map((text, index) => ({
              id: `opening-${index}`,
              text,
              completed: true,
              completedAt: `${date}T09:00:00`,
              completedBy: staffName,
            })),
            completedBy: staffName,
            signedOff: true,
          })
          checkCount++
        }

        if (includeClosing && checklistTemplates.closingChecks.length > 0) {
          await addChecklist({
            type: 'closing',
            date,
            items: checklistTemplates.closingChecks.map((text, index) => ({
              id: `closing-${index}`,
              text,
              completed: true,
              completedAt: `${date}T21:00:00`,
              completedBy: staffName,
            })),
            completedBy: staffName,
            signedOff: true,
          })
          checkCount++
        }
      }

      setSuccess(`Successfully created ${tempCount} temperature logs and ${checkCount} checklists for ${totalDays} days`)

      // Reset form
      setStartDate('')
      setEndDate('')
    } catch (err) {
      console.error('Bulk entry error:', err)
      setError('An error occurred while creating records')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulk Entry</h1>
        <p className="text-slate-500">Backdate temperature logs and checklists</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Date Range */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sfbb-500" />
            <h2 className="font-semibold text-slate-900">Date Range</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>
            </div>
            <StaffSelector
              value={staffName}
              onChange={setStaffName}
              label="Staff Name"
              required
            />
          </div>
        </div>

        {/* Temperature Logs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <ThermometerIcon className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-slate-900">Temperature Logs</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Fridge */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeFridge"
                  checked={includeFridge}
                  onChange={e => setIncludeFridge(e.target.checked)}
                  className="w-5 h-5 rounded text-sfbb-500"
                />
                <label htmlFor="includeFridge" className="font-medium text-slate-900">
                  Fridge
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fridgeTemp}
                  onChange={e => setFridgeTemp(e.target.value)}
                  disabled={!includeFridge}
                  className="w-20 input text-center"
                  step="0.1"
                />
                <span className="text-slate-500">°C</span>
              </div>
            </div>

            {/* Freezer */}
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeFreezer"
                  checked={includeFreezer}
                  onChange={e => setIncludeFreezer(e.target.checked)}
                  className="w-5 h-5 rounded text-sfbb-500"
                />
                <label htmlFor="includeFreezer" className="font-medium text-slate-900">
                  Freezer
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={freezerTemp}
                  onChange={e => setFreezerTemp(e.target.value)}
                  disabled={!includeFreezer}
                  className="w-20 input text-center"
                  step="0.1"
                />
                <span className="text-slate-500">°C</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Fridge: 0-5°C compliant • Freezer: -18°C or below compliant
            </p>
          </div>
        </div>

        {/* Checklists */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheckIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-slate-900">Daily Checklists</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <input
                type="checkbox"
                id="includeOpening"
                checked={includeOpening}
                onChange={e => setIncludeOpening(e.target.checked)}
                className="w-5 h-5 rounded text-sfbb-500"
              />
              <label htmlFor="includeOpening" className="font-medium text-slate-900">
                Opening Checks
              </label>
              <span className="text-sm text-slate-500">
                ({checklistTemplates.openingChecks.length} items)
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <input
                type="checkbox"
                id="includeClosing"
                checked={includeClosing}
                onChange={e => setIncludeClosing(e.target.checked)}
                className="w-5 h-5 rounded text-sfbb-500"
              />
              <label htmlFor="includeClosing" className="font-medium text-slate-900">
                Closing Checks
              </label>
              <span className="text-sm text-slate-500">
                ({checklistTemplates.closingChecks.length} items)
              </span>
            </div>

            <p className="text-xs text-slate-500">
              All checklist items will be marked as completed and signed off
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="w-5 h-5 animate-spin" />
              Creating Records...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Create Bulk Records
            </>
          )}
        </button>
      </form>
    </div>
  )
}
