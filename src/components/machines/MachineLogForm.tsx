import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { useApp } from '@/context/AppContext'
import { db } from '@/db/db'
import { machineLogRepo, settingsRepo } from '@/db/repositories'
import { hoursBetween, todayISO } from '@/utils/dates'
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
  const { currentSiteId, machines, settings } = useApp()
  const existing = useLiveQuery(() => (logId ? db.machineLogs.get(logId) : undefined), [logId])
  const [mid, setMid] = useState(machineId ?? settings?.lastMachineId ?? machines[0]?.id)
  const [mode, setMode] = useState<'hours' | 'range'>('hours')
  const [hours, setHours] = useState('8')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:30')
  const [brk, setBrk] = useState('0.5')
  const [operator, setOperator] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)

  if (existing && !hydrated) {
    setMid(existing.machineId)
    setHours(String(existing.hours))
    setStart(existing.startTime ?? '09:00')
    setEnd(existing.endTime ?? '17:30')
    setBrk(String(existing.breakHours ?? 0))
    setOperator(existing.operator ?? '')
    setNote(existing.note ?? '')
    setDate(existing.date)
    setMode(existing.startTime ? 'range' : 'hours')
    setHydrated(true)
  } else if (!hydrated) {
    setHydrated(true)
  }

  const computedHours = useMemo(() => {
    if (mode === 'range') return hoursBetween(start, end, Number(brk || 0))
    return Number(hours || 0)
  }, [mode, start, end, brk, hours])

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
      rate: 0,
      operator: operator.trim() || undefined,
      note: note.trim() || undefined,
    }
    if (logId) await machineLogRepo.update(logId, payload)
    else await machineLogRepo.add(payload)
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
            <Chip key={m.id} label={m.name} active={mid === m.id} onClick={() => setMid(m.id)} />
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

      <div className="mt-3 px-4 text-center text-[15px] font-semibold">{computedHours} hrs</div>

      <div className="mt-3 space-y-2 px-4">
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
      </div>

      <div className="px-4 pt-3">
        <button
          type="button"
          disabled={saving || computedHours <= 0 || !currentSiteId}
          onClick={() => void save()}
          className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)] disabled:opacity-40"
        >
          Save hours
        </button>
      </div>
    </div>
  )
}
