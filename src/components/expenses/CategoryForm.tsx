import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/db/db'
import { categoryRepo } from '@/db/repositories'
import { categoryKey } from '@/db/uniqueCategories'
import { UNITS } from '@/types'

const field = 'h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[15px] outline-none'

export function CategoryForm({
  categoryId,
  onSaved,
}: {
  categoryId?: string
  type?: 'expense' | 'other'
  onSaved?: () => void
}) {
  const existing = useLiveQuery(() => (categoryId ? db.categories.get(categoryId) : undefined), [categoryId])
  const all = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [unit, setUnit] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState('')

  if (existing && !hydrated) {
    setName(existing.name)
    setGroup(existing.group ?? '')
    setUnit(existing.defaultUnit ?? '')
    setHydrated(true)
  }

  async function save() {
    const trimmed = name.trim().replace(/\s+/g, ' ')
    if (!trimmed) {
      setError('Enter a name')
      return
    }
    const clash = all.find((c) => c.id !== categoryId && categoryKey(c.name) === categoryKey(trimmed))
    if (clash && !categoryId) {
      setError(`“${clash.name}” is already a category`)
      return
    }
    const payload = {
      name: trimmed,
      type: 'expense' as const,
      group: group.trim() || 'Custom',
      defaultUnit: unit || undefined,
      isCustom: true,
    }
    if (categoryId) await categoryRepo.update(categoryId, payload)
    else await categoryRepo.add(payload)
    onSaved?.()
  }

  return (
    <form
      className="space-y-3 px-4 pb-4"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className={field} autoFocus />
      <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Group (optional)" className={field} />
      <select value={unit} onChange={(e) => setUnit(e.target.value)} className={field}>
        <option value="">No default unit</option>
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      {error && <p className="text-[13px] text-[var(--expense)]">{error}</p>}
      <button type="submit" className="h-11 w-full rounded-lg bg-[var(--accent)] font-semibold text-[var(--on-accent)]">
        {categoryId ? 'Save category' : 'Add category'}
      </button>
    </form>
  )
}
