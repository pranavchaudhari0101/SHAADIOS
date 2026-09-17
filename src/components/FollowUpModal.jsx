import React, { useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react'

export function FollowUpModal({ vendor, wedding, onClose, onSent }) {
  const defaultMessage = `Hi ${vendor?.contactPerson || vendor?.name || 'there'},\n\nHope you are having a wonderful week! We are finalizing the key contracts for our wedding on ${wedding.date} in ${wedding.city}.\n\nCould you please share the finalized agreement / revised quotation ${vendor.holdDeadline ? `before the hold deadline of ${vendor.holdDeadline}` : 'when available'}? We would love to lock this in and confirm our dates.\n\nWarm regards,\n${wedding.couple}`

  const [message, setMessage] = useState(vendor.followUpDraft || defaultMessage)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  if (!vendor) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setCopyError('')
    } catch {
      setCopyError('Clipboard access unavailable. Select and copy the text manually.')
    }
  }

  const handleSend = (channel = 'whatsapp') => {
    onSent(vendor, channel, message)
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="followup-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close message composer" />
      <section className="change-modal followup-modal">
        <header>
          <div>
            <p className="eyebrow">CONTEXT-AWARE VENDOR ASSISTANT</p>
            <h2 id="followup-title">Prepare Follow-Up for {vendor.name}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close message composer">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="composer-context-pill">
            <Sparkles size={16} />
            <span>Draft generated using stored vendor hold deadline ({vendor.holdDeadline || 'Upcoming'}) and your {wedding.city} wedding anchor.</span>
          </div>

          <label className="composer-label">
            <span>Message Content (Editable)</span>
            <textarea
              className="composer-textarea"
              value={message}
              maxLength={4000}
              onChange={(e) => { setMessage(e.target.value); setCopied(false) }}
              rows={8}
            />
          </label>

          <div className="composer-vendor-meta">
            <span>Draft only. Nothing is sent automatically.</span>
            <span>Recipient: <strong>{vendor.contactPerson || vendor.name}</strong> ({vendor.phone || 'No phone recorded'})</span>
            <span>Category: <strong>{vendor.category}</strong></span>
          </div>
          {copyError && <p className="field-error" role="alert">{copyError}</p>}
        </div>

        <footer className="modal-actions">
          <button className="secondary-button" disabled={!message.trim()} onClick={handleCopy}>
            {copied ? <><Check size={16} /> Copied to clipboard</> : <><Copy size={16} /> Copy text</>}
          </button>
          <button className="primary-button" disabled={!message.trim()} onClick={() => handleSend('draft')}>
            <MessageCircle size={16} /> Save draft
          </button>
        </footer>
      </section>
    </div>
  )
}
