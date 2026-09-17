import React, { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  MessageCircle,
  Plus,
  Sparkles,
} from 'lucide-react'
import { CameraIcon, VenueIcon, FoodIcon } from './Icons.jsx'
import { formatCurrency } from '../core/utils.js'

export function VendorsView({
  vendors = [],
  tasks = [],
  onTask,
  onStageChange,
  onOpenFollowUp,
  onNotify,
}) {
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Photography',
    amount: '',
    owner: 'Rhea',
  })

  const stages = [
    'Discovered',
    'Shortlisted',
    'Contacted',
    'Quote received',
    'Selected',
    'Confirmed',
  ]

  const getCategoryIcon = (cat, color) => {
    switch (cat) {
      case 'Photography':
        return <CameraIcon />
      case 'Venue':
        return <VenueIcon />
      case 'Catering':
        return <FoodIcon />
      default:
        return <Sparkles size={19} />
    }
  }

  const handleCreateVendor = (e) => {
    e.preventDefault()
    if (!newVendor.name.trim()) return

    const created = {
      id: `v-${Date.now()}`,
      name: newVendor.name.trim(),
      category: newVendor.category,
      state: 'Shortlisted',
      owner: newVendor.owner,
      action: 'Request pricing',
      amount: newVendor.amount ? formatCurrency(Number(newVendor.amount)) : '—',
      amountNumber: Number(newVendor.amount) || 0,
      color: newVendor.category === 'Venue' ? 'rose' : newVendor.category === 'Photography' ? 'blue' : 'orange',
      holdDeadline: '',
      contactPerson: '',
      phone: '',
      notes: 'Added via vendor directory.',
    }

    onStageChange(null, null, created)
    setShowAddVendor(false)
    setNewVendor({ name: '', category: 'Photography', amount: '', owner: 'Rhea' })
    onNotify(`${created.name} added to shortlisted vendors.`)
  }

  return (
    <div className="page">
      <div className="page-intro compact-intro">
        <div>
          <p className="eyebrow">VENDOR DECISIONS AND COMMITMENTS</p>
          <h1>Vendors</h1>
          <p className="subtitle">
            Track quotes, contracts, holds, and next actions across all your wedding partners.
          </p>
        </div>
        <button className="primary-button compact" onClick={() => setShowAddVendor(true)}>
          <Plus size={17} /> Add vendor
        </button>
      </div>

      {/* Pipeline Stages Legend */}
      <div className="pipeline-legend">
        {stages.map((st, idx) => (
          <React.Fragment key={st}>
            <span className={st === 'Confirmed' ? 'legend-confirmed' : ''}>{st}</span>
            {idx !== stages.length - 1 && <i></i>}
          </React.Fragment>
        ))}
      </div>

      {/* Add Vendor Form Modal/Section */}
      {showAddVendor && (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="vendor-title">
          <button className="modal-backdrop" aria-label="Close add vendor" onClick={() => setShowAddVendor(false)} />
          <section className="change-modal">
            <header>
              <h2 id="vendor-title">Add vendor to your plan</h2>
              <button className="icon-button" aria-label="Close add vendor" onClick={() => setShowAddVendor(false)}>✕</button>
            </header>
            <form onSubmit={handleCreateVendor}>
              <div className="modal-body">
                <div className="form-fields">
                  <label>
                    <span>Vendor Business Name *</span>
                    <input
                      type="text" maxLength={120}
                      required
                      placeholder="e.g. Royal Rajasthani Shehnai Troupe"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Category</span>
                    <select
                      value={newVendor.category}
                      onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    >
                      <option value="Venue">Venue</option>
                      <option value="Photography">Photography</option>
                      <option value="Catering">Catering</option>
                      <option value="Decor">Decor</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Artists">Artists</option>
                      <option value="Music">Music & Sound</option>
                    </select>
                  </label>
                  <label>
                    <span>Estimated Quote (₹)</span>
                    <input
                      type="number" min="0" max="1000000000" step="1"
                      placeholder="e.g. 150000"
                      value={newVendor.amount}
                      onChange={(e) => setNewVendor({ ...newVendor, amount: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <footer className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowAddVendor(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save vendor
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {!vendors.length && <div className="empty-filter-state"><h2>Your dream team starts here.</h2><p>Add your first vendor to track quotes and next steps. No sample vendors are added to your personal plan.</p></div>}
      {/* Vendor Cards Grid */}
      <div className="vendor-grid">
        {vendors.map((vendor) => {
          const isConfirmed = vendor.state === 'Confirmed'
          const linkedTask = tasks.find((t) => t.id === vendor.relatedTaskId)

          return (
            <article className="vendor-card" key={vendor.id}>
              <div className="vendor-card-top">
                <span className={`vendor-icon ${vendor.color}`}>
                  {getCategoryIcon(vendor.category, vendor.color)}
                </span>

                {/* Interactive Stage Selector */}
                <select
                  value={vendor.state}
                  onChange={(e) => onStageChange(vendor.id, e.target.value)}
                  className={`stage-select-pill ${vendor.state.toLowerCase().replaceAll(' ', '-')}`}
                  aria-label={`Update stage for ${vendor.name}`}
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <p className="vendor-category-label">{vendor.category}</p>
              <h2>{vendor.name}</h2>

              <div className="vendor-details">
                <span>
                  <small>OWNER</small>
                  <strong>{vendor.owner}</strong>
                </span>
                <span>
                  <small>QUOTE / CONTRACT</small>
                  <strong>{vendor.amount}</strong>
                </span>
              </div>

              {vendor.holdDeadline && (
                <div className="vendor-hold-pill">
                  <Clock3 size={13} />
                  <span>Hold deadline: <strong>{vendor.holdDeadline}</strong></span>
                </div>
              )}

              <div className="vendor-action-bar">
                <div className="vendor-action">
                  <span>
                    {isConfirmed ? (
                      <CheckCircle2 size={16} className="text-sage" />
                    ) : (
                      <CircleDashed size={16} />
                    )}
                    <p>
                      <small>ACTION</small>
                      <strong>{isConfirmed ? 'Booking recorded' : vendor.action}</strong>
                    </p>
                  </span>
                  {linkedTask && (
                    <button
                      onClick={() => onTask(linkedTask)}
                      aria-label={`Open linked task for ${vendor.name}`}
                    >
                      <ChevronRight size={17} />
                    </button>
                  )}
                </div>

                <button
                  className="vendor-nudge-button"
                  onClick={() => onOpenFollowUp(vendor)}
                >
                  <MessageCircle size={14} /> Draft message
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Context-Aware Vendor Follow-Up Callout */}
      <section className="vendor-followup">
        <div>
          <span><MessageCircle size={20} /></span>
          <div>
            <p className="section-label">CONTEXT-AWARE COMMUNICATION</p>
            <h2>Need to follow up with a vendor or request an updated quote?</h2>
            <p>
              ShaadiOS automatically drafts polite, professional messages using the vendor's hold dates and your celebration timeline. Review, save, and copy the draft to send using your preferred app.
            </p>
          </div>
        </div>
        <button
          className="secondary-button pale"
          disabled={!vendors.length}
          onClick={() => onOpenFollowUp(vendors[1] || vendors[0])}
        >
          Prepare a follow-up <ArrowRight size={16} />
        </button>
      </section>
    </div>
  )
}
