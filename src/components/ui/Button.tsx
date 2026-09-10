import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Button({
  children,
  variant = 'primary',
  block,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  block?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        'pressable inline-flex min-h-12 items-center justify-center rounded-[14px] px-5 text-[17px] font-semibold tracking-tight transition-transform',
        block && 'w-full',
        variant === 'primary' && 'bg-[var(--accent)] text-[#06281c]',
        variant === 'secondary' && 'bg-[var(--fill)] text-[var(--label)]',
        variant === 'ghost' && 'bg-transparent text-[var(--accent)]',
        variant === 'danger' && 'bg-[var(--negative-bg)] text-[var(--expense)]',
        rest.disabled && 'opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
