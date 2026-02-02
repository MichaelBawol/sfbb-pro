import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  CalendarIcon,
  CalendarDaysIcon,
} from 'lucide-react'
import { ChecklistTemplates } from '../types'
import BottomSheet from './BottomSheet'

type TemplateType = keyof ChecklistTemplates

const templateConfig: Record<TemplateType, { label: string; icon: typeof SunIcon; color: string }> = {
  openingChecks: { label: 'Opening Checks', icon: SunIcon, color: 'amber' },
  closingChecks: { label: 'Closing Checks', icon: MoonIcon, color: 'indigo' },
  dailyCleaning: { label: 'Daily Cleaning', icon: SparklesIcon, color: 'emerald' },
  weeklyCleaning: { label: 'Weekly Cleaning', icon: CalendarIcon, color: 'blue' },
  monthlyCleaning: { label: 'Monthly Cleaning', icon: CalendarDaysIcon, color: 'violet' },
}

export default function ChecklistManager() {
  const {
    checklistTemplates,
    addChecklistItem,
    removeChecklistItem,
    updateChecklistItem,
  } = useAppContext()

  const [selectedType, setSelectedType] = useState<TemplateType | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleEdit = (index: number, text: string) => {
    setEditingIndex(index)
    setEditText(text)
  }

  const handleSaveEdit = () => {
    if (selectedType && editingIndex !== null && editText.trim()) {
      updateChecklistItem(selectedType, editingIndex, editText.trim())
      setEditingIndex(null)
      setEditText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditText('')
  }

  const handleAddItem = () => {
    if (selectedType && newItemText.trim()) {
      addChecklistItem(selectedType, newItemText.trim())
      setNewItemText('')
      setShowAddForm(false)
    }
  }

  const handleDelete = (index: number) => {
    if (selectedType && confirm('Remove this item from the checklist?')) {
      removeChecklistItem(selectedType, index)
    }
  }

  const currentItems = selectedType ? checklistTemplates[selectedType] : []
  const config = selectedType ? templateConfig[selectedType] : null

  return (
    <div className="space-y-4">
      {/* Template Type Selection */}
      <div className="grid grid-cols-1 gap-2">
        {(Object.keys(templateConfig) as TemplateType[]).map(type => {
          const cfg = templateConfig[type]
          const Icon = cfg.icon
          const itemCount = checklistTemplates[type].length

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${
                selectedType === type
                  ? `bg-${cfg.color}-100 border-2 border-${cfg.color}-500`
                  : 'bg-white border-2 border-transparent shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-${cfg.color}-100 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${cfg.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{cfg.label}</p>
                <p className="text-sm text-slate-500">{itemCount} items</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${cfg.color}-100 text-${cfg.color}-700`}>
                Edit
              </div>
            </button>
          )
        })}
      </div>

      {/* Edit Sheet */}
      <BottomSheet
        isOpen={selectedType !== null}
        onClose={() => {
          setSelectedType(null)
          setEditingIndex(null)
          setShowAddForm(false)
        }}
        title={config?.label || 'Edit Checklist'}
        fullScreen
      >
        <div className="flex flex-col h-full">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border-b border-slate-100"
              >
                {editingIndex === index ? (
                  // Edit Mode
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="input min-h-[80px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-3 bg-slate-100 rounded-xl font-medium text-slate-700 active:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 py-3 bg-sfbb-600 rounded-xl font-medium text-white active:bg-sfbb-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium text-slate-500">{index + 1}</span>
                    </div>
                    <p className="flex-1 text-slate-900 pt-1">{item}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(index, item)}
                        className="p-3 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-400"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-3 rounded-xl hover:bg-red-50 active:bg-red-100 text-slate-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {currentItems.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-slate-500">No items yet</p>
                <p className="text-sm text-slate-400">Tap the button below to add items</p>
              </div>
            )}
          </div>

          {/* Add Item Section */}
          <div className="p-4 border-t border-slate-200 bg-white">
            {showAddForm ? (
              <div className="space-y-3">
                <textarea
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  placeholder="Enter checklist item..."
                  className="input min-h-[80px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewItemText('')
                    }}
                    className="flex-1 py-3 bg-slate-100 rounded-xl font-medium text-slate-700 active:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemText.trim()}
                    className="flex-1 py-3 bg-sfbb-600 rounded-xl font-medium text-white active:bg-sfbb-700 disabled:opacity-50"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 bg-sfbb-600 rounded-xl font-semibold text-white active:bg-sfbb-700 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add New Item
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
