import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { todayIso } from '../core/utils.js'
import { Brand } from './Brand.jsx'

const ceremonyOptions = ['Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception']

export function Onboarding({
  step,
  setup,
  setSetup,
  onBack,
  onContinue,
}) {
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

  const details = [
    {
      title: 'Let’s start with the shape of your celebration.',
      body: 'A few key anchor details are enough for ShaadiOS to sequence your planning tracks.',
    },
    {
      title: 'Which ceremonies are part of your wedding?',
      body: 'Choose the events you plan to host. We customize timeline milestones for each.',
    },
    {
      title: 'Give us a baseline sense of scale.',
      body: 'Rough estimates are fine. Keep your guest range and budget in one place as you plan.',
    },
    {
      title: 'What has already moved forward?',
      body: 'Select what you have already locked so we mark those contracts complete and unblock subsequent work.',
    },
  ][step - 1]

  const bookedOptions = [
    { name: 'Venue', subtitle: 'e.g. Banquet, Lawn, or Resort' },
    { name: 'Photography', subtitle: 'e.g. Candid photo & cinematography team' },
    { name: 'Catering', subtitle: 'e.g. Menu tasting or caterer locked' },
    { name: 'Decor', subtitle: 'e.g. Floral & stage concept designer' },
    { name: 'Makeup', subtitle: 'e.g. Bridal hair & makeup artist' },
  ]

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Brand />
        <span>Step {step} of 4</span>
        <button onClick={onBack}>{step === 1 ? 'Exit setup' : 'Back'}</button>
      </header>

      <main className="onboarding-main">
        <section className="onboarding-copy">
          <p className="eyebrow">YOUR WEDDING PROFILE</p>
          <h1>{details.title}</h1>
          <p>{details.body}</p>
          <div className="step-dots" aria-label={`Step ${step} of 4`}>
            {[1, 2, 3, 4].map((item) => (
              <span key={item} className={item <= step ? 'is-filled' : ''}></span>
            ))}
          </div>
        </section>

        <form className="onboarding-form" aria-labelledby="setup-heading" onSubmit={e => { e.preventDefault(); onContinue() }}>
          <h2 id="setup-heading">
            {step === 1
              ? 'The essentials'
              : step === 2
              ? 'Your ceremonies'
              : step === 3
              ? 'A planning baseline'
              : 'Your head start'}
          </h2>

          {step === 1 && (
            <>
              <label>
                Wedding date <span aria-hidden="true">*</span>
                <input
                  type="date" required min={todayIso()} max="2100-12-31"
                  value={setup.date}
                  onChange={(event) => setSetup({ ...setup, date: event.target.value })}
                />
              </label>
              <label>
                Primary city <span aria-hidden="true">*</span>
                <input
                  type="text" required maxLength={100} pattern=".*\\S.*"
                  placeholder="e.g. Jaipur, Udaipur, Delhi, Mumbai"
                  value={setup.city}
                  onChange={(event) => setSetup({ ...setup, city: event.target.value })}
                />
              </label>
              <label>
                Couple names *
                <input
                  type="text" required maxLength={100} pattern=".*\\S.*"
                  placeholder="e.g. Rhea & Arjun"
                  value={setup.couple || ''}
                  onChange={(event) => setSetup({ ...setup, couple: event.target.value })}
                />
              </label>
              <p className="field-help">
                This date acts as your planning anchor. You can simulate date changes later anytime.
              </p>
            </>
          )}

          {step === 2 && (
            <div className="choice-grid">
              {ceremonyOptions.map((ceremony) => (
                <button
                  key={ceremony}
                  type="button"
                  className={`choice-card ${
                    setup.ceremonies.includes(ceremony) ? 'selected' : ''
                  }`}
                  aria-pressed={setup.ceremonies.includes(ceremony)}
                  onClick={() => toggleCeremony(ceremony)}
                >
                  <span className="choice-check">
                    {setup.ceremonies.includes(ceremony) && <Check size={15} />}
                  </span>
                  {ceremony}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <fieldset>
                <legend>Expected guest count</legend>
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

              <fieldset>
                <legend>Working budget</legend>
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
            </>
          )}

          {step === 4 && (
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
                      <small>{isChecked ? 'Already locked' : item.subtitle}</small>
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {step === 2 && !setup.ceremonies.length && <p className="field-error" role="status">Choose at least one ceremony to continue.</p>}
          <button type="submit" className="primary-button full" disabled={step === 2 && !setup.ceremonies.length}>
            {step === 4 ? 'Create my wedding plan' : 'Continue'} <ArrowRight size={17} />
          </button>
        </form>
      </main>
    </div>
  )
}
