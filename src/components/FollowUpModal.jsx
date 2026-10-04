import React, { useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Sparkles,
  X,
} from 'lucide-react'
import { openWhatsApp, getVendorWhatsAppMessage } from '../core/whatsapp.js'

export function FollowUpModal({ vendor, wedding, onClose, onSent }) {
  const defaultMessage = getVendorWhatsAppMessage(vendor, wedding)

  const [message, setMessage] = useState(defaultMessage)
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState(vendor?.phone || '')

  if (!vendor) return null

  const handleCopy = () => {
    navigator.clipboard?.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSendWhatsApp = () => {
    openWhatsApp({ phone, message })
    onSent(vendor, 'whatsapp', message)
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="followup-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close message composer" />
      <section className="change-modal followup-modal">
        <header>
          <div>
            <p className="eyebrow">CONTEXT-AWARE VENDOR ASSISTANT</p>
            <h2 id="followup-title">Follow-Up with {vendor.name}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close message composer">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="composer-context-pill">
            <Sparkles size={16} />
            <span>
              Pre-drafted with your {wedding.city} wedding date ({wedding.date}) and {vendor.name}’s current status ({vendor.action}).
            </span>
          </div>

          <div className="form-fields" style={{ marginBottom: 12 }}>
            <label>
              <span>WhatsApp / Mobile Number</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Phone size={16} className="text-ink-soft" />
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </label>
          </div>

          <label className="composer-label">
            <span>Message Content (Pre-formatted for WhatsApp)</span>
            <textarea
              className="composer-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </label>

          <div className="composer-vendor-meta">
            <span>Recipient: <strong>{vendor.contactPerson || vendor.name}</strong></span>
            <span>Category: <strong>{vendor.category}</strong></span>
            <span>Quote: <strong>{vendor.amount || '—'}</strong></span>
          </div>
        </div>

        <footer className="modal-actions">
          <button className="secondary-button" onClick={handleCopy}>
            {copied ? <><Check size={16} /> Copied text</> : <><Copy size={16} /> Copy text</>}
          </button>
          <button className="primary-button" onClick={handleSendWhatsApp} style={{ background: '#25D366', borderColor: '#25D366' }}>
            <MessageCircle size={16} /> Open in WhatsApp <ExternalLink size={14} />
          </button>
        </footer>
      </section>
    </div>
  )
}
