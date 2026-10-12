import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-semibold">Settings</h1>
      <Group>
        <LinkRow to="/settings/sites" label="Sites" />
        <LinkRow to="/settings/categories" label="Categories" />
        <LinkRow to="/settings/vendors" label="Vendors" />
      </Group>
      <Group>
        <LinkRow to="/settings/data" label="Data backup" />
        <LinkRow to="/settings/appearance" label="Appearance" />
        <Row label="Currency" value="₹ INR" />
      </Group>
    </div>
  )
}

function LinkRow({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex min-h-12 items-center justify-between px-4">
      <span className="text-[16px]">{label}</span>
      <ChevronRight size={16} className="text-[var(--secondary)]" />
    </Link>
  )
}
