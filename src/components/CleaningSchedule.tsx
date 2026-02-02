import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  SparklesIcon,
  CheckCircleIcon,
  PlusIcon,
} from 'lucide-react'
import { ChecklistTemplates } from '../types'

type Frequency = 'daily' | 'weekly' | 'monthly'

const frequencyConfig: Record<Frequency, { label: string; color: string; templateKey: keyof ChecklistTemplates }> = {
  daily: { label: 'Daily', color: 'emerald', templateKey: 'dailyCleaning' },
  weekly: { label: 'Weekly', color: 'blue', templateKey: 'weeklyCleaning' },
  monthly: { label: 'Monthly', color: 'violet', templateKey: 'monthlyCleaning' },
}

export default function CleaningSchedule() {
  const { cleaningRecords, addCleaningRecord, updateCleaningRecord, checklistTemplates } = useAppContext()
  const [activeFrequency, setActiveFrequency] = useState<Frequency>('daily')

  const today = new Date().toISOString().split('T')[0]
  const todayRecords = cleaningRecords.filter(c => c.date === today)
  const currentRecord = todayRecords.find(c => c.frequency === activeFrequency)

  // Get tasks from customizable templates
  const getTasksForFrequency = (freq: Frequency) => {
    const templateKey = frequencyConfig[freq].templateKey
    return checklistTemplates[templateKey]
  }

  const createRecord = () => {
    const tasks = getTasksForFrequency(activeFrequency)
    addCleaningRecord({
      date: today,
      frequency: activeFrequency,
      tasks: tasks.map((text, index) => ({
        id: `${activeFrequency}-${index}`,
        text,
        frequency: activeFrequency,
        completed: false,
      })),
      signedOff: false,
    })
  }

  const toggleTask = (taskId: string) => {
    if (!currentRecord) return

    const updatedTasks = currentRecord.tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined,
            completedBy: !task.completed ? 'Current User' : undefined,
          }
        : task
    )

    updateCleaningRecord(currentRecord.id, { tasks: updatedTasks })
  }

  const handleSignOff = () => {
    if (!currentRecord) return

    const allComplete = currentRecord.tasks.every(t => t.completed)
    if (!allComplete) {
      alert('Please complete all tasks before signing off')
      return
    }

    updateCleaningRecord(currentRecord.id, {
      signedOff: true,
      completedBy: 'Current User',
    })
  }

  const completedCount = currentRecord?.tasks.filter(t => t.completed).length || 0
  const totalCount = currentRecord?.tasks.length || getTasksForFrequency(activeFrequency).length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cleaning</h1>
        <p className="text-slate-500">Daily, weekly & monthly tasks</p>
      </div>

      {/* Frequency Tabs - Pill style */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(frequencyConfig) as Frequency[]).map(freq => {
          const config = frequencyConfig[freq]
          const record = todayRecords.find(r => r.frequency === freq)
          const isActive = activeFrequency === freq

          return (
            <button
              key={freq}
              onClick={() => setActiveFrequency(freq)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? `bg-${config.color}-100 text-${config.color}-700`
                  : 'bg-white text-slate-600 shadow-sm active:bg-slate-100'
              }`}
            >
              {config.label}
              {record?.signedOff && (
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {!currentRecord ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 rounded-full bg-${frequencyConfig[activeFrequency].color}-100 mx-auto mb-4 flex items-center justify-center`}>
              <SparklesIcon className={`w-8 h-8 text-${frequencyConfig[activeFrequency].color}-600`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Start {frequencyConfig[activeFrequency].label} Cleaning
            </h3>
            <p className="text-slate-500 mb-6">
              Tap below to begin the cleaning tasks
            </p>
            <button
              onClick={createRecord}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Start Cleaning
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
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
                    progress === 100 ? 'bg-emerald-500' : `bg-${frequencyConfig[activeFrequency].color}-500`
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div>
              {currentRecord.tasks.map((task, index) => (
                <div
                  key={task.id}
                  onClick={() => !currentRecord.signedOff && toggleTask(task.id)}
                  className={`flex items-start gap-4 p-5 border-b border-slate-50 select-none transition-colors ${
                    currentRecord.signedOff
                      ? 'opacity-60'
                      : 'active:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="pt-0.5">
                    {task.completed ? (
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
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}>
                      {task.text}
                    </p>
                    {task.completedAt && (
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(task.completedAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign Off */}
            <div className="p-5 bg-slate-50">
              {currentRecord.signedOff ? (
                <div className="flex items-center justify-center gap-3 py-3 bg-emerald-100 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  <div className="text-center">
                    <p className="font-semibold text-emerald-700">Signed Off</p>
                    <p className="text-sm text-emerald-600">by {currentRecord.completedBy}</p>
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
                  {progress === 100 ? 'Sign Off' : `${totalCount - completedCount} tasks remaining`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
