import { categoryRepo, expenseRepo, siteRepo, vendorRepo } from '@/db/repositories'
import { PAYMENT_METHODS, type CategoryType, type Expense, type PaymentMethod } from '@/types'
import { todayISO } from '@/utils/dates'
import { downloadText } from '@/db/csv'

type XLSXModule = typeof import('xlsx')

async function xlsxLib(): Promise<XLSXModule> {
  return import('xlsx')
}

function headerKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, '')
}

const COL = {
  date: ['date', 'dated'],
  amount: ['amount', 'amt', 'rs', 'inr', 'spend', 'spent'],
  category: ['category', 'cat', 'type'],
  vendor: ['vendor', 'shop', 'party', 'supplier'],
  site: ['site', 'plot', 'project'],
  payment: ['payment', 'paymentmethod', 'mode', 'method'],
  quantity: ['quantity', 'qty'],
  unit: ['unit', 'uom'],
  note: ['note', 'notes', 'remark', 'remarks', 'description', 'desc'],
  kind: ['kind', 'expensetype', 'bucket'],
} as const

function pick(row: Record<string, unknown>, aliases: readonly string[]): unknown {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.includes(headerKey(key))) return value
  }
  return undefined
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(/[,₹\s]/g, ''))
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function excelDate(value: unknown, XLSX: XLSXModule): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const m = String(parsed.m).padStart(2, '0')
      const d = String(parsed.d).padStart(2, '0')
      return `${parsed.y}-${m}-${d}`
    }
  }
  if (typeof value === 'string') {
    const s = value.trim()
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
    const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (dmy) {
      const dd = dmy[1]!.padStart(2, '0')
      const mm = dmy[2]!.padStart(2, '0')
      return `${dmy[3]}-${mm}-${dd}`
    }
  }
  return undefined
}

function paymentOf(value: unknown): PaymentMethod | undefined {
  if (value == null || value === '') return undefined
  const s = String(value).trim().toLowerCase()
  return PAYMENT_METHODS.find((m) => m.toLowerCase() === s)
}

export async function expensesToWorkbook(
  expenses: Expense[],
  names: { categories: Record<string, string>; vendors: Record<string, string>; sites: Record<string, string> },
): Promise<import('xlsx').WorkBook> {
  const XLSX = await xlsxLib()
  const rows = expenses.map((e) => ({
    Date: e.date,
    Amount: e.amount,
    Category: names.categories[e.categoryId] ?? e.categoryId,
    Vendor: e.vendorId ? names.vendors[e.vendorId] ?? '' : '',
    Site: e.siteId ? names.sites[e.siteId] ?? '' : '',
    Payment: e.paymentMethod ?? '',
    Quantity: e.quantity ?? '',
    Unit: e.unit ?? '',
    Note: e.note ?? '',
    Kind: e.siteId ? 'expense' : 'other',
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Expenses')
  return book
}

export async function downloadWorkbook(filename: string, book: import('xlsx').WorkBook): Promise<void> {
  const XLSX = await xlsxLib()
  const data = XLSX.write(book, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function parseExpenseSheet(file: ArrayBuffer): Promise<Array<Record<string, unknown>>> {
  const XLSX = await xlsxLib()
  const book = XLSX.read(file, { type: 'array', cellDates: true })
  const name = book.SheetNames[0]
  if (!name) return []
  const sheet = book.Sheets[name]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
}

export async function importExpenseRows(
  rows: Array<Record<string, unknown>>,
  opts: {
    fallbackSiteId?: string
    categories: { id: string; name: string; type: CategoryType }[]
    vendors: { id: string; name: string }[]
    sites: { id: string; name: string }[]
  },
): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0
  const cats = [...opts.categories]
  const vendors = [...opts.vendors]
  const sites = [...opts.sites]
  const XLSX = await xlsxLib()

  for (const row of rows) {
    const amount = toNumber(pick(row, COL.amount))
    if (amount == null || amount <= 0) {
      skipped += 1
      continue
    }
    const catName = String(pick(row, COL.category) ?? '').trim()
    if (!catName) {
      skipped += 1
      continue
    }
    const kindRaw = String(pick(row, COL.kind) ?? '').trim().toLowerCase()
    const siteName = String(pick(row, COL.site) ?? '').trim()
    const isOther = kindRaw === 'other' || (!siteName && kindRaw !== 'expense' && !opts.fallbackSiteId)
    const type: CategoryType = isOther ? 'other' : 'expense'

    let category = cats.find((c) => c.name.toLowerCase() === catName.toLowerCase() && c.type === type)
    if (!category) {
      const created = await categoryRepo.add({
        name: catName,
        type,
        group: 'Imported',
        isCustom: true,
      })
      category = created
      cats.push(created)
    }

    let vendorId: string | undefined
    const vendorName = String(pick(row, COL.vendor) ?? '').trim()
    if (vendorName) {
      let vendor = vendors.find((v) => v.name.toLowerCase() === vendorName.toLowerCase())
      if (!vendor) {
        vendor = await vendorRepo.add({ name: vendorName })
        vendors.push(vendor)
      }
      vendorId = vendor.id
    }

    let siteId: string | undefined
    if (!isOther) {
      if (siteName) {
        let site = sites.find((s) => s.name.toLowerCase() === siteName.toLowerCase())
        if (!site) {
          site = await siteRepo.add({ name: siteName })
          sites.push(site)
        }
        siteId = site.id
      } else {
        siteId = opts.fallbackSiteId
      }
    }

    const qty = toNumber(pick(row, COL.quantity))
    const unit = String(pick(row, COL.unit) ?? '').trim() || undefined
    const note = String(pick(row, COL.note) ?? '').trim() || undefined

    await expenseRepo.add({
      siteId,
      categoryId: category.id,
      vendorId,
      amount,
      quantity: qty,
      unit,
      paymentMethod: paymentOf(pick(row, COL.payment)),
      date: excelDate(pick(row, COL.date), XLSX) ?? todayISO(),
      note,
    })
    imported += 1
  }

  return { imported, skipped }
}

export function downloadExpenseTemplate(): void {
  downloadText(
    'expense-import-template.csv',
    '\uFEFFDate,Amount,Category,Vendor,Site,Payment,Quantity,Unit,Note,Kind\n2026-09-17,1500,Cement,Local Mart,Vista Residency,UPI,10,Bags,First floor slab,expense\n',
    'text/csv',
  )
}
