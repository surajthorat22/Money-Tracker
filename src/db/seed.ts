import { format, subDays } from 'date-fns'
import { db } from '@/db/db'
import { settingsRepo, siteRepo } from '@/db/repositories'
import { todayISO } from '@/utils/dates'
import { nowISO } from '@/utils/id'

export async function loadDemoData(): Promise<void> {
  const existing = await db.sites.get('demo-vista')
  if (existing) return

  const ts = nowISO()
  const today = todayISO()
  const d = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd')

  await db.transaction('rw', db.tables, async () => {
      await siteRepo.add({
        id: 'demo-vista',
        name: 'Vista Residency',
        location: 'Pune',
        budget: 2000000,
        startDate: d(60),
        notes: 'Sample site — safe to delete from Settings → Data.',
        createdAt: ts,
        updatedAt: ts,
      })
      await siteRepo.add({
        id: 'demo-arista',
        name: 'Arista',
        location: 'Pune',
        budget: 900000,
        createdAt: ts,
        updatedAt: ts,
      })

      await db.vendors.bulkAdd([
        { id: 'demo-sachin', name: 'Sachin Carpet', notes: 'Sample vendor', createdAt: ts, updatedAt: ts },
        { id: 'demo-abc', name: 'ABC Cement', createdAt: ts, updatedAt: ts },
        { id: 'demo-xyz', name: 'XYZ Stone', createdAt: ts, updatedAt: ts },
      ])

      const expenses = [
        { id: 'demo-e1', siteId: 'demo-vista', categoryId: 'cat-cement', vendorId: 'demo-abc', amount: 37500, quantity: 420, unit: 'Bags', paymentMethod: 'UPI' as const, date: today, note: 'Cement for road work' },
        { id: 'demo-e2', siteId: 'demo-vista', categoryId: 'cat-jcb', amount: 15750, quantity: 10.5, unit: 'Hours', paymentMethod: 'Cash' as const, date: d(1) },
        { id: 'demo-e3', siteId: 'demo-vista', categoryId: 'cat-stone', vendorId: 'demo-xyz', amount: 50000, quantity: 125, unit: 'Brass', paymentMethod: 'RTGS' as const, date: d(2) },
        { id: 'demo-e4', siteId: 'demo-vista', categoryId: 'cat-tractor', amount: 12500, quantity: 10, unit: 'Hours', paymentMethod: 'UPI' as const, date: d(3) },
        { id: 'demo-e5', siteId: 'demo-vista', categoryId: 'cat-roller', amount: 18000, quantity: 10, unit: 'Hours', paymentMethod: 'Cash' as const, date: d(4) },
        { id: 'demo-e6', siteId: 'demo-vista', categoryId: 'cat-marking', amount: 8000, paymentMethod: 'UPI' as const, date: d(5) },
        { id: 'demo-e7', siteId: 'demo-vista', categoryId: 'cat-labour', amount: 22000, paymentMethod: 'Cash' as const, date: d(1), note: 'Daily labour' },
        { id: 'demo-e8', siteId: 'demo-arista', categoryId: 'cat-cement', vendorId: 'demo-abc', amount: 28000, quantity: 300, unit: 'Bags', paymentMethod: 'NEFT' as const, date: d(6) },
        { id: 'demo-e9', siteId: 'demo-vista', categoryId: 'cat-sand', amount: 42000, quantity: 80, unit: 'Brass', paymentMethod: 'Bank Transfer' as const, date: d(8) },
      ]

      await db.expenses.bulkAdd(
        expenses.map((e) => ({ ...e, createdAt: ts, updatedAt: ts })),
      )

      await db.incomes.bulkAdd([
        {
          id: 'demo-i1',
          siteId: 'demo-vista',
          amount: 100000,
          source: 'Office',
          paymentMethod: 'RTGS',
          date: d(10),
          note: 'Office RTGS',
          createdAt: ts,
          updatedAt: ts,
        },
        {
          id: 'demo-i2',
          siteId: 'demo-vista',
          amount: 50000,
          source: 'Partner',
          paymentMethod: 'NEFT',
          date: d(20),
          createdAt: ts,
          updatedAt: ts,
        },
      ])

      await db.machineLogs.bulkAdd([
        {
          id: 'demo-l1',
          siteId: 'demo-vista',
          machineId: 'mach-jcb',
          date: today,
          hours: 7.5,
          rate: 0,
          operator: 'Ravi',
          createdAt: ts,
          updatedAt: ts,
        },
        {
          id: 'demo-l2',
          siteId: 'demo-vista',
          machineId: 'mach-jcb',
          date: d(1),
          hours: 8,
          rate: 0,
          createdAt: ts,
          updatedAt: ts,
        },
        {
          id: 'demo-l3',
          siteId: 'demo-vista',
          machineId: 'mach-tractor',
          date: d(3),
          hours: 10,
          rate: 0,
          createdAt: ts,
          updatedAt: ts,
        },
        {
          id: 'demo-l4',
          siteId: 'demo-vista',
          machineId: 'mach-roller',
          date: d(4),
          hours: 10,
          rate: 0,
          createdAt: ts,
          updatedAt: ts,
        },
      ])

      await settingsRepo.update({
        currentSiteId: 'demo-vista',
        demoDataLoaded: true,
        lastCategoryId: 'cat-cement',
        lastPaymentMethod: 'UPI',
        lastVendorId: 'demo-sachin',
      })
    },
  )
}

export async function clearDemoData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
      const prefix = 'demo-'
      const del = async (table: { toCollection: () => { filter: (fn: (r: { id: string }) => boolean) => { delete: () => Promise<number> } } }) => {
        await table.toCollection().filter((r) => r.id.startsWith(prefix)).delete()
      }
      await del(db.sites)
      await del(db.vendors)
      await del(db.expenses)
      await del(db.incomes)
      await del(db.machineLogs)
      const settings = await db.settings.get('app')
      if (settings?.currentSiteId?.startsWith(prefix)) {
        const first = await db.sites.toCollection().first()
        await settingsRepo.update({
          currentSiteId: first?.id,
          demoDataLoaded: false,
          lastVendorId: undefined,
        })
      } else {
        await settingsRepo.update({ demoDataLoaded: false })
      }
    },
  )
}
