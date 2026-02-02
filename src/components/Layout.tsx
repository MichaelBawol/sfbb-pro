import { ReactNode } from 'react'
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
  const { business, alerts, sidebarOpen, toggleSidebar } = useAppContext()
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length

  const isMoreMenuOpen = sidebarOpen

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sfbb-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">SFBB Pro</span>
              {business && (
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{business.name}</p>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {/* Food Hygiene Rating Badge */}
            {business?.foodHygieneRating !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full mr-1">
                <span className="text-emerald-700 text-xs font-bold">
                  {business.foodHygieneRating}/5
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2.5 rounded-full hover:bg-slate-100 active:bg-slate-200">
              <BellIcon className="w-5 h-5 text-slate-600" />
              {unacknowledgedAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unacknowledgedAlerts}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

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
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  )
}
