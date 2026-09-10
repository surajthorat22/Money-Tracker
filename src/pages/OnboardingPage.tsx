import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { siteRepo, settingsRepo } from '@/db/repositories'
import { loadDemoData } from '@/db/seed'
import { haptic } from '@/utils/haptics'

export function OnboardingPage() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('Vista Residency')
  const [busy, setBusy] = useState(false)

  async function finish(withDemo: boolean) {
    setBusy(true)
    if (withDemo) {
      await loadDemoData()
    } else if (name.trim()) {
      const site = await siteRepo.add({ name: name.trim() })
      await settingsRepo.update({ currentSiteId: site.id })
    }
    await settingsRepo.update({ onboardingComplete: true, currency: 'INR' })
    haptic('success')
    nav('/')
  }

  return (
    <div className="flex min-h-dvh flex-col px-6" style={{ paddingTop: 'max(48px, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Plot Tracker</div>
      {step === 0 && (
        <div className="mt-8">
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">Welcome to Plot Tracker</h1>
          <p className="mt-3 text-[16px] leading-6 text-[var(--secondary)]">
            A personal notebook for construction-site money. Fast enough to log a payment while you’re still on the plot.
          </p>
          <button type="button" className="pressable mt-10 h-12 w-full rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]" onClick={() => setStep(1)}>
            Continue
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="mt-8">
          <h1 className="text-[34px] font-semibold leading-tight">Create your first site</h1>
          <p className="mt-2 text-[15px] text-[var(--secondary)]">You can add more plots later.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-6 h-12 w-full rounded-[14px] bg-[var(--fill)] px-4 text-[17px]"
            placeholder="Vista Residency"
          />
          <button type="button" className="pressable mt-8 h-12 w-full rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]" onClick={() => setStep(2)}>
            Continue
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="mt-8">
          <h1 className="text-[34px] font-semibold leading-tight">Currency</h1>
          <p className="mt-2 text-[15px] text-[var(--secondary)]">Amounts use Indian numbering: ₹1,25,000.</p>
          <div className="mt-6 rounded-[16px] bg-[var(--card-solid)] px-4 py-4 text-[17px] font-semibold">₹ Indian Rupee</div>
          <button type="button" className="pressable mt-8 h-12 w-full rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]" onClick={() => setStep(3)}>
            Continue
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-8">
          <h1 className="text-[34px] font-semibold leading-tight">Ready</h1>
          <p className="mt-2 text-[15px] leading-6 text-[var(--secondary)]">
            Cement, JCB, labour, and the rest are already set up. Add a custom category whenever you need one.
          </p>
          <button
            type="button"
            disabled={busy}
            className="pressable mt-8 h-12 w-full rounded-[14px] bg-[var(--accent)] text-[17px] font-semibold text-[#06281c]"
            onClick={() => void finish(false)}
          >
            Start tracking
          </button>
          <button
            type="button"
            disabled={busy}
            className="mt-3 h-12 w-full text-[15px] font-medium text-[var(--accent)]"
            onClick={() => void finish(true)}
          >
            Load sample data instead
          </button>
        </div>
      )}
    </div>
  )
}
