import { Delete } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatINR } from '@/utils/format'
import { haptic } from '@/utils/haptics'

export function NumberPad({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'] as const

  const press = (key: (typeof keys)[number]) => {
    haptic('light')
    if (key === 'back') {
      onChange(value.slice(0, -1))
      return
    }
    if (key === '.' && value.includes('.')) return
    if (value.replace('.', '').length >= 10) return
    if (key === '.' && !value) {
      onChange('0.')
      return
    }
    onChange(value === '0' && key !== '.' ? key : value + key)
  }

  const amount = Number(value || 0)

  return (
    <div>
      <div className="px-4 pb-2 text-center">
        <div className="tabular text-[40px] font-semibold leading-none tracking-tight">
          {value ? formatINR(amount, { decimals: value.includes('.') }) : '₹0'}
        </div>
        <div className="mt-1 text-[12px] text-[var(--tertiary)]">Amount</div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === 'back' ? 'Delete' : key}
            className={cn(
              'num-key flex h-[52px] items-center justify-center rounded-[12px] text-[22px] font-medium',
              'bg-[var(--pad)]',
            )}
            onClick={() => press(key)}
          >
            {key === 'back' ? <Delete size={22} /> : key}
          </button>
        ))}
      </div>
    </div>
  )
}
