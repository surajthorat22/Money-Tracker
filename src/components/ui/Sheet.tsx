import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Sheet({
  open,
  onClose,
  children,
  height = 'auto',
  title,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  height?: 'auto' | 'full'
  title?: string
}) {
  const [shown, setShown] = useState(open)
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    if (open) {
      setShown(true)
      const t = requestAnimationFrame(() => setAnim(true))
      return () => cancelAnimationFrame(t)
    }
    setAnim(false)
    const t = window.setTimeout(() => setShown(false), 380)
    return () => window.clearTimeout(t)
  }, [open])

  if (!shown) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className={cn('backdrop-fade absolute inset-0 bg-black/40', anim && 'open')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'sheet-panel relative z-10 flex min-h-0 w-full flex-col overflow-hidden rounded-t-[22px]',
          height === 'full' ? 'h-[min(96dvh,100%)] max-h-full' : 'max-h-[88%]',
          anim && 'open',
        )}
        style={{
          background: 'var(--sheet)',
          paddingBottom: 'max(var(--safe-bottom), var(--keyboard-inset, 0px))',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex shrink-0 justify-center pt-2 pb-1">
          <div className="h-1.5 w-10 rounded-full bg-[var(--fill-strong)]" />
        </div>
        <div className={cn('flex min-h-0 flex-1 flex-col', height === 'full' ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain')}>{children}</div>
      </div>
    </div>
  )
}

export function SheetHeader({
  title,
  onClose,
  trailing,
}: {
  title: string
  onClose?: () => void
  trailing?: ReactNode
}) {
  return (
    <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-1">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      <div className="flex items-center gap-2">
        {trailing}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-[15px] font-medium text-[var(--accent)]"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
