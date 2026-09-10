import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { expensesCSV, incomesCSV, logsCSV, downloadText, toCSV } from '@/db/csv'
import { byPayment, byVendor, cashFlow, machineHours, materialStats, siteExpenses } from '@/utils/calc'
import { formatINR } from '@/utils/format'
import { Back } from '@/pages/SitesSettingsPage'
import { Card } from '@/components/ui/Card'

export function ReportsPage() {
  const { currentSite, currentSiteId, categories, vendors, machines, sites } = useApp()
  const nav = useNavigate()
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const incomesAll = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const logsAll = useLiveQuery(() => db.machineLogs.toArray(), []) ?? []
  const expenses = siteExpenses(expensesAll, currentSiteId)
  const incomes = incomesAll.filter((i) => i.siteId === currentSiteId)
  const logs = logsAll.filter((l) => l.siteId === currentSiteId)
  const flow = cashFlow(incomes, expenses)
  const names = {
    categories: Object.fromEntries(categories.map((c) => [c.id, c.name])),
    vendors: Object.fromEntries(vendors.map((v) => [v.id, v.name])),
    sites: Object.fromEntries(sites.map((s) => [s.id, s.name])),
    machines: Object.fromEntries(machines.map((m) => [m.id, m.name])),
  }

  return (
    <div className="px-4 pb-10">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="text-[28px] font-semibold">Reports</h1>
      <p className="text-[13px] text-[var(--secondary)]">{currentSite?.name ?? 'No site'}</p>

      <Card className="mt-4">
        <div className="text-[15px] font-semibold">Site cost</div>
        <div className="mt-2 space-y-1 text-[14px]">
          <div className="flex justify-between"><span>Received</span><span className="tabular">{formatINR(flow.received)}</span></div>
          <div className="flex justify-between"><span>Spent</span><span className="tabular">{formatINR(flow.spent)}</span></div>
          <div className="flex justify-between font-semibold"><span>Balance</span><span className="tabular">{formatINR(flow.balance)}</span></div>
        </div>
      </Card>

      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Export CSV</div>
      <Group>
        <Row label="Site expenses" onClick={() => downloadText('site-expenses.csv', expensesCSV(expenses, names), 'text/csv')} />
        <Row label="Vendor report" onClick={() => downloadText('vendors.csv', toCSV(byVendor(expenses, vendors).map((v) => ({ Vendor: v.vendor.name, Total: v.total, Count: v.count }))), 'text/csv')} />
        <Row
          label="Material report"
          onClick={() => {
            const rows = categories
              .filter((c) => c.type === 'expense')
              .map((c) => {
                const s = materialStats(expenses, c.id)
                return { Category: c.name, Quantity: s.qty, Unit: s.unit ?? '', Spent: s.spent, Average: s.avg, Purchases: s.purchases }
              })
              .filter((r) => r.Purchases > 0)
            downloadText('materials.csv', toCSV(rows), 'text/csv')
          }}
        />
        <Row
          label="Machine report"
          onClick={() => {
            const rows = machines.map((m) => {
              const s = machineHours(logs, m.id)
              return { Machine: m.name, Hours: s.totalHours }
            })
            downloadText('machines.csv', toCSV(rows), 'text/csv')
          }}
        />
        <Row label="Income vs expense" onClick={() => downloadText('cashflow.csv', toCSV([{ Received: flow.received, Spent: flow.spent, Balance: flow.balance }]), 'text/csv')} />
        <Row label="Payment methods" onClick={() => downloadText('payments.csv', toCSV(byPayment(expenses).map((p) => ({ Method: p.method, Total: p.total }))), 'text/csv')} />
        <Row label="All income" onClick={() => downloadText('income.csv', incomesCSV(incomes, names), 'text/csv')} />
        <Row label="All machine logs" onClick={() => downloadText('logs.csv', logsCSV(logs, names), 'text/csv')} />
      </Group>
    </div>
  )
}
