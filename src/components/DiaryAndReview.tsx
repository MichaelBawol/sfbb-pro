import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import { FourWeeklyReview } from '../types'
import BottomSheet from './BottomSheet'
import StaffSelector, { useLastStaff } from './StaffSelector'
import {
  CalendarIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  BookOpenIcon,
} from 'lucide-react'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Safe Method Checklist Questions (exact wording from PDF)
const SAFE_METHOD_QUESTIONS = [
  { key: 'reviewedSafeMethods', question: 'Have you reviewed your safe methods?' },
  { key: 'allergenInfoUpdated', question: 'Has allergen information been updated to reflect any menu or ingredient changes?' },
  { key: 'equipmentProcessesChanged', question: 'Have you changed any equipment or processes which change your safe methods?' },
  { key: 'newSuppliersRecorded', question: 'Have any new suppliers been recorded with contact information?' },
  { key: 'cleaningScheduleUpdated', question: 'Does the cleaning schedule require updating?' },
  { key: 'newStaffTrained', question: 'Have new staff (if applicable) been trained in all safe methods?' },
  { key: 'existingStaffRefresher', question: 'Do any existing staff require safe method refresher training?' },
  { key: 'extraChecksRequired', question: 'Are any extra opening or closing checks required?' },
  { key: 'foodComplaintsInvestigated', question: 'If any food complaints have been received, have they been investigated and safe methods reviewed?' },
  { key: 'probesCalibrated', question: 'Have probes been calibrated in the last 4 weeks and results recorded?' },
  { key: 'extraChecksCompleted', question: 'Have extra checks been completed and recorded weekly?' },
  { key: 'proveItChecksCompleted', question: 'Are prove it checks being completed regularly and recorded?' },
] as const

