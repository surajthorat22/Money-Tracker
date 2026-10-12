import { db } from '@/db/db'
import type { Category } from '@/types'

export function categoryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Keep one category per name and point expenses at the one that stays. */
export async function dedupeCategories(): Promise<void> {
  const cats = await db.categories.toArray()
  const groups = new Map<string, Category[]>()
  for (const cat of cats) {
    const key = categoryKey(cat.name)
    if (!key) continue
    const list = groups.get(key) ?? []
    list.push(cat)
    groups.set(key, list)
  }

  for (const list of groups.values()) {
    if (list.length < 2) continue
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    const keep = list[0]
    const drop = list.slice(1)
    await db.transaction('rw', db.categories, db.expenses, async () => {
      for (const extra of drop) {
        await db.expenses.where('categoryId').equals(extra.id).modify({ categoryId: keep.id })
        await db.categories.delete(extra.id)
      }
    })
  }
}
