import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Group, Row } from '@/components/ui/Row'
import { useApp } from '@/context/AppContext'
import { useUI } from '@/context/UIContext'
import {
  canPickBackupFolder,
  chooseBackupFolder,
  downloadLatestSnapshot,
  downloadSnapshot,
  listSnapshots,
  runDailyBackup,
} from '@/db/autoBackup'
import { exportBackup, importBackup, validateBackup } from '@/db/backup'
import { expensesCSV, incomesCSV, logsCSV, downloadJSON, downloadText } from '@/db/csv'
import { db } from '@/db/db'
import { downloadExpenseTemplate, downloadWorkbook, expensesToWorkbook, importExpenseRows, parseExpenseSheet } from '@/db/excel'
import { clearDemoData, loadDemoData } from '@/db/seed'
import { format } from 'date-fns'
import { Back } from '@/pages/SitesSettingsPage'
import { useRef } from 'react'

export function DataSettingsPage() {
  const { sites, categories, vendors, machines, settings, currentSiteId, updateSettings } = useApp()
  const { showToast, openSheet } = useUI()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const excelRef = useRef<HTMLInputElement>(null)
  const modeRef = useRef<'replace' | 'merge'>('merge')
  const snapshots = useLiveQuery(() => listSnapshots(), []) ?? []

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

  async function handleExcel(file: File) {
    try {
      const rows = await parseExpenseSheet(await file.arrayBuffer())
      const result = await importExpenseRows(rows, {
        fallbackSiteId: currentSiteId,
        categories,
        vendors,
        sites,
      })
      showToast({
        message:
          result.skipped > 0
            ? `Imported ${result.imported}, skipped ${result.skipped}`
            : `Imported ${result.imported} expenses`,
      })
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : 'Excel import failed' })
    }
  }

  return (
    <div className="px-4 pb-10">
      <Back onClick={() => nav('/settings')} label="Settings" />
      <h1 className="mb-1 text-[28px] font-semibold">Data</h1>
      <p className="mb-4 text-[13px] text-[var(--secondary)]">
        Data stays on this iPhone. A daily backup is saved automatically so you can recover it later.
      </p>
      <Group>
        <Row
          label="Daily auto backup"
          subtitle={
            settings?.lastAutoBackupDay
              ? `Last saved ${settings.lastAutoBackupDay}`
              : 'Saves a snapshot every day you open the app'
          }
          trailing={
            <input
              type="checkbox"
              checked={settings?.autoBackupEnabled !== false}
              onChange={(e) => void updateSettings({ autoBackupEnabled: e.target.checked })}
            />
          }
        />
        <Row
          label="Save latest backup to Files"
          subtitle="JSON copy you can keep in iCloud Drive"
          onClick={() =>
            void downloadLatestSnapshot()
              .then(() => showToast({ message: 'Backup downloaded' }))
              .catch((err: unknown) => showToast({ message: err instanceof Error ? err.message : 'Backup failed' }))
          }
        />
        <Row
          label="Back up now"
          subtitle="Create today’s snapshot immediately"
          onClick={() =>
            void runDailyBackup(true).then(() => showToast({ message: 'Backup saved on this iPhone' }))
          }
        />
        {canPickBackupFolder() && (
          <Row
            label="Choose backup folder"
            subtitle="Desktop browsers can write a file every day"
            onClick={() =>
              void chooseBackupFolder()
                .then((ok) => showToast({ message: ok ? 'Backup folder saved' : 'Folder picker not available' }))
                .catch(() => showToast({ message: 'Folder not selected' }))
            }
          />
        )}
      </Group>
      {snapshots.length > 0 && (
        <>
          <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">
            On-device snapshots
          </div>
          <Group>
            {snapshots.slice(0, 7).map((s) => (
              <Row
                key={s.id}
                label={s.day}
                subtitle={`${Math.max(1, Math.round(s.bytes / 1024))} KB`}
                onClick={() => void downloadSnapshot(s.id).then(() => showToast({ message: `Saved ${s.day}` }))}
              />
            ))}
          </Group>
        </>
      )}
      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Manual backup</div>
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
      <div className="mt-5 mb-2 text-[12px] font-semibold uppercase text-[var(--tertiary)]">Excel</div>
      <Group>
        <Row
          label="Export expenses to Excel"
          subtitle=".xlsx for Numbers, Excel, and Sheets"
          onClick={async () => {
            const n = await names()
            await downloadWorkbook(
              `expenses-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
              await expensesToWorkbook(await db.expenses.toArray(), n),
            )
          }}
        />
        <Row
          label="Import expenses from Excel"
          subtitle="xlsx or csv — Date, Amount, Category, Note"
          onClick={() => excelRef.current?.click()}
        />
        <Row label="Download import template" onClick={() => downloadExpenseTemplate()} />
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
      <input
        ref={excelRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void handleExcel(file)
        }}
      />
      <p className="mt-6 text-center text-[12px] text-[var(--tertiary)]">
        Automatic backups live on this device (and in a folder you pick, if the browser allows it). Use Save to Files
        for iCloud copies.
      </p>
    </div>
  )
}
