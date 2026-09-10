import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { machineHours } from '@/utils/calc'
import { Gauge } from 'lucide-react'

export function LogPage() {
  const { currentSiteId, machines } = useApp()
  const { openSheet } = useUI()
  const nav = useNavigate()
  const logs = useLiveQuery(
    () => (currentSiteId ? db.machineLogs.where('siteId').equals(currentSiteId).toArray() : []),
    [currentSiteId],
  ) ?? []

  if (!currentSiteId) {
    return (
      <EmptyState
        title="Select a site"
        body="Machine hours are tracked per plot."
        action="Your Sites"
        onAction={() => openSheet({ name: 'site-switcher' })}
      />
    )
  }

  const todayHours = logs
    .filter((l) => l.date === new Date().toISOString().slice(0, 10))
    .reduce((a, l) => a + l.hours, 0)

  return (
    <div className="px-4 pb-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="text-[13px] text-[var(--secondary)]">Hours today</div>
          <div className="tabular text-[32px] font-semibold tracking-tight">{todayHours} hrs</div>
        </div>
        <button
          type="button"
          className="mb-1 h-10 rounded-full bg-[var(--accent)] px-4 text-[14px] font-semibold text-[var(--on-accent)]"
          onClick={() => openSheet({ name: 'log' })}
        >
          + Log hours
        </button>
      </div>
      {machines.length === 0 ? (
        <EmptyState
          title="No machines yet"
          body="Add JCB, tractor, or other machines, then log hours."
          action="+ Add machine"
          onAction={() => openSheet({ name: 'machine-form' })}
          icon={<Gauge size={22} />}
        />
      ) : (
      <div className="mt-4 space-y-3">
        {machines.map((m) => {
          const s = machineHours(logs, m.id)
          return (
            <Card key={m.id} onClick={() => nav(`/log/${m.id}`)}>
              <div className="flex items-start justify-between">
                <div className="text-[17px] font-semibold">{m.name}</div>
                <Gauge size={18} className="text-[var(--tertiary)]" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[11px] text-[var(--tertiary)]">Today</div>
                  <div className="tabular text-[16px] font-semibold">{s.todayHours} hrs</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--tertiary)]">This Week</div>
                  <div className="tabular text-[16px] font-semibold">{s.weekHours} hrs</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--tertiary)]">Total</div>
                  <div className="tabular text-[16px] font-semibold">{s.totalHours} hrs</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      )}
    </div>
  )
}
