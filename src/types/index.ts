// Core types for SFBB Pro

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  businessId: string
  pin?: string
}

export type EmployeePrivilege =
  | 'view_dashboard'
  | 'log_temperature'
  | 'complete_checklists'
  | 'complete_cleaning'
  | 'manage_suppliers'
  | 'manage_allergens'
  | 'view_records'
  | 'export_records'
  | 'manage_employees'
  | 'access_settings'

export const ROLE_PRIVILEGES: Record<'admin' | 'manager' | 'staff', EmployeePrivilege[]> = {
  admin: [
    'view_dashboard',
    'log_temperature',
    'complete_checklists',
    'complete_cleaning',
    'manage_suppliers',
    'manage_allergens',
    'view_records',
    'export_records',
    'manage_employees',
    'access_settings',
  ],
  manager: [
    'view_dashboard',
    'log_temperature',
    'complete_checklists',
    'complete_cleaning',
    'manage_suppliers',
    'manage_allergens',
    'view_records',
    'export_records',
    'manage_employees',
  ],
  staff: [
    'view_dashboard',
    'log_temperature',
    'complete_checklists',
    'complete_cleaning',
    'view_records',
  ],
}

export const PRIVILEGE_LABELS: Record<EmployeePrivilege, string> = {
  view_dashboard: 'View Dashboard',
  log_temperature: 'Log Temperatures',
  complete_checklists: 'Complete Checklists',
  complete_cleaning: 'Complete Cleaning Tasks',
  manage_suppliers: 'Manage Suppliers',
  manage_allergens: 'Manage Allergens & Dishes',
  view_records: 'View Records',
  export_records: 'Export Records',
  manage_employees: 'Manage Employees',
  access_settings: 'Access Settings',
}

export interface Business {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logoUrl?: string
  managerName: string
  foodHygieneRating?: number
  lastInspectionDate?: string
}

export interface Location {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  managerName?: string
  isPrimary: boolean
}

export interface Employee {
  id: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  email?: string
  phone?: string
  pin?: string
  startDate: string
  certificates: Certificate[]
  trainingRecords: TrainingRecord[]
  customPrivileges?: EmployeePrivilege[]
}

export interface Certificate {
  id: string
  name: string
  issueDate: string
  expiryDate: string | null
  fileUrl?: string
}

export interface TrainingRecord {
  id: string
  title: string
  date: string
  notes?: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  notes?: string
}

export interface Checklist {
  id: string
  type: 'opening' | 'closing' | 'weekly'
  date: string
  items: ChecklistItem[]
  completedBy?: string
  remarks?: string
  signedOff: boolean
}

export interface CleaningTask {
  id: string
  text: string
  frequency: 'daily' | 'weekly' | 'monthly'
  completed: boolean
  completedAt?: string
  completedBy?: string
}

export interface CleaningRecord {
  id: string
  date: string
  frequency: 'daily' | 'weekly' | 'monthly'
  tasks: CleaningTask[]
  completedBy?: string
  signedOff: boolean
}

export interface TemperatureLog {
  id: string
  type: 'fridge' | 'freezer' | 'hot_hold' | 'delivery' | 'dishwasher' | 'probe_calibration'
  applianceId?: string
  applianceName: string
  temperature?: number
  boilingTemp?: number
  iceTemp?: number
  time: string
  date: string
  loggedBy: string
  notes?: string
  isCompliant: boolean
}

export interface Appliance {
  id: string
  name: string
  type: 'fridge' | 'freezer' | 'hot_hold' | 'dishwasher' | 'probe'
  location?: string
  minTemp?: number
  maxTemp?: number
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone?: string
  email?: string
  address?: string
  products: string[]
  lastDelivery?: string
  rating?: number
  notes?: string
}

export interface Dish {
  id: string
  name: string
  description?: string
  category?: string
  allergens: string[]
  crossContaminationRisks: string[]
  cookingInstructions?: string
  storageInstructions?: string
}

export interface WasteLog {
  id: string
  date: string
  time: string
  itemName: string
  quantity: string
  reason: string
  loggedBy: string
  cost?: number
}

export interface MaintenanceLog {
  id: string
  date: string
  applianceId?: string
  applianceName: string
  type: 'repair' | 'service' | 'inspection'
  description: string
  performedBy: string
  cost?: number
  nextServiceDate?: string
}

// SFBB Diary & 4-Weekly Review types
export interface DiaryEntry {
  id: string
  date: string
  dayOfWeek: string
  problemsChanges?: string
  openingChecksDone: boolean
  closingChecksDone: boolean
  staffName?: string
  signedOff: boolean
}

export interface WeeklyExtraCheck {
  id: string
  weekCommencing: string
  extraChecksNotes?: string
  staffName?: string
  signedOff: boolean
}

export interface FourWeeklyReview {
  id: string
  reviewDate: string
  weekCommencing: string
  // Problems observed
  problemsObserved?: boolean
  problemDetails?: string
  problemActions?: string
  // Safe Method Checklist (12 questions)
  reviewedSafeMethods?: boolean
  allergenInfoUpdated?: boolean
  equipmentProcessesChanged?: boolean
  newSuppliersRecorded?: boolean
  cleaningScheduleUpdated?: boolean
  newStaffTrained?: boolean
  existingStaffRefresher?: boolean
  extraChecksRequired?: boolean
  foodComplaintsInvestigated?: boolean
  probesCalibrated?: boolean
  extraChecksCompleted?: boolean
  proveItChecksCompleted?: boolean
  // Additional details
  additionalDetails?: string
  // Sign off
  managerName?: string
  signedOff: boolean
}

