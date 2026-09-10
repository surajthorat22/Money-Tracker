import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Filter, PieChart, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Stat } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { NamedIcon } from '@/components/ui/NamedIcon'
import { SwipeRow } from '@/components/ui/SwipeRow'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { expenseRepo } from '@/db/repositories'
import {
  byCategory,
  cashFlow,
  machineHours,
  siteExpenses,
  sumBy,
  totalsForDay,
  totalsThisMonth,
} from '@/utils/calc'
import { formatDateShort, inRange, presetRange } from '@/utils/dates'
import { formatINR, formatQty } from '@/utils/format'
import { haptic } from '@/utils/haptics'
import type { Expense } from '@/types'

export function ExpensesPage() {
  const { currentSite, currentSiteId, categories, vendors, machines } = useApp()
  const { openSheet, filters, setFilters, undoExpense } = useUI()
  const nav = useNavigate()
  const expensesAll = useLiveQuery(() => db.expenses.toArray(), []) ?? []
  const incomesAll = useLiveQuery(() => db.incomes.toArray(), []) ?? []
  const logsAll = useLiveQuery(() => db.machineLogs.toArray(), []) ?? []

  const expenses = useMemo(
    () => siteExpenses(expensesAll, currentSiteId),
    [expensesAll, currentSiteId],
  )
  const incomes = useMemo(
    () => incomesAll.filter((i) => i.siteId === currentSiteId),
    [incomesAll, currentSiteId],
  )
  const logs = useMemo(
    () => logsAll.filter((l) => l.siteId === currentSiteId),
    [logsAll, currentSiteId],
  )

  const total = sumBy(expenses, (e) => e.amount)
  const month = totalsThisMonth(expenses)
  const today = totalsForDay(expenses, new Date())
  const flow = cashFlow(incomes, expenses)
  const remaining = currentSite?.budget != null ? currentSite.budget - total : undefined
  const breakdown = byCategory(expenses, categories).slice(0, 8)
  const machineSummary = machines
    .map((m) => ({ machine: m, ...machineHours(logs, m.id) }))
    .filter((m) => m.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 4)

  const { from, to } = presetRange(filters.preset)
  const filtered = useMemo(() => {
    let rows = expenses.filter((e) => {
      if (!inRange(e.date, from, to)) return false
      if (filters.categoryId && e.categoryId !== filters.categoryId) return false
      if (filters.vendorId && e.vendorId !== filters.vendorId) return false
      if (filters.paymentMethod && e.paymentMethod !== filters.paymentMethod) return false
      if (filters.minAmount != null && e.amount < filters.minAmount) return false
      if (filters.maxAmount != null && e.amount > filters.maxAmount) return false
      return true
    })
    const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? ''
    const venName = (id?: string) => vendors.find((v) => v.id === id)?.name ?? ''
    rows = [...rows].sort((a, b) => {
      if (filters.sort === 'oldest') return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
      if (filters.sort === 'highest') return b.amount - a.amount
      if (filters.sort === 'lowest') return a.amount - b.amount
      if (filters.sort === 'category') return catName(a.categoryId).localeCompare(catName(b.categoryId))
      if (filters.sort === 'vendor') return venName(a.vendorId).localeCompare(venName(b.vendorId))
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    })
    return rows
  }, [expenses, from, to, filters, categories, vendors])

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of filtered) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return [...map.entries()]
  }, [filtered])

  if (!currentSite) {
    return (
      <EmptyState
        title="No site yet"
        body="Create your first plot to start tracking expenses."
        action="+ Add Site"
        onAction={() => openSheet({ name: 'site-form' })}
      />
    )
  }

  return (
    <div className="px-4">
      <div className="px-1 pt-1">
        <div className="text-[13px] font-medium text-[var(--secondary)]">Total Spent</div>
        <div className="tabular text-[40px] font-semibold leading-tight tracking-tight">{formatINR(total)}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Card>
          <Stat label="This Month" value={formatINR(month)} />
        </Card>
        <Card>
          <Stat label="Today" value={formatINR(today)} />
        </Card>
        <Card>
          <Stat
            label={remaining != null ? 'Remaining' : 'Received'}
            value={formatINR(remaining ?? flow.received)}
            tone={remaining != null && remaining < 0 ? 'expense' : 'income'}
          />
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card>
          <Stat label="Money Received" value={formatINR(flow.received)} tone="income" />
        </Card>
        <Card>
          <Stat label="Balance" value={formatINR(flow.balance)} tone={flow.balance >= 0 ? 'income' : 'expense'} />
        </Card>
        <Card onClick={() => nav('/analytics')}>
          <div className="flex items-center justify-between text-[12px] font-medium text-[var(--secondary)]">
            Analytics <PieChart size={14} />
          </div>
          <div className="mt-1 text-[15px] font-semibold">Reports</div>
        </Card>
      </div>

      <div className="mt-3 flex gap-2">
        <QuickAction label="+ Expense" onClick={() => openSheet({ name: 'expense' })} />
        <QuickAction label="+ Income" onClick={() => openSheet({ name: 'income' })} />
        <QuickAction label="+ Log" onClick={() => openSheet({ name: 'log' })} />
      </div>

      {breakdown.length > 0 && (
        <Card className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-semibold">Breakdown</div>
            <button type="button" className="text-[13px] text-[var(--accent)]" onClick={() => nav('/analytics')}>
              See all
            </button>
          </div>
          <div className="space-y-2">
            {breakdown.slice(0, 6).map((b) => (
              <button
                key={b.category.id}
                type="button"
                className="w-full text-left"
                onClick={() => nav(`/category/${b.category.id}`)}
              >
                <div className="flex items-center justify-between text-[13px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: b.category.color ?? 'var(--accent)' }} />
                    <span className="truncate">{b.category.name}</span>
                  </span>
                  <span className="tabular font-medium">{formatINR(b.total)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--fill)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(6, b.pct)}%`, background: b.category.color ?? 'var(--accent)' }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {machineSummary.length > 0 && (
        <Card className="mt-3">
          <div className="mb-2 text-[15px] font-semibold">Machine Usage</div>
          <div className="space-y-2">
            {machineSummary.map((m) => (
              <button
                key={m.machine.id}
                type="button"
                className="flex w-full items-center justify-between text-[14px]"
                onClick={() => nav(`/log/${m.machine.id}`)}
              >
                <span>{m.machine.name}</span>
                <span className="tabular text-[var(--secondary)]">{m.totalHours} hrs</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Recent</h2>
        <div className="flex items-center gap-1">
          {(['today', 'thisMonth', 'all'] as const).map((p) => (
            <Chip key={p} label={p === 'today' ? 'Today' : p === 'thisMonth' ? 'Month' : 'All'} active={filters.preset === p} onClick={() => setFilters({ preset: p })} />
          ))}
          <button
            type="button"
            aria-label="Filters"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fill)]"
            onClick={() => openSheet({ name: 'filters' })}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          body="Start tracking your first site expense."
          action="+ Add Expense"
          onAction={() => openSheet({ name: 'expense' })}
          icon={<Plus size={22} />}
        />
      ) : (
        <div className="mt-2 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <div className="px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
                {formatDateShort(date)}
              </div>
              {items.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId)
                const vendor = vendors.find((v) => v.id === e.vendorId)
                return (
                  <SwipeRow
                    key={e.id}
                    onDuplicate={() => {
                      haptic('light')
                      void expenseRepo.add({
                        siteId: e.siteId,
                        categoryId: e.categoryId,
                        vendorId: e.vendorId,
                        amount: e.amount,
                        quantity: e.quantity,
                        unit: e.unit,
                        paymentMethod: e.paymentMethod,
                        date: e.date,
                        note: e.note,
                      })
                    }}
                    onDelete={() =>
                      openSheet({
                        name: 'confirm',
                        title: 'Delete expense?',
                        message: 'You can undo this for a few seconds.',
                        destructive: true,
                        onConfirm: () => void undoExpense(e),
                      })
                    }
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                      onClick={() => openSheet({ name: 'expense-detail', id: e.id })}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ background: 'var(--fill)' }}
                      >
                        <NamedIcon name={cat?.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[16px] font-medium">{cat?.name ?? 'Expense'}</span>
                          <span className="tabular text-[16px] font-semibold">{formatINR(e.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[12px] text-[var(--secondary)]">
                          <span className="truncate">
                            {[vendor?.name, e.paymentMethod].filter(Boolean).join(' · ') || '—'}
                            {e.quantity != null ? ` · ${formatQty(e.quantity, e.unit)}` : ''}
                          </span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </button>
                  </SwipeRow>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable min-h-10 flex-1 rounded-full bg-[var(--fill)] text-[13px] font-semibold"
    >
      {label}
    </button>
  )
}
