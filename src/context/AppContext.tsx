import { useLiveQuery } from 'dexie-react-hooks'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { db } from '@/db/db'
import { settingsRepo } from '@/db/repositories'
import type { AppSettings, Category, Machine, Site, Vendor } from '@/types'
import { setHapticsEnabled } from '@/utils/haptics'
import { applyTheme } from '@/utils/theme'

type AppState = {
  ready: boolean
  settings: AppSettings | undefined
  sites: Site[]
  categories: Category[]
  vendors: Vendor[]
  machines: Machine[]
  currentSite: Site | undefined
  currentSiteId: string | undefined
  setCurrentSiteId: (id: string) => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const settings = useLiveQuery(() => db.settings.get('app'))
  const sites = useLiveQuery(() => db.sites.toArray(), []) ?? []
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const vendors = useLiveQuery(() => db.vendors.toArray(), []) ?? []
  const machines = useLiveQuery(() => db.machines.toArray(), []) ?? []

  const currentSite =
    sites.find((s) => s.id === settings?.currentSiteId) ??
    [...sites].sort((a, b) => a.name.localeCompare(b.name))[0]

  useEffect(() => {
    if (settings?.theme) applyTheme(settings.theme)
    if (settings) setHapticsEnabled(settings.haptics)
  }, [settings])

  useEffect(() => {
    if (!settings) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(settings.theme)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [settings])

  const setCurrentSiteId = useCallback(async (id: string) => {
    await settingsRepo.update({ currentSiteId: id })
  }, [])

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    await settingsRepo.update(patch)
  }, [])

  const value = useMemo<AppState>(
    () => ({
      ready: settings !== undefined,
      settings,
      sites: [...sites].sort((a, b) => a.name.localeCompare(b.name)),
      categories,
      vendors: [...vendors].sort((a, b) => a.name.localeCompare(b.name)),
      machines,
      currentSite,
      currentSiteId: currentSite?.id,
      setCurrentSiteId,
      updateSettings,
    }),
    [settings, sites, categories, vendors, machines, currentSite, setCurrentSiteId, updateSettings],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