export interface SpotCheck {
  id: string
  date: string
  time: string
  area: string
  checkedBy: string
  items: {
    item: string
    status: 'pass' | 'fail' | 'na'
    notes?: string
  }[]
  overallResult: 'pass' | 'fail'
  correctiveAction?: string
}

export interface Alert {
  id: string
  type: 'certificate_expiry' | 'temperature' | 'overdue_task' | 'inspection'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  date: string
  acknowledged: boolean
  relatedId?: string
}

export interface DailyRecord {
  id: string
  date: string
  openingChecklist?: Checklist
  closingChecklist?: Checklist
  temperatureLogs: TemperatureLog[]
  cleaningTasks: CleaningTask[]
  wasteLogs: WasteLog[]
  incidents?: string[]
  completedBy?: string
  managerSignOff?: boolean
  remarks?: string
}

// Customizable checklist templates
export interface ChecklistTemplates {
  openingChecks: string[]
  closingChecks: string[]
  dailyCleaning: string[]
  weeklyCleaning: string[]
  monthlyCleaning: string[]
}

// Allergen list (UK FSA standard 14 allergens)
export const ALLERGENS = [
  'Celery',
  'Cereals containing gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Nuts',
  'Peanuts',
  'Sesame',
  'Soybeans',
  'Sulphur dioxide'
] as const

export type Allergen = typeof ALLERGENS[number]

// Temperature compliance thresholds
export const TEMP_THRESHOLDS = {
  fridge: { min: 0, max: 5 },
  freezer: { min: -25, max: -18 },
  hot_hold: { min: 63, max: 100 },
  delivery_chilled: { min: 0, max: 8 },
  delivery_frozen: { min: -25, max: -15 },
  dishwasher_wash: { min: 55, max: 65 },
  dishwasher_rinse: { min: 82, max: 90 },
  probe_ice: { min: -1, max: 1 },
  probe_boiling: { min: 99, max: 101 },
}

// Subscription types
// Note: 'vip' is a hidden tier for internal use - grants full access without payment
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'vip'

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  tier: SubscriptionTier
  status: SubscriptionStatus
  trialStart: string | null
  trialEnd: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

export type SubscriptionFeature =
  | 'temperature_logging'
  | 'daily_checklists'
  | 'cleaning_schedules'
  | 'sfbb_diary'
  | 'staff_management'
  | 'allergen_tracking'
  | 'single_location'
  | 'pdf_export'
  | 'email_reminders'
  | 'multi_location'
  | 'priority_support'
  | 'advanced_reporting'
  | 'sfbb_packs'

export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeature[]> = {
  free: [
    'temperature_logging',
    'daily_checklists',
    'cleaning_schedules',
    'sfbb_diary',
    'staff_management',
    'allergen_tracking',
    'single_location',
  ],
  starter: [
    'temperature_logging',
    'daily_checklists',
    'cleaning_schedules',
    'sfbb_diary',
    'staff_management',
    'allergen_tracking',
    'single_location',
  ],
  professional: [
    'temperature_logging',
    'daily_checklists',
    'cleaning_schedules',
    'sfbb_diary',
    'staff_management',
    'allergen_tracking',
    'single_location',
    'pdf_export',
    'email_reminders',
    'multi_location',
    'priority_support',
    'advanced_reporting',
    'sfbb_packs',
  ],
  vip: [
    'temperature_logging',
    'daily_checklists',
    'cleaning_schedules',
    'sfbb_diary',
    'staff_management',
    'allergen_tracking',
    'single_location',
    'pdf_export',
    'email_reminders',
    'multi_location',
    'priority_support',
    'advanced_reporting',
    'sfbb_packs',
  ],
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  vip: 'VIP',
}

export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free' | 'vip'>, string> = {
  starter: '15.00',
  professional: '30.00',
}

// SFBB Pack Types
export type SFBBPackType = 'caterer' | 'retailer' | 'care_home' | 'childminder'

export const SFBB_PACK_LABELS: Record<SFBBPackType, string> = {
  caterer: 'Caterers',
  retailer: 'Retailers',
  care_home: 'Care Homes',
  childminder: 'Childminders',
}

export const SFBB_PACK_DESCRIPTIONS: Record<SFBBPackType, string> = {
  caterer: 'For restaurants, cafes, pubs, hotels, and any business preparing and cooking food',
  retailer: 'For shops, supermarkets, and businesses selling pre-packaged or loose food',
  care_home: 'For residential care homes preparing food for residents',
  childminder: 'For childminders and small nurseries preparing food for children',
}

// SFBB Pack Section - each section in a pack
export interface SFBBPackSection {
  id: string
  key: string
  title: string
  description: string
  fields: SFBBPackField[]
}

// Field types for pack forms
export interface SFBBPackField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'checkbox' | 'date' | 'signature' | 'select'
  options?: string[]
  required?: boolean
  placeholder?: string
  helpText?: string
}

// Stored pack data
export interface SFBBPack {
  id: string
  packType: SFBBPackType
  name: string
  createdAt: string
  updatedAt: string
  completedSections: number
  totalSections: number
  data: Record<string, Record<string, any>> // sectionKey -> fieldKey -> value
  signedOff: boolean
  signedOffBy?: string
  signedOffAt?: string
}
