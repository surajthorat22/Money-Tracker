import type { Expense, Income, MachineLog } from '@/types'

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(filename: string, data: unknown): void {
  downloadText(filename, JSON.stringify(data, null, 2), 'application/json')
}

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCSV(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0] ?? {})
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(',')),
  ]
  return `\uFEFF${lines.join('\n')}`
}

export function expensesCSV(
  expenses: Expense[],
  names: { categories: Record<string, string>; vendors: Record<string, string>; sites: Record<string, string> },
): string {
  return toCSV(
    expenses.map((e) => ({
      Date: e.date,
      Amount: e.amount,
      Category: names.categories[e.categoryId] ?? e.categoryId,
      Vendor: e.vendorId ? names.vendors[e.vendorId] ?? '' : '',
      Site: e.siteId ? names.sites[e.siteId] ?? '' : '',
      Payment: e.paymentMethod ?? '',
      Quantity: e.quantity ?? '',
      Unit: e.unit ?? '',
      Note: e.note ?? '',
    })),
  )
}

export function incomesCSV(
  incomes: Income[],
  names: { sites: Record<string, string> },
): string {
  return toCSV(
    incomes.map((i) => ({
      Date: i.date,
      Amount: i.amount,
      Source: i.source,
      Site: i.siteId ? names.sites[i.siteId] ?? '' : 'General',
      Payment: i.paymentMethod ?? '',
      Note: i.note ?? '',
    })),
  )
}

export function logsCSV(
  logs: MachineLog[],
  names: { machines: Record<string, string>; sites: Record<string, string> },
): string {
  return toCSV(
    logs.map((l) => ({
      Date: l.date,
      Machine: names.machines[l.machineId] ?? l.machineId,
      Site: names.sites[l.siteId] ?? '',
      Hours: l.hours,
      Rate: l.rate,
      Cost: l.hours * l.rate,
      Operator: l.operator ?? '',
      Start: l.startTime ?? '',
      End: l.endTime ?? '',
      Note: l.note ?? '',
    })),
  )
}
