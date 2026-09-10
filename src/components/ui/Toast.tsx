import { useUI } from '@/context/UIContext'

export function ToastHost() {
  const { toast, hideToast } = useUI()
  if (!toast) return null
  return (
    <div
      className="absolute inset-x-4 z-50 flex items-center justify-between rounded-[14px] bg-[#1c1c1e] px-4 py-3 text-white shadow-lg dark:bg-[#2c2c2e]"
      style={{ bottom: 'calc(78px + env(safe-area-inset-bottom))' }}
      role="status"
    >
      <span className="text-[14px] font-medium">{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          className="text-[14px] font-semibold text-[var(--accent)]"
          onClick={() => {
            toast.onAction?.()
            hideToast()
          }}
        >
          {toast.actionLabel}
        </button>
      )}
    </div>
  )
}
