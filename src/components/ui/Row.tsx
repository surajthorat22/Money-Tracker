import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Row({
  label,
  value,
  onClick,
  trailing,
  subtitle,
}: {
  label: string
  value?: ReactNode
  subtitle?: string
  onClick?: () => void
  trailing?: ReactNode
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left',
        onClick && 'active:bg-[var(--fill)]',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[16px]">{label}</div>
        {subtitle && <div className="text-[12px] text-[var(--secondary)]">{subtitle}</div>}
      </div>
      {value && <div className="text-[15px] text-[var(--secondary)]">{value}</div>}
      {trailing}
      {onClick && !trailing && <ChevronRight size={18} className="text-[var(--tertiary)]" />}
    </Comp>
  )
}

export function Group({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-[14px] bg-[var(--card-solid)]', className)}>
      {children}
    </div>
  )
}
