import React, { useState } from 'react'
import {
  Send,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'

export function InviteModal({ onClose, onInvite }) {
  const [name, setName] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [roleKey, setRoleKey] = useState('family_lead')

  const roles = [
    {
      key: 'co_owner',
      label: 'Co-Owner (Partner)',
      desc: 'Full access to all budget, vendor contracts, and planning decisions.',
    },
    {
      key: 'family_lead',
      label: 'Family Lead',
      desc: 'Sees tasks assigned to family (e.g. accommodations, guest coordination). Financial details stay private.',
    },
    {
      key: 'coordinator',
      label: 'Wedding Coordinator',
      desc: 'Operational access to timelines, run-of-show, and vendor contact sheets.',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const roleObj = roles.find((r) => r.key === roleKey)
    const initials = name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    const newPerson = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      role: roleObj?.label || 'Collaborator',
      roleKey,
      initials,
      email: emailOrPhone.includes('@') ? emailOrPhone : '',
      phone: !emailOrPhone.includes('@') ? emailOrPhone : '',
      tint: roleKey === 'co_owner' ? 'sage' : roleKey === 'family_lead' ? 'soft' : 'lilac',
      note: 'Invited collaborator · Ready to collaborate',
    }

    onInvite(newPerson)
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close invite modal" />
      <section className="change-modal invite-modal">
        <header>
          <div>
            <p className="eyebrow">TEAM & COLLABORATION</p>
            <h2 id="invite-title">Invite a Wedding Collaborator</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close invite modal">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-lead">
              ShaadiOS gives each collaborator the exact clarity they need without exposing private couple discussions.
            </p>

            <div className="form-fields">
              <label>
                <span>Full Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Kapoor or Vikram Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                <span>Email or WhatsApp Number *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. meera@gmail.com or +91 98200 12345"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
              </label>

              <fieldset className="role-selector-fieldset">
                <legend>Select Role & Access Level</legend>
                <div className="role-options-list">
                  {roles.map((r) => (
                    <label
                      key={r.key}
                      className={`role-option-card ${roleKey === r.key ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.key}
                        checked={roleKey === r.key}
                        onChange={() => setRoleKey(r.key)}
                      />
                      <div>
                        <strong>{r.label}</strong>
                        <p>{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="modal-note">
              <ShieldCheck size={18} />
              <p>
                <strong>Privacy Guaranteed:</strong> Family members only see work assigned to them.
              </p>
            </div>
          </div>

          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={!name.trim()}>
              <Send size={16} /> Send invitation
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
