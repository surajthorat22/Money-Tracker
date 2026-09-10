/** Indian grouping: ₹1,25,000 not ₹125,000 */
export function formatINR(amount: number, opts?: { decimals?: boolean }): string {
  if (!Number.isFinite(amount)) return '₹0'
  const negative = amount < 0
  const abs = Math.abs(amount)
  const showDecimals = opts?.decimals ?? abs % 1 !== 0
  const fixed = abs.toFixed(showDecimals ? 2 : 0)
  const [intPart, decPart] = fixed.split('.')
  const grouped = groupIndian(intPart)
  const dec = decPart ? `.${decPart}` : ''
  return `${negative ? '-' : ''}₹${grouped}${dec}`
}

export function groupIndian(intPart: string): string {
  const n = intPart.replace(/^(-)/, '')
  if (n.length <= 3) return n
  const last3 = n.slice(-3)
  const rest = n.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${rest},${last3}`
}

export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_00_00_000) return `${sign}₹${trimNum(abs / 1_00_00_000)}Cr`
  if (abs >= 1_00_000) return `${sign}₹${trimNum(abs / 1_00_000)}L`
  if (abs >= 1_000) return `${sign}₹${trimNum(abs / 1_000)}k`
  return formatINR(amount)
}

function trimNum(n: number): string {
  return n >= 10 ? n.toFixed(0) : n.toFixed(1).replace(/\.0$/, '')
}

export function formatQty(qty: number, unit?: string): string {
  const n = Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/\.?0+$/, '')
  return unit ? `${n} ${unit}` : n
}

export function formatRate(amount: number, unit?: string): string {
  const u = unit ? `/${unit.replace(/s$/, '').toLowerCase()}` : ''
  return `${formatINR(amount)}${u}`
}

export function parseAmountInput(raw: string): number {
  const cleaned = raw.replace(/[₹,\s]/g, '')
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
