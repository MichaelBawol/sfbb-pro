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
  CalendarDaysIcon,
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
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sfbb-600 via-sfbb-500 to-sfbb-600 shadow-lg animate-gradient">
        <div className="flex items-center justify-between h-20 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-pulse-slow shadow-lg border border-white/30">
              <span className="text-white font-black text-lg tracking-tight">SF</span>
            </div>
          </div>

          {/* Center - Business Name */}
          <div className="flex-1 text-center px-4">
            {business?.name ? (
              <h1 className="text-white font-bold text-lg truncate animate-fade-in">
                {business.name}
              </h1>
            ) : (
              <h1 className="text-white font-bold text-lg">SFBB Pro</h1>
            )}
            {business?.foodHygieneRating !== undefined && (
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
            <button className="relative p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200">
              <BellIcon className="w-6 h-6 text-white" />
              {unacknowledgedAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
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
