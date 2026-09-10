import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { categoryRepo } from '@/db/repositories'
import { Back } from '@/pages/SitesSettingsPage'

export function CategoriesSettingsPage() {
  const { categories } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const groups = [...new Set(categories.map((c) => c.group ?? 'Other'))]

  return (
    <div className="px-4 pb-8">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-3 text-[28px] font-semibold">Categories</h1>
      {groups.map((g) => (
        <div key={g} className="mb-4">
          <div className="mb-1 px-1 text-[12px] font-semibold uppercase text-[var(--tertiary)]">{g}</div>
          <Group>
            {categories
              .filter((c) => (c.group ?? 'Other') === g)
              .map((c) => (
                <Row
                  key={c.id}
                  label={c.name}
                  subtitle={c.type === 'other' ? 'Non-site' : c.defaultUnit}
                  onClick={() => openSheet({ name: 'category-form', categoryId: c.id })}
                  trailing={
                    c.isCustom ? (
                      <button
                        type="button"
                        className="text-[12px] text-[var(--expense)]"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSheet({
                            name: 'confirm',
                            title: `Delete ${c.name}?`,
                            message: 'Existing expenses keep their amount but lose this label.',
                            destructive: true,
                            onConfirm: () => void categoryRepo.remove(c.id),
                          })
                        }}
                      >
                        Delete
                      </button>
                    ) : undefined
                  }
                />
              ))}
          </Group>
        </div>
      ))}
      <button
        type="button"
        className="h-12 w-full rounded-[14px] bg-[var(--fill)] font-semibold text-[var(--accent)]"
        onClick={() => openSheet({ name: 'category-form' })}
      >
        + Custom category
      </button>
    </div>
  )
}
