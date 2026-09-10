import { db } from '@/db/db'
import type {
  AppSettings,
  Category,
  Expense,
  Income,
  Machine,
  MachineLog,
  PaymentMethod,
  Site,
  Vendor,
} from '@/types'
import { nid, nowISO } from '@/utils/id'

function stamp() {
  const ts = nowISO()
  return { createdAt: ts, updatedAt: ts }
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
    await db.transaction('rw', db.sites, db.expenses, db.incomes, db.machineLogs, async () => {
      await db.sites.delete(id)
      await db.expenses.where('siteId').equals(id).delete()
      await db.incomes.where('siteId').equals(id).delete()
      await db.machineLogs.where('siteId').equals(id).delete()
    })
  },
}

export const expenseRepo = {
  all: () => db.expenses.toArray(),
  forSite: (siteId: string) => db.expenses.where('siteId').equals(siteId).toArray(),
  get: (id: string) => db.expenses.get(id),
  add: async (input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    const row: Expense = { ...stamp(), ...input, id: input.id ?? nid() }
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
    const row: Income = { ...stamp(), ...input, id: input.id ?? nid() }
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

export const machineRepo = {
  all: () => db.machines.toArray(),
  get: (id: string) => db.machines.get(id),
  add: async (input: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const row: Machine = { id: input.id ?? nid(), ...stamp(), ...input }
    await db.machines.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Machine>) => {
    await db.machines.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.transaction('rw', db.machines, db.machineLogs, async () => {
      await db.machines.delete(id)
      await db.machineLogs.where('machineId').equals(id).delete()
    })
  },
}

export const machineLogRepo = {
  all: () => db.machineLogs.toArray(),
  forSite: (siteId: string) => db.machineLogs.where('siteId').equals(siteId).toArray(),
  forMachine: (siteId: string, machineId: string) =>
    db.machineLogs.where('[siteId+machineId]').equals([siteId, machineId]).toArray(),
  get: (id: string) => db.machineLogs.get(id),
  add: async (input: Omit<MachineLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const row: MachineLog = { id: input.id ?? nid(), ...stamp(), ...input }
    await db.machineLogs.add(row)
    return row
  },
  update: async (id: string, patch: Partial<MachineLog>) => {
    await db.machineLogs.update(id, { ...patch, updatedAt: nowISO() })
  },
  remove: async (id: string) => {
    await db.machineLogs.delete(id)
  },
  restore: async (row: MachineLog) => {
    await db.machineLogs.put(row)
  },
}

export const categoryRepo = {
  all: () => db.categories.toArray(),
  get: (id: string) => db.categories.get(id),
  add: async (input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const row: Category = { id: input.id ?? nid(), isCustom: true, ...stamp(), ...input }
    await db.categories.add(row)
    return row
  },
  update: async (id: string, patch: Partial<Category>) => {
    await db.categories.update(id, { ...patch, updatedAt: nowISO() })
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
