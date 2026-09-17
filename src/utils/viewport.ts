/** Keep the app edge-to-edge. Only track the iOS keyboard inset. */
export function installViewport(): () => void {
  const root = document.documentElement

  const sync = () => {
    const vv = window.visualViewport
    const keyboard = vv
      ? Math.max(0, Math.round(window.innerHeight - vv.height - (vv.offsetTop || 0)))
      : 0
    root.style.setProperty('--keyboard-inset', `${keyboard}px`)
  }

  sync()
  window.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('scroll', sync)
  window.addEventListener('orientationchange', sync)

  return () => {
    window.removeEventListener('resize', sync)
    window.visualViewport?.removeEventListener('resize', sync)
    window.visualViewport?.removeEventListener('scroll', sync)
    window.removeEventListener('orientationchange', sync)
  }
}
