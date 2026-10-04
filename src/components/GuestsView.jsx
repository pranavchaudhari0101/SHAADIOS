import React, { useState, useMemo } from 'react'
import {
  Bed,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Hotel,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  X,
  XCircle,
} from 'lucide-react'
import {
  openWhatsApp,
  getGuestRsvpWhatsAppMessage,
  getRoomAllocationWhatsAppMessage,
} from '../core/whatsapp.js'

export function GuestsView({
  guests = [],
  rooms = [],
  wedding,
  onUpdateGuest,
  onAddGuest,
  onAssignRoom,
  onNotify,
}) {
  const [activeSubTab, setActiveSubTab] = useState('guests') // 'guests' | 'rooms'
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState('all') // 'all' | 'bride' | 'groom' | 'mutual'
  const [rsvpFilter, setRsvpFilter] = useState('all') // 'all' | 'Confirmed' | 'Tentative' | 'Pending' | 'Declined'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState(null)

  // New Guest Form State
  const [newGuest, setNewGuest] = useState({
    name: '',
    side: 'bride',
    group: 'VIP Elders',
    relation: '',
    partySize: 2,
    rsvpStatus: 'Pending',
    events: ['Sangeet', 'Wedding', 'Reception'],
    stayRequired: true,
    roomAssigned: null,
    dietary: 'Pure Veg',
    phone: '',
    city: 'Jaipur',
    notes: '',
  })

  // Metrics
  const totalInvitedGuests = useMemo(() => {
    return guests.reduce((sum, g) => sum + (g.partySize || 1), 0)
  }, [guests])

  const confirmedCount = useMemo(() => {
    return guests
      .filter((g) => g.rsvpStatus === 'Confirmed')
      .reduce((sum, g) => sum + (g.partySize || 1), 0)
  }, [guests])

  const pendingCount = useMemo(() => {
    return guests
      .filter((g) => g.rsvpStatus === 'Pending' || g.rsvpStatus === 'Tentative')
      .reduce((sum, g) => sum + (g.partySize || 1), 0)
  }, [guests])

  const stayRequiredCount = useMemo(() => {
    return guests
      .filter((g) => g.stayRequired)
      .reduce((sum, g) => sum + (g.partySize || 1), 0)
  }, [guests])

  const occupiedRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.assignedGuestIds && r.assignedGuestIds.length > 0).length
  }, [rooms])

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.relation && g.relation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.city && g.city.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesSide = sideFilter === 'all' || g.side === sideFilter
      const matchesRsvp = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter
      return matchesSearch && matchesSide && matchesRsvp
    })
  }, [guests, searchQuery, sideFilter, rsvpFilter])

  // Handle WhatsApp RSVP nudge
  const handleSendWhatsAppRsvp = (guest) => {
    const msg = getGuestRsvpWhatsAppMessage(guest, wedding)
    openWhatsApp({ phone: guest.phone, message: msg })
    if (onNotify) onNotify(`WhatsApp RSVP message opened for ${guest.name}!`)
  }

  // Handle WhatsApp Room details
  const handleSendWhatsAppRoom = (guest, room) => {
    const msg = getRoomAllocationWhatsAppMessage(guest, room, wedding)
    openWhatsApp({ phone: guest.phone, message: msg })
    if (onNotify) onNotify(`Room #${room?.roomNumber} details shared with ${guest.name} via WhatsApp!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Side', 'Relation', 'Party Size', 'RSVP Status', 'Events', 'Stay Required', 'Room', 'Dietary', 'Phone', 'City']
    const rows = guests.map((g) => [
      `"${g.name}"`,
      g.side,
      `"${g.relation || ''}"`,
      g.partySize,
      g.rsvpStatus,
      `"${(g.events || []).join('; ')}"`,
      g.stayRequired ? 'Yes' : 'No',
      `"${g.roomAssigned || 'None'}"`,
      g.dietary,
      `"${g.phone}"`,
      `"${g.city || ''}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `shaadios_guest_manifest_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    if (onNotify) onNotify('Guest & Room Manifest exported as CSV!')
  }

  const handleCreateGuest = (e) => {
    e.preventDefault()
    if (!newGuest.name.trim()) return
    const created = {
      ...newGuest,
      id: `g-${Date.now()}`,
    }
    onAddGuest(created)
    setIsAddModalOpen(false)
    setNewGuest({
      name: '',
      side: 'bride',
      group: 'VIP Elders',
      relation: '',
      partySize: 2,
      rsvpStatus: 'Pending',
      events: ['Sangeet', 'Wedding', 'Reception'],
      stayRequired: true,
      roomAssigned: null,
      dietary: 'Pure Veg',
      phone: '',
      city: 'Jaipur',
      notes: '',
    })
    if (onNotify) onNotify(`✓ ${created.name} added to wedding guest list!`)
  }

  return (
    <div className="page guests-page">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            GUEST EXPERIENCE & HOSPITALITY · {wedding.city.toUpperCase()}
          </p>
          <h1>Guest RSVPs & Room Allocations</h1>
          <p className="subtitle">
            Track multi-event confirmations, Ladkewale vs. Ladkiwale splits, and hotel room distribution seamlessly.
          </p>
        </div>

        <div className="guest-action-buttons">
          <button className="secondary-button" onClick={handleExportCSV}>
            <Download size={16} /> Export Manifest
          </button>
          <button className="primary-button" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={16} /> Add Guest / Family
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="guest-metrics-strip">
        <div className="guest-metric-card">
          <div className="metric-icon blue">
            <Users size={20} />
          </div>
          <div>
            <span className="metric-num">{totalInvitedGuests}</span>
            <small>Total Invited Across {guests.length} Parties</small>
          </div>
        </div>

        <div className="guest-metric-card">
          <div className="metric-icon green">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="metric-num text-sage">{confirmedCount} Confirmed</span>
            <small>{Math.round((confirmedCount / (totalInvitedGuests || 1)) * 100)}% Attendance rate</small>
          </div>
        </div>

        <div className="guest-metric-card">
          <div className="metric-icon amber">
            <Clock size={20} />
          </div>
          <div>
            <span className="metric-num text-amber">{pendingCount} Awaiting Nudge</span>
            <small>Tentative or Pending reply</small>
          </div>
        </div>

        <div className="guest-metric-card">
          <div className="metric-icon purple">
            <Hotel size={20} />
          </div>
          <div>
            <span className="metric-num text-purple">{occupiedRoomsCount} / {rooms.length} Rooms</span>
            <small>{stayRequiredCount} guests requiring stay</small>
          </div>
        </div>
      </div>

      {/* View Sub-Tabs (Guests vs Rooms) */}
      <div className="guest-subtab-bar">
        <button
          className={`guest-subtab ${activeSubTab === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('guests')}
        >
          <Users size={16} /> Guest Manifest ({guests.length})
        </button>
        <button
          className={`guest-subtab ${activeSubTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('rooms')}
        >
          <Bed size={16} /> Hotel Room Block ({rooms.length} Rooms)
        </button>
      </div>

      {activeSubTab === 'guests' ? (
        <>
          {/* Filters Bar */}
          <div className="guest-filters-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by guest name, relation, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-group">
              <div className="segmented-tiny">
                <button
                  className={sideFilter === 'all' ? 'active' : ''}
                  onClick={() => setSideFilter('all')}
                >
                  All Sides
                </button>
                <button
                  className={sideFilter === 'bride' ? 'active' : ''}
                  onClick={() => setSideFilter('bride')}
                >
                  🌸 Ladkiwale
                </button>
                <button
                  className={sideFilter === 'groom' ? 'active' : ''}
                  onClick={() => setSideFilter('groom')}
                >
                  🌿 Ladkewale
                </button>
                <button
                  className={sideFilter === 'mutual' ? 'active' : ''}
                  onClick={() => setSideFilter('mutual')}
                >
                  ✨ Mutual
                </button>
              </div>

              <select
                className="select-filter"
                value={rsvpFilter}
                onChange={(e) => setRsvpFilter(e.target.value)}
              >
                <option value="all">All RSVP States</option>
                <option value="Confirmed">✓ Confirmed</option>
                <option value="Tentative">⏳ Tentative</option>
                <option value="Pending">❓ Pending</option>
                <option value="Declined">✕ Declined</option>
              </select>
            </div>
          </div>

          {/* Guest List Grid */}
          <div className="guest-card-grid">
            {filteredGuests.map((guest) => {
              const assignedRoom = rooms.find((r) => r.roomNumber === guest.roomAssigned)
              return (
                <div key={guest.id} className="guest-card">
                  <div className="guest-card-header">
                    <div>
                      <div className="guest-name-row">
                        <strong>{guest.name}</strong>
                        <span className={`side-badge ${guest.side}`}>
                          {guest.side === 'bride'
                            ? 'Ladkiwale'
                            : guest.side === 'groom'
                            ? 'Ladkewale'
                            : 'Mutual'}
                        </span>
                      </div>
                      <p className="guest-relation">
                        {guest.relation} · {guest.city}
                      </p>
                    </div>

                    <select
                      className={`rsvp-badge-select ${guest.rsvpStatus.toLowerCase()}`}
                      value={guest.rsvpStatus}
                      onChange={(e) =>
                        onUpdateGuest({ ...guest, rsvpStatus: e.target.value })
                      }
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Tentative">Tentative</option>
                      <option value="Pending">Pending</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>

                  <div className="guest-details-grid">
                    <div className="detail-pill">
                      <Users size={13} />
                      <span>{guest.partySize} {guest.partySize === 1 ? 'Guest' : 'Guests'}</span>
                    </div>

                    <div className="detail-pill">
                      <Utensils size={13} />
                      <span>{guest.dietary || 'No pref'}</span>
                    </div>

                    <div className="detail-pill">
                      <Hotel size={13} />
                      <span>
                        {guest.stayRequired
                          ? guest.roomAssigned
                            ? `Room #${guest.roomAssigned}`
                            : 'Needs Room'
                          : 'No stay'}
                      </span>
                    </div>
                  </div>

                  {/* Multi-event attendance chips */}
                  <div className="guest-events-chips">
                    {(guest.events || []).map((ev) => (
                      <span key={ev} className="event-chip">
                        {ev}
                      </span>
                    ))}
                  </div>

                  {guest.notes && (
                    <p className="guest-note-text">
                      <strong>Note:</strong> {guest.notes}
                    </p>
                  )}

                  <div className="guest-card-actions">
                    <button
                      className="whatsapp-btn-small"
                      onClick={() => handleSendWhatsAppRsvp(guest)}
                      title="Send WhatsApp RSVP request"
                    >
                      <MessageCircle size={14} /> WhatsApp Nudge
                    </button>

                    {guest.stayRequired && guest.roomAssigned && (
                      <button
                        className="whatsapp-btn-subtle"
                        onClick={() => handleSendWhatsAppRoom(guest, assignedRoom)}
                        title="Send hotel room details"
                      >
                        <Hotel size={13} /> Share Room #{guest.roomAssigned}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Hotel Rooms Block View */
        <div className="rooms-management-view">
          <div className="rooms-header-banner">
            <div>
              <h3>Royal Palace Suites — Guest Room Block</h3>
              <p>
                40 rooms reserved for 17–20 Feb 2027. Early check-in requested for Baraat and elderly relatives.
              </p>
            </div>
            <div className="rooms-legend">
              <span className="legend-dot occupied">Occupied</span>
              <span className="legend-dot available">Available</span>
            </div>
          </div>

          <div className="rooms-grid">
            {rooms.map((room) => {
              const occupants = guests.filter((g) =>
                (room.assignedGuestIds || []).includes(g.id) || g.roomAssigned === room.roomNumber
              )
              const isOccupied = occupants.length > 0
              const totalOccupantHeadcount = occupants.reduce((s, g) => s + (g.partySize || 1), 0)

              return (
                <div key={room.id} className={`room-card ${isOccupied ? 'is-occupied' : 'is-available'}`}>
                  <div className="room-card-head">
                    <div>
                      <span className="room-number">#{room.roomNumber}</span>
                      <h4>{room.type}</h4>
                      <small className="room-wing">{room.wing}</small>
                    </div>
                    <span className={`room-status-badge ${isOccupied ? 'occupied' : 'available'}`}>
                      {isOccupied ? `${totalOccupantHeadcount}/${room.capacity} Guests` : 'Available'}
                    </span>
                  </div>

                  <div className="room-dates-row">
                    <Clock size={13} />
                    <span>{room.checkIn} → {room.checkOut}</span>
                  </div>

                  <div className="room-occupants-list">
                    <strong>Assigned Guests:</strong>
                    {occupants.length > 0 ? (
                      occupants.map((occ) => (
                        <div key={occ.id} className="room-occupant-row">
                          <span>{occ.name} ({occ.partySize}p)</span>
                          <button
                            className="unassign-btn"
                            title="Unassign room"
                            onClick={() => {
                              onAssignRoom(room.id, occ.id, false)
                              if (onNotify) onNotify(`Unassigned ${occ.name} from Room #${room.roomNumber}`)
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="quiet-note">No guests assigned yet.</p>
                    )}
                  </div>

                  <div className="room-card-footer">
                    <button
                      className="assign-trigger-btn"
                      onClick={() => setSelectedRoomForAssign(room)}
                    >
                      <Plus size={14} /> Assign Guest
                    </button>
                    {occupants.length > 0 && (
                      <button
                        className="whatsapp-btn-subtle"
                        onClick={() => handleSendWhatsAppRoom(occupants[0], room)}
                        title="Share room info via WhatsApp"
                      >
                        <Send size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-header">
              <h3>Add Guest / Family Group</h3>
              <button className="icon-button" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <form onSubmit={handleCreateGuest}>
              <div className="modal-scroll-body form-grid">
                <label>
                  Guest or Family Head Name <span aria-hidden="true">*</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh & Sunita Gupta"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  />
                </label>

                <div className="form-row-2">
                  <label>
                    Wedding Side
                    <select
                      value={newGuest.side}
                      onChange={(e) => setNewGuest({ ...newGuest, side: e.target.value })}
                    >
                      <option value="bride">🌸 Ladkiwale (Bride)</option>
                      <option value="groom">🌿 Ladkewale (Groom)</option>
                      <option value="mutual">✨ Mutual Friends / Colleagues</option>
                    </select>
                  </label>

                  <label>
                    Relation / Role
                    <input
                      type="text"
                      placeholder="e.g. Masi, College Bestie"
                      value={newGuest.relation}
                      onChange={(e) => setNewGuest({ ...newGuest, relation: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    Party Size (Total Guests)
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newGuest.partySize}
                      onChange={(e) => setNewGuest({ ...newGuest, partySize: Number(e.target.value) })}
                    />
                  </label>

                  <label>
                    Dietary Preference
                    <select
                      value={newGuest.dietary}
                      onChange={(e) => setNewGuest({ ...newGuest, dietary: e.target.value })}
                    >
                      <option value="Pure Veg">Pure Veg</option>
                      <option value="Jain">Jain (No Onion/Garlic/Roots)</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Vegan">Vegan</option>
                      <option value="No preference">No preference</option>
                    </select>
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    Phone / WhatsApp Number
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    />
                  </label>

                  <label>
                    Origin City
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Delhi, London"
                      value={newGuest.city}
                      onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })}
                    />
                  </label>
                </div>

                <label className="checkbox-label" style={{ marginTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={newGuest.stayRequired}
                    onChange={(e) => setNewGuest({ ...newGuest, stayRequired: e.target.checked })}
                  />
                  <span>Hotel room stay required at Royal Palace Suites</span>
                </label>

                <label style={{ marginTop: 12 }}>
                  Special Requests / Hospitality Notes
                  <textarea
                    rows="2"
                    placeholder="e.g. Wheelchair access needed, ground floor room preferred"
                    value={newGuest.notes}
                    onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  />
                </label>
              </div>

              <footer className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <UserPlus size={16} /> Save to Manifest
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Assign Room Quick Modal */}
      {selectedRoomForAssign && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-header">
              <div>
                <h3>Assign Guests to Room #{selectedRoomForAssign.roomNumber}</h3>
                <small>{selectedRoomForAssign.type} · Max {selectedRoomForAssign.capacity} Guests</small>
              </div>
              <button className="icon-button" onClick={() => setSelectedRoomForAssign(null)}>
                <X size={18} />
              </button>
            </header>
            <div className="modal-scroll-body">
              <p className="field-help" style={{ marginBottom: 12 }}>
                Select an unassigned guest who requires accommodation:
              </p>
              <div className="unassigned-guests-list">
                {guests
                  .filter((g) => g.stayRequired && !g.roomAssigned)
                  .map((guest) => (
                    <button
                      key={guest.id}
                      className="unassigned-guest-row"
                      onClick={() => {
                        onAssignRoom(selectedRoomForAssign.id, guest.id, true)
                        setSelectedRoomForAssign(null)
                        if (onNotify) onNotify(`✓ ${guest.name} assigned to Room #${selectedRoomForAssign.roomNumber}`)
                      }}
                    >
                      <div>
                        <strong>{guest.name}</strong>
                        <small>{guest.relation} · {guest.partySize} guests</small>
                      </div>
                      <span className="assign-badge">Assign</span>
                    </button>
                  ))}
                {guests.filter((g) => g.stayRequired && !g.roomAssigned).length === 0 && (
                  <p className="quiet-note">All guests requiring stay are currently allocated to rooms!</p>
                )}
              </div>
            </div>
            <footer className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedRoomForAssign(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
