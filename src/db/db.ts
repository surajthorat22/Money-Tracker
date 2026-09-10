import Dexie, { type Table } from 'dexie'
import { stampDefaults } from '@/constants/defaults'
import type {
  AppSettings,
  Category,
  Expense,
  Income,
  Machine,
  MachineLog,
  Site,
  Vendor,
} from '@/types'

export class PlotTrackerDB extends Dexie {
  sites!: Table<Site, string>
  expenses!: Table<Expense, string>
  incomes!: Table<Income, string>
  vendors!: Table<Vendor, string>
  machines!: Table<Machine, string>
  machineLogs!: Table<MachineLog, string>
  categories!: Table<Category, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('plot-tracker')
    this.version(1).stores({
      sites: 'id, name, updatedAt',
      expenses: 'id, siteId, categoryId, vendorId, date, amount, updatedAt, [siteId+date]',
      incomes: 'id, siteId, date, source, updatedAt',
      vendors: 'id, name, updatedAt',
      machines: 'id, name',
      machineLogs: 'id, siteId, machineId, date, [siteId+machineId]',
      categories: 'id, type, name',
      settings: 'id',
    })
  }
}

export const db = new PlotTrackerDB()

const defaultSettings = (): AppSettings => ({
  id: 'app',
  currency: 'INR',
  theme: 'system',
  haptics: true,
  onboardingComplete: false,
})

export async function initDb(): Promise<void> {
  try {
    await db.open()
  } catch (err) {
    console.error('IndexedDB failed to open', err)
    throw err
  }

  const existingSettings = await db.settings.get('app')
  if (!existingSettings) {
    await db.settings.put(defaultSettings())
  }

  const catCount = await db.categories.count()
  if (catCount === 0) {
    const { categories, machines } = stampDefaults()
    await db.categories.bulkAdd(categories)
    const machineCount = await db.machines.count()
    if (machineCount === 0) await db.machines.bulkAdd(machines)
  } else {
    const machineCount = await db.machines.count()
    if (machineCount === 0) {
      const { machines } = stampDefaults()
      await db.machines.bulkAdd(machines)
    }
  }
}

export async function resetDatabase(): Promise<void> {
  await db.delete()
  await db.open()
  await db.settings.put(defaultSettings())
  const { categories, machines } = stampDefaults()
  await db.categories.bulkAdd(categories)
  await db.machines.bulkAdd(machines)
}
