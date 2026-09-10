import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { NumberPad } from '@/components/ui/NumberPad'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { incomeRepo } from '@/db/repositories'
import { INCOME_SOURCES, PAYMENT_METHODS, type PaymentMethod } from '@/types'
import { todayISO } from '@/utils/dates'
import { haptic } from '@/utils/haptics'

export function IncomeForm({
  incomeId,
  general,
  onSaved,
}: {
  incomeId?: string
  general?: boolean
  onSaved?: () => void
}) {
  const { currentSiteId, settings } = useApp()
  const existing = useLiveQuery(() => (incomeId ? db.incomes.get(incomeId) : undefined), [incomeId])
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState<string>('Office')
  const [payment, setPayment] = useState<PaymentMethod>(settings?.lastPaymentMethod ?? 'RTGS')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [linkSite, setLinkSite] = useState(!general)
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)

  if (existing && !hydrated) {
    setAmount(String(existing.amount))
    setSource(existing.source)
    setPayment(existing.paymentMethod ?? 'RTGS')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setLinkSite(!!existing.siteId)
    setHydrated(true)
  }

  const parsed = Number(amount || 0)

  async function save() {
    if (parsed <= 0) {
      haptic('warning')
      return
    }
    setSaving(true)
    const payload = {
      siteId: linkSite ? currentSiteId : undefined,
      amount: parsed,
      source,
      paymentMethod: payment,
      date,
      note: note.trim() || undefined,
    }
    if (incomeId) await incomeRepo.update(incomeId, payload)
    else await incomeRepo.add(payload)
    haptic('success')
    setSaving(false)
    onSaved?.()
  }

  return (
    <div>
      <NumberPad value={amount} onChange={setAmount} />
      <section className="mt-3 px-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
          Source
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INCOME_SOURCES.map((s) => (
            <Chip key={s} label={s} active={source === s} onClick={() => setSource(s)} />
          ))}
        </div>
      </section>
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
      <label className="mt-3 flex items-center justify-between px-4 text-[15px]">
        Link to current site
        <input type="checkbox" checked={linkSite} onChange={(e) => setLinkSite(e.target.checked)} />
      </label>
      <div className="mt-3 space-y-2 px-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
      </div>
      <div className="px-4 pt-3 pb-3">
        <button
          type="button"
          disabled={parsed <= 0 || saving}
          onClick={() => void save()}
          className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)] disabled:opacity-40"
        >
          {incomeId ? 'Save changes' : 'Save Income'}
        </button>
      </div>
    </div>
  )
}
