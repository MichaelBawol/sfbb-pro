import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  CheckCircleIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react'

export default function DailyChecks() {
  const { checklists, addChecklist, updateChecklist, signOffChecklist, checklistTemplates } = useAppContext()
  const [activeTab, setActiveTab] = useState<'opening' | 'closing'>('opening')

  const today = new Date().toISOString().split('T')[0]
  const todayChecklists = checklists.filter(c => c.date === today)
  const openingChecklist = todayChecklists.find(c => c.type === 'opening')
  const closingChecklist = todayChecklists.find(c => c.type === 'closing')

  // Get items from customizable templates
  const openingCheckItems = checklistTemplates.openingChecks
  const closingCheckItems = checklistTemplates.closingChecks

  const currentChecklist = activeTab === 'opening' ? openingChecklist : closingChecklist
  const checkItems = activeTab === 'opening' ? openingCheckItems : closingCheckItems

  const createChecklist = (type: 'opening' | 'closing') => {
    const items = type === 'opening' ? openingCheckItems : closingCheckItems
    addChecklist({
      type,
      date: today,
      items: items.map((text, index) => ({
        id: `${type}-${index}`,
        text,
        completed: false,
      })),
      signedOff: false,
    })
  }

  const toggleItem = (itemId: string) => {
    if (!currentChecklist) return

    const updatedItems = currentChecklist.items.map(item =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
            completedBy: !item.completed ? 'Current User' : undefined,
          }
        : item
    )

    updateChecklist(currentChecklist.id, { items: updatedItems })
  }

  const handleSignOff = () => {
    if (!currentChecklist) return

    const allComplete = currentChecklist.items.every(i => i.completed)
    if (!allComplete) {
      alert('Please complete all items before signing off')
      return
    }

    signOffChecklist(currentChecklist.id, 'Current User')
  }

  const completedCount = currentChecklist?.items.filter(i => i.completed).length || 0
  const totalCount = currentChecklist?.items.length || checkItems.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daily Checks</h1>
        <p className="text-slate-500">Opening and closing checklists</p>
      </div>

      {/* Tab Switch - App style */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm flex gap-1">
        <button
          onClick={() => setActiveTab('opening')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'opening'
              ? 'bg-amber-100 text-amber-700'
              : 'text-slate-500 active:bg-slate-100'
          }`}
        >
          <SunIcon className="w-5 h-5" />
          <span>Opening</span>
          {openingChecklist?.signedOff && (
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('closing')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
            activeTab === 'closing'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-slate-500 active:bg-slate-100'
          }`}
        >
          <MoonIcon className="w-5 h-5" />
          <span>Closing</span>
          {closingChecklist?.signedOff && (
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          )}
        </button>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {!currentChecklist ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              activeTab === 'opening' ? 'bg-amber-100' : 'bg-indigo-100'
            }`}>
              {activeTab === 'opening' ? (
                <SunIcon className={`w-8 h-8 text-amber-600`} />
              ) : (
                <MoonIcon className={`w-8 h-8 text-indigo-600`} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Start {activeTab === 'opening' ? 'Opening' : 'Closing'} Checks
            </h3>
            <p className="text-slate-500 mb-6">
              Tap below to begin the checklist
            </p>
            <button
              onClick={() => createChecklist(activeTab)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Start Checklist
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Progress</span>
                <span className="text-sm font-medium text-slate-500">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? 'bg-emerald-500' : 'bg-sfbb-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div>
              {currentChecklist.items.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => !currentChecklist.signedOff && toggleItem(item.id)}
                  className={`flex items-start gap-4 p-5 border-b border-slate-50 select-none transition-colors ${
                    currentChecklist.signedOff
                      ? 'opacity-60'
                      : 'active:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="pt-0.5">
                    {item.completed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-400">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-base leading-snug ${
                      item.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}>
                      {item.text}
                    </p>
                    {item.completedAt && (
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(item.completedAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign Off Section */}
            <div className="p-5 bg-slate-50">
              {currentChecklist.signedOff ? (
                <div className="flex items-center justify-center gap-3 py-3 bg-emerald-100 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  <div className="text-center">
                    <p className="font-semibold text-emerald-700">Signed Off</p>
                    <p className="text-sm text-emerald-600">by {currentChecklist.completedBy}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignOff}
                  disabled={progress !== 100}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                    progress === 100
                      ? 'bg-emerald-600 text-white active:bg-emerald-700'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {progress === 100 ? 'Sign Off Checklist' : `Complete all items (${totalCount - completedCount} remaining)`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
