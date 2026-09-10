import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { Back } from '@/pages/SitesSettingsPage'
import type { ThemeMode } from '@/types'

export function AppearanceSettingsPage() {
  const { settings, updateSettings } = useApp()
  const nav = useNavigate()
  const theme = settings?.theme ?? 'system'

  return (
    <div className="px-4">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-3 text-[28px] font-semibold">Appearance</h1>
      <Group>
        {(['system', 'light', 'dark'] as ThemeMode[]).map((t) => (
          <Row
            key={t}
            label={t === 'system' ? 'System' : t === 'light' ? 'Light' : 'Dark'}
            onClick={() => void updateSettings({ theme: t })}
            trailing={theme === t ? <span className="text-[var(--accent)]">●</span> : undefined}
          />
        ))}
      </Group>
      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Haptics</div>
      <Group>
        <Row
          label="Haptic feedback"
          subtitle="Light vibration on save"
          onClick={() => void updateSettings({ haptics: !settings?.haptics })}
          trailing={<span className="text-[13px] text-[var(--secondary)]">{settings?.haptics ? 'On' : 'Off'}</span>}
        />
      </Group>
    </div>
  )
}
