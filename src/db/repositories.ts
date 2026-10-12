import { db } from '@/db/db'
import { categoryKey } from '@/db/uniqueCategories'
import type {
  AppSettings,
  Category,
  Expense,
  Income,
  PaymentMethod,
  Site,
  Vendor,
} from '@/types'
import { nid, nowISO } from '@/utils/id'

function stamp() {
  const ts = nowISO()
  return { createdAt: ts, updatedAt: ts }
}

function withoutEmpty<T extends object>(input: T): T {
  const row = { ...input }
  for (const key of Object.keys(row) as (keyof T)[]) {
    if (row[key] === undefined) delete row[key]
  }
  return row
}

export const siteRepo = {
  all: () => db.sites.toArray().then((rows) => rows.sort((a, b) => a.name.localeCompare(b.name))),
  get: (id: string) => db.sites.get(id),
  add: async (input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    const row: Site = { ...stamp(), ...input, id: input.id ?? nid() }
    await db.sites.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Site>) => {
    await db.sites.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.transaction('rw', db.sites, db.expenses, db.incomes, async () => {
      await db.sites.delete(id)
      await db.expenses.where('siteId').equals(id).modify((row) => {
        delete row.siteId
      })
      await db.incomes.where('siteId').equals(id).modify((row) => {
        delete row.siteId
      })
    })
  },
}

export const expenseRepo = {
  all: () => db.expenses.toArray(),
  forSite: (siteId: string) => db.expenses.where('siteId').equals(siteId).toArray(),
  get: (id: string) => db.expenses.get(id),
  add: async (input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    const row: Expense = withoutEmpty({ ...stamp(), ...input, id: input.id ?? nid() })
    await db.expenses.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Expense>) => {
    await db.expenses.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.expenses.delete(id)
  },
  restore: async (row: Expense) => {
    await db.expenses.put(row)
  },
}

export const incomeRepo = {
  all: () => db.incomes.toArray(),
  forSite: (siteId: string) => db.incomes.where('siteId').equals(siteId).toArray(),
  get: (id: string) => db.incomes.get(id),
  add: async (input: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    const row: Income = withoutEmpty({ ...stamp(), ...input, id: input.id ?? nid() })
    await db.incomes.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Income>) => {
    await db.incomes.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.incomes.delete(id)
  },
  restore: async (row: Income) => {
    await db.incomes.put(row)
  },
}

export const vendorRepo = {
  all: () => db.vendors.toArray().then((rows) => rows.sort((a, b) => a.name.localeCompare(b.name))),
  get: (id: string) => db.vendors.get(id),
  add: async (input: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    const row: Vendor = { ...stamp(), ...input, id: input.id ?? nid() }
    await db.vendors.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Vendor>) => {
    await db.vendors.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.vendors.delete(id)
  },
  findByName: async (name: string) => {
    const q = name.trim().toLowerCase()
    const all = await db.vendors.toArray()
    return all.filter((v) => v.name.toLowerCase().includes(q))
  },
}

export const categoryRepo = {
  all: () => db.categories.toArray(),
  get: (id: string) => db.categories.get(id),
  add: async (input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const name = input.name.trim().replace(/\s+/g, ' ')
    const key = categoryKey(name)
    const existing = (await db.categories.toArray()).find((c) => categoryKey(c.name) === key)
    if (existing) return existing
    const row: Category = { id: input.id ?? nid(), isCustom: true, ...stamp(), ...input, name, type: 'expense' }
    await db.categories.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Category>) => {
    const name = patch.name?.trim().replace(/\s+/g, ' ')
    if (name) {
      const key = categoryKey(name)
      const clash = (await db.categories.toArray()).find((c) => c.id !== id && categoryKey(c.name) === key)
      if (clash) {
        await db.transaction('rw', db.categories, db.expenses, async () => {
          await db.expenses.where('categoryId').equals(id).modify({ categoryId: clash.id })
          await db.categories.delete(id)
        })
        return
      }
    }
    await db.categories.update(id, { ...patch, ...(name ? { name } : {}), type: 'expense', updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.categories.delete(id)
  },
}

export const settingsRepo = {
  get: () => db.settings.get('app'),
  update: async (patch: Partial<AppSettings>) => {
    const current = (await db.settings.get('app')) ?? {
      id: 'app' as const,
      currency: 'INR' as const,
      theme: 'system' as const,
      haptics: true,
      onboardingComplete: false,
    }
    await db.settings.put({ ...current, ...patch })
  },
  rememberExpense: async (opts: {
    siteId?: string
    categoryId?: string
    paymentMethod?: PaymentMethod
    vendorId?: string
    other?: boolean
  }) => {
    const patch: Partial<AppSettings> = {}
    if (opts.siteId) patch.currentSiteId = opts.siteId
    if (opts.categoryId && opts.other) patch.lastOtherCategoryId = opts.categoryId
    else if (opts.categoryId) patch.lastCategoryId = opts.categoryId
    if (opts.paymentMethod) patch.lastPaymentMethod = opts.paymentMethod
    if (opts.vendorId) patch.lastVendorId = opts.vendorId
    await settingsRepo.update(patch)
  },
}
