import { useRef, useState, type ReactNode, type TouchEvent } from 'react'

export function SwipeRow({
  children,
  onDelete,
  onDuplicate,
}: {
  children: ReactNode
  onDelete: () => void
  onDuplicate: () => void
}) {
  const startX = useRef(0)
  const startY = useRef(0)
  const [x, setX] = useState(0)
  const axis = useRef<'h' | 'v' | null>(null)

  const onStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    axis.current = null
  }

  const onMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    if (!axis.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (axis.current !== 'h') return
    setX(Math.max(-96, Math.min(96, dx)))
  }

  const onEnd = () => {
    if (x > 72) onDuplicate()
    if (x < -72) onDelete()
    setX(0)
    axis.current = null
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-[var(--accent-soft)] text-[13px] font-semibold text-[var(--accent)]">
        Duplicate
      </div>
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-[var(--negative-bg)] text-[13px] font-semibold text-[var(--expense)]">
        Delete
      </div>
      <div
        className="relative bg-[var(--card-solid)]"
        style={{ transform: `translateX(${x}px)`, transition: axis.current ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      >
        {children}
      </div>
    </div>
  )
}
