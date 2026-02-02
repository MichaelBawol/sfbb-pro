import { Link } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import {
  ThermometerIcon,
  ClipboardCheckIcon,
  SparklesIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react'

export default function Dashboard() {
  const {
    temperatureLogs,
    checklists,
    cleaningRecords,
    alerts,
    acknowledgeAlert,
    dismissAlert,
  } = useAppContext()

  const today = new Date().toISOString().split('T')[0]

  // Calculate stats
  const todayTempLogs = temperatureLogs.filter(t => t.date === today)
  const tempCompliance = todayTempLogs.length > 0
    ? Math.round((todayTempLogs.filter(t => t.isCompliant).length / todayTempLogs.length) * 100)
    : null

  const todayChecklists = checklists.filter(c => c.date === today)
  const openingComplete = todayChecklists.some(c => c.type === 'opening' && c.signedOff)
  const closingComplete = todayChecklists.some(c => c.type === 'closing' && c.signedOff)

  const todayCleaning = cleaningRecords.filter(c => c.date === today)
  const cleaningComplete = todayCleaning.length > 0 && todayCleaning.every(c => c.signedOff)

  const activeAlerts = alerts.filter(a => !a.acknowledged)

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}
        </h1>
        <p className="text-slate-500">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/temperature"
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white active:scale-[0.98] transition-transform"
        >
          <ThermometerIcon className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold text-lg">Log Temp</p>
          <p className="text-blue-100 text-sm">{todayTempLogs.length} today</p>
        </Link>

        <Link
          to="/checks"
          className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl text-white active:scale-[0.98] transition-transform"
        >
          <ClipboardCheckIcon className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold text-lg">Daily Checks</p>
          <p className="text-amber-100 text-sm">
            {openingComplete && closingComplete ? 'Complete' : openingComplete ? 'Opening done' : 'Start checks'}
          </p>
        </Link>
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Today's Progress</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Opening Checks */}
          <Link to="/checks" className="flex items-center gap-4 p-4 active:bg-slate-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              openingComplete ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              <SunIcon className={`w-6 h-6 ${openingComplete ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Opening Checks</p>
              <p className="text-sm text-slate-500">
                {openingComplete ? 'Completed' : 'Not started'}
              </p>
            </div>
            {openingComplete ? (
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-slate-300" />
            )}
          </Link>

          {/* Temperature Logs */}
          <Link to="/temperature" className="flex items-center gap-4 p-4 active:bg-slate-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              tempCompliance === 100 ? 'bg-emerald-100' : todayTempLogs.length > 0 ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <ThermometerIcon className={`w-6 h-6 ${
                tempCompliance === 100 ? 'text-emerald-600' : todayTempLogs.length > 0 ? 'text-blue-600' : 'text-slate-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Temperature Logs</p>
              <p className="text-sm text-slate-500">
                {todayTempLogs.length} logged {tempCompliance !== null && `• ${tempCompliance}% OK`}
              </p>
            </div>
            <ChevronRightIcon className="w-6 h-6 text-slate-300" />
          </Link>

          {/* Cleaning */}
          <Link to="/cleaning" className="flex items-center gap-4 p-4 active:bg-slate-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              cleaningComplete ? 'bg-emerald-100' : 'bg-violet-100'
            }`}>
              <SparklesIcon className={`w-6 h-6 ${cleaningComplete ? 'text-emerald-600' : 'text-violet-600'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Cleaning Tasks</p>
              <p className="text-sm text-slate-500">
                {cleaningComplete ? 'Completed' : todayCleaning.length > 0 ? 'In progress' : 'Not started'}
              </p>
            </div>
            {cleaningComplete ? (
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-slate-300" />
            )}
          </Link>

          {/* Closing Checks */}
          <Link to="/checks" className="flex items-center gap-4 p-4 active:bg-slate-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              closingComplete ? 'bg-emerald-100' : 'bg-indigo-100'
            }`}>
              <MoonIcon className={`w-6 h-6 ${closingComplete ? 'text-emerald-600' : 'text-indigo-600'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Closing Checks</p>
              <p className="text-sm text-slate-500">
                {closingComplete ? 'Completed' : 'Not started'}
              </p>
            </div>
            {closingComplete ? (
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-slate-300" />
            )}
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Alerts</h2>
            <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeAlerts.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeAlerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className={`p-4 ${
                  alert.severity === 'critical' || alert.severity === 'high'
                    ? 'bg-red-50'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.severity === 'critical' ? 'bg-red-100' :
                    alert.severity === 'high' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <AlertTriangleIcon className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{alert.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{alert.message}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 ml-13">
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex-1 py-2.5 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-1 py-2.5 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clear State */}
      {activeAlerts.length === 0 && (
        <div className="bg-emerald-50 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="font-semibold text-emerald-800">All Clear</p>
          <p className="text-sm text-emerald-600">No active alerts</p>
        </div>
      )}
    </div>
  )
}
