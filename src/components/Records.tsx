import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  FolderIcon,
  DownloadIcon,
  CalendarIcon,
  ThermometerIcon,
  ClipboardCheckIcon,
  SparklesIcon,
  TrashIcon,
  FileTextIcon,
} from 'lucide-react'

type RecordType = 'all' | 'temperature' | 'checklist' | 'cleaning' | 'waste' | 'maintenance'

export default function Records() {
  const {
    temperatureLogs,
    checklists,
    cleaningRecords,
    wasteLogs,
    maintenanceLogs,
  } = useAppContext()

  const [recordType, setRecordType] = useState<RecordType>('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const filterByDate = <T extends { date: string }>(items: T[]) => {
    return items.filter(
      item => item.date >= dateRange.start && item.date <= dateRange.end
    )
  }

  const filteredTemps = filterByDate(temperatureLogs)
  const filteredChecklists = filterByDate(checklists)
  const filteredCleaning = filterByDate(cleaningRecords)
  const filteredWaste = filterByDate(wasteLogs)
  const filteredMaintenance = filterByDate(maintenanceLogs)

  const recordCounts = {
    temperature: filteredTemps.length,
    checklist: filteredChecklists.length,
    cleaning: filteredCleaning.length,
    waste: filteredWaste.length,
    maintenance: filteredMaintenance.length,
  }

  const totalRecords = Object.values(recordCounts).reduce((a, b) => a + b, 0)

  const exportRecords = () => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange,
      temperatureLogs: filteredTemps,
      checklists: filteredChecklists,
      cleaningRecords: filteredCleaning,
      wasteLogs: filteredWaste,
      maintenanceLogs: filteredMaintenance,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sfbb-records-${dateRange.start}-to-${dateRange.end}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const recordTabs = [
    { value: 'all', label: 'All Records', count: totalRecords },
    { value: 'temperature', label: 'Temperature', count: recordCounts.temperature, icon: ThermometerIcon },
    { value: 'checklist', label: 'Checklists', count: recordCounts.checklist, icon: ClipboardCheckIcon },
    { value: 'cleaning', label: 'Cleaning', count: recordCounts.cleaning, icon: SparklesIcon },
    { value: 'waste', label: 'Waste', count: recordCounts.waste, icon: TrashIcon },
    { value: 'maintenance', label: 'Maintenance', count: recordCounts.maintenance, icon: FileTextIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Records & Reports</h1>
          <p className="text-slate-500 mt-1">View and export your compliance records</p>
        </div>
        <button onClick={exportRecords} className="btn-primary flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" />
          Export Records
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="input w-auto"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="input w-auto"
            />
          </div>
        </div>
      </div>

      {/* Record Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {recordTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setRecordType(tab.value as RecordType)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              recordType === tab.value
                ? 'bg-sfbb-100 text-sfbb-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              recordType === tab.value ? 'bg-sfbb-200' : 'bg-slate-200'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Records Display */}
      <div className="space-y-4">
        {/* Temperature Logs */}
        {(recordType === 'all' || recordType === 'temperature') && filteredTemps.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <ThermometerIcon className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900">Temperature Logs</h3>
              <span className="badge badge-info">{filteredTemps.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Date</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Time</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Appliance</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Temp</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTemps.slice(0, recordType === 'all' ? 5 : 50).map(log => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 text-sm">{new Date(log.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2 text-sm">{log.time}</td>
                      <td className="px-4 py-2 text-sm capitalize">{log.type.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-sm">{log.applianceName}</td>
                      <td className="px-4 py-2 text-sm">{log.temperature}°C</td>
                      <td className="px-4 py-2">
                        <span className={`badge ${log.isCompliant ? 'badge-success' : 'badge-danger'}`}>
                          {log.isCompliant ? 'OK' : 'Issue'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checklists */}
        {(recordType === 'all' || recordType === 'checklist') && filteredChecklists.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <ClipboardCheckIcon className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900">Checklists</h3>
              <span className="badge badge-info">{filteredChecklists.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredChecklists.slice(0, recordType === 'all' ? 5 : 50).map(checklist => (
                <div key={checklist.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">
                      {checklist.type} Checklist
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(checklist.date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${checklist.signedOff ? 'badge-success' : 'badge-warning'}`}>
                      {checklist.signedOff ? 'Signed Off' : 'Incomplete'}
                    </span>
                    {checklist.completedBy && (
                      <p className="text-xs text-slate-400 mt-1">by {checklist.completedBy}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cleaning Records */}
        {(recordType === 'all' || recordType === 'cleaning') && filteredCleaning.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-violet-500" />
              <h3 className="font-semibold text-slate-900">Cleaning Records</h3>
              <span className="badge badge-info">{filteredCleaning.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredCleaning.slice(0, recordType === 'all' ? 5 : 50).map(record => (
                <div key={record.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">
                      {record.frequency} Cleaning
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(record.date).toLocaleDateString('en-GB')} - {record.tasks.filter(t => t.completed).length}/{record.tasks.length} tasks
                    </p>
                  </div>
                  <span className={`badge ${record.signedOff ? 'badge-success' : 'badge-warning'}`}>
                    {record.signedOff ? 'Signed Off' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waste Logs */}
        {(recordType === 'all' || recordType === 'waste') && filteredWaste.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <TrashIcon className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Waste Logs</h3>
              <span className="badge badge-info">{filteredWaste.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Date</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Item</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Quantity</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Reason</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-slate-600">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWaste.slice(0, recordType === 'all' ? 5 : 50).map(log => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 text-sm">{new Date(log.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2 text-sm">{log.itemName}</td>
                      <td className="px-4 py-2 text-sm">{log.quantity}</td>
                      <td className="px-4 py-2 text-sm">{log.reason}</td>
                      <td className="px-4 py-2 text-sm">{log.loggedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalRecords === 0 && (
          <div className="card p-8 text-center">
            <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No records found</h3>
            <p className="text-slate-500">
              No records match the selected date range. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
