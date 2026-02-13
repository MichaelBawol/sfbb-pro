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
  LogOutIcon,
} from 'lucide-react'

// All navigation items for sidebar (tablet/desktop)
const allNavItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Temperature', href: '/temperature', icon: ThermometerIcon },
  { name: 'Checklists', href: '/checks', icon: ClipboardCheckIcon },
  { name: 'Cleaning', href: '/cleaning', icon: SparklesIcon },
  { name: 'SFBB Diary', href: '/diary', icon: CalendarDaysIcon },
  { name: 'Bulk Entry', href: '/bulk-entry', icon: ClockIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
  { name: 'Allergens', href: '/allergens', icon: AlertTriangleIcon },
  { name: 'Waste', href: '/waste', icon: TrashIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Records', href: '/records', icon: FolderIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'SFBB Packs', href: '/sfbb-packs', icon: FileWarning },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

// Main bottom nav items for mobile (max 5)
const mobileNavItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Temps', href: '/temperature', icon: ThermometerIcon },
  { name: 'Checks', href: '/checks', icon: ClipboardCheckIcon },
  { name: 'Clean', href: '/cleaning', icon: SparklesIcon },
  { name: 'More', href: '#more', icon: MenuIcon },
]

// Secondary nav items (shown in "More" menu on mobile)
const moreNavItems = [
  { name: 'SFBB Diary', href: '/diary', icon: CalendarDaysIcon },
  { name: 'Bulk Entry', href: '/bulk-entry', icon: ClockIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
  { name: 'Allergens', href: '/allergens', icon: AlertTriangleIcon },
  { name: 'Waste', href: '/waste', icon: TrashIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Records', href: '/records', icon: FolderIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'SFBB Packs', href: '/sfbb-packs', icon: FileWarning },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { business, alerts, sidebarOpen, toggleSidebar, acknowledgeAlert, dismissAlert, locations, activeLocationId, setActiveLocation, logout, user } = useAppContext()
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
    <div className="min-h-screen bg-slate-100">
      {/* Desktop/Tablet Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:z-40">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-200 bg-gradient-to-r from-sfbb-600 to-sfbb-500">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <span className="text-white font-black text-sm tracking-tight">SF</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm truncate">
              {business?.name || 'SFBB Pro'}
            </h1>
            {hasLocations && activeLocation && (
              <p className="text-white/80 text-xs truncate">{activeLocation.name}</p>
            )}
          </div>
        </div>

        {/* Location Switcher (if multiple locations) */}
        {canSwitchLocations && (
          <div className="px-3 py-2 border-b border-slate-200">
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <MapPinIcon className="w-4 h-4 text-sfbb-600" />
              <span className="flex-1 text-left text-sm font-medium text-slate-700 truncate">
                {activeLocation?.name}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {allNavItems.map(item => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sfbb-50 text-sfbb-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-sfbb-600' : 'text-slate-400'}`} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer - User & Actions */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          {/* User info */}
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}

          {/* Alerts button */}
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="relative">
              <BellIcon className="w-5 h-5 text-slate-400" />
              {unacknowledgedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unacknowledgedCount}
                </span>
              )}
            </div>
            <span className="text-sm text-slate-600">Alerts</span>
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout()
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header Bar - Simplified on desktop */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-sfbb-600 via-sfbb-500 to-sfbb-600 shadow-lg animate-gradient lg:bg-white lg:shadow-sm lg:border-b lg:border-slate-200">
          <div className="flex items-center justify-between h-16 lg:h-14 px-4">
            {/* Mobile: Logo */}
            <div className="flex items-center lg:hidden">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse-slow shadow-lg border border-white/30">
                <span className="text-white font-black text-sm tracking-tight">SF</span>
              </div>
            </div>

            {/* Desktop: Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-slate-900">
                {allNavItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Mobile: Business Name & Location */}
            <div className="flex-1 text-center px-4 lg:hidden relative">
              {business?.name ? (
                hasLocations && activeLocation ? (
                  canSwitchLocations ? (
                    <button
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="inline-flex items-center gap-1 text-white font-bold text-base animate-fade-in hover:bg-white/10 rounded-lg px-2 py-1 transition-colors max-w-full"
                    >
                      <span className="truncate max-w-[100px]">{business.name}</span>
                      <span className="text-white/60 mx-1 flex-shrink-0">›</span>
                      <span className="truncate max-w-[80px] text-white/90">{activeLocation.name}</span>
                      <ChevronDownIcon className="w-4 h-4 text-white/70 flex-shrink-0" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-white font-bold text-base animate-fade-in max-w-full">
                      <span className="truncate max-w-[100px]">{business.name}</span>
                      <span className="text-white/60 mx-1 flex-shrink-0">›</span>
                      <span className="truncate max-w-[80px] text-white/90">{activeLocation.name}</span>
                    </div>
                  )
                ) : (
                  <h1 className="text-white font-bold text-base truncate animate-fade-in">
                    {business.name}
                  </h1>
                )
              ) : (
                <h1 className="text-white font-bold text-base">SFBB Pro</h1>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Desktop: Location Switcher Button */}
              {canSwitchLocations && (
                <button
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <MapPinIcon className="w-4 h-4 text-sfbb-600" />
                  <span className="text-sm font-medium text-slate-700">{activeLocation?.name}</span>
                  <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Notifications - Mobile only (desktop has it in sidebar) */}
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 lg:bg-slate-100 lg:hover:bg-slate-200"
              >
                <BellIcon className="w-5 h-5 text-white lg:text-slate-600" />
                {unacknowledgedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg">
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
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowLocationPicker(false)}
            />
            <div className="fixed top-16 left-4 right-4 lg:left-auto lg:right-4 lg:top-14 lg:w-80 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900">Switch Location</h2>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 active:bg-slate-300"
                >
                  <XIcon className="w-4 h-4 text-slate-500" />
                </button>
              </div>
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
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAlerts(false)}
            />
            <div className="fixed top-16 right-2 left-2 lg:left-auto lg:right-4 lg:top-14 lg:w-96 z-50 bg-white rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden animate-slide-down">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Alerts</h2>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="p-2 rounded-full hover:bg-slate-200 active:bg-slate-300"
                >
                  <XIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>
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
        <main className="p-4 pb-24 lg:pb-6 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom lg:hidden">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map(item => {
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

      {/* Mobile More Menu - Slide up sheet */}
      {isMoreMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={toggleSidebar}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl animate-slide-up safe-area-bottom lg:hidden">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">More</h2>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200"
              >
                <XIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              {moreNavItems.map(item => (
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

            {/* User info and Logout */}
            <div className="px-5 py-3 border-t border-slate-100">
              {user && (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to log out?')) {
                        toggleSidebar()
                        logout()
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              )}
            </div>
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
