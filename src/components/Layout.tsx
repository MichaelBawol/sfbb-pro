import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import {
  HomeIcon,
  ThermometerIcon,
  ClipboardCheckIcon,
  SparklesIcon,
  SettingsIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  TruckIcon,
  AlertTriangleIcon,
  UsersIcon,
  FolderIcon,
  TrashIcon,
  WrenchIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  FileWarning,
  Thermometer,
  Clock,
  Search,
  ChevronDownIcon,
  MapPinIcon,
} from 'lucide-react'

// Main bottom nav items (max 5 for mobile)
const mainNav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Temps', href: '/temperature', icon: ThermometerIcon },
  { name: 'Checks', href: '/checks', icon: ClipboardCheckIcon },
  { name: 'Clean', href: '/cleaning', icon: SparklesIcon },
  { name: 'More', href: '#more', icon: MenuIcon },
]

// Secondary nav items (shown in "More" menu)
const moreNav = [
  { name: 'SFBB Diary', href: '/diary', icon: CalendarDaysIcon },
  { name: 'Bulk Entry', href: '/bulk-entry', icon: ClockIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
  { name: 'Allergens', href: '/allergens', icon: AlertTriangleIcon },
  { name: 'Waste', href: '/waste', icon: TrashIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Records', href: '/records', icon: FolderIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { business, alerts, sidebarOpen, toggleSidebar, acknowledgeAlert, dismissAlert, locations, activeLocationId, setActiveLocation } = useAppContext()
  const [showAlerts, setShowAlerts] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Get active location details
  const activeLocation = locations.find(l => l.id === activeLocationId)
  // Show location indicator if user has locations - picker dropdown only if more than 1
  const hasLocations = locations.length >= 1
  const canSwitchLocations = locations.length > 1
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged)
  const unacknowledgedCount = unacknowledgedAlerts.length

  const isMoreMenuOpen = sidebarOpen

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'certificate_expiry': return FileWarning
      case 'temperature': return Thermometer
      case 'overdue_task': return Clock
      case 'inspection': return Search
      default: return AlertTriangleIcon
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sfbb-600 via-sfbb-500 to-sfbb-600 shadow-lg animate-gradient">
        <div className="flex items-center justify-between h-20 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-pulse-slow shadow-lg border border-white/30">
              <span className="text-white font-black text-lg tracking-tight">SF</span>
            </div>
          </div>

          {/* Center - Business Name & Location */}
          <div className="flex-1 text-center px-4 relative">
            {business?.name ? (
              hasLocations && activeLocation ? (
                canSwitchLocations ? (
                  <button
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="inline-flex items-center gap-1 text-white font-bold text-lg animate-fade-in hover:bg-white/10 rounded-lg px-2 py-1 transition-colors max-w-full"
                  >
                    <span className="truncate">{business.name}</span>
                    <span className="text-white/60 mx-1 flex-shrink-0">›</span>
                    <span className="truncate text-white/90">{activeLocation.name}</span>
                    <ChevronDownIcon className="w-4 h-4 text-white/70 flex-shrink-0" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1 text-white font-bold text-lg animate-fade-in max-w-full">
                    <span className="truncate">{business.name}</span>
                    <span className="text-white/60 mx-1 flex-shrink-0">›</span>
                    <span className="truncate text-white/90">{activeLocation.name}</span>
                  </div>
                )
              ) : (
                <h1 className="text-white font-bold text-lg truncate animate-fade-in">
                  {business.name}
                </h1>
              )
            ) : (
              <h1 className="text-white font-bold text-lg">SFBB Pro</h1>
            )}
            {business?.foodHygieneRating !== undefined && !hasLocations && (
              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-white/90 text-xs font-semibold">
                  Rating: {business.foodHygieneRating}/5
                </span>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Notifications */}
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200"
            >
              <BellIcon className="w-6 h-6 text-white" />
              {unacknowledgedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
                  {unacknowledgedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Picker Dropdown */}
      {showLocationPicker && canSwitchLocations && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowLocationPicker(false)}
          />

          {/* Dropdown */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl w-72 overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Switch Location</h2>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 active:bg-slate-300"
              >
                <XIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Locations List */}
            <div className="max-h-64 overflow-y-auto">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc.id)
                    setShowLocationPicker(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                    loc.id === activeLocationId ? 'bg-sfbb-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    loc.id === activeLocationId ? 'bg-sfbb-100' : 'bg-slate-100'
                  }`}>
                    <MapPinIcon className={`w-5 h-5 ${
                      loc.id === activeLocationId ? 'text-sfbb-600' : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${
                        loc.id === activeLocationId ? 'text-sfbb-700' : 'text-slate-900'
                      }`}>
                        {loc.name}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-sfbb-100 text-sfbb-600 rounded font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {loc.address && (
                      <p className="text-xs text-slate-500 truncate">{loc.address}</p>
                    )}
                  </div>
                  {loc.id === activeLocationId && (
                    <CheckIcon className="w-5 h-5 text-sfbb-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Alerts Panel */}
      {showAlerts && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAlerts(false)}
          />

          {/* Alerts Dropdown */}
          <div className="fixed top-20 right-2 left-2 md:left-auto md:right-4 md:w-96 z-50 bg-white rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Alerts</h2>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-2 rounded-full hover:bg-slate-200 active:bg-slate-300"
              >
                <XIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Alerts List */}
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {alerts.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No alerts</p>
                  <p className="text-slate-400 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {alerts.slice(0, 20).map(alert => {
                    const AlertIcon = getAlertIcon(alert.type)
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 ${alert.acknowledged ? 'bg-slate-50 opacity-60' : 'bg-white'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                            <AlertIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1 ${getSeverityBadge(alert.severity)}`}>
                                  {alert.severity.toUpperCase()}
                                </span>
                                <h3 className="font-semibold text-slate-900 text-sm">
                                  {alert.title}
                                </h3>
                              </div>
                            </div>
                            <p className="text-slate-600 text-xs mt-1 line-clamp-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-slate-400 text-[10px]">
                                {new Date(alert.date).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {!alert.acknowledged && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => acknowledgeAlert(alert.id)}
                                    className="text-xs text-sfbb-600 font-medium hover:text-sfbb-700 flex items-center gap-1"
                                  >
                                    <CheckIcon className="w-3 h-3" />
                                    Acknowledge
                                  </button>
                                  <button
                                    onClick={() => dismissAlert(alert.id)}
                                    className="text-xs text-slate-400 font-medium hover:text-slate-600"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="p-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mainNav.map(item => {
            const isActive = item.href === '#more'
              ? isMoreMenuOpen
              : location.pathname === item.href
            const isMore = item.href === '#more'

            if (isMore) {
              return (
                <button
                  key={item.name}
                  onClick={toggleSidebar}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                    isActive ? 'text-sfbb-600' : 'text-slate-500'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'text-sfbb-600' : ''}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                  isActive ? 'text-sfbb-600' : 'text-slate-500'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'text-sfbb-600' : ''}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* More Menu - Slide up sheet */}
      {isMoreMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={toggleSidebar}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl animate-slide-up safe-area-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">More</h2>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200"
              >
                <XIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-3 grid grid-cols-3 gap-2">
              {moreNav.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleSidebar}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-sfbb-100 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-sfbb-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Extra padding for safe area */}
            <div className="h-6" />
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
