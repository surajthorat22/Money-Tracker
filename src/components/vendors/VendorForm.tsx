import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { vendorRepo } from '@/db/repositories'
import { haptic } from '@/utils/haptics'

export function VendorForm({ vendorId, onSaved }: { vendorId?: string; onSaved?: () => void }) {
  const existing = useLiveQuery(() => (vendorId ? db.vendors.get(vendorId) : undefined), [vendorId])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [hydrated, setHydrated] = useState(false)

  if (existing && !hydrated) {
    setName(existing.name)
    setPhone(existing.phone ?? '')
    setNotes(existing.notes ?? '')
    setHydrated(true)
  }

  async function save() {
    if (!name.trim()) return haptic('warning')
    const payload = { name: name.trim(), phone: phone.trim() || undefined, notes: notes.trim() || undefined }
    if (vendorId) await vendorRepo.update(vendorId, payload)
    else await vendorRepo.add(payload)
    haptic('success')
    onSaved?.()
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vendor name" className="h-12 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" autoFocus />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-h-20 w-full rounded-[12px] bg-[var(--fill)] px-3 py-2 text-[16px]" />
      <button type="button" onClick={() => void save()} className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]">
        {vendorId ? 'Save Vendor' : 'Add Vendor'}
      </button>
    </div>
  )
}
