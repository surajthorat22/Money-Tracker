import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsRepo, siteRepo } from '@/db/repositories'

export function OnboardingPage() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function start() {
    setBusy(true)
    if (name.trim()) {
      const site = await siteRepo.add({ name: name.trim() })
      await settingsRepo.update({ currentSiteId: site.id })
    }
    await settingsRepo.update({ onboardingComplete: true, currency: 'INR' })
    nav('/')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-[28px] font-semibold">Money Tracker</h1>
      <p className="mt-2 text-[15px] leading-6 text-[var(--secondary)]">
        Track office income in one place, then record spending on each site. Other spending is subtracted from the same income.
      </p>
      <label className="mt-6 text-[13px] text-[var(--secondary)]">
        First site (optional)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--bg-elevated)] px-3 text-[16px]"
          placeholder="Site name"
        />
      </label>
      <button
        type="button"
        disabled={busy}
        className="mt-6 h-11 rounded-lg bg-[var(--accent)] font-semibold text-[var(--on-accent)] disabled:opacity-50"
        onClick={() => void start()}
      >
        Start
      </button>
    </div>
  )
}
