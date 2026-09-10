import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export function EmptyState({
  title,
  body,
  action,
  onAction,
  icon,
}: {
  title: string
  body: string
  action?: string
  onAction?: () => void
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--secondary)]">
          {icon}
        </div>
      )}
      <h3 className="text-[18px] font-semibold">{title}</h3>
      <p className="mt-1 max-w-[260px] text-[14px] leading-5 text-[var(--secondary)]">{body}</p>
      {action && onAction && (
        <div className="mt-5">
          <Button onClick={onAction}>{action}</Button>
        </div>
      )}
    </div>
  )
}
