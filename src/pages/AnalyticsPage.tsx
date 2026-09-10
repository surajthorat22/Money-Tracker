import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { byCategory, byMonth, byPayment, byVendor, cashFlow, siteExpenses } from '@/utils/calc'
import { formatMonth } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { Back } from '@/pages/SitesSettingsPage'

export function AnalyticsPage() {
  const { currentSite, currentSiteId, categories, vendors } = useApp()
  const nav = useNavigate()
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const incomesAll = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const expenses = useMemo(() => siteExpenses(expensesAll, currentSiteId), [expensesAll, currentSiteId])
  const incomes = incomesAll.filter((i) => i.siteId === currentSiteId)
  const flow = cashFlow(incomes, expenses)
  const cats = byCategory(expenses, categories)
  const vendorRows = byVendor(expenses, vendors)
  const pay = byPayment(expenses)
  const months = byMonth(expenses)

  return (
    <div className="px-4 pb-8">
      <Back onClick={() => nav('/')} label="Expenses" />
      <h1 className="text-[28px] font-semibold">Analytics</h1>
      <p className="text-[13px] text-[var(--secondary)]">{currentSite?.name ?? 'No site'}</p>

      <Card className="mt-4">
        <div className="text-[12px] text-[var(--secondary)]">Total Investment</div>
        <div className="tabular text-[28px] font-semibold">{formatINR(flow.spent)}</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
          <div>
            Received
            <div className="tabular font-semibold text-[var(--income)]">{formatINR(flow.received)}</div>
          </div>
          <div>
            Balance
            <div className="tabular font-semibold">{formatINR(flow.balance)}</div>
          </div>
        </div>
      </Card>

      {cats.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[15px] font-semibold">By category</div>
          <div className="mx-auto h-40 w-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cats.map((c) => ({ name: c.category.name, value: c.total }))} dataKey="value" innerRadius={40} outerRadius={70} stroke="none">
                  {cats.map((c) => (
                    <Cell key={c.category.id} fill={c.category.color ?? '#3ee0a0'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {cats.map((c) => (
              <button
                key={c.category.id}
                type="button"
                className="flex w-full justify-between text-[13px]"
                onClick={() => nav(`/category/${c.category.id}`)}
              >
                <span>
                  {c.category.name} · {c.pct.toFixed(0)}%
                </span>
                <span className="tabular font-medium">{formatINR(c.total)}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {vendorRows.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[15px] font-semibold">By vendor</div>
          {vendorRows.map((v) => (
            <button
              key={v.vendor.id}
              type="button"
              className="flex w-full justify-between py-1.5 text-[13px]"
              onClick={() => nav(`/vendor/${v.vendor.id}`)}
            >
              <span>{v.vendor.name}</span>
              <span className="tabular">{formatINR(v.total)}</span>
            </button>
          ))}
        </Card>
      )}

      {pay.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[15px] font-semibold">By payment</div>
          {pay.map((p) => (
            <div key={p.method} className="flex justify-between py-1 text-[13px]">
              <span>{p.method}</span>
              <span className="tabular">{formatINR(p.total)}</span>
            </div>
          ))}
        </Card>
      )}

      {months.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[15px] font-semibold">By month</div>
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={months.map((m) => ({ ...m, label: formatMonth(m.month).slice(0, 3) }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--secondary)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {months.map((m) => (
            <div key={m.month} className="flex justify-between py-1 text-[13px]">
              <span>{formatMonth(m.month)}</span>
              <span className="tabular">{formatINR(m.total)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
