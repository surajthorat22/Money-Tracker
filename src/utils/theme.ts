const THEME_KEY = 'plot-tracker-theme'

export function isDarkTheme(theme: 'system' | 'light' | 'dark'): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: 'system' | 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* private mode */
  }
  const dark = isDarkTheme(theme)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
  const color = dark ? '#000000' : '#f4f6fa'
  document.documentElement.style.backgroundColor = color
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.body.style.backgroundColor = color
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', color)
}
