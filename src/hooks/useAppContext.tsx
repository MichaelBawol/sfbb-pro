import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'
import {
  User,
  Business,
  Employee,
  Checklist,
  CleaningRecord,
  TemperatureLog,
  Supplier,
  Dish,
  WasteLog,
  MaintenanceLog,
  SpotCheck,
  Alert,
  Appliance,
  ChecklistTemplates,
  DiaryEntry,
  WeeklyExtraCheck,
  FourWeeklyReview,
  Subscription,
  SubscriptionFeature,
  TIER_FEATURES,
} from '../types'

interface AppState {
  // Auth
  user: User | null
  supabaseUser: SupabaseUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Business
  business: Business | null

  // Subscription
  subscription: Subscription | null

  // Data
  employees: Employee[]
  checklists: Checklist[]
  cleaningRecords: CleaningRecord[]
  temperatureLogs: TemperatureLog[]
  suppliers: Supplier[]
  dishes: Dish[]
  wasteLogs: WasteLog[]
  maintenanceLogs: MaintenanceLog[]
  spotChecks: SpotCheck[]
  alerts: Alert[]
  appliances: Appliance[]
  checklistTemplates: ChecklistTemplates
  diaryEntries: DiaryEntry[]
  weeklyExtraChecks: WeeklyExtraCheck[]
  fourWeeklyReviews: FourWeeklyReview[]

  // UI State
  activeTab: string
  sidebarOpen: boolean
  settingsUnlocked: boolean
}

