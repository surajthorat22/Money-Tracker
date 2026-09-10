import {
  endOfMonth,
  endOfWeek,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { Category, Expense, Income, Machine, MachineLog, Vendor } from '@/types'
import { monthKey } from '@/utils/dates'

export function sumBy<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((acc, row) => acc + (pick(row) || 0), 0)
}

export function siteExpenses(expenses: Expense[], siteId?: string): Expense[] {
  if (!siteId) return []
  return expenses.filter((e) => e.siteId === siteId)
}

export function otherExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => !e.siteId)
}

export function totalsForDay(expenses: Expense[], date: Date): number {
  return sumBy(
    expenses.filter((e) => isSameDay(parseISO(e.date), date)),
    (e) => e.amount,
  )
}

export function totalsThisMonth(expenses: Expense[], now = new Date()): number {
  const from = startOfMonth(now)
  const to = endOfMonth(now)
  return sumBy(
    expenses.filter((e) => {
      const d = parseISO(e.date)
      return d >= from && d <= to
    }),
    (e) => e.amount,
  )
}

export function totalsThisWeek(expenses: Expense[], now = new Date()): number {
  const from = startOfWeek(now, { weekStartsOn: 1 })
  const to = endOfWeek(now, { weekStartsOn: 1 })
  return sumBy(
    expenses.filter((e) => {
      const d = parseISO(e.date)
      return d >= from && d <= to
    }),
    (e) => e.amount,
  )
}

export function byCategory(
  expenses: Expense[],
  categories: Category[],
): Array<{ category: Category; total: number; count: number; pct: number }> {
  const map = new Map<string, { total: number; count: number }>()
  for (const e of expenses) {
    const cur = map.get(e.categoryId) ?? { total: 0, count: 0 }
    cur.total += e.amount
    cur.count += 1
    map.set(e.categoryId, cur)
  }
  const grand = sumBy(expenses, (e) => e.amount) || 1
  const catById = new Map(categories.map((c) => [c.id, c]))
  return [...map.entries()]
    .map(([id, v]) => ({
      category: catById.get(id) ?? {
        id,
        name: 'Unknown',
        type: 'expense' as const,
        createdAt: '',
        updatedAt: '',
      },
      total: v.total,
      count: v.count,
      pct: (v.total / grand) * 100,
    }))
    .sort((a, b) => b.total - a.total)
}

export function byVendor(
  expenses: Expense[],
  vendors: Vendor[],
): Array<{ vendor: Vendor; total: number; count: number }> {
  const map = new Map<string, { total: number; count: number }>()
  for (const e of expenses) {
    if (!e.vendorId) continue
    const cur = map.get(e.vendorId) ?? { total: 0, count: 0 }
    cur.total += e.amount
    cur.count += 1
    map.set(e.vendorId, cur)
  }
  const vendorById = new Map(vendors.map((v) => [v.id, v]))
  return [...map.entries()]
    .map(([id, v]) => ({
      vendor: vendorById.get(id) ?? {
        id,
        name: 'Unknown',
        createdAt: '',
        updatedAt: '',
      },
      total: v.total,
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total)
}

export function byPayment(expenses: Expense[]): Array<{ method: string; total: number }> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const key = e.paymentMethod ?? 'Unspecified'
    map.set(key, (map.get(key) ?? 0) + e.amount)
  }
  return [...map.entries()]
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total)
}

export function byMonth(expenses: Expense[]): Array<{ month: string; total: number }> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const key = monthKey(e.date)
    map.set(key, (map.get(key) ?? 0) + e.amount)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export function materialStats(expenses: Expense[], categoryId: string) {
  const list = expenses
    .filter((e) => e.categoryId === categoryId)
    .sort((a, b) => a.date.localeCompare(b.date))
  const spent = sumBy(list, (e) => e.amount)
  const qty = sumBy(list, (e) => e.quantity ?? 0)
  const unit = list.find((e) => e.unit)?.unit
  const dates = list.map((e) => e.date)
  return {
    spent,
    qty,
    unit,
    avg: qty > 0 ? spent / qty : 0,
    purchases: list.length,
    first: dates[0],
    last: dates[dates.length - 1],
  }
}

export function machineHours(logs: MachineLog[], machineId: string, now = new Date()) {
  const rows = logs.filter((l) => l.machineId === machineId)
  const today = rows.filter((l) => isSameDay(parseISO(l.date), now))
  const weekFrom = startOfWeek(now, { weekStartsOn: 1 })
  const weekTo = endOfWeek(now, { weekStartsOn: 1 })
  const week = rows.filter((l) => {
    const d = parseISO(l.date)
    return d >= weekFrom && d <= weekTo
  })
  const monthFrom = startOfMonth(now)
  const monthTo = endOfMonth(now)
  const month = rows.filter((l) => {
    const d = parseISO(l.date)
    return d >= monthFrom && d <= monthTo
  })
  const hours = (xs: MachineLog[]) => sumBy(xs, (l) => l.hours)
  const cost = (xs: MachineLog[]) => sumBy(xs, (l) => l.hours * l.rate)
  return {
    todayHours: hours(today),
    weekHours: hours(week),
    monthHours: hours(month),
    totalHours: hours(rows),
    todayCost: cost(today),
    weekCost: cost(week),
    monthCost: cost(month),
    totalCost: cost(rows),
    count: rows.length,
  }
}

export function cashFlow(income: Income[], expenses: Expense[]) {
  const received = sumBy(income, (i) => i.amount)
  const spent = sumBy(expenses, (e) => e.amount)
  return { received, spent, balance: received - spent }
}

export function frequentCategoryIds(expenses: Expense[], limit = 8): string[] {
  const map = new Map<string, number>()
  for (const e of expenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + 1)
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)
}

export function recentCategoryIds(expenses: Expense[], limit = 5): string[] {
  const sorted = [...expenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const ids: string[] = []
  for (const e of sorted) {
    if (!ids.includes(e.categoryId)) ids.push(e.categoryId)
    if (ids.length >= limit) break
  }
  return ids
}

export function recentVendorIds(expenses: Expense[], limit = 5): string[] {
  const sorted = [...expenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const ids: string[] = []
  for (const e of sorted) {
    if (e.vendorId && !ids.includes(e.vendorId)) ids.push(e.vendorId)
    if (ids.length >= limit) break
  }
  return ids
}

export function machineCategoryId(machine: Machine, categories: Category[]): string | undefined {
  const exact = categories.find(
    (c) => c.type === 'expense' && c.name.toLowerCase() === machine.name.toLowerCase(),
  )
  return exact?.id ?? categories.find((c) => c.id === 'cat-other-machine')?.id
}