function getWeekCommencing(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDaysInWeek(weekCommencing: Date): { date: Date; dayOfWeek: string; dateStr: string }[] {
  return DAYS_OF_WEEK.map((day, index) => {
    const date = new Date(weekCommencing)
    date.setDate(weekCommencing.getDate() + index)
    return {
      date,
      dayOfWeek: day,
      dateStr: formatDate(date),
    }
  })
}

export default function DiaryAndReview() {
  const {
    user,
    weeklyExtraChecks,
    fourWeeklyReviews,
    addDiaryEntry,
    updateDiaryEntry,
    getDiaryEntryByDate,
    addWeeklyExtraCheck,
    updateWeeklyExtraCheck,
    getWeeklyExtraCheckByWeek,
    addFourWeeklyReview,
    updateFourWeeklyReview,
  } = useAppContext()
  const { getLastStaff } = useLastStaff()

  const [currentWeek, setCurrentWeek] = useState(() => getWeekCommencing(new Date()))
  const [activeTab, setActiveTab] = useState<'diary' | 'review'>('diary')
  const [showDaySheet, setShowDaySheet] = useState(false)
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ date: Date; dayOfWeek: string; dateStr: string } | null>(null)
  const [selectedReview, setSelectedReview] = useState<FourWeeklyReview | null>(null)

  // Form state for day entry
  const [dayForm, setDayForm] = useState({
    problemsChanges: '',
    openingChecksDone: false,
    closingChecksDone: false,
    staffName: '',
    signedOff: false,
  })

  // Form state for weekly extra checks
  const [extraChecksForm, setExtraChecksForm] = useState({
    extraChecksNotes: '',
    staffName: '',
    signedOff: false,
  })

  // Form state for 4-weekly review
  const [reviewForm, setReviewForm] = useState<Partial<FourWeeklyReview>>({
    problemsObserved: false,
    problemDetails: '',
    problemActions: '',
    reviewedSafeMethods: undefined,
    allergenInfoUpdated: undefined,
    equipmentProcessesChanged: undefined,
    newSuppliersRecorded: undefined,
    cleaningScheduleUpdated: undefined,
    newStaffTrained: undefined,
    existingStaffRefresher: undefined,
    extraChecksRequired: undefined,
    foodComplaintsInvestigated: undefined,
    probesCalibrated: undefined,
    extraChecksCompleted: undefined,
    proveItChecksCompleted: undefined,
    additionalDetails: '',
    managerName: '',
    signedOff: false,
  })

  const weekCommencingStr = formatDate(currentWeek)
  const daysInWeek = getDaysInWeek(currentWeek)

  // Load extra checks for current week
  useEffect(() => {
    const existingCheck = getWeeklyExtraCheckByWeek(weekCommencingStr)
    if (existingCheck) {
      setExtraChecksForm({
        extraChecksNotes: existingCheck.extraChecksNotes || '',
        staffName: existingCheck.staffName || '',
        signedOff: existingCheck.signedOff,
      })
    } else {
      setExtraChecksForm({
        extraChecksNotes: '',
        staffName: '',
        signedOff: false,
      })
    }
  }, [weekCommencingStr, weeklyExtraChecks])

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + direction * 7)
    setCurrentWeek(newWeek)
  }

  const openDayEntry = (day: { date: Date; dayOfWeek: string; dateStr: string }) => {
    setSelectedDay(day)
    const existing = getDiaryEntryByDate(day.dateStr)
    if (existing) {
      setDayForm({
        problemsChanges: existing.problemsChanges || '',
        openingChecksDone: existing.openingChecksDone,
        closingChecksDone: existing.closingChecksDone,
        staffName: existing.staffName || '',
        signedOff: existing.signedOff,
      })
    } else {
      setDayForm({
        problemsChanges: '',
        openingChecksDone: false,
        closingChecksDone: false,
        staffName: getLastStaff(),
        signedOff: false,
      })
    }
    setShowDaySheet(true)
  }

  const saveDayEntry = async () => {
    if (!selectedDay) return

    const existing = getDiaryEntryByDate(selectedDay.dateStr)
    if (existing) {
      await updateDiaryEntry(existing.id, dayForm)
    } else {
      await addDiaryEntry({
        date: selectedDay.dateStr,
        dayOfWeek: selectedDay.dayOfWeek,
        ...dayForm,
      })
    }
    setShowDaySheet(false)
  }

  const saveExtraChecks = async () => {
    const existing = getWeeklyExtraCheckByWeek(weekCommencingStr)
    if (existing) {
      await updateWeeklyExtraCheck(existing.id, extraChecksForm)
    } else {
      await addWeeklyExtraCheck({
        weekCommencing: weekCommencingStr,
        ...extraChecksForm,
      })
    }
  }

  const openNewReview = () => {
    setSelectedReview(null)
    setReviewForm({
      problemsObserved: false,
      problemDetails: '',
      problemActions: '',
      reviewedSafeMethods: undefined,
      allergenInfoUpdated: undefined,
      equipmentProcessesChanged: undefined,
      newSuppliersRecorded: undefined,
      cleaningScheduleUpdated: undefined,
      newStaffTrained: undefined,
      existingStaffRefresher: undefined,
      extraChecksRequired: undefined,
      foodComplaintsInvestigated: undefined,
      probesCalibrated: undefined,
      extraChecksCompleted: undefined,
      proveItChecksCompleted: undefined,
      additionalDetails: '',
      managerName: user?.name || '',
      signedOff: false,
    })
    setShowReviewSheet(true)
  }

  const openExistingReview = (review: FourWeeklyReview) => {
    setSelectedReview(review)
    setReviewForm({ ...review })
    setShowReviewSheet(true)
  }

  const saveReview = async () => {
    const today = formatDate(new Date())
    if (selectedReview) {
      await updateFourWeeklyReview(selectedReview.id, reviewForm)
    } else {
      await addFourWeeklyReview({
        reviewDate: today,
        weekCommencing: weekCommencingStr,
        ...reviewForm,
        signedOff: reviewForm.signedOff || false,
      } as Omit<FourWeeklyReview, 'id'>)
    }
    setShowReviewSheet(false)
  }

  const getDayStatus = (dateStr: string) => {
    const entry = getDiaryEntryByDate(dateStr)
    if (!entry) return 'empty'
    if (entry.signedOff) return 'signed'
    if (entry.openingChecksDone || entry.closingChecksDone) return 'partial'
    return 'started'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SFBB Diary</h1>
          <p className="text-sm text-slate-500">Daily diary & 4-weekly review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('diary')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'diary'
              ? 'bg-white text-sfbb-600 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          Weekly Diary
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'review'
              ? 'bg-white text-sfbb-600 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          4-Weekly Review
        </button>
      </div>

      {activeTab === 'diary' && (
        <>
          {/* Week Navigator */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="text-center">
                <p className="text-sm text-slate-500">Week commencing</p>
                <p className="font-bold text-slate-900">{formatDisplayDate(weekCommencingStr)}</p>
              </div>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                <ChevronRightIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Daily Entries */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Daily Diary Entries</h2>
              <p className="text-xs text-slate-500 mt-1">
                Record any problems or changes and confirm checks completed
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {daysInWeek.map((day) => {
                const status = getDayStatus(day.dateStr)
                const entry = getDiaryEntryByDate(day.dateStr)
                const isToday = day.dateStr === formatDate(new Date())

                return (
                  <button
                    key={day.dateStr}
                    onClick={() => openDayEntry(day)}
                    className={`w-full p-4 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                      isToday ? 'bg-sfbb-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === 'signed' ? 'bg-green-100' :
                          status === 'partial' ? 'bg-amber-100' :
                          status === 'started' ? 'bg-blue-100' :
                          'bg-slate-100'
                        }`}>
                          {status === 'signed' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <CalendarIcon className={`w-5 h-5 ${
                              status === 'partial' ? 'text-amber-600' :
                              status === 'started' ? 'text-blue-600' :
                              'text-slate-400'
                            }`} />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${isToday ? 'text-sfbb-600' : 'text-slate-900'}`}>
                            {day.dayOfWeek}
                            {isToday && <span className="ml-2 text-xs bg-sfbb-100 text-sfbb-600 px-2 py-0.5 rounded-full">Today</span>}
                          </p>
                          <p className="text-xs text-slate-500">{formatDisplayDate(day.dateStr)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry && (
                          <div className="flex items-center gap-1">
                            {entry.openingChecksDone && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Open</span>
                            )}
                            {entry.closingChecksDone && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Close</span>
                            )}
                          </div>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                    {entry?.problemsChanges && (
                      <p className="mt-2 text-xs text-slate-600 line-clamp-1 pl-13">
                        {entry.problemsChanges}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Extra Checks Section */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheckIcon className="w-5 h-5 text-sfbb-600" />
              <h2 className="font-semibold text-slate-900">Extra Checks This Week</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              We have performed the following extra checks this week
            </p>
            <textarea
              value={extraChecksForm.extraChecksNotes}
              onChange={(e) => setExtraChecksForm(prev => ({ ...prev, extraChecksNotes: e.target.value }))}
              onBlur={saveExtraChecks}
              placeholder="Enter details of extra checks performed..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sfbb-500"
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <StaffSelector
                  value={extraChecksForm.staffName}
                  onChange={val => {
                    setExtraChecksForm(prev => ({ ...prev, staffName: val }))
                  }}
                  placeholder="Select name"
                />
              </div>
              <button
                onClick={async () => {
                  const newVal = !extraChecksForm.signedOff
                  setExtraChecksForm(prev => ({ ...prev, signedOff: newVal }))
                  const existing = getWeeklyExtraCheckByWeek(weekCommencingStr)
                  if (existing) {
                    await updateWeeklyExtraCheck(existing.id, { ...extraChecksForm, signedOff: newVal })
                  } else {
                    await addWeeklyExtraCheck({
                      weekCommencing: weekCommencingStr,
                      ...extraChecksForm,
                      signedOff: newVal,
                    })
                  }
                }}
                className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  extraChecksForm.signedOff
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {extraChecksForm.signedOff ? 'Signed' : 'Sign Off'}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'review' && (
        <>
          {/* 4-Weekly Review Info */}
          <div className="bg-gradient-to-br from-sfbb-500 to-sfbb-600 rounded-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <BookOpenIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold">4-Weekly Review</h2>
                <p className="text-sm text-white/80 mt-1">
                  Take time to walk around the kitchen and observe whether safe methods are being followed.
                  Review the past 4 weeks' diary entries.
                </p>
              </div>
            </div>
          </div>

          {/* New Review Button */}
          <button
            onClick={openNewReview}
            className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 text-sfbb-600 font-medium hover:bg-sfbb-50 active:bg-sfbb-100 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Start New 4-Weekly Review
          </button>

          {/* Past Reviews */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Past Reviews</h2>
            </div>
            {fourWeeklyReviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ClipboardCheckIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No reviews completed yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {fourWeeklyReviews.map((review) => (
                  <button
                    key={review.id}
                    onClick={() => openExistingReview(review)}
                    className="w-full p-4 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          Review: {formatDisplayDate(review.reviewDate)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Week of {formatDisplayDate(review.weekCommencing)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.signedOff && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Signed
                          </span>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                    {review.managerName && (
                      <p className="text-xs text-slate-500 mt-1">By: {review.managerName}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Day Entry Sheet */}
      <BottomSheet
        isOpen={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={selectedDay ? `${selectedDay.dayOfWeek} - ${formatDisplayDate(selectedDay.dateStr)}` : 'Day Entry'}
        fullScreen
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Problems/Changes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Any problems or changes - what did you do?
            </label>
            <textarea
              value={dayForm.problemsChanges}
              onChange={(e) => setDayForm(prev => ({ ...prev, problemsChanges: e.target.value }))}
              placeholder="Describe any problems or changes that occurred..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sfbb-500"
              rows={4}
            />
          </div>

          {/* Checks */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDayForm(prev => ({ ...prev, openingChecksDone: !prev.openingChecksDone }))}
              className={`p-4 rounded-xl border-2 transition-colors ${
                dayForm.openingChecksDone
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {dayForm.openingChecksDone ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-slate-300 rounded" />
                )}
                <span className={`font-medium ${dayForm.openingChecksDone ? 'text-green-700' : 'text-slate-600'}`}>
                  Opening checks
                </span>
              </div>
            </button>
            <button
              onClick={() => setDayForm(prev => ({ ...prev, closingChecksDone: !prev.closingChecksDone }))}
              className={`p-4 rounded-xl border-2 transition-colors ${
                dayForm.closingChecksDone
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {dayForm.closingChecksDone ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-slate-300 rounded" />
                )}
                <span className={`font-medium ${dayForm.closingChecksDone ? 'text-green-700' : 'text-slate-600'}`}>
                  Closing checks
                </span>
              </div>
            </button>
          </div>

          {/* Safe Methods Statement */}
          <div className="bg-sfbb-50 rounded-xl p-4">
            <p className="text-sm text-sfbb-700 font-medium text-center">
              Our safe methods were followed and effectively supervised today.
            </p>
          </div>

          {/* Name */}
          <StaffSelector
            value={dayForm.staffName}
            onChange={val => setDayForm(prev => ({ ...prev, staffName: val }))}
            label="Name"
            required
          />

          {/* Sign Off */}
          <button
            onClick={() => setDayForm(prev => ({ ...prev, signedOff: !prev.signedOff }))}
            className={`w-full p-4 rounded-xl border-2 transition-colors ${
              dayForm.signedOff
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {dayForm.signedOff ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
              )}
              <span className={`font-medium ${dayForm.signedOff ? 'text-green-700' : 'text-slate-600'}`}>
                {dayForm.signedOff ? 'Signed Off' : 'Tap to Sign Off'}
              </span>
            </div>
          </button>
        </div>

        {/* Save Button */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={saveDayEntry}
            className="w-full py-3.5 bg-sfbb-500 text-white rounded-xl font-semibold hover:bg-sfbb-600 active:bg-sfbb-700 transition-colors"
          >
            Save Entry
          </button>
        </div>
      </BottomSheet>

      {/* 4-Weekly Review Sheet */}
      <BottomSheet
        isOpen={showReviewSheet}
        onClose={() => setShowReviewSheet(false)}
        title="4-Weekly Review"
        fullScreen
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Instructions */}
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-2">Instructions:</p>
            <p>Take some time to walk around the kitchen and observe whether safe methods are being followed. Write details of any problems below and what you did about it.</p>
            <p className="mt-2">Also look back over the past 4 weeks' diary entries. If you had a serious problem, or the same thing went wrong three times or more, make a note of it here.</p>
            <p className="mt-2 font-medium">Please remember: this review requires completion even if no problems have been found.</p>
          </div>

          {/* Problems Observed */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Did you observe any problems or did the same issue occur in the diary three times or more?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReviewForm(prev => ({ ...prev, problemsObserved: true }))}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  reviewForm.problemsObserved === true
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setReviewForm(prev => ({ ...prev, problemsObserved: false }))}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  reviewForm.problemsObserved === false
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {reviewForm.problemsObserved && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Details</label>
                <textarea
                  value={reviewForm.problemDetails || ''}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, problemDetails: e.target.value }))}
                  placeholder="Describe the problems observed..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sfbb-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What did you do about it?</label>
                <textarea
                  value={reviewForm.problemActions || ''}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, problemActions: e.target.value }))}
                  placeholder="Describe the actions taken..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sfbb-500"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Safe Method Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-sfbb-50 border-b border-slate-200">
              <h3 className="font-semibold text-sfbb-700">Safe Method Checklist</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {SAFE_METHOD_QUESTIONS.map(({ key, question }) => (
                <div key={key} className="p-4">
                  <p className="text-sm text-slate-700 mb-2">{question}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReviewForm(prev => ({ ...prev, [key]: true }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (reviewForm as any)[key] === true
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setReviewForm(prev => ({ ...prev, [key]: false }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (reviewForm as any)[key] === false
                          ? 'bg-red-100 text-red-700 border-2 border-red-500'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Details</label>
            <textarea
              value={reviewForm.additionalDetails || ''}
              onChange={(e) => setReviewForm(prev => ({ ...prev, additionalDetails: e.target.value }))}
              placeholder="Enter any additional details..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sfbb-500"
              rows={3}
            />
          </div>

          {/* Manager Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Manager Name</label>
            <input
              type="text"
              value={reviewForm.managerName || ''}
              onChange={(e) => setReviewForm(prev => ({ ...prev, managerName: e.target.value }))}
              placeholder="Enter manager name"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sfbb-500"
            />
          </div>

          {/* Sign Off */}
          <button
            onClick={() => setReviewForm(prev => ({ ...prev, signedOff: !prev.signedOff }))}
            className={`w-full p-4 rounded-xl border-2 transition-colors ${
              reviewForm.signedOff
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {reviewForm.signedOff ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
              )}
              <span className={`font-medium ${reviewForm.signedOff ? 'text-green-700' : 'text-slate-600'}`}>
                {reviewForm.signedOff ? 'Signed Off' : 'Tap to Sign Off'}
              </span>
            </div>
          </button>
        </div>

        {/* Save Button */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={saveReview}
            className="w-full py-3.5 bg-sfbb-500 text-white rounded-xl font-semibold hover:bg-sfbb-600 active:bg-sfbb-700 transition-colors"
          >
            {selectedReview ? 'Update Review' : 'Save Review'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
