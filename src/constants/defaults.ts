import type { Category, Machine } from '@/types'
import { nowISO } from '@/utils/id'

export const QUICK_CATEGORY_IDS = [
  'cat-cement',
  'cat-stone',
  'cat-jcb',
  'cat-tractor',
  'cat-roller',
  'cat-labour',
  'cat-marking',
  'cat-transportation',
  'cat-miscellaneous',
] as const

export const DEFAULT_MACHINES: Omit<Machine, 'createdAt' | 'updatedAt'>[] = [
  { id: 'mach-jcb', name: 'JCB', rateUnit: 'Hours' },
  { id: 'mach-tractor', name: 'Tractor', rateUnit: 'Hours' },
  { id: 'mach-roller', name: 'Roller', rateUnit: 'Hours' },
  { id: 'mach-excavator', name: 'Excavator', rateUnit: 'Hours' },
  { id: 'mach-crane', name: 'Crane', rateUnit: 'Hours' },
  { id: 'mach-loader', name: 'Loader', rateUnit: 'Hours' },
  { id: 'mach-other', name: 'Other Machine', rateUnit: 'Hours' },
]

type CatSeed = Omit<Category, 'createdAt' | 'updatedAt'>

export const DEFAULT_CATEGORIES: CatSeed[] = [
  { id: 'cat-cement', name: 'Cement', type: 'expense', group: 'Construction Materials', icon: 'Layers', color: '#94a3b8', defaultUnit: 'Bags' },
  { id: 'cat-sand', name: 'Sand', type: 'expense', group: 'Construction Materials', icon: 'Mountain', color: '#d4a574', defaultUnit: 'Brass' },
  { id: 'cat-stone', name: 'Stone', type: 'expense', group: 'Construction Materials', icon: 'Gem', color: '#78716c', defaultUnit: 'Brass' },
  { id: 'cat-metal', name: 'Metal', type: 'expense', group: 'Construction Materials', icon: 'Hexagon', color: '#64748b', defaultUnit: 'Kg' },
  { id: 'cat-gravel', name: 'Gravel', type: 'expense', group: 'Construction Materials', icon: 'Layers', color: '#a8a29e', defaultUnit: 'Brass' },
  { id: 'cat-bricks', name: 'Bricks', type: 'expense', group: 'Construction Materials', icon: 'Grid3x3', color: '#b45309', defaultUnit: 'Pieces' },
  { id: 'cat-steel', name: 'Steel', type: 'expense', group: 'Construction Materials', icon: 'Minus', color: '#57534e', defaultUnit: 'Kg' },
  { id: 'cat-pipes', name: 'Pipes', type: 'expense', group: 'Construction Materials', icon: 'Minus', color: '#0ea5e9', defaultUnit: 'Pieces' },
  { id: 'cat-electrical', name: 'Electrical', type: 'expense', group: 'Construction Materials', icon: 'Zap', color: '#eab308' },
  { id: 'cat-plumbing', name: 'Plumbing', type: 'expense', group: 'Construction Materials', icon: 'Droplets', color: '#38bdf8' },
  { id: 'cat-other-material', name: 'Other Material', type: 'expense', group: 'Construction Materials', icon: 'Box', color: '#94a3b8' },

  { id: 'cat-jcb', name: 'JCB', type: 'expense', group: 'Machines', icon: 'Truck', color: '#f59e0b', defaultUnit: 'Hours' },
  { id: 'cat-tractor', name: 'Tractor', type: 'expense', group: 'Machines', icon: 'Tractor', color: '#22c55e', defaultUnit: 'Hours' },
  { id: 'cat-roller', name: 'Roller', type: 'expense', group: 'Machines', icon: 'Circle', color: '#f97316', defaultUnit: 'Hours' },
  { id: 'cat-excavator', name: 'Excavator', type: 'expense', group: 'Machines', icon: 'Truck', color: '#eab308', defaultUnit: 'Hours' },
  { id: 'cat-crane', name: 'Crane', type: 'expense', group: 'Machines', icon: 'Building2', color: '#f43f5e', defaultUnit: 'Hours' },
  { id: 'cat-loader', name: 'Loader', type: 'expense', group: 'Machines', icon: 'Truck', color: '#84cc16', defaultUnit: 'Hours' },
  { id: 'cat-other-machine', name: 'Other Machine', type: 'expense', group: 'Machines', icon: 'Cog', color: '#94a3b8', defaultUnit: 'Hours' },

  { id: 'cat-labour', name: 'Labour', type: 'expense', group: 'Labour', icon: 'Users', color: '#38bdf8' },
  { id: 'cat-contractor', name: 'Contractor', type: 'expense', group: 'Labour', icon: 'HardHat', color: '#818cf8' },
  { id: 'cat-supervisor', name: 'Supervisor', type: 'expense', group: 'Labour', icon: 'UserCheck', color: '#22d3ee' },
  { id: 'cat-engineer', name: 'Engineer', type: 'expense', group: 'Labour', icon: 'Ruler', color: '#60a5fa' },
  { id: 'cat-other-labour', name: 'Other Labour', type: 'expense', group: 'Labour', icon: 'Users', color: '#94a3b8' },

  { id: 'cat-marking', name: 'Marking', type: 'expense', group: 'Site Work', icon: 'Flag', color: '#34d399' },
  { id: 'cat-survey', name: 'Survey', type: 'expense', group: 'Site Work', icon: 'Map', color: '#2dd4bf' },
  { id: 'cat-road-work', name: 'Road Work', type: 'expense', group: 'Site Work', icon: 'Route', color: '#fb923c' },
  { id: 'cat-excavation', name: 'Excavation', type: 'expense', group: 'Site Work', icon: 'Shovel', color: '#d97706' },
  { id: 'cat-leveling', name: 'Leveling', type: 'expense', group: 'Site Work', icon: 'AlignVerticalSpaceAround', color: '#a3e635' },
  { id: 'cat-compaction', name: 'Compaction', type: 'expense', group: 'Site Work', icon: 'CircleDot', color: '#facc15' },
  { id: 'cat-drainage', name: 'Drainage', type: 'expense', group: 'Site Work', icon: 'Waves', color: '#06b6d4' },
  { id: 'cat-electricity', name: 'Electricity', type: 'expense', group: 'Site Work', icon: 'Zap', color: '#fde047' },
  { id: 'cat-water', name: 'Water', type: 'expense', group: 'Site Work', icon: 'Droplets', color: '#38bdf8' },
  { id: 'cat-fencing', name: 'Fencing', type: 'expense', group: 'Site Work', icon: 'Fence', color: '#86efac' },
  { id: 'cat-other-site-work', name: 'Other Site Work', type: 'expense', group: 'Site Work', icon: 'LandPlot', color: '#94a3b8' },

  { id: 'cat-government-fees', name: 'Government Fees', type: 'expense', group: 'Other', icon: 'FileBadge', color: '#c084fc' },
  { id: 'cat-documentation', name: 'Documentation', type: 'expense', group: 'Other', icon: 'FileText', color: '#a78bfa' },
  { id: 'cat-transportation', name: 'Transportation', type: 'expense', group: 'Other', icon: 'Truck', color: '#fb7185' },
  { id: 'cat-food', name: 'Food', type: 'expense', group: 'Other', icon: 'Utensils', color: '#f472b6' },
  { id: 'cat-miscellaneous', name: 'Miscellaneous', type: 'expense', group: 'Other', icon: 'Ellipsis', color: '#94a3b8' },

  { id: 'cat-office', name: 'Office', type: 'other', group: 'Non-site', icon: 'Briefcase', color: '#60a5fa' },
  { id: 'cat-travel', name: 'Travel', type: 'other', group: 'Non-site', icon: 'Plane', color: '#22d3ee' },
  { id: 'cat-personal', name: 'Personal', type: 'other', group: 'Non-site', icon: 'User', color: '#a78bfa' },
  { id: 'cat-equipment', name: 'Equipment', type: 'other', group: 'Non-site', icon: 'Wrench', color: '#fb923c' },
  { id: 'cat-other-business', name: 'Other Business', type: 'other', group: 'Non-site', icon: 'Building2', color: '#34d399' },
  { id: 'cat-other-misc', name: 'Other', type: 'other', group: 'Non-site', icon: 'Ellipsis', color: '#94a3b8' },
]

export function stampDefaults(): { categories: Category[]; machines: Machine[] } {
  const ts = nowISO()
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, createdAt: ts, updatedAt: ts })),
    machines: DEFAULT_MACHINES.map((m) => ({ ...m, createdAt: ts, updatedAt: ts })),
  }
}

