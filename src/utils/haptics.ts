let enabled = true

export function setHapticsEnabled(value: boolean): void {
  enabled = value
}

export function haptic(kind: 'light' | 'success' | 'warning' = 'light'): void {
  if (!enabled) return
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  if (kind === 'light') navigator.vibrate(10)
  else if (kind === 'success') navigator.vibrate([12, 40, 18])
  else navigator.vibrate([28, 40, 28])
}