interface AppContextType extends AppState {
  // Auth actions
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, name: string, pin: string) => Promise<{ error?: string }>
  logout: () => Promise<void>

  // PIN actions
  verifyPin: (pin: string) => boolean
  setPin: (pin: string) => Promise<void>
  updatePin: (oldPin: string, newPin: string) => Promise<boolean>
  unlockSettings: (pin: string) => boolean
  lockSettings: () => void
  hasPin: () => boolean

  // Business actions
  updateBusiness: (business: Partial<Business>) => Promise<void>

  // Employee actions
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>

  // Checklist actions
  addChecklist: (checklist: Omit<Checklist, 'id'>) => Promise<void>
  updateChecklist: (id: string, data: Partial<Checklist>) => Promise<void>
  signOffChecklist: (id: string, signature: string) => Promise<void>

  // Temperature actions
  addTemperatureLog: (log: Omit<TemperatureLog, 'id'>) => Promise<void>
  updateTemperatureLog: (id: string, data: Partial<TemperatureLog>) => Promise<void>

  // Cleaning actions
  addCleaningRecord: (record: Omit<CleaningRecord, 'id'>) => Promise<void>
  updateCleaningRecord: (id: string, data: Partial<CleaningRecord>) => Promise<void>

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>

  // Dish actions
  addDish: (dish: Omit<Dish, 'id'>) => Promise<void>
  updateDish: (id: string, data: Partial<Dish>) => Promise<void>
  deleteDish: (id: string) => Promise<void>

  // Waste actions
  addWasteLog: (log: Omit<WasteLog, 'id'>) => Promise<void>

  // Maintenance actions
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => Promise<void>

  // Spot check actions
  addSpotCheck: (check: Omit<SpotCheck, 'id'>) => Promise<void>

  // Alert actions
  acknowledgeAlert: (id: string) => Promise<void>
  dismissAlert: (id: string) => Promise<void>

  // Appliance actions
  addAppliance: (appliance: Omit<Appliance, 'id'>) => Promise<void>
  updateAppliance: (id: string, data: Partial<Appliance>) => Promise<void>
  deleteAppliance: (id: string) => Promise<void>

  // Checklist template actions
  addChecklistItem: (type: keyof ChecklistTemplates, item: string) => Promise<void>
  removeChecklistItem: (type: keyof ChecklistTemplates, index: number) => Promise<void>
  reorderChecklistItem: (type: keyof ChecklistTemplates, fromIndex: number, toIndex: number) => Promise<void>
  updateChecklistItem: (type: keyof ChecklistTemplates, index: number, newText: string) => Promise<void>

  // Diary actions
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => Promise<void>
  updateDiaryEntry: (id: string, data: Partial<DiaryEntry>) => Promise<void>
  getDiaryEntryByDate: (date: string) => DiaryEntry | undefined

  // Weekly extra checks actions
  addWeeklyExtraCheck: (check: Omit<WeeklyExtraCheck, 'id'>) => Promise<void>
  updateWeeklyExtraCheck: (id: string, data: Partial<WeeklyExtraCheck>) => Promise<void>
  getWeeklyExtraCheckByWeek: (weekCommencing: string) => WeeklyExtraCheck | undefined

  // 4-Weekly review actions
  addFourWeeklyReview: (review: Omit<FourWeeklyReview, 'id'>) => Promise<void>
  updateFourWeeklyReview: (id: string, data: Partial<FourWeeklyReview>) => Promise<void>

  // UI actions
  setActiveTab: (tab: string) => void
  toggleSidebar: () => void

  // Subscription actions
  hasFeature: (feature: SubscriptionFeature) => boolean
  isSubscriptionActive: () => boolean
  isInTrial: () => boolean
  getTrialDaysRemaining: () => number
  createCheckoutSession: (priceId: string) => Promise<{ url?: string; error?: string }>
  openCustomerPortal: () => Promise<{ url?: string; error?: string }>

  // Data refresh
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_TEMPLATES: ChecklistTemplates = {
  openingChecks: [],
  closingChecks: [],
  dailyCleaning: [],
  weeklyCleaning: [],
  monthlyCleaning: [],
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    supabaseUser: null,
    isAuthenticated: false,
    isLoading: true,
    business: null,
    subscription: null,
    employees: [],
    checklists: [],
    cleaningRecords: [],
    temperatureLogs: [],
    suppliers: [],
    dishes: [],
    wasteLogs: [],
    maintenanceLogs: [],
    spotChecks: [],
    alerts: [],
    appliances: [],
    checklistTemplates: DEFAULT_TEMPLATES,
    diaryEntries: [],
    weeklyExtraChecks: [],
    fourWeeklyReviews: [],
    activeTab: 'dashboard',
    sidebarOpen: false,
    settingsUnlocked: false,
  })

  // Fetch all user data from Supabase
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId)

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Profile doesn't exist yet, wait and retry once
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, waiting for trigger...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (retryError) {
            console.error('Profile still not found after retry:', retryError)
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }))
            return
          }
          Object.assign(profile || {}, retryProfile)
        }
      }

      console.log('Profile fetched:', profile)

      // Fetch business
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)

      // Fetch all data in parallel - use maybeSingle for templates to avoid error if not exists
      const [
        { data: employees },
        { data: appliances },
        { data: temperatureLogs },
        { data: checklists },
        { data: cleaningRecords },
        { data: suppliers },
        { data: dishes },
        { data: wasteLogs },
        { data: maintenanceLogs },
        { data: spotChecks },
        { data: alerts },
        { data: templates },
        { data: diaryEntries },
        { data: weeklyExtraChecks },
        { data: fourWeeklyReviews },
        { data: subscriptionData },
      ] = await Promise.all([
        supabase.from('employees').select('*, certificates(*), training_records(*)').eq('user_id', userId),
        supabase.from('appliances').select('*').eq('user_id', userId),
        supabase.from('temperature_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).order('time', { ascending: false }),
        supabase.from('checklists').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('cleaning_records').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('suppliers').select('*').eq('user_id', userId),
        supabase.from('dishes').select('*').eq('user_id', userId),
        supabase.from('waste_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('maintenance_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('spot_checks').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('alerts').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('checklist_templates').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('weekly_extra_checks').select('*').eq('user_id', userId).order('week_commencing', { ascending: false }),
        supabase.from('four_weekly_reviews').select('*').eq('user_id', userId).order('review_date', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      ])

      // Transform data from snake_case to camelCase
      const transformedBusiness = businesses?.[0] ? {
        id: businesses[0].id,
        name: businesses[0].name,
        address: businesses[0].address,
        phone: businesses[0].phone,
        email: businesses[0].email,
        logoUrl: businesses[0].logo_url,
        managerName: businesses[0].manager_name,
        foodHygieneRating: businesses[0].food_hygiene_rating,
        lastInspectionDate: businesses[0].last_inspection_date,
      } : null

      const transformedEmployees = (employees || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        email: e.email,
        phone: e.phone,
        pin: e.pin,
        startDate: e.start_date,
        customPrivileges: e.custom_privileges,
        certificates: (e.certificates || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          issueDate: c.issue_date,
          expiryDate: c.expiry_date,
          fileUrl: c.file_url,
        })),
        trainingRecords: (e.training_records || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          date: t.date,
          notes: t.notes,
        })),
      }))

      const transformedAppliances = (appliances || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        location: a.location,
        minTemp: a.min_temp,
        maxTemp: a.max_temp,
      }))

      const transformedTempLogs = (temperatureLogs || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        applianceId: t.appliance_id,
        applianceName: t.appliance_name,
        temperature: t.temperature,
        boilingTemp: t.boiling_temp,
        iceTemp: t.ice_temp,
        time: t.time,
        date: t.date,
        loggedBy: t.logged_by,
        notes: t.notes,
        isCompliant: t.is_compliant,
      }))

      const transformedChecklists = (checklists || []).map((c: any) => ({
        id: c.id,
        type: c.type,
        date: c.date,
        items: c.items,
        completedBy: c.completed_by,
        remarks: c.remarks,
        signedOff: c.signed_off,
      }))

      const transformedCleaningRecords = (cleaningRecords || []).map((c: any) => ({
        id: c.id,
        date: c.date,
        frequency: c.frequency,
        tasks: c.tasks,
        completedBy: c.completed_by,
        signedOff: c.signed_off,
      }))

      const transformedSuppliers = (suppliers || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        contact: s.contact,
        phone: s.phone,
        email: s.email,
        address: s.address,
        products: s.products || [],
        lastDelivery: s.last_delivery,
        rating: s.rating,
        notes: s.notes,
      }))

      const transformedDishes = (dishes || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        allergens: d.allergens || [],
        crossContaminationRisks: d.cross_contamination_risks || [],
        cookingInstructions: d.cooking_instructions,
        storageInstructions: d.storage_instructions,
      }))

      const transformedWasteLogs = (wasteLogs || []).map((w: any) => ({
        id: w.id,
        date: w.date,
        time: w.time,
        itemName: w.item_name,
        quantity: w.quantity,
        reason: w.reason,
        loggedBy: w.logged_by,
        cost: w.cost,
      }))

      const transformedMaintenanceLogs = (maintenanceLogs || []).map((m: any) => ({
        id: m.id,
        date: m.date,
        applianceId: m.appliance_id,
        applianceName: m.appliance_name,
        type: m.type,
        description: m.description,
        performedBy: m.performed_by,
        cost: m.cost,
        nextServiceDate: m.next_service_date,
      }))

      const transformedSpotChecks = (spotChecks || []).map((s: any) => ({
        id: s.id,
        date: s.date,
        time: s.time,
        area: s.area,
        checkedBy: s.checked_by,
        items: s.items,
        overallResult: s.overall_result,
        correctiveAction: s.corrective_action,
      }))

      const transformedAlerts = (alerts || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        date: a.date,
        acknowledged: a.acknowledged,
        relatedId: a.related_id,
      }))

      const transformedTemplates: ChecklistTemplates = templates ? {
        openingChecks: templates.opening_checks || [],
        closingChecks: templates.closing_checks || [],
        dailyCleaning: templates.daily_cleaning || [],
        weeklyCleaning: templates.weekly_cleaning || [],
        monthlyCleaning: templates.monthly_cleaning || [],
      } : DEFAULT_TEMPLATES

      const transformedDiaryEntries = (diaryEntries || []).map((d: any) => ({
        id: d.id,
        date: d.date,
        dayOfWeek: d.day_of_week,
        problemsChanges: d.problems_changes,
        openingChecksDone: d.opening_checks_done,
        closingChecksDone: d.closing_checks_done,
        staffName: d.staff_name,
        signedOff: d.signed_off,
      }))

      const transformedWeeklyExtraChecks = (weeklyExtraChecks || []).map((w: any) => ({
        id: w.id,
        weekCommencing: w.week_commencing,
        extraChecksNotes: w.extra_checks_notes,
        staffName: w.staff_name,
        signedOff: w.signed_off,
      }))

      const transformedFourWeeklyReviews = (fourWeeklyReviews || []).map((r: any) => ({
        id: r.id,
        reviewDate: r.review_date,
        weekCommencing: r.week_commencing,
        problemsObserved: r.problems_observed,
        problemDetails: r.problem_details,
        problemActions: r.problem_actions,
        reviewedSafeMethods: r.reviewed_safe_methods,
        allergenInfoUpdated: r.allergen_info_updated,
        equipmentProcessesChanged: r.equipment_processes_changed,
        newSuppliersRecorded: r.new_suppliers_recorded,
        cleaningScheduleUpdated: r.cleaning_schedule_updated,
        newStaffTrained: r.new_staff_trained,
        existingStaffRefresher: r.existing_staff_refresher,
        extraChecksRequired: r.extra_checks_required,
        foodComplaintsInvestigated: r.food_complaints_investigated,
        probesCalibrated: r.probes_calibrated,
        extraChecksCompleted: r.extra_checks_completed,
        proveItChecksCompleted: r.prove_it_checks_completed,
        additionalDetails: r.additional_details,
        managerName: r.manager_name,
        signedOff: r.signed_off,
      }))

      const transformedSubscription: Subscription | null = subscriptionData ? {
        id: subscriptionData.id,
        userId: subscriptionData.user_id,
        stripeCustomerId: subscriptionData.stripe_customer_id,
        stripeSubscriptionId: subscriptionData.stripe_subscription_id,
        stripePriceId: subscriptionData.stripe_price_id,
        tier: subscriptionData.tier,
        status: subscriptionData.status,
        trialStart: subscriptionData.trial_start,
        trialEnd: subscriptionData.trial_end,
        currentPeriodStart: subscriptionData.current_period_start,
        currentPeriodEnd: subscriptionData.current_period_end,
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        canceledAt: subscriptionData.canceled_at,
        createdAt: subscriptionData.created_at,
        updatedAt: subscriptionData.updated_at,
      } : null

      console.log('Setting state with profile:', profile?.email)

      setState(prev => ({
        ...prev,
        user: profile ? {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          businessId: transformedBusiness?.id || '',
          pin: profile.pin,
        } : null,
        isAuthenticated: !!profile,
        business: transformedBusiness,
        subscription: transformedSubscription,
        employees: transformedEmployees,
        appliances: transformedAppliances,
        temperatureLogs: transformedTempLogs,
        checklists: transformedChecklists,
        cleaningRecords: transformedCleaningRecords,
        suppliers: transformedSuppliers,
        dishes: transformedDishes,
        wasteLogs: transformedWasteLogs,
        maintenanceLogs: transformedMaintenanceLogs,
        spotChecks: transformedSpotChecks,
        alerts: transformedAlerts,
        checklistTemplates: transformedTemplates,
        diaryEntries: transformedDiaryEntries,
        weeklyExtraChecks: transformedWeeklyExtraChecks,
        fourWeeklyReviews: transformedFourWeeklyReviews,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error fetching user data:', error)
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }))
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState(prev => ({
          ...prev,
          supabaseUser: session.user,
          isAuthenticated: true,
        }))
        fetchUserData(session.user.id)
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setState(prev => ({
          ...prev,
          supabaseUser: session.user,
          isAuthenticated: true,
        }))
        fetchUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({
          ...prev,
          user: null,
          supabaseUser: null,
          isAuthenticated: false,
          isLoading: false,
          business: null,
          subscription: null,
          employees: [],
          checklists: [],
          cleaningRecords: [],
          temperatureLogs: [],
          suppliers: [],
          dishes: [],
          wasteLogs: [],
          maintenanceLogs: [],
          spotChecks: [],
          alerts: [],
          appliances: [],
          checklistTemplates: DEFAULT_TEMPLATES,
          diaryEntries: [],
          weeklyExtraChecks: [],
          fourWeeklyReviews: [],
          settingsUnlocked: false,
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { error: error.message }
    }
    return {}
  }

  const register = async (email: string, password: string, name: string, pin: string) => {
    console.log('Starting registration for:', email)
    setState(prev => ({ ...prev, isLoading: true }))

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    console.log('SignUp response:', { data, error })

    if (error) {
      console.error('Registration error:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      return { error: error.message }
    }

    // Check if user was actually created (not just a fake success for existing email)
    if (!data.user || data.user.identities?.length === 0) {
      console.error('User not created - email may already exist')
      setState(prev => ({ ...prev, isLoading: false }))
      return { error: 'An account with this email already exists. Please sign in instead.' }
    }

    console.log('User created:', data.user.id)

    // Update profile with PIN after signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ pin, name })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }

    return {}
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const verifyPin = (pin: string): boolean => {
    return state.user?.pin === pin
  }

  const hasPin = (): boolean => {
    return !!state.user?.pin
  }

  const setPin = async (pin: string) => {
    if (!state.supabaseUser) return
    await supabase
      .from('profiles')
      .update({ pin })
      .eq('id', state.supabaseUser.id)
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, pin } : null,
      settingsUnlocked: true,
    }))
  }

  const updatePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    if (state.user?.pin !== oldPin) return false
    if (!state.supabaseUser) return false

    await supabase
      .from('profiles')
      .update({ pin: newPin })
      .eq('id', state.supabaseUser.id)

    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, pin: newPin } : null,
    }))
    return true
  }

  const unlockSettings = (pin: string): boolean => {
    if (state.user?.pin === pin) {
      setState(prev => ({ ...prev, settingsUnlocked: true }))
      return true
    }
    return false
  }

  const lockSettings = () => {
    setState(prev => ({ ...prev, settingsUnlocked: false }))
  }

  const updateBusiness = async (data: Partial<Business>) => {
    if (!state.supabaseUser) return

    const dbData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      logo_url: data.logoUrl,
      manager_name: data.managerName,
      food_hygiene_rating: data.foodHygieneRating,
      last_inspection_date: data.lastInspectionDate,
    }

    if (state.business) {
      await supabase
        .from('businesses')
        .update(dbData)
        .eq('id', state.business.id)
    } else {
      await supabase
        .from('businesses')
        .insert({ ...dbData, user_id: state.supabaseUser.id })
    }

    setState(prev => ({
      ...prev,
      business: prev.business
        ? { ...prev.business, ...data }
        : { id: '', ...data } as Business,
    }))
  }

  // Employee actions
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('employees')
      .insert({
        user_id: state.supabaseUser.id,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        phone: employee.phone,
        pin: employee.pin,
        start_date: employee.startDate,
        custom_privileges: employee.customPrivileges,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        employees: [...prev.employees, { ...employee, id: data.id, certificates: [], trainingRecords: [] }],
      }))
    }
  }

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    await supabase
      .from('employees')
      .update({
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        pin: data.pin,
        start_date: data.startDate,
        custom_privileges: data.customPrivileges,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => e.id === id ? { ...e, ...data } : e),
    }))
  }

  const deleteEmployee = async (id: string) => {
    await supabase.from('employees').delete().eq('id', id)
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
    }))
  }

  // Checklist actions
  const addChecklist = async (checklist: Omit<Checklist, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('checklists')
      .insert({
        user_id: state.supabaseUser.id,
        type: checklist.type,
        date: checklist.date,
        items: checklist.items,
        completed_by: checklist.completedBy,
        remarks: checklist.remarks,
        signed_off: checklist.signedOff,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        checklists: [{ ...checklist, id: data.id }, ...prev.checklists],
      }))
    }
  }

  const updateChecklist = async (id: string, data: Partial<Checklist>) => {
    await supabase
      .from('checklists')
      .update({
        items: data.items,
        completed_by: data.completedBy,
        remarks: data.remarks,
        signed_off: data.signedOff,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => c.id === id ? { ...c, ...data } : c),
    }))
  }

  const signOffChecklist = async (id: string, signature: string) => {
    await supabase
      .from('checklists')
      .update({ signed_off: true, completed_by: signature })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c =>
        c.id === id ? { ...c, signedOff: true, completedBy: signature } : c
      ),
    }))
  }

  // Temperature actions
  const addTemperatureLog = async (log: Omit<TemperatureLog, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('temperature_logs')
      .insert({
        user_id: state.supabaseUser.id,
        type: log.type,
        appliance_id: log.applianceId,
        appliance_name: log.applianceName,
        temperature: log.temperature,
        boiling_temp: log.boilingTemp,
        ice_temp: log.iceTemp,
        time: log.time,
        date: log.date,
        logged_by: log.loggedBy,
        notes: log.notes,
        is_compliant: log.isCompliant,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        temperatureLogs: [{ ...log, id: data.id }, ...prev.temperatureLogs],
      }))
    }
  }

  const updateTemperatureLog = async (id: string, data: Partial<TemperatureLog>) => {
    await supabase
      .from('temperature_logs')
      .update({
        temperature: data.temperature,
        notes: data.notes,
        is_compliant: data.isCompliant,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      temperatureLogs: prev.temperatureLogs.map(t => t.id === id ? { ...t, ...data } : t),
    }))
  }

  // Cleaning actions
  const addCleaningRecord = async (record: Omit<CleaningRecord, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('cleaning_records')
      .insert({
        user_id: state.supabaseUser.id,
        date: record.date,
        frequency: record.frequency,
        tasks: record.tasks,
        completed_by: record.completedBy,
        signed_off: record.signedOff,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        cleaningRecords: [{ ...record, id: data.id }, ...prev.cleaningRecords],
      }))
    }
  }

  const updateCleaningRecord = async (id: string, data: Partial<CleaningRecord>) => {
    await supabase
      .from('cleaning_records')
      .update({
        tasks: data.tasks,
        completed_by: data.completedBy,
        signed_off: data.signedOff,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      cleaningRecords: prev.cleaningRecords.map(c => c.id === id ? { ...c, ...data } : c),
    }))
  }

  // Supplier actions
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('suppliers')
      .insert({
        user_id: state.supabaseUser.id,
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        products: supplier.products,
        last_delivery: supplier.lastDelivery,
        rating: supplier.rating,
        notes: supplier.notes,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        suppliers: [...prev.suppliers, { ...supplier, id: data.id }],
      }))
    }
  }

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    await supabase
      .from('suppliers')
      .update({
        name: data.name,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        products: data.products,
        last_delivery: data.lastDelivery,
        rating: data.rating,
        notes: data.notes,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === id ? { ...s, ...data } : s),
    }))
  }

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id)
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id),
    }))
  }

  // Dish actions
  const addDish = async (dish: Omit<Dish, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('dishes')
      .insert({
        user_id: state.supabaseUser.id,
        name: dish.name,
        description: dish.description,
        category: dish.category,
        allergens: dish.allergens,
        cross_contamination_risks: dish.crossContaminationRisks,
        cooking_instructions: dish.cookingInstructions,
        storage_instructions: dish.storageInstructions,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        dishes: [...prev.dishes, { ...dish, id: data.id }],
      }))
    }
  }

  const updateDish = async (id: string, data: Partial<Dish>) => {
    await supabase
      .from('dishes')
      .update({
        name: data.name,
        description: data.description,
        category: data.category,
        allergens: data.allergens,
        cross_contamination_risks: data.crossContaminationRisks,
        cooking_instructions: data.cookingInstructions,
        storage_instructions: data.storageInstructions,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === id ? { ...d, ...data } : d),
    }))
  }

  const deleteDish = async (id: string) => {
    await supabase.from('dishes').delete().eq('id', id)
    setState(prev => ({
      ...prev,
      dishes: prev.dishes.filter(d => d.id !== id),
    }))
  }

  // Waste actions
  const addWasteLog = async (log: Omit<WasteLog, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('waste_logs')
      .insert({
        user_id: state.supabaseUser.id,
        date: log.date,
        time: log.time,
        item_name: log.itemName,
        quantity: log.quantity,
        reason: log.reason,
        logged_by: log.loggedBy,
        cost: log.cost,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        wasteLogs: [{ ...log, id: data.id }, ...prev.wasteLogs],
      }))
    }
  }

  // Maintenance actions
  const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('maintenance_logs')
      .insert({
        user_id: state.supabaseUser.id,
        date: log.date,
        appliance_id: log.applianceId,
        appliance_name: log.applianceName,
        type: log.type,
        description: log.description,
        performed_by: log.performedBy,
        cost: log.cost,
        next_service_date: log.nextServiceDate,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        maintenanceLogs: [{ ...log, id: data.id }, ...prev.maintenanceLogs],
      }))
    }
  }

  // Spot check actions
  const addSpotCheck = async (check: Omit<SpotCheck, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('spot_checks')
      .insert({
        user_id: state.supabaseUser.id,
        date: check.date,
        time: check.time,
        area: check.area,
        checked_by: check.checkedBy,
        items: check.items,
        overall_result: check.overallResult,
        corrective_action: check.correctiveAction,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        spotChecks: [{ ...check, id: data.id }, ...prev.spotChecks],
      }))
    }
  }

  // Alert actions
  const acknowledgeAlert = async (id: string) => {
    await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    }))
  }

  const dismissAlert = async (id: string) => {
    await supabase.from('alerts').delete().eq('id', id)
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id),
    }))
  }

  // Appliance actions
  const addAppliance = async (appliance: Omit<Appliance, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('appliances')
      .insert({
        user_id: state.supabaseUser.id,
        name: appliance.name,
        type: appliance.type,
        location: appliance.location,
        min_temp: appliance.minTemp,
        max_temp: appliance.maxTemp,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        appliances: [...prev.appliances, { ...appliance, id: data.id }],
      }))
    }
  }

  const updateAppliance = async (id: string, data: Partial<Appliance>) => {
    await supabase
      .from('appliances')
      .update({
        name: data.name,
        type: data.type,
        location: data.location,
        min_temp: data.minTemp,
        max_temp: data.maxTemp,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      appliances: prev.appliances.map(a => a.id === id ? { ...a, ...data } : a),
    }))
  }

  const deleteAppliance = async (id: string) => {
    await supabase.from('appliances').delete().eq('id', id)
    setState(prev => ({
      ...prev,
      appliances: prev.appliances.filter(a => a.id !== id),
    }))
  }

  // Checklist template actions
  const addChecklistItem = async (type: keyof ChecklistTemplates, item: string) => {
    if (!state.supabaseUser) return
    const newTemplates = {
      ...state.checklistTemplates,
      [type]: [...state.checklistTemplates[type], item],
    }

    const dbField = {
      openingChecks: 'opening_checks',
      closingChecks: 'closing_checks',
      dailyCleaning: 'daily_cleaning',
      weeklyCleaning: 'weekly_cleaning',
      monthlyCleaning: 'monthly_cleaning',
    }[type]

    await supabase
      .from('checklist_templates')
      .update({ [dbField]: newTemplates[type] })
      .eq('user_id', state.supabaseUser.id)

    setState(prev => ({
      ...prev,
      checklistTemplates: newTemplates,
    }))
  }

  const removeChecklistItem = async (type: keyof ChecklistTemplates, index: number) => {
    if (!state.supabaseUser) return
    const newTemplates = {
      ...state.checklistTemplates,
      [type]: state.checklistTemplates[type].filter((_, i) => i !== index),
    }

    const dbField = {
      openingChecks: 'opening_checks',
      closingChecks: 'closing_checks',
      dailyCleaning: 'daily_cleaning',
      weeklyCleaning: 'weekly_cleaning',
      monthlyCleaning: 'monthly_cleaning',
    }[type]

    await supabase
      .from('checklist_templates')
      .update({ [dbField]: newTemplates[type] })
      .eq('user_id', state.supabaseUser.id)

    setState(prev => ({
      ...prev,
      checklistTemplates: newTemplates,
    }))
  }

  const reorderChecklistItem = async (type: keyof ChecklistTemplates, fromIndex: number, toIndex: number) => {
    if (!state.supabaseUser) return
    const items = [...state.checklistTemplates[type]]
    const [removed] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, removed)

    const newTemplates = {
      ...state.checklistTemplates,
      [type]: items,
    }

    const dbField = {
      openingChecks: 'opening_checks',
      closingChecks: 'closing_checks',
      dailyCleaning: 'daily_cleaning',
      weeklyCleaning: 'weekly_cleaning',
      monthlyCleaning: 'monthly_cleaning',
    }[type]

    await supabase
      .from('checklist_templates')
      .update({ [dbField]: newTemplates[type] })
      .eq('user_id', state.supabaseUser.id)

    setState(prev => ({
      ...prev,
      checklistTemplates: newTemplates,
    }))
  }

  const updateChecklistItem = async (type: keyof ChecklistTemplates, index: number, newText: string) => {
    if (!state.supabaseUser) return
    const newTemplates = {
      ...state.checklistTemplates,
      [type]: state.checklistTemplates[type].map((item, i) => i === index ? newText : item),
    }

    const dbField = {
      openingChecks: 'opening_checks',
      closingChecks: 'closing_checks',
      dailyCleaning: 'daily_cleaning',
      weeklyCleaning: 'weekly_cleaning',
      monthlyCleaning: 'monthly_cleaning',
    }[type]

    await supabase
      .from('checklist_templates')
      .update({ [dbField]: newTemplates[type] })
      .eq('user_id', state.supabaseUser.id)

    setState(prev => ({
      ...prev,
      checklistTemplates: newTemplates,
    }))
  }

  // Diary entry actions
  const addDiaryEntry = async (entry: Omit<DiaryEntry, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('diary_entries')
      .insert({
        user_id: state.supabaseUser.id,
        date: entry.date,
        day_of_week: entry.dayOfWeek,
        problems_changes: entry.problemsChanges,
        opening_checks_done: entry.openingChecksDone,
        closing_checks_done: entry.closingChecksDone,
        staff_name: entry.staffName,
        signed_off: entry.signedOff,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        diaryEntries: [{ ...entry, id: data.id }, ...prev.diaryEntries],
      }))
    }
  }

  const updateDiaryEntry = async (id: string, data: Partial<DiaryEntry>) => {
    await supabase
      .from('diary_entries')
      .update({
        problems_changes: data.problemsChanges,
        opening_checks_done: data.openingChecksDone,
        closing_checks_done: data.closingChecksDone,
        staff_name: data.staffName,
        signed_off: data.signedOff,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      diaryEntries: prev.diaryEntries.map(d => d.id === id ? { ...d, ...data } : d),
    }))
  }

  const getDiaryEntryByDate = (date: string): DiaryEntry | undefined => {
    return state.diaryEntries.find(d => d.date === date)
  }

  // Weekly extra checks actions
  const addWeeklyExtraCheck = async (check: Omit<WeeklyExtraCheck, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('weekly_extra_checks')
      .insert({
        user_id: state.supabaseUser.id,
        week_commencing: check.weekCommencing,
        extra_checks_notes: check.extraChecksNotes,
        staff_name: check.staffName,
        signed_off: check.signedOff,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        weeklyExtraChecks: [{ ...check, id: data.id }, ...prev.weeklyExtraChecks],
      }))
    }
  }

  const updateWeeklyExtraCheck = async (id: string, data: Partial<WeeklyExtraCheck>) => {
    await supabase
      .from('weekly_extra_checks')
      .update({
        extra_checks_notes: data.extraChecksNotes,
        staff_name: data.staffName,
        signed_off: data.signedOff,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      weeklyExtraChecks: prev.weeklyExtraChecks.map(w => w.id === id ? { ...w, ...data } : w),
    }))
  }

  const getWeeklyExtraCheckByWeek = (weekCommencing: string): WeeklyExtraCheck | undefined => {
    return state.weeklyExtraChecks.find(w => w.weekCommencing === weekCommencing)
  }

  // 4-Weekly review actions
  const addFourWeeklyReview = async (review: Omit<FourWeeklyReview, 'id'>) => {
    if (!state.supabaseUser) return
    const { data } = await supabase
      .from('four_weekly_reviews')
      .insert({
        user_id: state.supabaseUser.id,
        review_date: review.reviewDate,
        week_commencing: review.weekCommencing,
        problems_observed: review.problemsObserved,
        problem_details: review.problemDetails,
        problem_actions: review.problemActions,
        reviewed_safe_methods: review.reviewedSafeMethods,
        allergen_info_updated: review.allergenInfoUpdated,
        equipment_processes_changed: review.equipmentProcessesChanged,
        new_suppliers_recorded: review.newSuppliersRecorded,
        cleaning_schedule_updated: review.cleaningScheduleUpdated,
        new_staff_trained: review.newStaffTrained,
        existing_staff_refresher: review.existingStaffRefresher,
        extra_checks_required: review.extraChecksRequired,
        food_complaints_investigated: review.foodComplaintsInvestigated,
        probes_calibrated: review.probesCalibrated,
        extra_checks_completed: review.extraChecksCompleted,
        prove_it_checks_completed: review.proveItChecksCompleted,
        additional_details: review.additionalDetails,
        manager_name: review.managerName,
        signed_off: review.signedOff,
      })
      .select()
      .single()

    if (data) {
      setState(prev => ({
        ...prev,
        fourWeeklyReviews: [{ ...review, id: data.id }, ...prev.fourWeeklyReviews],
      }))
    }
  }

  const updateFourWeeklyReview = async (id: string, data: Partial<FourWeeklyReview>) => {
    await supabase
      .from('four_weekly_reviews')
      .update({
        problems_observed: data.problemsObserved,
        problem_details: data.problemDetails,
        problem_actions: data.problemActions,
        reviewed_safe_methods: data.reviewedSafeMethods,
        allergen_info_updated: data.allergenInfoUpdated,
        equipment_processes_changed: data.equipmentProcessesChanged,
        new_suppliers_recorded: data.newSuppliersRecorded,
        cleaning_schedule_updated: data.cleaningScheduleUpdated,
        new_staff_trained: data.newStaffTrained,
        existing_staff_refresher: data.existingStaffRefresher,
        extra_checks_required: data.extraChecksRequired,
        food_complaints_investigated: data.foodComplaintsInvestigated,
        probes_calibrated: data.probesCalibrated,
        extra_checks_completed: data.extraChecksCompleted,
        prove_it_checks_completed: data.proveItChecksCompleted,
        additional_details: data.additionalDetails,
        manager_name: data.managerName,
        signed_off: data.signedOff,
      })
      .eq('id', id)

    setState(prev => ({
      ...prev,
      fourWeeklyReviews: prev.fourWeeklyReviews.map(r => r.id === id ? { ...r, ...data } : r),
    }))
  }

  // UI actions
  const setActiveTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }

  const refreshData = async () => {
    if (state.supabaseUser) {
      await fetchUserData(state.supabaseUser.id)
    }
  }

  // Subscription helpers
  const hasFeature = (feature: SubscriptionFeature): boolean => {
    const tier = state.subscription?.tier || 'free'
    const activeStatuses = ['trialing', 'active']
    const isActive = state.subscription ? activeStatuses.includes(state.subscription.status) : false

    // If no active subscription, use free tier features
    if (!isActive) {
      return TIER_FEATURES.free.includes(feature)
    }

    return TIER_FEATURES[tier].includes(feature)
  }

  const isSubscriptionActive = (): boolean => {
    if (!state.subscription) return false
    const activeStatuses = ['trialing', 'active']
    return activeStatuses.includes(state.subscription.status)
  }

  const isInTrial = (): boolean => {
    return state.subscription?.status === 'trialing'
  }

  const getTrialDaysRemaining = (): number => {
    if (!state.subscription?.trialEnd) return 0
    const trialEnd = new Date(state.subscription.trialEnd)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const createCheckoutSession = async (priceId: string): Promise<{ url?: string; error?: string }> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            priceId,
            email: state.user?.email,
            userId: state.user?.id,
            successUrl: `${window.location.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/settings`,
          }),
        }
      )

      const data = await response.json()
      if (data.error) {
        return { error: data.error }
      }
      return { url: data.url }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return { error: 'Failed to create checkout session' }
    }
  }

  const openCustomerPortal = async (): Promise<{ url?: string; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { error: 'Not authenticated' }
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            returnUrl: `${window.location.origin}/settings`,
          }),
        }
      )

      const data = await response.json()
      if (data.error) {
        return { error: data.error }
      }
      return { url: data.url }
    } catch (error) {
      console.error('Error creating portal session:', error)
      return { error: 'Failed to open customer portal' }
    }
  }

  const value: AppContextType = {
    ...state,
    login,
    register,
    logout,
    verifyPin,
    hasPin,
    setPin,
    updatePin,
    unlockSettings,
    lockSettings,
    updateBusiness,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addChecklist,
    updateChecklist,
    signOffChecklist,
    addTemperatureLog,
    updateTemperatureLog,
    addCleaningRecord,
    updateCleaningRecord,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addDish,
    updateDish,
    deleteDish,
    addWasteLog,
    addMaintenanceLog,
    addSpotCheck,
    acknowledgeAlert,
    dismissAlert,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    addChecklistItem,
    removeChecklistItem,
    reorderChecklistItem,
    updateChecklistItem,
    addDiaryEntry,
    updateDiaryEntry,
    getDiaryEntryByDate,
    addWeeklyExtraCheck,
    updateWeeklyExtraCheck,
    getWeeklyExtraCheckByWeek,
    addFourWeeklyReview,
    updateFourWeeklyReview,
    setActiveTab,
    toggleSidebar,
    hasFeature,
    isSubscriptionActive,
    isInTrial,
    getTrialDaysRemaining,
    createCheckoutSession,
    openCustomerPortal,
    refreshData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
