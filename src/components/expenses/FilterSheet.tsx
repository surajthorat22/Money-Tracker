import { Chip } from '@/components/ui/Chip'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { PAYMENT_METHODS, type DatePreset, type SortKey } from '@/types'

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'all', label: 'All Time' },
]

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'highest', label: 'Highest Amount' },
  { id: 'lowest', label: 'Lowest Amount' },
  { id: 'category', label: 'Category' },
  { id: 'vendor', label: 'Vendor' },
]

export function FilterSheet() {
  const { categories, vendors } = useApp()
  const { filters, setFilters, closeSheet } = useUI()
  const expenseCats = categories.filter((c) => c.type === 'expense')

  return (
    <div className="no-scrollbar max-h-[70vh] space-y-4 overflow-y-auto px-4 pb-6">
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Date</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Chip key={p.id} label={p.label} active={filters.preset === p.id} onClick={() => setFilters({ preset: p.id })} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Sort</div>
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map((s) => (
            <Chip key={s.id} label={s.label} active={filters.sort === s.id} onClick={() => setFilters({ sort: s.id })} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Category</div>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="All" active={!filters.categoryId} onClick={() => setFilters({ categoryId: undefined })} />
          {expenseCats.map((c) => (
            <Chip key={c.id} label={c.name} active={filters.categoryId === c.id} onClick={() => setFilters({ categoryId: c.id })} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Vendor</div>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="All" active={!filters.vendorId} onClick={() => setFilters({ vendorId: undefined })} />
          {vendors.map((v) => (
            <Chip key={v.id} label={v.name} active={filters.vendorId === v.id} onClick={() => setFilters({ vendorId: v.id })} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Payment</div>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="All" active={!filters.paymentMethod} onClick={() => setFilters({ paymentMethod: undefined })} />
          {PAYMENT_METHODS.map((m) => (
            <Chip key={m} label={m} active={filters.paymentMethod === m} onClick={() => setFilters({ paymentMethod: m })} />
          ))}
        </div>
      </section>
      <button
        type="button"
        className="h-12 w-full rounded-[14px] bg-[var(--accent)] text-[16px] font-semibold text-[#06281c]"
        onClick={closeSheet}
      >
        Done
      </button>
    </div>
  )
}
