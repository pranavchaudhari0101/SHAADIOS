import React from 'react'
import { Printer, X, Download, ShieldCheck } from 'lucide-react'
import { Brand } from './Brand.jsx'

export function MasterRunSheetModal({ wedding, tasks = [], vendors = [], people = [], guests = [], rooms = [], onClose }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-layer run-sheet-modal-layer" role="dialog" aria-modal="true">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close run-sheet" />
      <section className="change-modal run-sheet-container">
        <header className="no-print">
          <div>
            <p className="eyebrow">FAMILY & COORDINATOR MASTER DOCUMENT</p>
            <h2>Master Wedding Run-Sheet & Contacts</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary-button compact" onClick={handlePrint}>
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button className="icon-button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="run-sheet-print-area">
          <div className="run-sheet-header">
            <Brand />
            <div className="run-sheet-title-block">
              <h1>{wedding.couple} — Wedding Master Plan</h1>
              <p>
                <strong>Destination:</strong> {wedding.city} · <strong>Target Date:</strong> {wedding.date} · <strong>Scale:</strong> {wedding.guests}
              </p>
            </div>
          </div>

          <hr className="run-sheet-hr" />

          {/* Section 1: Key Stakeholder Phone Directory */}
          <section className="run-sheet-section">
            <h2>1. Family Leads & Operations Directory</h2>
            <table className="run-sheet-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Contact Number</th>
                  <th>Key Responsibilities</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.role}</strong></td>
                    <td>{p.name}</td>
                    <td>{p.phone || p.email || '—'}</td>
                    <td>{p.note || 'Planning lead'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 2: Key Vendor Partners & Hold Contacts */}
          <section className="run-sheet-section">
            <h2>2. Key Vendor Partner Run-Sheet</h2>
            <table className="run-sheet-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Vendor Business</th>
                  <th>Point of Contact</th>
                  <th>Status</th>
                  <th>Contract / Inclusions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.category}</td>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.contactPerson} ({v.phone || 'Phone on file'})</td>
                    <td><span className="print-badge">{v.state}</span></td>
                    <td>{v.amount} · {v.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 3: Ceremony Timeline & Action Deliverables */}
          <section className="run-sheet-section">
            <h2>3. Critical Milestone & Ceremony Sequence</h2>
            <table className="run-sheet-table">
              <thead>
                <tr>
                  <th>Ceremony / Scope</th>
                  <th>Action Deliverable</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.ceremony || 'All'}</td>
                    <td><strong>{t.title}</strong><br /><small>{t.reason}</small></td>
                    <td>{t.owner}</td>
                    <td>{t.due}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 4: Hotel Room Block & Hospitality Manifest */}
          {rooms && rooms.length > 0 && (
            <section className="run-sheet-section">
              <h2>4. Hotel Room Block & Hospitality Manifest</h2>
              <table className="run-sheet-table">
                <thead>
                  <tr>
                    <th>Room #</th>
                    <th>Suite Type & Wing</th>
                    <th>Assigned Guest / Family Head</th>
                    <th>Dietary Preference</th>
                    <th>Stay Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => {
                    const assignedGuests = (guests || []).filter(
                      (g) => (r.assignedGuestIds || []).includes(g.id) || g.roomAssigned === r.roomNumber
                    )
                    return (
                      <tr key={r.id}>
                        <td><strong>#{r.roomNumber}</strong></td>
                        <td>{r.type} <br /><small>{r.wing}</small></td>
                        <td>
                          {assignedGuests.length > 0 ? (
                            assignedGuests.map((g) => (
                              <div key={g.id}>
                                <strong>{g.name}</strong> ({g.partySize} guests)
                                {g.notes && <><br /><small>Note: {g.notes}</small></>}
                              </div>
                            ))
                          ) : (
                            <span style={{ color: '#999' }}>Available / Unassigned</span>
                          )}
                        </td>
                        <td>
                          {assignedGuests.map((g) => g.dietary).join(', ') || 'Standard'}
                        </td>
                        <td>{r.checkIn} to {r.checkOut}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          )}

          <footer className="run-sheet-footer">
            <p>Generated by ShaadiOS — The Operating System for Indian Weddings. Keep one physical printed copy with the family logistics lead.</p>
          </footer>
        </div>
      </section>
    </div>
  )
}
