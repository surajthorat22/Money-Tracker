import { Plus } from 'lucide-react'
import { haptic } from '@/utils/haptics'

export function FAB({ onClick, label = 'Add' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        haptic('light')
        onClick()
      }}
      className="pressable fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-[var(--on-accent)] shadow-lg md:right-[max(1rem,calc(50vw-215px+1rem))]"
      style={{
        bottom: 'calc(var(--nav-h) + 12px)',
        background: 'var(--accent)',
        boxShadow: '0 10px 24px rgba(0, 122, 255, 0.28)',
      }}
    >
      <Plus size={28} strokeWidth={2.25} />
    </button>
  )
}
