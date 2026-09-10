import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useApp } from '@/context/AppContext'
import { AppearanceSettingsPage } from '@/pages/AppearanceSettingsPage'
import { CategoriesSettingsPage } from '@/pages/CategoriesSettingsPage'
import { CategoryDetailPage } from '@/pages/CategoryDetailPage'
import { DataSettingsPage } from '@/pages/DataSettingsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { IncomePage } from '@/pages/IncomePage'
import { LogPage } from '@/pages/LogPage'
import { MachineDetailPage } from '@/pages/MachineDetailPage'
import { MachinesSettingsPage } from '@/pages/MachinesSettingsPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { OtherPage } from '@/pages/OtherPage'
import { QuickExpensePage } from '@/pages/QuickExpensePage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SitesSettingsPage } from '@/pages/SitesSettingsPage'
import { VendorDetailPage } from '@/pages/VendorDetailPage'
import { VendorsSettingsPage } from '@/pages/VendorsSettingsPage'

const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="px-4 py-10 text-center text-[var(--secondary)]">Loading…</div>}>{children}</Suspense>
}

export default function App() {
  const { ready, settings } = useApp()
  const loc = useLocation()

  if (!ready) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div className="text-center">
          <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Plot Tracker</div>
          <div className="mt-2 text-[15px] text-[var(--secondary)]">Opening your notebook…</div>
        </div>
      </div>
    )
  }

  if (!settings?.onboardingComplete && loc.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="h-full min-h-0">
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/quick-expense" element={<QuickExpensePage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/log/:machineId" element={<MachineDetailPage />} />
        <Route path="/other" element={<OtherPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/sites" element={<SitesSettingsPage />} />
        <Route path="/settings/categories" element={<CategoriesSettingsPage />} />
        <Route path="/settings/vendors" element={<VendorsSettingsPage />} />
        <Route path="/settings/machines" element={<MachinesSettingsPage />} />
        <Route path="/settings/data" element={<DataSettingsPage />} />
        <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
        <Route path="/analytics" element={<Lazy><AnalyticsPage /></Lazy>} />
        <Route path="/reports" element={<Lazy><ReportsPage /></Lazy>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/vendor/:id" element={<VendorDetailPage />} />
      </Route>
    </Routes>
    </div>
  )
}
