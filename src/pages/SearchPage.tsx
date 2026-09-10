import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { formatDateShort } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { Search } from 'lucide-react'

export function SearchPage() {
  const { categories, vendors, machines, sites } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const incomes = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const logs = useLiveQuery(() => db.machineLogs.toArray(), []) ?? []
  const query = q.trim().toLowerCase()

  const results = useMemo(() => {
    if (query.length < 1) return { expenses: [], incomes: [], vendors: [], categories: [], machines: [], logs: [] }
    const match = (s?: string) => (s ?? '').toLowerCase().includes(query)
    const amountMatch = (n: number) => String(n).includes(query.replace(/[₹,]/g, ''))
    return {
      expenses: expenses.filter((e) => {
        const cat = categories.find((c) => c.id === e.categoryId)
        const ven = vendors.find((v) => v.id === e.vendorId)
        return match(cat?.name) || match(ven?.name) || match(e.note) || match(e.date) || match(e.paymentMethod) || amountMatch(e.amount)
      }),
      incomes: incomes.filter((i) => match(i.source) || match(i.note) || match(i.date) || amountMatch(i.amount)),
      vendors: vendors.filter((v) => match(v.name) || match(v.notes) || match(v.phone)),
      categories: categories.filter((c) => match(c.name)),
      machines: machines.filter((m) => match(m.name)),
      logs: logs.filter((l) => {
        const m = machines.find((x) => x.id === l.machineId)
        return match(m?.name) || match(l.operator) || match(l.note) || match(l.date)
      }),
    }
  }, [query, expenses, incomes, vendors, categories, machines, logs])

  return (
    <div className="px-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-[var(--tertiary)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Vendor, amount, note, date…"
          className="h-12 w-full rounded-[14px] bg-[var(--fill)] pl-10 pr-3 text-[16px] outline-none"
        />
      </div>

      {!query && (
        <p className="mt-8 text-center text-[14px] text-[var(--secondary)]">Search expenses, income, vendors, categories, and machines.</p>
      )}

      {query && (
        <div className="mt-4 space-y-4">
          {results.expenses.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId)
            const ven = vendors.find((v) => v.id === e.vendorId)
            const site = sites.find((s) => s.id === e.siteId)
            return (
              <button
                key={e.id}
                type="button"
                className="flex w-full justify-between rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
                onClick={() => openSheet({ name: 'expense-detail', id: e.id })}
              >
                <div>
                  <div className="font-medium">{cat?.name}</div>
                  <div className="text-[12px] text-[var(--secondary)]">
                    {formatDateShort(e.date)} · {ven?.name ?? 'No vendor'} · {site?.name ?? 'Other'}
                  </div>
                </div>
                <div className="tabular font-semibold">{formatINR(e.amount)}</div>
              </button>
            )
          })}
          {results.incomes.map((i) => (
            <button
              key={i.id}
              type="button"
              className="flex w-full justify-between rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
              onClick={() => openSheet({ name: 'income-detail', id: i.id })}
            >
              <div>
                <div className="font-medium">{i.source}</div>
                <div className="text-[12px] text-[var(--secondary)]">{formatDateShort(i.date)}</div>
              </div>
              <div className="tabular font-semibold text-[var(--income)]">{formatINR(i.amount)}</div>
            </button>
          ))}
          {results.vendors.map((v) => (
            <button
              key={v.id}
              type="button"
              className="w-full rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
              onClick={() => nav(`/vendor/${v.id}`)}
            >
              Vendor · {v.name}
            </button>
          ))}
          {results.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
              onClick={() => nav(`/category/${c.id}`)}
            >
              Category · {c.name}
            </button>
          ))}
          {results.machines.map((m) => (
            <button
              key={m.id}
              type="button"
              className="w-full rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
              onClick={() => nav(`/log/${m.id}`)}
            >
              Machine · {m.name}
            </button>
          ))}
          {results.logs.map((l) => {
            const m = machines.find((x) => x.id === l.machineId)
            return (
              <button
                key={l.id}
                type="button"
                className="w-full rounded-[14px] bg-[var(--card-solid)] px-4 py-3 text-left"
                onClick={() => openSheet({ name: 'log-detail', id: l.id })}
              >
                Log · {m?.name ?? 'Machine'} · {formatDateShort(l.date)} · {l.hours} hrs
              </button>
            )
          })}
          {Object.values(results).every((arr) => arr.length === 0) && (
            <p className="text-center text-[14px] text-[var(--secondary)]">No matches.</p>
          )}
        </div>
      )}
    </div>
  )
}
