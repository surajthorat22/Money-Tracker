import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { siteRepo, settingsRepo } from '@/db/repositories'
import { todayISO } from '@/utils/dates'
import { haptic } from '@/utils/haptics'

export function SiteForm({ siteId, onSaved }: { siteId?: string; onSaved?: () => void }) {
  const existing = useLiveQuery(() => (siteId ? db.sites.get(siteId) : undefined), [siteId])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [targetDate, setTargetDate] = useState('')
  const [hydrated, setHydrated] = useState(false)

  if (existing && !hydrated) {
    setName(existing.name)
    setLocation(existing.location ?? '')
    setNotes(existing.notes ?? '')
    setBudget(existing.budget != null ? String(existing.budget) : '')
    setStartDate(existing.startDate ?? '')
    setTargetDate(existing.targetDate ?? '')
    setHydrated(true)
  }

  async function save() {
    if (!name.trim()) {
      haptic('warning')
      return
    }
    const payload = {
      name: name.trim(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
    }
    if (siteId) await siteRepo.update(siteId, payload)
    else {
      const site = await siteRepo.add(payload)
      await settingsRepo.update({ currentSiteId: site.id })
    }
    haptic('success')
    onSaved?.()
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Site name — Vista Residency"
        className="h-12 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        autoFocus
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
      />
      <input
        inputMode="decimal"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="Budget ₹ (optional)"
        className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
      />
      <label className="block text-[12px] text-[var(--secondary)]">
        Start date
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
      </label>
      <label className="block text-[12px] text-[var(--secondary)]">
        Target completion
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mt-1 h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]"
        />
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="min-h-20 w-full rounded-[12px] bg-[var(--fill)] px-3 py-2 text-[16px]"
      />
      <button
        type="button"
        onClick={() => void save()}
        className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)]"
      >
        {siteId ? 'Save Site' : 'Create Site'}
      </button>
    </div>
  )
}
