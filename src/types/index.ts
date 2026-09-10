export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'RTGS',
  'NEFT',
  'Bank Transfer',
  'Card',
  'Other',
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const UNITS = [
  'Bags',
  'Tonnes',
  'Brass',
  'Cubic Feet',
  'Cubic Meter',
  'Pieces',
  'Hours',
  'Days',
  'Trips',
  'Litres',
  'Kg',
  'Other',
] as const
export type Unit = (typeof UNITS)[number]

export const INCOME_SOURCES = [
  'Office',
  'Friend',
  'Partner',
  'Personal',
  'Other',
] as const
export type IncomeSource = (typeof INCOME_SOURCES)[number]

export const THEMES = ['system', 'light', 'dark'] as const
export type ThemeMode = (typeof THEMES)[number]

export type CategoryType = 'expense' | 'other'

export type Site = {
  id: string
  name: string
  location?: string
  budget?: number
  startDate?: string
  targetDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Expense = {
  id: string
  siteId?: string
  categoryId: string
  vendorId?: string
  amount: number
  quantity?: number
  unit?: string
  paymentMethod?: PaymentMethod
  date: string
  note?: string
  machineLogId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Income = {
  id: string
  siteId?: string
  amount: number
  source: string
  paymentMethod?: PaymentMethod
  date: string
  note?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Vendor = {
  id: string
  name: string
  phone?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Machine = {
  id: string
  name: string
  defaultRate?: number
  rateUnit?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type MachineLog = {
  id: string
  siteId: string
  machineId: string
  date: string
  hours: number
  startTime?: string
  endTime?: string
  breakHours?: number
  rate: number
  operator?: string
  note?: string
  expenseId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type Category = {
  id: string
  name: string
  type: CategoryType
  group?: string
  icon?: string
  color?: string
  defaultUnit?: string
  isCustom?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type AppSettings = {
  id: 'app'
  currentSiteId?: string
  currency: 'INR'
  theme: ThemeMode
  haptics: boolean
  onboardingComplete: boolean
  lastCategoryId?: string
  lastPaymentMethod?: PaymentMethod
  lastVendorId?: string
  lastOtherCategoryId?: string
  lastMachineId?: string
  demoDataLoaded?: boolean
}

export type BackupFile = {
  version: 1
  app: 'plot-tracker'
  exportedAt: string
  data: {
    sites: Site[]
    expenses: Expense[]
    incomes: Income[]
    vendors: Vendor[]
    machines: Machine[]
    machineLogs: MachineLog[]
    categories: Category[]
    settings: AppSettings[]
  }
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'all'

export type SortKey =
  | 'newest'
  | 'oldest'
  | 'highest'
  | 'lowest'
  | 'category'
  | 'vendor'

export type ExpenseFilters = {
  preset: DatePreset
  categoryId?: string
  vendorId?: string
  paymentMethod?: PaymentMethod
  minAmount?: number
  maxAmount?: number
  sort: SortKey
}
