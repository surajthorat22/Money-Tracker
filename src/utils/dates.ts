import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from 'date-fns'
import type { DatePreset } from '@/types'

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(iso: string): string {
  try {
    const d = parseISO(iso)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'd MMM yyyy')
  } catch {
    return iso
  }
}

export function formatDateShort(iso: string): string {
  try {
    const d = parseISO(iso)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'd MMM')
  } catch {
    return iso
  }
}

export function formatDateFull(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMMM yyyy')
  } catch {
    return iso
  }
}

export function formatMonth(iso: string): string {
  try {
    return format(parseISO(iso.length === 7 ? `${iso}-01` : iso), 'MMMM yyyy')
  } catch {
    return iso
  }
}

export function hoursBetween(
  start: string,
  end: string,
  breakHours = 0,
): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let hours = eh + em / 60 - (sh + sm / 60)
  if (hours < 0) hours += 24
  return Math.max(0, Math.round((hours - breakHours) * 100) / 100)
}

export function presetRange(preset: DatePreset): { from?: string; to?: string } {
  const now = new Date()
  if (preset === 'all') return {}
  if (preset === 'today') {
    const d = todayISO()
    return { from: d, to: d }
  }
  if (preset === 'yesterday') {
    const d = format(subDays(now, 1), 'yyyy-MM-dd')
    return { from: d, to: d }
  }
  if (preset === 'thisWeek') {
    return {
      from: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    }
  }
  if (preset === 'thisMonth') {
    return {
      from: format(startOfMonth(now), 'yyyy-MM-dd'),
      to: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }
  const last = subMonths(now, 1)
  return {
    from: format(startOfMonth(last), 'yyyy-MM-dd'),
    to: format(endOfMonth(last), 'yyyy-MM-dd'),
  }
}

export function inRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}
