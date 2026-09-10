import { db } from '@/db/db'
import type { BackupFile } from '@/types'
import { nowISO } from '@/utils/id'

const TABLES = [
  'sites',
  'expenses',
  'incomes',
  'vendors',
  'machines',
  'machineLogs',
  'categories',
  'settings',
] as const

export async function exportBackup(): Promise<BackupFile> {
  const [
    sites,
    expenses,
    incomes,
    vendors,
    machines,
    machineLogs,
    categories,
    settings,
  ] = await Promise.all([
    db.sites.toArray(),
    db.expenses.toArray(),
    db.incomes.toArray(),
    db.vendors.toArray(),
    db.machines.toArray(),
    db.machineLogs.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ])

  return {
    version: 1,
    app: 'plot-tracker',
    exportedAt: nowISO(),
    data: {
      sites,
      expenses,
      incomes,
      vendors,
      machines,
      machineLogs,
      categories,
      settings,
    },
  }
}

export function validateBackup(raw: unknown): BackupFile {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid backup file')
  const file = raw as Partial<BackupFile>
  if (file.app !== 'plot-tracker') throw new Error('This file is not a Plot Tracker backup')
  if (file.version !== 1) throw new Error('Unsupported backup version')
  if (!file.data || typeof file.data !== 'object') throw new Error('Backup is missing data')
  for (const key of TABLES) {
    const value = file.data[key]
    if (!Array.isArray(value)) throw new Error(`Backup is missing ${key}`)
  }
  for (const exp of file.data.expenses ?? []) {
    if (typeof exp.id !== 'string' || typeof exp.amount !== 'number' || !exp.categoryId) {
      throw new Error('Backup contains an invalid expense')
    }
  }
  return file as BackupFile
}

export async function importBackup(
  file: BackupFile,
  mode: 'replace' | 'merge',
): Promise<void> {
  if (mode === 'replace') {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map((t) => t.clear()))
      await db.sites.bulkAdd(file.data.sites)
      await db.expenses.bulkAdd(file.data.expenses)
      await db.incomes.bulkAdd(file.data.incomes)
      await db.vendors.bulkAdd(file.data.vendors)
      await db.machines.bulkAdd(file.data.machines)
      await db.machineLogs.bulkAdd(file.data.machineLogs)
      await db.categories.bulkAdd(file.data.categories)
      await db.settings.bulkAdd(file.data.settings.length ? file.data.settings : [])
    })
    return
  }

  await db.transaction('rw', db.tables, async () => {
    await mergeTable(db.sites, file.data.sites)
    await mergeTable(db.expenses, file.data.expenses)
    await mergeTable(db.incomes, file.data.incomes)
    await mergeTable(db.vendors, file.data.vendors)
    await mergeTable(db.machines, file.data.machines)
    await mergeTable(db.machineLogs, file.data.machineLogs)
    await mergeTable(db.categories, file.data.categories)
    if (file.data.settings[0]) {
      const local = await db.settings.get('app')
      await db.settings.put({ ...(local ?? file.data.settings[0]), ...file.data.settings[0] })
    }
  })
}

async function mergeTable<T extends { id: string; updatedAt?: string }>(
  table: { get: (id: string) => Promise<T | undefined>; put: (row: T) => Promise<unknown> },
  rows: T[],
): Promise<void> {
  for (const row of rows) {
    const local = await table.get(row.id)
    if (!local) {
      await table.put(row)
      continue
    }
    if ((row.updatedAt ?? '') >= (local.updatedAt ?? '')) {
      await table.put(row)
    }
  }
}
