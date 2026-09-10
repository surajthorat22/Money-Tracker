import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { expenseRepo, machineLogRepo, settingsRepo } from '@/db/repositories'
import { machineCategoryId } from '@/utils/calc'
import { hoursBetween, todayISO } from '@/utils/dates'
import { formatINR } from '@/utils/format'
import { haptic } from '@/utils/haptics'

export function MachineLogForm({
  logId,
  machineId,
  onSaved,
}: {
  logId?: string
  machineId?: string
  onSaved?: () => void
}) {
  const { currentSiteId, machines, categories, settings } = useApp()
  const existing = useLiveQuery(() => (logId ? db.machineLogs.get(logId) : undefined), [logId])
  const [mid, setMid] = useState(machineId ?? settings?.lastMachineId ?? machines[0]?.id)
  const [mode, setMode] = useState<'hours' | 'range'>('hours')
  const [hours, setHours] = useState('8')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:30')
  const [brk, setBrk] = useState('0.5')
  const [rate, setRate] = useState('')
  const [operator, setOperator] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [asExpense, setAsExpense] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)

  const machine = machines.find((m) => m.id === mid)

  if (existing && !hydrated) {
    setMid(existing.machineId)
    setHours(String(existing.hours))
    setStart(existing.startTime ?? '09:00')
    setEnd(existing.endTime ?? '17:30')
    setBrk(String(existing.breakHours ?? 0))
    setRate(String(existing.rate))
    setOperator(existing.operator ?? '')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setMode(existing.startTime ? 'range' : 'hours')
    setAsExpense(!!existing.expenseId)
    setHydrated(true)
  } else if (!hydrated && machine && !rate) {
    setRate(String(machine.defaultRate ?? 0))
    setHydrated(true)
  }

  const computedHours = useMemo(() => {
    if (mode === 'range') return hoursBetween(start, end, Number(brk || 0))
    return Number(hours || 0)
  }, [mode, start, end, brk, hours])

  const r = Number(rate || machine?.defaultRate || 0)
  const cost = computedHours * r

  async function save() {
    if (!currentSiteId || !mid || computedHours <= 0) {
      haptic('warning')
      return
    }
    setSaving(true)
    const payload = {
      siteId: currentSiteId,
      machineId: mid,
      date,
      hours: computedHours,
      startTime: mode === 'range' ? start : undefined,
      endTime: mode === 'range' ? end : undefined,
      breakHours: mode === 'range' ? Number(brk || 0) : undefined,
      rate: r,
      operator: operator.trim() || undefined,
      note: note.trim() || undefined,
    }

    if (logId) {
      await machineLogRepo.update(logId, payload)
      const log = await db.machineLogs.get(logId)
      if (asExpense && !log?.expenseId) {
        const catId = machine ? machineCategoryId(machine, categories) : undefined
        if (catId) {
          const exp = await expenseRepo.add({
            siteId: currentSiteId,
            categoryId: catId,
            amount: cost,
            quantity: computedHours,
            unit: 'Hours',
            paymentMethod: 'Cash',
            date,
            note: `${machine?.name ?? 'Machine'} · ${computedHours} hrs`,
            machineLogId: logId,
          })
          await machineLogRepo.update(logId, { expenseId: exp.id })
        }
      }
    } else {
      const log = await machineLogRepo.add(payload)
      if (asExpense) {
        const catId = machine ? machineCategoryId(machine, categories) : undefined
        if (catId) {
          const exp = await expenseRepo.add({
            siteId: currentSiteId,
            categoryId: catId,
            amount: cost,
            quantity: computedHours,
            unit: 'Hours',
            paymentMethod: 'Cash',
            date,
            note: `${machine?.name ?? 'Machine'} · ${computedHours} hrs${operator ? ` · ${operator}` : ''}`,
            machineLogId: log.id,
          })
          await machineLogRepo.update(log.id, { expenseId: exp.id })
        }
      }
    }
    await settingsRepo.update({ lastMachineId: mid })
    haptic('success')
    setSaving(false)
    onSaved?.()
  }

  return (
    <div className="no-scrollbar max-h-[70vh] overflow-y-auto pb-3">
      <section className="px-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--tertiary)]">
          Machine
        </div>
        <div className="flex flex-wrap gap-1.5">
          {machines.map((m) => (
            <Chip
              key={m.id}
              label={m.name}
              active={mid === m.id}
              onClick={() => {
                setMid(m.id)
                setRate(String(m.defaultRate ?? 0))
              }}
            />
          ))}
        </div>
      </section>

      <div className="mt-3 flex gap-1 px-4">
        <Chip label="Hours" active={mode === 'hours'} onClick={() => setMode('hours')} />
        <Chip label="Start / End" active={mode === 'range'} onClick={() => setMode('range')} />
      </div>

      {mode === 'hours' ? (
        <div className="mt-3 px-4">
          <input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="h-12 w-full rounded-[12px] bg-[var(--fill)] px-3 text-center text-[22px] font-semibold"
          />
          <div className="mt-1 text-center text-[12px] text-[var(--secondary)]">Hours worked</div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 px-4">
          <label className="text-[12px] text-[var(--secondary)]">
            Start
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 h-11 w-full rounded-[12px] bg-[var(--fill)] px-2 text-[15px]"
            />
          </label>
          <label className="text-[12px] text-[var(--secondary)]">
            End
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 h-11 w-full rounded-[12px] bg-[var(--fill)] px-2 text-[15px]"
            />
          </label>
          <label className="text-[12px] text-[var(--secondary)]">
            Break (hrs)
            <input
              inputMode="decimal"
              value={brk}
              onChange={(e) => setBrk(e.target.value)}
              className="mt-1 h-11 w-full rounded-[12px] bg-[var(--fill)] px-2 text-[15px]"
            />
          </label>
        </div>
      )}

      <div className="mt-3 px-4 text-center">
        <div className="text-[13px] text-[var(--secondary)]">
          {computedHours} hrs × {formatINR(r)} ={' '}
          <span className="font-semibold text-[var(--label)]">{formatINR(cost)}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2 px-4">
        <input
          inputMode="decimal"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate per hour"
          className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
        <input
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          placeholder="Operator (optional)"
          className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
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
        <label className="flex min-h-11 items-center justify-between text-[15px]">
          Add this as Expense
          <input type="checkbox" checked={asExpense} onChange={(e) => setAsExpense(e.target.checked)} />
        </label>
      </div>

      <div className="px-4 pt-3">
        <button
          type="button"
          disabled={saving || computedHours <= 0 || !currentSiteId}
          onClick={() => void save()}
          className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)] disabled:opacity-40"
        >
          Save Log
        </button>
      </div>
    </div>
  )
}
