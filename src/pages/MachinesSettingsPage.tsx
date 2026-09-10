import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { machineRepo } from '@/db/repositories'
import { Back } from '@/pages/SitesSettingsPage'
import { formatINR } from '@/utils/format'

export function MachinesSettingsPage() {
  const { machines } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()

  return (
    <div className="px-4">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-3 text-[28px] font-semibold">Machines</h1>
      <Group>
        {machines.map((m) => (
          <Row
            key={m.id}
            label={m.name}
            value={`${formatINR(m.defaultRate ?? 0)}/hr`}
            onClick={() => openSheet({ name: 'machine-form', machineId: m.id })}
            trailing={
              <button
                type="button"
                className="text-[12px] text-[var(--expense)]"
                onClick={(e) => {
                  e.stopPropagation()
                  openSheet({
                    name: 'confirm',
                    title: `Delete ${m.name}?`,
                    message: 'This also deletes its hour logs.',
                    destructive: true,
                    onConfirm: () => void machineRepo.remove(m.id),
                  })
                }}
              >
                Delete
              </button>
            }
          />
        ))}
      </Group>
      <button
        type="button"
        className="mt-4 h-12 w-full rounded-[14px] bg-[var(--fill)] font-semibold text-[var(--accent)]"
        onClick={() => openSheet({ name: 'machine-form' })}
      >
        + Add Machine
      </button>
    </div>
  )
}
