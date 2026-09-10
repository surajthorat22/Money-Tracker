import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full rounded-[18px] p-4 text-left',
        'bg-[var(--card-solid)] shadow-[var(--shadow)]',
        onClick && 'pressable',
        className,
      )}
    >
      {children}
    </Comp>
  )
}

export function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'default' | 'income' | 'expense'
}) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] font-medium text-[var(--secondary)]">{label}</div>
      <div
        className={cn(
          'tabular mt-0.5 truncate text-[17px] font-semibold tracking-tight',
          tone === 'income' && 'text-[var(--income)]',
          tone === 'expense' && 'text-[var(--expense)]',
        )}
      >
        {value}
      </div>
    </div>
  )
}
