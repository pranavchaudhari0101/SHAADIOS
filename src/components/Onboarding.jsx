import React, { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HelpCircle,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { Brand } from './Brand.jsx'
import { REGIONAL_TEMPLATES } from '../core/weddingState.js'

const allCeremonyOptions = [
  'Roka / Engagement',
  'Mehendi',
  'Haldi',
  'Sangeet / Garba',
  'Cocktail Soiree',
  'Wedding / Muhurtham',
  'Reception',
  'Sundowner Pool Party',
]

const seasons = [
  'November 2026 (Peak Winter)',
  'December 2026 (Peak Winter)',
  'January 2027 (Auspicious Muhurats)',
  'February 2027 (Spring Festive)',
  'Summer / Monsoon 2027',
  'I have an exact date',
]

export function Onboarding({
  step,
  setup,
  setSetup,
  onBack,
  onContinue,
}) {
  const [dateMode, setDateMode] = useState(
    setup.date ? 'exact' : 'season'
  )

  const handleSelectTemplate = (template) => {
    setSetup((prev) => ({
      ...prev,
      templateId: template.id,
      ceremonies: template.ceremonies,
      budget: template.defaultBudget,
      guests: template.defaultGuests,
      booked: template.presetBooked || [],
    }))
  }

  const toggleCeremony = (ceremony) => {
    setSetup((current) => ({
      ...current,
      ceremonies: current.ceremonies.includes(ceremony)
        ? current.ceremonies.filter((item) => item !== ceremony)
        : [...current.ceremonies, ceremony],
    }))
  }

  const toggleBooked = (item) => {
    const booked = setup.booked || []
    setSetup((current) => ({
      ...current,
      booked: booked.includes(item)
        ? booked.filter((b) => b !== item)
        : [...booked, item],
    }))
  }

  const bookedOptions = [
    { name: 'Venue', subtitle: 'e.g. Banquet, Heritage Palace, or Lawn' },
    { name: 'Photography', subtitle: 'e.g. Candid photo & cinematography team' },
    { name: 'Catering', subtitle: 'e.g. Live counters & tasting finalized' },
    { name: 'Decor', subtitle: 'e.g. Floral concepts & stage designer' },
    { name: 'Bridal Makeup', subtitle: 'e.g. Lead bridal artist reserved' },
  ]

  // Dynamic budget calculation demo
  const getBudgetSplits = (budgetStr) => {
    let base = 2500000
    if (budgetStr?.includes('15L')) base = 1500000
    else if (budgetStr?.includes('50L+')) base = 6000000
    else if (budgetStr?.includes('25–50L')) base = 3500000
    else if (budgetStr?.includes('15–25L')) base = 2000000

    return [
      { cat: 'Venue & Banquet', pct: 40, amount: (base * 0.4).toLocaleString('en-IN') },
      { cat: 'Catering & Feasts', pct: 25, amount: (base * 0.25).toLocaleString('en-IN') },
      { cat: 'Decor & Florals', pct: 15, amount: (base * 0.15).toLocaleString('en-IN') },
      { cat: 'Photo & Cinema', pct: 10, amount: (base * 0.1).toLocaleString('en-IN') },
      { cat: 'Buffer & Outfits', pct: 10, amount: (base * 0.1).toLocaleString('en-IN') },
    ]
  }

  const splits = getBudgetSplits(setup.budget)

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Brand />
        <div className="onboarding-progress-pill">
          <span>Step {step} of 4</span>
          <div className="mini-progress-bar">
            <div
              className="mini-progress-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
        <button onClick={onBack} className="text-button">
          {step === 1 ? 'Exit setup' : 'Back'}
        </button>
      </header>

      <main className="onboarding-main">
        {/* Left Column: Contextual Guidance */}
        <section className="onboarding-copy">
          <p className="eyebrow">
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
            INTELLIGENT ONBOARDING
          </p>

          {step === 1 && (
            <>
              <h1>Choose your celebration style & anchor.</h1>
              <p>
                Every culture and wedding format has unique sequence rhythms. Pick a regional template or customize your foundation in seconds.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1>When and which ceremonies?</h1>
              <p>
                Don’t have an exact Muhurat date locked yet? No problem. Pick a seasonal horizon or set the target date to calculate vendor lead-times.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Scale, guests & working budget.</h1>
              <p>
                ShaadiOS instantly creates benchmark splits for Indian vendors so you never overpay advances or discover surprise catering bills.
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <h1>Your pre-flight diagnostics.</h1>
              <p>
                Tell us what is already locked so we immediately unblock subsequent workflows and calculate your high-priority risks.
              </p>
            </>
          )}

          <div className="step-dots" aria-label={`Step ${step} of 4`}>
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className={item <= step ? 'is-filled' : ''}
              ></span>
            ))}
          </div>

          <div className="cultural-guarantee-card">
            <strong>🌸 Culturally Authentic</strong>
            <p>Sequenced specifically for multi-event Indian weddings with family delegation support.</p>
          </div>
        </section>

        {/* Right Column: Interactive Form */}
        <section className="onboarding-form" aria-labelledby="setup-heading">
          {step === 1 && (
            <>
              <h2 id="setup-heading">Select Wedding Style</h2>
              <div className="template-picker-grid">
                {REGIONAL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    className={`template-card ${
                      setup.templateId === tmpl.id ? 'selected' : ''
                    }`}
                    onClick={() => handleSelectTemplate(tmpl)}
                  >
                    <span className="template-icon">{tmpl.icon}</span>
                    <div className="template-text">
                      <strong>{tmpl.name}</strong>
                      <small>{tmpl.tagline}</small>
                    </div>
                    {setup.templateId === tmpl.id && (
                      <span className="template-check">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="form-fields" style={{ marginTop: 24 }}>
                <label>
                  Couple Names
                  <input
                    type="text"
                    placeholder="e.g. Rhea & Arjun"
                    value={setup.couple || ''}
                    onChange={(e) => setSetup({ ...setup, couple: e.target.value })}
                  />
                </label>

                <label>
                  Primary City or Destination <span aria-hidden="true">*</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Udaipur, Delhi NCR, Mumbai, Goa"
                    value={setup.city}
                    onChange={(e) => setSetup({ ...setup, city: e.target.value })}
                  />
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 id="setup-heading">Wedding Date & Ceremonies</h2>

              <div className="date-mode-toggle">
                <button
                  type="button"
                  className={dateMode === 'season' ? 'active' : ''}
                  onClick={() => setDateMode('season')}
                >
                  <Clock size={15} /> Tentative Season
                </button>
                <button
                  type="button"
                  className={dateMode === 'exact' ? 'active' : ''}
                  onClick={() => setDateMode('exact')}
                >
                  <Calendar size={15} /> Fixed Exact Date
                </button>
              </div>

              {dateMode === 'season' ? (
                <div className="season-selector">
                  <label>
                    Target Wedding Month / Horizon
                    <select
                      value={setup.season || seasons[0]}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === 'I have an exact date') {
                          setDateMode('exact')
                        } else {
                          setSetup({ ...setup, season: val, date: '2027-02-18' })
                        }
                      }}
                    >
                      {seasons.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <small className="field-help">
                    You can pick an exact date anytime later; ShaadiOS will adapt automatically.
                  </small>
                </div>
              ) : (
                <label>
                  Anchor Wedding Date <span aria-hidden="true">*</span>
                  <input
                    type="date"
                    value={setup.date}
                    onChange={(e) => setSetup({ ...setup, date: e.target.value })}
                  />
                </label>
              )}

              <div style={{ marginTop: 22 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Select Ceremonies to Include ({setup.ceremonies.length} selected)
                </label>
                <div className="choice-grid">
                  {allCeremonyOptions.map((ceremony) => {
                    const isSelected = setup.ceremonies.includes(ceremony)
                    return (
                      <button
                        key={ceremony}
                        type="button"
                        className={`choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCeremony(ceremony)}
                      >
                        <span className="choice-check">
                          {isSelected && <Check size={14} />}
                        </span>
                        {ceremony}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 id="setup-heading">Scale & Financial Calibration</h2>

              <fieldset>
                <legend>
                  <Users size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Expected Guest Count
                </legend>
                <div className="segmented">
                  {['Under 150', '150–300', '300–500', '500+'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSetup({ ...setup, guests: item })}
                      className={setup.guests === item ? 'selected' : ''}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset style={{ marginTop: 20 }}>
                <legend>
                  <Wallet size={15} style={{ display: 'inline', marginRight: 6 }} />
                  Overall Budget Target
                </legend>
                <div className="segmented budget">
                  {['Under ₹15L', '₹15–25L', '₹25–50L', '₹50L+'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSetup({ ...setup, budget: item })}
                      className={setup.budget === item ? 'selected' : ''}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Dynamic Budget Benchmarking Split Visualizer */}
              <div className="budget-benchmark-box">
                <div className="benchmark-title">
                  <strong>Estimated Category Splits for {setup.budget}</strong>
                  <small>Based on real Indian wedding benchmarks</small>
                </div>
                <div className="benchmark-bars">
                  {splits.map((s) => (
                    <div key={s.cat} className="benchmark-row">
                      <div className="benchmark-meta">
                        <span>{s.cat}</span>
                        <strong>₹{s.amount} ({s.pct}%)</strong>
                      </div>
                      <div className="benchmark-progress">
                        <div
                          className="benchmark-fill"
                          style={{ width: `${s.pct * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 id="setup-heading">Existing Progress & Diagnostics</h2>
              <p className="field-help" style={{ marginBottom: 16 }}>
                Check anything you’ve already reserved. We’ll auto-mark them as secured and cascade dependencies.
              </p>

              <div className="booked-list">
                {bookedOptions.map((item) => {
                  const isChecked = (setup.booked || []).includes(item.name)
                  return (
                    <label key={item.name} className="booked-row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBooked(item.name)}
                      />
                      <div>
                        <span>{item.name}</span>
                        <small>{isChecked ? '✓ Contract secured' : item.subtitle}</small>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Instant "Aha!" Magic Moment Diagnostic Card */}
              <div className="diagnostic-summary-card">
                <div className="diagnostic-head">
                  <Sparkles size={18} className="text-rose" />
                  <strong>ShaadiOS Pre-Flight Analysis for {setup.city}</strong>
                </div>
                <ul className="diagnostic-points">
                  <li>
                    <CheckCircle2 size={15} className="text-sage" />
                    <span>
                      <strong>Lead time calculated:</strong> Photographers and venue in {setup.city} hold prime weekends 6–8 months in advance.
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-sage" />
                    <span>
                      <strong>Ceremonies mapped:</strong> {setup.ceremonies.length} milestone tracks sequenced with family delegation support.
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-sage" />
                    <span>
                      <strong>Cash flow initialized:</strong> Payment milestones and advance alerts set according to {setup.budget}.
                    </span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <button className="primary-button full" onClick={onContinue} style={{ marginTop: 24 }}>
            {step === 4 ? (
              <>
                <Sparkles size={17} /> Generate My Master Wedding Plan
              </>
            ) : (
              <>
                Continue <ArrowRight size={17} />
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  )
}
