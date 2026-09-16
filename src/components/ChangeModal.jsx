import React, { useMemo } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { simulateDateChange } from '../core/changeEngine.js'
import { CameraIcon, VenueIcon, FoodIcon } from './Icons.jsx'

export function ChangeModal({
  step,
  setStep,
  proposal,
  setProposal,
  onClose,
  onApply,
  wedding,
  tasks = [],
  vendors = [],
}) {
  const simulation = useMemo(() => {
    return simulateDateChange(wedding, tasks, vendors, proposal)
  }, [wedding, tasks, vendors, proposal])

  const getImpactIcon = (category) => {
    switch (category) {
      case 'Venue':
        return <VenueIcon />
      case 'Vendor':
      case 'Photography':
        return <CameraIcon />
      case 'Catering':
        return <FoodIcon />
      case 'Accommodation':
        return <UsersRound size={17} />
      default:
        return <CircleAlert size={17} />
    }
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="change-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close date change" />
      <section className="change-modal">
        {step !== 'success' && (
          <header>
            <div>
              <p className="eyebrow">CHANGE MANAGEMENT ENGINE</p>
              <h2 id="change-title">
                {step === 'edit' ? 'Change wedding date' : 'Review the impact first'}
              </h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close date change">
              <X size={20} />
            </button>
          </header>
        )}

        {step === 'edit' && (
          <div className="modal-body">
            <p className="modal-lead">
              A wedding date connects to every venue contract, vendor hold, reservation, and deadline.
              ShaadiOS computes downstream ripple effects before anything is updated.
            </p>
            <div className="date-compare">
              <div>
                <small>CURRENT ANCHOR</small>
                <strong>{wedding.date}</strong>
              </div>
              <ArrowRight size={19} />
              <label>
                <span>NEW TARGET DATE</span>
                <input
                  type="date"
                  value={proposal}
                  onChange={(event) => setProposal(event.target.value)}
                />
              </label>
            </div>
            <div className="modal-note">
              <ShieldCheck size={18} />
              <p>
                <strong>No changes happen yet.</strong>
                <br />
                You will inspect all affected dependencies and approve the update.
              </p>
            </div>
          </div>
        )}

        {step === 'impact' && (
          <div className="modal-body impact-body">
            <div className="impact-summary">
              <span><CircleAlert size={21} /></span>
              <div>
                <strong>{simulation.affectedCount} connected items need a review</strong>
                <p>
                  Moving from {simulation.formattedOld} to {simulation.formattedNew} ({simulation.direction})
                  triggers dependency shifts across your vendors and schedule.
                </p>
              </div>
            </div>

            <div className="affected-people-pill">
              <UsersRound size={14} />
              <span>Targeted notification audience: <strong>{simulation.affectedCollaborators.join(', ')}</strong></span>
            </div>

            <ol className="impact-list">
              {simulation.impacts.map((impact, index) => (
                <li key={impact.id || impact.title}>
                  <span className={`impact-number ${impact.level.toLowerCase()}`}>
                    {index + 1}
                  </span>
                  <span className="impact-icon">{getImpactIcon(impact.category)}</span>
                  <span>
                    <small>{impact.level.toUpperCase()} IMPACT · {impact.category}</small>
                    <strong>{impact.title}</strong>
                    <p>{impact.body}</p>
                    <span className="impact-owner-tag">Owner: {impact.owner}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="modal-footnote">
              <LockKeyhole size={14} /> Internal timelines recalculate automatically. External vendor messages are drafted for your manual review.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="success-state">
            <span><CheckCircle2 size={42} /></span>
            <p className="eyebrow">PLAN RECALCULATED</p>
            <h2>Your wedding is now set for {simulation.formattedNew}.</h2>
            <p>
              Timeline anchors updated, task due dates re-aligned, and selective notifications delivered.
            </p>
            <div className="success-list">
              <span><Check size={16} /> Venue availability re-check marked as top critical action</span>
              <span><Check size={16} /> Photographer date hold inquiry drafted for Arjun</span>
              <span><Check size={16} /> Mom notified of revised hotel block check-in dates</span>
              <span><Check size={16} /> Invitation printing target recalculated</span>
            </div>
            <button className="primary-button full" onClick={onClose}>
              See updated plan <ArrowRight size={17} />
            </button>
          </div>
        )}

        {step !== 'success' && (
          <footer className="modal-actions">
            {step === 'impact' && (
              <button className="secondary-button" onClick={() => setStep('edit')}>
                Back
              </button>
            )}
            <button
              className="primary-button"
              onClick={() => (step === 'edit' ? setStep('impact') : onApply())}
            >
              {step === 'edit' ? 'Preview impact' : 'Approve and update plan'} <ArrowRight size={17} />
            </button>
          </footer>
        )}
      </section>
    </div>
  )
}
