import { endOfMonth, parseISO, startOfMonth } from 'date-fns'
import type { Expense } from '@/types'

export function sumBy<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((acc, row) => acc + (pick(row) || 0), 0)
}

export function otherExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => !e.siteId)
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
