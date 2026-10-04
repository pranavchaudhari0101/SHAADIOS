import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Percent,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  X,
  Zap,
} from 'lucide-react'

export function ContingencyModal({
  wedding,
  vendors = [],
  contingency,
  onSave,
  onClose,
}) {
  const [gstEnabled, setGstEnabled] = useState(contingency?.gstEnabled ?? true)
  const [extraPlatesPct, setExtraPlatesPct] = useState(contingency?.extraPlatesPct ?? 10)
  const [plateCost, setPlateCost] = useState(contingency?.plateCost ?? 2200)
  const [alcoholCorkage, setAlcoholCorkage] = useState(contingency?.alcoholCorkage ?? 65000)
  const [soundPplLicense, setSoundPplLicense] = useState(contingency?.soundPplLicense ?? 40000)
  const [generatorDiesel, setGeneratorDiesel] = useState(contingency?.generatorDieselBackup ?? 35000)
  const [shagunTips, setShagunTips] = useState(contingency?.shagunTipsReserve ?? 50000)

  // Parse guest count
  let guestCountBase = 250
  if (wedding.guests?.includes('150–300')) guestCountBase = 250
  else if (wedding.guests?.includes('300–500')) guestCountBase = 400
  else if (wedding.guests?.includes('500+')) guestCountBase = 600
  else if (wedding.guests?.includes('Under 150')) guestCountBase = 120

  // Calculate vendor committed base
  const totalVendorBase = vendors.reduce((acc, v) => acc + (v.amountNumber || 0), 0)

  // Calculate 18% GST liability
  const gstLiability = gstEnabled ? Math.round(totalVendorBase * 0.18) : 0

  // Calculate Extra Plates buffer (unannounced guests)
  const extraGuests = Math.round((guestCountBase * extraPlatesPct) / 100)
  const extraCateringLiability = extraGuests * plateCost

  // Total hidden overheads
  const overheadsTotal = alcoholCorkage + soundPplLicense + generatorDiesel + shagunTips

  // Total Contingency Required
  const totalContingencyGap = gstLiability + extraCateringLiability + overheadsTotal
  const baseBudget = wedding.budgetAmount || 2500000
  const adjustedRealisticBudget = baseBudget + totalContingencyGap

  const handleApply = () => {
    onSave({
      gstRate: 18,
      gstEnabled,
      extraPlatesPct,
      plateCost,
      alcoholCorkage,
      soundPplLicense,
      generatorDieselBackup: generatorDiesel,
      shagunTipsReserve: shagunTips,
      totalContingencyGap,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="contingency-title">
      <div className="modal-box contingency-modal">
        <header className="modal-header">
          <div className="modal-header-icon-title">
            <span className="modal-icon-badge warning">
              <Calculator size={20} />
            </span>
            <div>
              <h2 id="contingency-title">Indian Wedding Hidden Costs & GST Audit</h2>
              <p className="modal-sub">
                Avoid the classic 25% post-wedding shock bill. Calculate real liabilities for {wedding.couple}.
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </header>

        <div className="modal-scroll-body">
          {/* Executive Summary Alert Banner */}
          <div className="contingency-hero-card">
            <div className="contingency-stat-grid">
              <div className="contingency-stat">
                <span className="stat-label">BASE CONTRACTS</span>
                <span className="stat-value">₹{(totalVendorBase / 100000).toFixed(2)}L</span>
                <small>{vendors.length} vendors tracked</small>
              </div>
              <div className="contingency-stat highlight">
                <span className="stat-label">HIDDEN BUFFER NEEDED</span>
                <span className="stat-value text-rose">+₹{(totalContingencyGap / 100000).toFixed(2)}L</span>
                <small>Taxes + Plates + Overheads</small>
              </div>
              <div className="contingency-stat">
                <span className="stat-label">REALISTIC GTM BUDGET</span>
                <span className="stat-value text-sage">₹{(adjustedRealisticBudget / 100000).toFixed(2)}L</span>
                <small>Zero-surprise safety total</small>
              </div>
            </div>
          </div>

          {/* Section 1: GST Tax Calibration */}
          <section className="contingency-section">
            <div className="section-title-toggle">
              <div>
                <strong>1. Statutory 18% GST on Indian Vendors</strong>
                <p className="field-help">
                  Banquet halls, luxury decor, sound, and candid photo contracts are subject to 18% GST unless quoted inclusive.
                </p>
              </div>
              <label className="switch-toggle" aria-label="Toggle 18% GST calculation">
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {gstEnabled && (
              <div className="contingency-breakdown-row">
                <span>Estimated 18% GST on ₹{totalVendorBase.toLocaleString('en-IN')} vendor base:</span>
                <strong className="text-rose">+₹{gstLiability.toLocaleString('en-IN')}</strong>
              </div>
            )}
          </section>

          {/* Section 2: Unannounced Guest Buffer */}
          <section className="contingency-section">
            <div className="section-title-toggle">
              <div>
                <strong>2. Unannounced Guests & Plate Buffer ({extraPlatesPct}%)</strong>
                <p className="field-help">
                  Indian weddings traditionally experience +10% unannounced relatives & last-minute +1s at Sangeet and Reception.
                </p>
              </div>
            </div>

            <div className="plate-buffer-controls">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Guest Base: <strong>{guestCountBase} guests</strong></span>
                  <span>Extra Buffer: <strong>+{extraGuests} unannounced plates</strong></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={extraPlatesPct}
                  onChange={(e) => setExtraPlatesPct(Number(e.target.value))}
                  className="contingency-slider"
                />
                <div className="slider-ticks">
                  <span>0% (Tight)</span>
                  <span>5%</span>
                  <span>10% (Recommended)</span>
                  <span>15%</span>
                  <span>20%</span>
                  <span>25% (Safe)</span>
                </div>
              </div>

              <div className="rate-input-row">
                <label>
                  Per-Plate Cost (₹)
                  <input
                    type="number"
                    value={plateCost}
                    onChange={(e) => setPlateCost(Number(e.target.value))}
                    step="100"
                  />
                </label>
                <div className="rate-calculated">
                  <small>Catering Variance Liability:</small>
                  <strong>+₹{extraCateringLiability.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Essential Hidden Venue Overheads */}
          <section className="contingency-section">
            <strong>3. Essential Venue & Hospitality Overheads</strong>
            <p className="field-help">
              Commonly overlooked expenses that hotels and farmhouses add to the final check-out bill.
            </p>

            <div className="overhead-grid">
              <div className="overhead-item">
                <label>
                  <span>PPL / IPRS Music License (DJ & Curfew)</span>
                  <input
                    type="number"
                    value={soundPplLicense}
                    onChange={(e) => setSoundPplLicense(Number(e.target.value))}
                    step="5000"
                  />
                </label>
              </div>

              <div className="overhead-item">
                <label>
                  <span>Alcohol Corkage & Bar Setup License</span>
                  <input
                    type="number"
                    value={alcoholCorkage}
                    onChange={(e) => setAlcoholCorkage(Number(e.target.value))}
                    step="5000"
                  />
                </label>
              </div>

              <div className="overhead-item">
                <label>
                  <span>Silent Generator Diesel Backup (KVA)</span>
                  <input
                    type="number"
                    value={generatorDiesel}
                    onChange={(e) => setGeneratorDiesel(Number(e.target.value))}
                    step="5000"
                  />
                </label>
              </div>

              <div className="overhead-item">
                <label>
                  <span>Shagun Envelopes & Hospitality Tips</span>
                  <input
                    type="number"
                    value={shagunTips}
                    onChange={(e) => setShagunTips(Number(e.target.value))}
                    step="5000"
                  />
                </label>
              </div>
            </div>

            <div className="contingency-breakdown-row total-overheads">
              <span>Subtotal Venue Overheads:</span>
              <strong className="text-rose">+₹{overheadsTotal.toLocaleString('en-IN')}</strong>
            </div>
          </section>
        </div>

        <footer className="modal-footer">
          <div className="modal-footer-summary">
            <span>Realistic Cash Commitment:</span>
            <strong>₹{adjustedRealisticBudget.toLocaleString('en-IN')}</strong>
          </div>
          <div className="modal-footer-actions">
            <button className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" onClick={handleApply}>
              <CheckCircle2 size={16} /> Save Calibration to Plan
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
