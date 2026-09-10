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
      className="pressable absolute right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-[#06281c] shadow-lg"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom))',
        background: 'var(--accent)',
        boxShadow: '0 10px 24px rgba(62, 224, 160, 0.28)',
      }}
    >
      <Plus size={28} strokeWidth={2.25} />
    </button>
  )
}
