import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { db } from '@/db/db'
import { machineHours } from '@/utils/calc'
import { formatINR } from '@/utils/format'
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

  const todayCost = logs
    .filter((l) => l.date === new Date().toISOString().slice(0, 10))
    .reduce((a, l) => a + l.hours * l.rate, 0)

  return (
    <div className="px-4">
      <div className="px-1">
        <div className="text-[13px] text-[var(--secondary)]">Today’s machine cost</div>
        <div className="tabular text-[32px] font-semibold tracking-tight">{formatINR(todayCost)}</div>
      </div>
      <div className="mt-4 space-y-3">
        {machines.map((m) => {
          const s = machineHours(logs, m.id)
          return (
            <Card key={m.id} onClick={() => nav(`/log/${m.id}`)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[17px] font-semibold">{m.name}</div>
                  <div className="text-[12px] text-[var(--secondary)]">
                    {formatINR(m.defaultRate ?? 0)}/hour
                  </div>
                </div>
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
              <div className="mt-2 text-[12px] text-[var(--secondary)]">
                Cost {formatINR(s.totalCost)}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
