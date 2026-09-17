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
  const [error, setError] = useState('')

  const roles = [
    {
      key: 'co_owner',
      label: 'Co-Owner (Partner)',
      desc: 'Your partner in planning decisions and shared responsibilities.',
    },
    {
      key: 'family_lead',
      label: 'Family Lead',
      desc: 'Help with family tasks, accommodation and guest coordination.',
    },
    {
      key: 'coordinator',
      label: 'Wedding Coordinator',
      desc: 'Help organize timelines, ceremonies and vendor follow-ups.',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const contact = emailOrPhone.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[\d\s()-]{8,20}$/.test(contact)) {
      setError('Enter a valid email address or phone number.'); return
    }

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
      email: contact.includes('@') ? contact.toLowerCase() : '',
      phone: !contact.includes('@') ? contact.toLowerCase() : '',
      tint: roleKey === 'co_owner' ? 'sage' : roleKey === 'family_lead' ? 'soft' : 'lilac',
      note: 'Local planning contact · No invitation sent',
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
            <h2 id="invite-title">Add someone to your team</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close invite modal">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-lead">
              Keep responsibilities clear by adding a planning contact. This saves a contact on this browser; it does not send an invitation or create an account.
            </p>

            <div className="form-fields">
              <label>
                <span>Full Name *</span>
                <input
                  type="text" maxLength={120}
                  required
                  placeholder="e.g. Meera Kapoor or Vikram Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                <span>Email or WhatsApp Number *</span>
                <input
                  type="text" maxLength={120}
                  required
                  placeholder="e.g. meera@gmail.com or +91 98200 12345"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
              </label>

              <fieldset className="role-selector-fieldset">
                <legend>Planning role (not an access permission)</legend>
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
                <strong>Local prototype:</strong> Everyone using this browser can see all saved data. Do not enter confidential information.
              </p>
            </div>
          </div>

          {error && <p className="field-error form-error" role="alert">{error}</p>}
          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={!name.trim()}>
              <Send size={16} /> Add planning contact
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
