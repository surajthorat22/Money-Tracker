import { useEffect, type ReactNode } from 'react'

export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  height?: 'auto' | 'full'
  title?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 my-8 w-full max-w-md rounded-xl bg-[var(--sheet)] shadow-xl"
      >
        {children}
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
    <div className="flex items-center justify-between px-4 py-3">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {trailing}
        {onClose && (
          <button type="button" className="text-[14px] text-[var(--accent)]" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  )
}
