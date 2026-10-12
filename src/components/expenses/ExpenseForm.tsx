import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { categoryRepo, expenseRepo, settingsRepo, vendorRepo } from '@/db/repositories'
import { PAYMENT_METHODS, UNITS, type PaymentMethod } from '@/types'
import { todayISO } from '@/utils/dates'

const field = 'h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[15px] outline-none'

export function ExpenseForm({
  expenseId,
  onSaved,
}: {
  expenseId?: string
  other?: boolean
  onSaved?: () => void
  variant?: 'sheet' | 'page'
}) {
  const { settings, categories, vendors, sites } = useApp()
  const existing = useLiveQuery(() => (expenseId ? db.expenses.get(expenseId) : undefined), [expenseId])

  const [amount, setAmount] = useState('')
  const [siteId, setSiteId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [vendorQuery, setVendorQuery] = useState('')
  const [payment, setPayment] = useState<PaymentMethod | ''>(settings?.lastPaymentMethod ?? 'UPI')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (existing && !hydrated) {
    setAmount(String(existing.amount))
    setSiteId(existing.siteId ?? '')
    setCategoryId(existing.categoryId)
    setVendorId(existing.vendorId ?? '')
    setVendorQuery(vendors.find((v) => v.id === existing.vendorId)?.name ?? '')
    setPayment(existing.paymentMethod ?? '')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setQty(existing.quantity != null ? String(existing.quantity) : '')
    setUnit(existing.unit ?? '')
    setHydrated(true)
  } else if (!expenseId && !hydrated && settings) {
    setCategoryId(settings.lastCategoryId ?? '')
    setPayment(settings.lastPaymentMethod ?? 'UPI')
    setVendorId(settings.lastVendorId ?? '')
    setVendorQuery(vendors.find((v) => v.id === settings.lastVendorId)?.name ?? '')
    setSiteId(settings.currentSiteId && sites.some((s) => s.id === settings.currentSiteId) ? settings.currentSiteId : '')
    setHydrated(true)
  }

  const parsed = Number(amount)
  const selected = categories.find((c) => c.id === categoryId)

  async function save() {
    if (!(parsed > 0) || !categoryId) {
      setError(parsed > 0 ? 'Choose a category' : 'Enter an amount')
      return
    }
    setSaving(true)
    setError('')
    try {
      let vid = vendorId || undefined
      const q = vendorQuery.trim()
      if (q) {
        const match = vendors.find((v) => v.name.toLowerCase() === q.toLowerCase())
        vid = match?.id ?? (await vendorRepo.add({ name: q })).id
      } else {
        vid = undefined
      }
      const payload = {
        siteId: siteId || undefined,
        categoryId,
        vendorId: vid,
        amount: parsed,
        quantity: qty ? Number(qty) : undefined,
        unit: unit || selected?.defaultUnit,
        paymentMethod: payment || undefined,
        date,
        note: note.trim() || undefined,
      }
      if (expenseId) {
        const row = await db.expenses.get(expenseId)
        if (row) {
          const next = { ...row, ...payload, updatedAt: new Date().toISOString() }
          if (!payload.siteId) delete next.siteId
          if (!payload.vendorId) delete next.vendorId
          if (!payload.quantity) delete next.quantity
          if (!payload.unit) delete next.unit
          if (!payload.note) delete next.note
          if (!payload.paymentMethod) delete next.paymentMethod
          await db.expenses.put(next)
        }
      } else {
        await expenseRepo.add(payload)
      }
      await settingsRepo.rememberExpense({
        siteId: siteId || undefined,
        categoryId,
        paymentMethod: payment || undefined,
        vendorId: vid,
      })
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="space-y-3 px-4 pb-4"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <label className="block text-[13px] text-[var(--secondary)]">
        Amount
        <input
          className={`${field} mt-1 tabular text-[20px] font-semibold`}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          autoFocus
          required
        />
      </label>
      <label className="block text-[13px] text-[var(--secondary)]">
        Site
        <select className={`${field} mt-1`} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">Other (not a site)</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[13px] text-[var(--secondary)]">
        Category
        <select
          className={`${field} mt-1`}
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            const cat = categories.find((c) => c.id === e.target.value)
            if (cat?.defaultUnit) setUnit(cat.defaultUnit)
          }}
          required
        >
          <option value="">Choose category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="text-[13px] text-[var(--accent)]"
        onClick={async () => {
          const name = window.prompt('New category name')
          if (!name?.trim()) return
          const created = await categoryRepo.add({ name: name.trim(), type: 'expense', group: 'Custom', isCustom: true })
          setCategoryId(created.id)
        }}
      >
        Add category
      </button>
      <label className="block text-[13px] text-[var(--secondary)]">
        Vendor
        <input
          className={`${field} mt-1`}
          list="vendor-names"
          value={vendorQuery}
          onChange={(e) => {
            setVendorQuery(e.target.value)
            setVendorId('')
          }}
          placeholder="Optional"
        />
        <datalist id="vendor-names">
          {vendors.map((v) => (
            <option key={v.id} value={v.name} />
          ))}
        </datalist>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[13px] text-[var(--secondary)]">
          Payment
          <select className={`${field} mt-1`} value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] text-[var(--secondary)]">
          Date
          <input className={`${field} mt-1`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[13px] text-[var(--secondary)]">
          Quantity
          <input className={`${field} mt-1`} inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Optional" />
        </label>
        <label className="block text-[13px] text-[var(--secondary)]">
          Unit
          <select className={`${field} mt-1`} value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">—</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-[13px] text-[var(--secondary)]">
        Note
        <input className={`${field} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
      </label>
      {error && <p className="text-[13px] text-[var(--expense)]">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-lg bg-[var(--accent)] text-[15px] font-semibold text-[var(--on-accent)] disabled:opacity-50"
      >
        {saving ? 'Saving…' : expenseId ? 'Save expense' : 'Add expense'}
      </button>
    </form>
  )
}
