import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { machineHours } from '@/utils/calc'
import { formatDateShort } from '@/utils/dates'

export function MachineDetailPage() {
  const { machineId } = useParams()
  const { machines, currentSiteId } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const machine = machines.find((m) => m.id === machineId)
  const logs = useLiveQuery(async () => {
    if (!currentSiteId || !machineId) return []
    const rows = await db.machineLogs.where('[siteId+machineId]').equals([currentSiteId, machineId]).toArray()
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [currentSiteId, machineId]) ?? []

  if (!machine) return <EmptyState title="Machine not found" body="It may have been removed." />
  const s = machineHours(logs, machine.id)

  return (
    <div className="px-4 pb-4">
      <button type="button" className="mb-2 flex items-center gap-1 text-[var(--accent)]" onClick={() => nav('/log')}>
        <ChevronLeft size={18} /> Log
      </button>
      <div className="flex items-end justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight">{machine.name}</h1>
        <button
          type="button"
          className="text-[14px] font-semibold text-[var(--accent)]"
          onClick={() => openSheet({ name: 'log', machineId: machine.id })}
        >
          + Log hours
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Card>
          <div className="text-[12px] text-[var(--secondary)]">Today</div>
          <div className="tabular text-[18px] font-semibold">{s.todayHours} hrs</div>
        </Card>
        <Card>
          <div className="text-[12px] text-[var(--secondary)]">This week</div>
          <div className="tabular text-[18px] font-semibold">{s.weekHours} hrs</div>
        </Card>
        <Card>
          <div className="text-[12px] text-[var(--secondary)]">This month</div>
          <div className="tabular text-[18px] font-semibold">{s.monthHours} hrs</div>
        </Card>
        <Card>
          <div className="text-[12px] text-[var(--secondary)]">Total</div>
          <div className="tabular text-[18px] font-semibold">{s.totalHours} hrs</div>
        </Card>
      </div>

      <h2 className="mt-5 text-[15px] font-semibold">Entries</h2>
      {logs.length === 0 ? (
        <EmptyState
          title={`No ${machine.name} logs`}
          body="Log hours from the site in a few seconds."
          action="+ Log hours"
          onAction={() => openSheet({ name: 'log', machineId: machine.id })}
        />
      ) : (
        <div className="mt-2 overflow-hidden rounded-[16px] bg-[var(--card-solid)]">
          {logs.map((l) => (
            <button
              key={l.id}
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => openSheet({ name: 'log-detail', id: l.id })}
            >
              <div>
                <div className="text-[15px] font-medium">{formatDateShort(l.date)}</div>
                <div className="text-[12px] text-[var(--secondary)]">
                  {l.startTime && l.endTime ? `${l.startTime} – ${l.endTime}` : ''}
                  {l.operator ? `${l.startTime ? ' · ' : ''}${l.operator}` : ''}
                </div>
              </div>
              <div className="tabular font-semibold">{l.hours} hrs</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
