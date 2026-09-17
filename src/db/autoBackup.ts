import { format } from 'date-fns'
import { exportBackup } from '@/db/backup'
import { db } from '@/db/db'
import { downloadJSON } from '@/db/csv'
import { settingsRepo } from '@/db/repositories'
import type { BackupSnapshot } from '@/types'
import { nid, nowISO } from '@/utils/id'

const KEEP_DAYS = 14
const OPFS_DIR = 'daily-backups'

export async function listSnapshots(): Promise<BackupSnapshot[]> {
  const rows = await db.backupSnapshots.toArray()
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function downloadSnapshot(id: string): Promise<void> {
  const row = await db.backupSnapshots.get(id)
  if (!row) throw new Error('Backup not found')
  downloadJSON(`plot-tracker-backup-${row.day}.json`, JSON.parse(row.json))
}

export async function downloadLatestSnapshot(): Promise<void> {
  const rows = await listSnapshots()
  const latest = rows[0]
  if (!latest) {
    const backup = await exportBackup()
    downloadJSON(`plot-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, backup)
    return
  }
  downloadJSON(`plot-tracker-backup-${latest.day}.json`, JSON.parse(latest.json))
}

async function writeOpfs(day: string, json: string): Promise<void> {
  if (!navigator.storage?.getDirectory) return
  try {
    const root = await navigator.storage.getDirectory()
    const dir = await root.getDirectoryHandle(OPFS_DIR, { create: true })
    const file = await dir.getFileHandle(`plot-tracker-${day}.json`, { create: true })
    const writable = await file.createWritable()
    await writable.write(json)
    await writable.close()
  } catch {
    // OPFS is best-effort on iOS Safari.
  }
}

async function pruneOpfs(keepDays: Set<string>): Promise<void> {
  if (!navigator.storage?.getDirectory) return
  try {
    const root = await navigator.storage.getDirectory()
    const dir = await root.getDirectoryHandle(OPFS_DIR, { create: true })
    const iter = dir as FileSystemDirectoryHandle & {
      entries?: () => AsyncIterableIterator<[string, FileSystemHandle]>
    }
    if (!iter.entries) return
    for await (const [name, handle] of iter.entries()) {
      if (handle.kind !== 'file') continue
      const day = name.replace(/^plot-tracker-/, '').replace(/\.json$/, '')
      if (!keepDays.has(day)) await dir.removeEntry(name)
    }
  } catch {
    // ignore
  }
}

async function writePickedFolder(day: string, json: string): Promise<boolean> {
  const kv = await db.kv.get('backup-folder')
  const handle = kv?.value as FileSystemDirectoryHandle | undefined
  if (!handle?.getFileHandle) return false
  try {
    const file = await handle.getFileHandle(`plot-tracker-${day}.json`, { create: true })
    const writable = await file.createWritable()
    await writable.write(json)
    await writable.close()
    return true
  } catch {
    return false
  }
}

export async function chooseBackupFolder(): Promise<boolean> {
  const picker = window.showDirectoryPicker
  if (!picker) return false
  const handle = await picker({ mode: 'readwrite' })
  await db.kv.put({ id: 'backup-folder', value: handle })
  return true
}

export function canPickBackupFolder(): boolean {
  return typeof window.showDirectoryPicker === 'function'
}

let inflight: Promise<{ created: boolean; day: string }> | null = null

export async function runDailyBackup(force = false): Promise<{ created: boolean; day: string }> {
  if (!force && inflight) return inflight
  const run = actuallyRunDailyBackup(force)
  inflight = run
  try {
    return await run
  } finally {
    if (inflight === run) inflight = null
  }
}

async function actuallyRunDailyBackup(force = false): Promise<{ created: boolean; day: string }> {
  const day = format(new Date(), 'yyyy-MM-dd')
  const settings = await settingsRepo.get()
  if (settings?.autoBackupEnabled === false && !force) {
    return { created: false, day }
  }
  if (!force && settings?.lastAutoBackupDay === day) {
    const existing = await db.backupSnapshots.where('day').equals(day).first()
    if (existing) return { created: false, day }
  }

  const backup = await exportBackup()
  const json = JSON.stringify(backup)
  const row: BackupSnapshot = {
    id: nid(),
    day,
    createdAt: nowISO(),
    bytes: json.length,
    json,
  }

  await db.transaction('rw', db.backupSnapshots, async () => {
    const sameDay = await db.backupSnapshots.where('day').equals(day).toArray()
    await Promise.all(sameDay.map((s) => db.backupSnapshots.delete(s.id)))
    await db.backupSnapshots.add(row)
    const all = await db.backupSnapshots.toArray()
    const keep = [...all].sort((a, b) => b.day.localeCompare(a.day)).slice(0, KEEP_DAYS)
    const keepIds = new Set(keep.map((s) => s.id))
    await Promise.all(all.filter((s) => !keepIds.has(s.id)).map((s) => db.backupSnapshots.delete(s.id)))
  })

  await writeOpfs(day, json)
  await writePickedFolder(day, json)
  const kept = await db.backupSnapshots.toArray()
  await pruneOpfs(new Set(kept.map((s) => s.day)))
  await settingsRepo.update({ lastAutoBackupDay: day })

  try {
    await navigator.storage?.persist?.()
  } catch {
    // ignore
  }

  return { created: true, day }
}
