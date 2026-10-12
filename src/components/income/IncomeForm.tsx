import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { incomeRepo } from '@/db/repositories'
import { INCOME_SOURCES, PAYMENT_METHODS, type PaymentMethod } from '@/types'
import { todayISO } from '@/utils/dates'

const field = 'h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[15px] outline-none'

export function IncomeForm({
  incomeId,
  onSaved,
}: {
  incomeId?: string
  general?: boolean
  onSaved?: () => void
}) {
  const { settings } = useApp()
  const existing = useLiveQuery(() => (incomeId ? db.incomes.get(incomeId) : undefined), [incomeId])
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('Office')
  const [payment, setPayment] = useState<PaymentMethod>(settings?.lastPaymentMethod ?? 'RTGS')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (existing && !hydrated) {
    setAmount(String(existing.amount))
    setSource(existing.source || 'Office')
    setPayment(existing.paymentMethod ?? 'RTGS')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setHydrated(true)
  }

  async function save() {
    const parsed = Number(amount)
    if (!(parsed > 0)) {
      setError('Enter an amount')
      return
    }
    setSaving(true)
    setError('')
    try {
    const payload = {
      amount: parsed,
      source,
      paymentMethod: payment,
      date,
      note: note.trim() || undefined,
    }
    if (incomeId) {
      const row = await db.incomes.get(incomeId)
      if (row) {
        const next = { ...row, ...payload, updatedAt: new Date().toISOString() }
        delete next.siteId
        if (!payload.note) delete next.note
        await db.incomes.put(next)
      }
    } else {
      await incomeRepo.add(payload)
    }
    onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save income')
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
      <p className="text-[13px] text-[var(--secondary)]">Income is shared across every site.</p>
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
        Source
        <select className={`${field} mt-1`} value={source} onChange={(e) => setSource(e.target.value)}>
          {INCOME_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[13px] text-[var(--secondary)]">
          Payment
          <select className={`${field} mt-1`} value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
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
        {saving ? 'Saving…' : incomeId ? 'Save income' : 'Add income'}
      </button>
    </form>
  )
}
