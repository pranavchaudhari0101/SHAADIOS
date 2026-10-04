import React, { useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  CreditCard,
  FileSpreadsheet,
  MessageCircle,
  Plus,
  Scale,
  Sparkles,
  X,
} from 'lucide-react'
import { CameraIcon, VenueIcon, FoodIcon } from './Icons.jsx'
import { formatCurrency } from '../core/utils.js'
import { getDaysRemaining } from '../core/priorityEngine.js'

export function getVendorHoldUrgency(vendor) {
  if (!vendor.holdDeadline || vendor.state === 'Confirmed') return null
  const daysLeft = getDaysRemaining(vendor.holdDeadline)
  if (daysLeft < 0) return { tone: 'overdue', label: `Hold expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago` }
  if (daysLeft === 0) return { tone: 'due-soon', label: 'Hold expires today' }
  if (daysLeft <= 6) return { tone: 'due-soon', label: `Hold expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` }
  return { tone: 'on-track', label: `Hold expires in ${daysLeft} days` }
}

export function VendorsView({
  vendors = [],
  tasks = [],
  onTask,
  onStageChange,
  onOpenFollowUp,
  onNotify,
}) {
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedMilestoneVendorId, setSelectedMilestoneVendorId] = useState(null)
  const [vendorList, setVendorList] = useState(vendors)

  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Photography',
    amount: '',
    owner: 'Rhea',
  })

  // Sync internal state when prop changes
  React.useEffect(() => {
    setVendorList(vendors)
  }, [vendors])

  const stages = [
    'Discovered',
    'Shortlisted',
    'Contacted',
    'Quote received',
    'Selected',
    'Confirmed',
  ]

  const getCategoryIcon = (cat) => {
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

  // Calculate totals
  const totalCommitted = vendorList.reduce((acc, v) => acc + (v.amountNumber || 0), 0)
  const totalPaid = vendorList.reduce((acc, v) => {
    const paidInMilestones = (v.milestones || [])
      .filter((m) => m.status === 'Paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    return acc + paidInMilestones
  }, 0)
  const remainingOutflow = Math.max(0, totalCommitted - totalPaid)

  const toggleMilestoneStatus = (vendorId, milestoneId) => {
    setVendorList((prev) =>
      prev.map((v) => {
        if (v.id !== vendorId) return v
        const updatedMilestones = (v.milestones || []).map((m) => {
          if (m.id !== milestoneId) return m
          const nextStatus = m.status === 'Paid' ? 'Pending' : 'Paid'
          onNotify?.(`Milestone "${m.label}" marked as ${nextStatus}. Cash flow updated.`)
          return { ...m, status: nextStatus }
        })
        return { ...v, milestones: updatedMilestones }
      })
    )
  }

  const handleCreateVendor = (e) => {
    e.preventDefault()
    if (!newVendor.name.trim()) return

    const amountNum = parseInt(newVendor.amount.replace(/[^0-9]/g, ''), 10) || 0
    const created = {
      id: `v-${Date.now()}`,
      name: newVendor.name.trim(),
      category: newVendor.category,
      state: 'Shortlisted',
      owner: newVendor.owner,
      action: 'Request pricing & terms',
      amount: newVendor.amount ? `₹${amountNum.toLocaleString('en-IN')}` : '—',
      amountNumber: amountNum,
      color: newVendor.category === 'Venue' ? 'rose' : newVendor.category === 'Photography' ? 'blue' : 'orange',
      holdDeadline: '2026-10-15',
      contactPerson: 'Lead Contact',
      phone: '+91 98000 00000',
      notes: 'Added via vendor directory.',
      inclusions: ['Standard contract service terms', 'Team staffing included'],
      milestones: [
        { id: `m-${Date.now()}-1`, label: 'Booking Advance (25%)', amount: Math.round(amountNum * 0.25), due: '2026-10-15', status: 'Pending' },
        { id: `m-${Date.now()}-2`, label: 'Pre-Event Payment (50%)', amount: Math.round(amountNum * 0.50), due: '2027-01-15', status: 'Pending' },
        { id: `m-${Date.now()}-3`, label: 'Final Settlement (25%)', amount: Math.round(amountNum * 0.25), due: '2027-02-18', status: 'Pending' },
      ],
    }

    onStageChange(null, null, created)
    setShowAddVendor(false)
    setNewVendor({ name: '', category: 'Photography', amount: '', owner: 'Rhea' })
    onNotify?.(`${created.name} added to shortlisted vendors.`)
  }

  return (
    <div className="page">
      <div className="page-intro compact-intro">
        <div>
          <p className="eyebrow">CONTRACTS, HOLDS & CASH FLOW</p>
          <h1>Vendors & Partners</h1>
          <p className="subtitle">
            Track contracts, hold deadlines, payment milestones, and negotiate with WhatsApp ease.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="secondary-button compact"
            onClick={() => setShowCompareModal(true)}
            title="Compare shortlisted quotes side-by-side"
          >
            <Scale size={16} /> Compare Quotes
          </button>
          <button className="primary-button compact" onClick={() => setShowAddVendor(true)}>
            <Plus size={17} /> Add vendor
          </button>
        </div>
      </div>

      {/* Financial Milestone Cash Flow Strip */}
      <div className="vendor-cashflow-banner">
        <div className="cashflow-stat">
          <span><CreditCard size={18} /></span>
          <div>
            <small>TOTAL COMMITTED</small>
            <strong>₹{totalCommitted.toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div className="cashflow-divider"></div>
        <div className="cashflow-stat">
          <span className="text-sage"><CheckCircle2 size={18} /></span>
          <div>
            <small>PAID IN ADVANCES</small>
            <strong className="text-sage">₹{totalPaid.toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div className="cashflow-divider"></div>
        <div className="cashflow-stat">
          <span className="text-amber"><Clock3 size={18} /></span>
          <div>
            <small>PENDING OUTFLOW</small>
            <strong className="text-amber">₹{remainingOutflow.toLocaleString('en-IN')}</strong>
          </div>
        </div>
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

      {/* Vendor Cards Grid */}
      <div className="vendor-grid">
        {vendorList.map((vendor) => {
          const isConfirmed = vendor.state === 'Confirmed'
          const linkedTask = tasks.find((t) => t.id === vendor.relatedTaskId)
          const isMilestoneOpen = selectedMilestoneVendorId === vendor.id
          const milestones = vendor.milestones || []

          return (
            <article className="vendor-card" key={vendor.id}>
              <div className="vendor-card-top">
                <span className={`vendor-icon ${vendor.color}`}>
                  {getCategoryIcon(vendor.category)}
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
                  <small>CONTRACT VALUE</small>
                  <strong>{vendor.amount}</strong>
                </span>
              </div>

              {vendor.holdDeadline && (() => {
                const urgency = getVendorHoldUrgency(vendor)
                return (
                  <div className={`vendor-hold-pill${urgency ? ` ${urgency.tone}` : ''}`}>
                    <Clock3 size={13} />
                    <span>Hold deadline: <strong>{vendor.holdDeadline}</strong>{urgency ? ` · ${urgency.label}` : ''}</span>
                  </div>
                )
              })()}

              {/* Inclusions summary chip */}
              {vendor.inclusions && vendor.inclusions.length > 0 && (
                <div className="vendor-inclusions-list">
                  <small>INCLUSIONS</small>
                  <ul>
                    {vendor.inclusions.slice(0, 2).map((inc, i) => (
                      <li key={i}>✓ {inc}</li>
                    ))}
                    {vendor.inclusions.length > 2 && (
                      <li className="text-ink-soft">+{vendor.inclusions.length - 2} more terms</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Payment Milestones Toggle */}
              {milestones.length > 0 && (
                <div className="vendor-milestones-section">
                  <button
                    type="button"
                    className="milestone-toggle-btn"
                    onClick={() =>
                      setSelectedMilestoneVendorId(isMilestoneOpen ? null : vendor.id)
                    }
                  >
                    <span>
                      <CreditCard size={13} />
                      <strong>Payment Milestones ({milestones.filter((m) => m.status === 'Paid').length}/{milestones.length})</strong>
                    </span>
                    <ChevronDown size={14} style={{ transform: isMilestoneOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {isMilestoneOpen && (
                    <div className="milestone-list-drawer">
                      {milestones.map((m) => (
                        <div key={m.id} className="milestone-item-row">
                          <div>
                            <span className="m-label">{m.label}</span>
                            <small className="m-due">Due: {m.due}</small>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong className="m-amount">₹{m.amount.toLocaleString('en-IN')}</strong>
                            <button
                              type="button"
                              className={`m-status-pill ${m.status.toLowerCase()}`}
                              onClick={() => toggleMilestoneStatus(vendor.id, m.id)}
                            >
                              {m.status === 'Paid' ? '✓ Paid' : 'Pending'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <strong>{vendor.action}</strong>
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
                  style={{ borderColor: '#25D366', color: '#128C7E' }}
                  onClick={() => onOpenFollowUp(vendor)}
                >
                  <MessageCircle size={14} /> WhatsApp Follow-Up
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Vendor Comparison Matrix Modal */}
      {showCompareModal && (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="compare-title">
          <button className="modal-backdrop" onClick={() => setShowCompareModal(false)} />
          <section className="change-modal compare-quotes-modal" style={{ maxWidth: 840 }}>
            <header>
              <div>
                <p className="eyebrow">DECISION MATRIX</p>
                <h2 id="compare-title">Side-by-Side Vendor Comparison</h2>
              </div>
              <button className="icon-button" onClick={() => setShowCompareModal(false)}>
                <X size={20} />
              </button>
            </header>

            <div className="modal-body">
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Parameters</th>
                      {vendorList.slice(0, 3).map((v) => (
                        <th key={v.id}>
                          <strong>{v.name}</strong>
                          <small>{v.category}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Status</td>
                      {vendorList.slice(0, 3).map((v) => (
                        <td key={v.id}>
                          <span className={`stage-select-pill ${v.state.toLowerCase().replaceAll(' ', '-')}`}>
                            {v.state}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Quoted Amount</td>
                      {vendorList.slice(0, 3).map((v) => (
                        <td key={v.id}>
                          <strong>{v.amount}</strong>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Hold Deadline</td>
                      {vendorList.slice(0, 3).map((v) => (
                        <td key={v.id}>
                          {v.holdDeadline || 'Flexible'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Key Inclusions</td>
                      {vendorList.slice(0, 3).map((v) => (
                        <td key={v.id}>
                          <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12 }}>
                            {(v.inclusions || ['Standard package']).map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Advance Terms</td>
                      {vendorList.slice(0, 3).map((v) => (
                        <td key={v.id} style={{ fontSize: 12 }}>
                          {v.milestones?.[0]?.label || '25% token'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="modal-actions">
              <button className="primary-button" onClick={() => setShowCompareModal(false)}>
                Done reviewing
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Add Vendor Form Modal */}
      {showAddVendor && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <button className="modal-backdrop" onClick={() => setShowAddVendor(false)} />
          <section className="change-modal">
            <header>
              <h2>Add Vendor to Pipeline</h2>
              <button className="icon-button" onClick={() => setShowAddVendor(false)}>✕</button>
            </header>
            <form onSubmit={handleCreateVendor}>
              <div className="modal-body">
                <div className="form-fields">
                  <label>
                    <span>Vendor Business Name *</span>
                    <input
                      type="text"
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
                      <option value="Artists">Artists & Makeup</option>
                      <option value="Music">Music & Sound</option>
                    </select>
                  </label>
                  <label>
                    <span>Estimated Quote (₹)</span>
                    <input
                      type="text"
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
                  Save vendor & milestones
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
