import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from './hooks/useAppContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TemperatureMonitoring from './components/TemperatureMonitoring'
import DailyChecks from './components/DailyChecks'
import CleaningSchedule from './components/CleaningSchedule'
import Suppliers from './components/Suppliers'
import Allergens from './components/Allergens'
import Employees from './components/Employees'
import Records from './components/Records'
import Settings from './components/Settings'
import Login from './components/Login'
import WasteManagement from './components/WasteManagement'
import Maintenance from './components/Maintenance'
import Resources from './components/Resources'

function App() {
  const { isAuthenticated, isLoading } = useAppContext()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sfbb-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading SFBB Pro...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/temperature" element={<TemperatureMonitoring />} />
        <Route path="/checks" element={<DailyChecks />} />
        <Route path="/cleaning" element={<CleaningSchedule />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/allergens" element={<Allergens />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/records" element={<Records />} />
        <Route path="/waste" element={<WasteManagement />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
