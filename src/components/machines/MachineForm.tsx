import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { machineRepo } from '@/db/repositories'
import { haptic } from '@/utils/haptics'

export function MachineForm({ machineId, onSaved }: { machineId?: string; onSaved?: () => void }) {
  const existing = useLiveQuery(() => (machineId ? db.machines.get(machineId) : undefined), [machineId])
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [hydrated, setHydrated] = useState(false)

  if (existing && !hydrated) {
    setName(existing.name)
    setRate(existing.defaultRate != null ? String(existing.defaultRate) : '')
    setHydrated(true)
  }

  async function save() {
    if (!name.trim()) return haptic('warning')
    const payload = { name: name.trim(), defaultRate: rate ? Number(rate) : undefined, rateUnit: 'Hours' }
    if (machineId) await machineRepo.update(machineId, payload)
    else await machineRepo.add(payload)
    haptic('success')
    onSaved?.()
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Machine name — JCB" className="h-12 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" autoFocus />
      <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Default rate ₹ / hour" className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" />
      <button type="button" onClick={() => void save()} className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]">
        {machineId ? 'Save Machine' : 'Add Machine'}
      </button>
    </div>
  )
}
