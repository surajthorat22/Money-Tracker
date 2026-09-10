import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { NumberPad } from '@/components/ui/NumberPad'
import { NamedIcon } from '@/components/ui/NamedIcon'
import { QUICK_CATEGORY_IDS } from '@/constants/defaults'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { categoryRepo, expenseRepo, settingsRepo, vendorRepo } from '@/db/repositories'
import { PAYMENT_METHODS, UNITS, type Category, type Expense, type PaymentMethod } from '@/types'
import { frequentCategoryIds, recentCategoryIds, recentVendorIds } from '@/utils/calc'
import { todayISO } from '@/utils/dates'
import { haptic } from '@/utils/haptics'
import { cn } from '@/utils/cn'

export function ExpenseForm({
  expenseId,
  other,
  onSaved,
  variant = 'sheet',
}: {
  expenseId?: string
  other?: boolean
  onSaved?: () => void
  variant?: 'sheet' | 'page'
}) {
  const { currentSiteId, settings, categories, vendors } = useApp()
  const existing = useLiveQuery(() => (expenseId ? db.expenses.get(expenseId) : undefined), [expenseId])
  const allExpenses = useLiveQuery(() => db.expenses.toArray(), []) ?? []

  const type = other ? 'other' : 'expense'
  const pool = categories.filter((c) => c.type === type)

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [vendorId, setVendorId] = useState<string | undefined>()
  const [vendorQuery, setVendorQuery] = useState('')
  const [payment, setPayment] = useState<PaymentMethod | undefined>(settings?.lastPaymentMethod ?? 'UPI')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [more, setMore] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (existing && !hydrated) {
    setAmount(String(existing.amount))
    setCategoryId(existing.categoryId)
    setVendorId(existing.vendorId)
    setPayment(existing.paymentMethod)
    setNote(existing.note ?? '')
    setDate(existing.date)
    setQty(existing.quantity != null ? String(existing.quantity) : '')
    setUnit(existing.unit ?? '')
    setHydrated(true)
  } else if (!expenseId && !hydrated && settings) {
    setCategoryId(other ? settings.lastOtherCategoryId : settings.lastCategoryId)
    setPayment(settings.lastPaymentMethod ?? 'UPI')
    setVendorId(other ? undefined : settings.lastVendorId)
    setHydrated(true)
  }

  const siteExpenses = allExpenses.filter((e) => (other ? !e.siteId : e.siteId === currentSiteId))
  const freq = frequentCategoryIds(siteExpenses, 8)
  const recentCats = recentCategoryIds(siteExpenses, 5)
  const recentVendors = recentVendorIds(siteExpenses, 5)

  const quick = useMemo(() => {
    const ids = [...freq, ...QUICK_CATEGORY_IDS]
    const unique: Category[] = []
    for (const id of ids) {
      const c = pool.find((x) => x.id === id)
      if (c && !unique.some((u) => u.id === c.id)) unique.push(c)
    }
    for (const c of pool) {
      if (unique.length >= 12) break
      if (!unique.some((u) => u.id === c.id)) unique.push(c)
    }
    return unique
  }, [freq, pool])

  const selected = pool.find((c) => c.id === categoryId)
  const vendorMatches = vendors.filter((v) =>
    v.name.toLowerCase().includes(vendorQuery.trim().toLowerCase()),
  )
  const parsed = Number(amount || 0)
  const canSave = parsed > 0 && !!categoryId && (other || !!currentSiteId) && !saving

  async function save() {
    if (!canSave) {
      setError(!categoryId ? 'Choose a category' : !parsed ? 'Enter an amount' : 'Select a site first')
      haptic('warning')
      return
    }
    setSaving(true)
    setError('')
    try {
      let vid = vendorId
      const q = vendorQuery.trim()
      if (!vid && q) {
        const created = await vendorRepo.add({ name: q })
        vid = created.id
      }
      const payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
        siteId: other ? undefined : currentSiteId,
        categoryId: categoryId!,
        vendorId: vid,
        amount: parsed,
        quantity: qty ? Number(qty) : undefined,
        unit: unit || selected?.defaultUnit,
        paymentMethod: payment,
        date,
        note: note.trim() || undefined,
      }
      if (expenseId) await expenseRepo.update(expenseId, payload)
      else await expenseRepo.add(payload)
      await settingsRepo.rememberExpense({
        siteId: currentSiteId,
        categoryId,
        paymentMethod: payment,
        vendorId: vid,
        other,
      })
      haptic('success')
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('flex flex-col', variant === 'page' && 'min-h-full')}>
      <div className={cn('no-scrollbar flex-1 overflow-y-auto pb-3', variant === 'sheet' && 'max-h-[48vh]')}>
        <NumberPad value={amount} onChange={setAmount} />

        {recentCats.length > 0 && (
          <section className="mt-3 px-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
              Recent
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {recentCats.map((id) => {
                const c = pool.find((x) => x.id === id)
                if (!c) return null
                return (
                  <Chip key={id} label={c.name} active={categoryId === id} onClick={() => setCategoryId(id)} />
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-3 px-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
            Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quick.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id)
                  if (c.defaultUnit) setUnit(c.defaultUnit)
                  haptic('light')
                }}
                className={cn(
                  'flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium',
                  categoryId === c.id
                    ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                    : 'bg-[var(--fill)]',
                )}
              >
                <NamedIcon name={c.icon} size={14} />
                {c.name}
              </button>
            ))}
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-[13px] text-[var(--accent)]">All categories</summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pool.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={categoryId === c.id}
                  onClick={() => {
                    setCategoryId(c.id)
                    if (c.defaultUnit) setUnit(c.defaultUnit)
                  }}
                />
              ))}
              <button
                type="button"
                className="min-h-9 rounded-full bg-[var(--fill)] px-3 text-[13px] text-[var(--accent)]"
                onClick={async () => {
                  const name = window.prompt('New category name')
                  if (!name?.trim()) return
                  const created = await categoryRepo.add({
                    name: name.trim(),
                    type,
                    group: 'Custom',
                    isCustom: true,
                  })
                  setCategoryId(created.id)
                }}
              >
                + Custom
              </button>
            </div>
          </details>
        </section>

        {!other && (
          <section className="mt-3 px-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
              Vendor
            </div>
            {recentVendors.length > 0 && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                {recentVendors.map((id) => {
                  const v = vendors.find((x) => x.id === id)
                  if (!v) return null
                  return (
                    <Chip
                      key={id}
                      label={v.name}
                      active={vendorId === id}
                      onClick={() => {
                        setVendorId(id)
                        setVendorQuery(v.name)
                      }}
                    />
                  )
                })}
              </div>
            )}
            <input
              value={vendorQuery}
              onChange={(e) => {
                setVendorQuery(e.target.value)
                setVendorId(undefined)
              }}
              placeholder="Optional — type a name"
              className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px] outline-none"
            />
            {vendorQuery && !vendorId && vendorMatches.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-[12px] bg-[var(--card-solid)]">
                {vendorMatches.slice(0, 5).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className="flex h-11 w-full items-center px-3 text-left text-[15px] active:bg-[var(--fill)]"
                    onClick={() => {
                      setVendorId(v.id)
                      setVendorQuery(v.name)
                    }}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
            {vendorQuery && !vendorId && !vendorMatches.some((v) => v.name.toLowerCase() === vendorQuery.toLowerCase()) && (
              <div className="mt-1 text-[12px] text-[var(--secondary)]">
                Will create vendor “{vendorQuery.trim()}”
              </div>
            )}
          </section>
        )}

        <section className="mt-3 px-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
            Payment
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <Chip key={m} label={m} active={payment === m} onClick={() => setPayment(m)} />
            ))}
          </div>
        </section>

        <button
          type="button"
          className="mt-3 px-4 text-[13px] text-[var(--accent)]"
          onClick={() => setMore((v) => !v)}
        >
          {more ? 'Less' : 'Date, quantity, note'}
        </button>
        {more && (
          <section className="mt-2 space-y-2 px-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
            />
            <div className="flex gap-2">
              <input
                inputMode="decimal"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qty"
                className="h-11 w-1/2 rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-11 w-1/2 rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
              >
                <option value="">Unit</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
            />
          </section>
        )}
      </div>

      <div className="px-4 pt-2">
        {error && <div className="mb-2 text-center text-[12px] text-[var(--expense)]">{error}</div>}
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void save()}
          className="pressable mb-3 flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)] disabled:opacity-40"
        >
          {saving ? 'Saving…' : expenseId ? 'Save changes' : 'Save Expense'}
        </button>
      </div>
    </div>
  )
}
