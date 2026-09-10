import { cn } from '@/utils/cn'

export function Chip({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active?: boolean
  onClick?: () => void
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium',
        active
          ? 'bg-[var(--accent)] text-[#06281c]'
          : 'bg-[var(--fill)] text-[var(--label)]',
      )}
      style={active && color ? { background: color, color: '#06281c' } : undefined}
    >
      {label}
    </button>
  )
}
