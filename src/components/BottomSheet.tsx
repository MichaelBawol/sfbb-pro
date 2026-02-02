import { ReactNode } from 'react'
import { XIcon } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  fullScreen?: boolean
}

export default function BottomSheet({ isOpen, onClose, title, children, fullScreen = false }: BottomSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 z-[60] bg-white animate-slide-up ${
          fullScreen
            ? 'inset-0 rounded-none'
            : 'bottom-0 rounded-t-3xl max-h-[90vh]'
        }`}
      >
        {/* Handle (only for non-fullscreen) */}
        {!fullScreen && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${fullScreen ? 'pt-safe' : ''}`}>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 -mr-2 rounded-full hover:bg-slate-100 active:bg-slate-200"
          >
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className={`${fullScreen ? 'h-[calc(100vh-80px)] flex flex-col' : 'max-h-[calc(90vh-80px)] overflow-y-auto'}`}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .pt-safe {
          padding-top: max(1rem, env(safe-area-inset-top));
        }
      `}</style>
    </>
  )
}
