import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import { exportBackup, importBackup, validateBackup } from '@/db/backup'
import { expensesCSV, incomesCSV, logsCSV, downloadJSON, downloadText } from '@/db/csv'
import { db } from '@/db/db'
import { clearDemoData, loadDemoData } from '@/db/seed'
import { format } from 'date-fns'
import { Back } from '@/pages/SitesSettingsPage'
import { useRef } from 'react'

export function DataSettingsPage() {
  const { sites, categories, vendors, machines, settings } = useApp()
  const { showToast, openSheet } = useUI()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const modeRef = useRef<'replace' | 'merge'>('merge')

  async function names() {
    return {
      categories: Object.fromEntries(categories.map((c) => [c.id, c.name])),
      vendors: Object.fromEntries(vendors.map((v) => [v.id, v.name])),
      sites: Object.fromEntries(sites.map((s) => [s.id, s.name])),
      machines: Object.fromEntries(machines.map((m) => [m.id, m.name])),
    }
  }

  async function doExport() {
    const backup = await exportBackup()
    downloadJSON(`plot-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, backup)
    showToast({ message: 'Backup exported' })
  }

  async function handleFile(file: File, mode: 'replace' | 'merge') {
    try {
      const raw = JSON.parse(await file.text())
      const backup = validateBackup(raw)
      if (mode === 'replace') {
        const safety = await exportBackup()
        downloadJSON(`plot-tracker-safety-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`, safety)
      }
      await importBackup(backup, mode)
      showToast({ message: mode === 'replace' ? 'Data replaced' : 'Backup merged' })
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : 'Import failed' })
    }
  }

  return (
    <div className="px-4 pb-10">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-1 text-[28px] font-semibold">Data</h1>
      <p className="mb-4 text-[13px] text-[var(--secondary)]">
        Everything lives on this iPhone. Export backups regularly.
      </p>
      <Group>
        <Row label="Export backup" subtitle="JSON of all data" onClick={() => void doExport()} />
        <Row
          label="Import & merge"
          subtitle="Keep existing records"
          onClick={() => {
            modeRef.current = 'merge'
            fileRef.current?.click()
          }}
        />
        <Row
          label="Import & replace"
          subtitle="Downloads a safety copy first"
          onClick={() => {
            openSheet({
              name: 'confirm',
              title: 'Replace all data?',
              message: 'A safety backup will download first. This cannot be silently undone.',
              destructive: true,
              onConfirm: () => {
                modeRef.current = 'replace'
                fileRef.current?.click()
              },
            })
          }}
        />
      </Group>
      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">CSV</div>
      <Group>
        <Row
          label="Export expenses CSV"
          onClick={async () => {
            const n = await names()
            downloadText('expenses.csv', expensesCSV(await db.expenses.toArray(), n), 'text/csv')
          }}
        />
        <Row
          label="Export income CSV"
          onClick={async () => {
            const n = await names()
            downloadText('income.csv', incomesCSV(await db.incomes.toArray(), n), 'text/csv')
          }}
        />
        <Row
          label="Export machine logs CSV"
          onClick={async () => {
            const n = await names()
            downloadText('machine-logs.csv', logsCSV(await db.machineLogs.toArray(), n), 'text/csv')
          }}
        />
      </Group>
      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Sample data</div>
      <Group>
        <Row
          label={settings?.demoDataLoaded ? 'Remove sample data' : 'Load sample data'}
          subtitle="Vista Residency demo — easy to delete"
          onClick={() =>
            void (settings?.demoDataLoaded ? clearDemoData() : loadDemoData()).then(() =>
              showToast({ message: settings?.demoDataLoaded ? 'Sample data removed' : 'Sample data loaded' }),
            )
          }
        />
      </Group>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void handleFile(file, modeRef.current)
        }}
      />
      <p className="mt-6 text-center text-[12px] text-[var(--tertiary)]">No analytics. No cloud. Data never leaves the device unless you export it.</p>
    </div>
  )
}
