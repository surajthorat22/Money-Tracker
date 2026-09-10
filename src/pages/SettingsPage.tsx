import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'

export function SettingsPage() {
  const { settings } = useApp()
  return (
    <div className="space-y-5 px-4">
      <Group>
        <LinkRow to="/settings/sites" label="Sites" />
        <LinkRow to="/settings/categories" label="Categories" />
        <LinkRow to="/settings/vendors" label="Vendors" />
        <LinkRow to="/settings/machines" label="Machines" />
      </Group>
      <Group>
        <LinkRow to="/settings/data" label="Data backup" />
        <LinkRow to="/reports" label="Reports" />
        <LinkRow to="/analytics" label="Analytics" />
      </Group>
      <Group>
        <LinkRow to="/settings/appearance" label="Appearance" value={settings?.theme} />
        <Row label="Currency" value="₹ INR" />
        <Row
          label="Haptic feedback"
          trailing={
            <span className="text-[13px] text-[var(--secondary)]">{settings?.haptics ? 'On' : 'Off'}</span>
          }
        />
      </Group>
      <Group>
        <Row label="About" subtitle="Plot Tracker · local-first · iPhone PWA" />
      </Group>
    </div>
  )
}

function LinkRow({ to, label, value }: { to: string; label: string; value?: string }) {
  return (
    <Link to={to} className="flex min-h-12 items-center justify-between px-4">
      <span className="text-[16px]">{label}</span>
      <span className="flex items-center gap-1 text-[14px] text-[var(--secondary)]">
        {value}
        <ChevronRight size={16} />
      </span>
    </Link>
  )
}
