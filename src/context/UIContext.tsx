import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Expense, ExpenseFilters, Income, MachineLog } from '@/types'
import { expenseRepo, incomeRepo, machineLogRepo } from '@/db/repositories'

export type Sheet =
  | { name: 'expense'; expenseId?: string; other?: boolean }
  | { name: 'expense-detail'; id: string }
  | { name: 'income'; incomeId?: string; general?: boolean }
  | { name: 'income-detail'; id: string }
  | { name: 'log'; logId?: string; machineId?: string }
  | { name: 'log-detail'; id: string }
  | { name: 'site-switcher' }
  | { name: 'site-form'; siteId?: string }
  | { name: 'vendor-form'; vendorId?: string }
  | { name: 'category-form'; categoryId?: string; type?: 'expense' | 'other' }
  | { name: 'machine-form'; machineId?: string }
  | { name: 'filters' }
  | { name: 'confirm'; title: string; message: string; destructive?: boolean; onConfirm: () => void }

export type Toast = {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

type UIState = {
  sheets: Sheet[]
  toast: Toast | null
  filters: ExpenseFilters
  setFilters: (patch: Partial<ExpenseFilters>) => void
  openSheet: (sheet: Sheet) => void
  closeSheet: () => void
  closeAllSheets: () => void
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: () => void
  undoExpense: (row: Expense, message?: string) => Promise<void>
  undoIncome: (row: Income) => Promise<void>
  undoLog: (row: MachineLog) => Promise<void>
}

const Ctx = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [filters, setFiltersState] = useState<ExpenseFilters>({ preset: 'all', sort: 'newest' })
  const setFilters = useCallback((patch: Partial<ExpenseFilters>) => {
    setFiltersState((f) => ({ ...f, ...patch }))
  }, [])
  const timer = useRef<number | null>(null)
  const idRef = useRef(1)

  const openSheet = useCallback((sheet: Sheet) => {
    setSheets((s) => [...s, sheet])
  }, [])

  const closeSheet = useCallback(() => {
    setSheets((s) => s.slice(0, -1))
  }, [])

  const closeAllSheets = useCallback(() => setSheets([]), [])

  const hideToast = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const showToast = useCallback(
    (next: Omit<Toast, 'id'>) => {
      if (timer.current) window.clearTimeout(timer.current)
      const id = idRef.current++
      setToast({ ...next, id })
      timer.current = window.setTimeout(() => setToast(null), 5000)
    },
    [],
  )

  const undoExpense = useCallback(
    async (row: Expense, message = 'Expense deleted') => {
      await expenseRepo.remove(row.id)
      showToast({
        message,
        actionLabel: 'Undo',
        onAction: () => {
          void expenseRepo.restore(row)
        },
      })
    },
    [showToast],
  )

  const undoIncome = useCallback(
    async (row: Income) => {
      await incomeRepo.remove(row.id)
      showToast({
        message: 'Income deleted',
        actionLabel: 'Undo',
        onAction: () => {
          void incomeRepo.restore(row)
        },
      })
    },
    [showToast],
  )

  const undoLog = useCallback(
    async (row: MachineLog) => {
      await machineLogRepo.remove(row.id)
      showToast({
        message: 'Hours log deleted',
        actionLabel: 'Undo',
        onAction: () => {
          void machineLogRepo.restore(row)
        },
      })
    },
    [showToast],
  )

  const value = useMemo(
    () => ({
      sheets,
      toast,
      filters,
      setFilters,
      openSheet,
      closeSheet,
      closeAllSheets,
      showToast,
      hideToast,
      undoExpense,
      undoIncome,
      undoLog,
    }),
    [
      sheets,
      toast,
      filters,
      setFilters,
      openSheet,
      closeSheet,
      closeAllSheets,
      showToast,
      hideToast,
      undoExpense,
      undoIncome,
      undoLog,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI(): UIState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
