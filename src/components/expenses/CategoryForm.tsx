import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { categoryRepo } from '@/db/repositories'
import { UNITS, type CategoryType } from '@/types'
import { haptic } from '@/utils/haptics'

export function CategoryForm({
  categoryId,
  type = 'expense',
  onSaved,
}: {
  categoryId?: string
  type?: CategoryType
  onSaved?: () => void
}) {
  const existing = useLiveQuery(() => (categoryId ? db.categories.get(categoryId) : undefined), [categoryId])
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [unit, setUnit] = useState('')
  const [kind, setKind] = useState<CategoryType>(type)
  const [hydrated, setHydrated] = useState(false)

  if (existing && !hydrated) {
    setName(existing.name)
    setGroup(existing.group ?? '')
    setUnit(existing.defaultUnit ?? '')
    setKind(existing.type)
    setHydrated(true)
  }

  async function save() {
    if (!name.trim()) return haptic('warning')
    const payload = {
      name: name.trim(),
      type: kind,
      group: group.trim() || (kind === 'other' ? 'Non-site' : 'Custom'),
      defaultUnit: unit || undefined,
      isCustom: true,
    }
    if (categoryId) await categoryRepo.update(categoryId, payload)
    else await categoryRepo.add(payload)
    haptic('success')
    onSaved?.()
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="h-12 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" autoFocus />
      <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Group (optional)" className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]" />
      <select value={kind} onChange={(e) => setKind(e.target.value as CategoryType)} className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]">
        <option value="expense">Site expense</option>
        <option value="other">Non-site / other</option>
      </select>
      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-11 w-full rounded-[12px] bg-[var(--fill)] px-3 text-[16px]">
        <option value="">No default unit</option>
        {UNITS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <button type="button" onClick={() => void save()} className="pressable flex h-12 w-full items-center justify-center rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[var(--on-accent)]">
        {categoryId ? 'Save Category' : 'Add Category'}
      </button>
    </div>
  )
}
