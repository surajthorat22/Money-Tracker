import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useApp } from '@/context/AppContext'
import { AppearanceSettingsPage } from '@/pages/AppearanceSettingsPage'
import { CategoriesSettingsPage } from '@/pages/CategoriesSettingsPage'
import { CategoryDetailPage } from '@/pages/CategoryDetailPage'
import { DataSettingsPage } from '@/pages/DataSettingsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { FilterPage } from '@/pages/FilterPage'
import { IncomePage } from '@/pages/IncomePage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SitesSettingsPage } from '@/pages/SitesSettingsPage'
import { VendorDetailPage } from '@/pages/VendorDetailPage'
import { VendorsSettingsPage } from '@/pages/VendorsSettingsPage'

export default function App() {
  const { ready, settings } = useApp()
  const loc = useLocation()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--secondary)]">
        Opening Money Tracker…
      </div>
    )
  }

  if (!settings?.onboardingComplete && loc.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/filter" element={<FilterPage />} />
        <Route path="/search" element={<Navigate to="/filter" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/sites" element={<SitesSettingsPage />} />
        <Route path="/settings/categories" element={<CategoriesSettingsPage />} />
        <Route path="/settings/vendors" element={<VendorsSettingsPage />} />
        <Route path="/settings/data" element={<DataSettingsPage />} />
        <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/vendor/:id" element={<VendorDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
