import { daysBetween, formatIndianDate, isValidDate, shiftDate, todayIso } from './utils.js'
import { synchronizeDependencies } from './dependencyEngine.js'

// ShaadiOS Wedding State Engine
// Manages the connected wedding state model, initial seed data, and local persistence.

export const STORAGE_KEY = 'shaadios_wedding_state_v1'

export const DEFAULT_WEDDING = {
  id: 'wed-001',
  couple: 'Rhea & Arjun',
  partner1: 'Rhea Kapoor',
  partner2: 'Arjun Mehta',
  city: 'Jaipur',
  date: '18 Feb 2027',
  isoDate: '2027-02-18',
  days: 156,
  guests: '280 guests',
  guestCount: 280,
  budget: '₹24L budget',
  budgetAmount: 2400000,
  ceremonies: ['Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception'],
  onTrackScore: 82,
}

export const DEFAULT_PEOPLE = [
  {
    id: 'p-rhea',
    name: 'Rhea Kapoor',
    role: 'Wedding owner',
    roleKey: 'owner',
    initials: 'R',
    email: 'rhea@example.com',
    phone: '+91 98201 11223',
    tint: 'coral',
    note: 'Full access · 4 active tasks',
  },
  {
    id: 'p-arjun',
    name: 'Arjun Mehta',
    role: 'Co-owner',
    roleKey: 'co_owner',
    initials: 'A',
    email: 'arjun@example.com',
    phone: '+91 98190 44556',
    tint: 'sage',
    note: 'Full access · 2 active tasks',
  },
  {
    id: 'p-mom',
    name: 'Meera Kapoor (Mom)',
    role: 'Family lead',
    roleKey: 'family_lead',
    initials: 'M',
    email: 'meera.k@example.com',
    phone: '+91 98200 77889',
    tint: 'soft',
    note: 'Assigned work · 1 waiting task',
  },
  {
    id: 'p-kavya',
    name: 'Kavya Shah',
    role: 'Coordinator',
    roleKey: 'coordinator',
    initials: 'K',
    email: 'kavya.coord@example.com',
    phone: '+91 99300 22334',
    tint: 'lilac',
    note: 'Operational access · Ready to assist',
  },
]

export const DEFAULT_TASKS = [
  {
    id: 'venue',
    title: 'Confirm venue contract with The Roseate',
    owner: 'Rhea',
    ownerRole: 'owner',
    initials: 'R',
    due: 'Today',
    dueIsoDate: '2026-09-16',
    status: 'In progress', // 'Not started' | 'In progress' | 'Waiting' | 'Blocked' | 'Done'
    priority: 'Critical',  // 'Critical' | 'Important' | 'Upcoming' | 'Waiting' | 'Blocked' | 'Done'
    type: 'venue',
    category: 'Venue',
    ceremony: 'Wedding',
    reason: 'It unlocks invitation design, family accommodation and decor planning.',
    dependsOn: [],
    blocks: ['invitations', 'accommodation', 'decor'],
    notes: [
      'Site visit completed on 10 Sep. Banquet halls and central lawn shortlisted.',
      'Revised quote received: ₹5.4L including sound curfew waiver until 11 PM.',
    ],
  },
  {
    id: 'photographer',
    title: 'Review photographer contract from Lenscraft Studios',
    owner: 'Arjun',
    ownerRole: 'co_owner',
    initials: 'A',
    due: 'In 4 days',
    dueIsoDate: '2026-09-20',
    status: 'Not started',
    priority: 'Important',
    type: 'photo',
    category: 'Vendor',
    ceremony: 'All ceremonies',
    reason: 'The studio is holding your date until 22 September before releasing it.',
    dependsOn: [],
    blocks: [],
    notes: ['Package covers Candid + Traditional + 3-min Teaser + Drone.'],
  },
  {
    id: 'accommodation',
    title: 'Confirm family hotel block quote',
    owner: 'Mom',
    ownerRole: 'family_lead',
    initials: 'M',
    due: 'In 6 days',
    dueIsoDate: '2026-09-22',
    status: 'Waiting',
    priority: 'Waiting',
    type: 'stay',
    category: 'Accommodation',
    ceremony: 'Wedding',
    reason: 'Mom is waiting for the hotel sales manager to provide the 40-room discount.',
    dependsOn: ['venue'],
    blocks: ['travel-logistics'],
    notes: ['Need 25 Deluxe rooms + 15 Club rooms within 4km radius of venue.'],
  },
  {
    id: 'guest-list',
    title: 'Consolidate first guest list estimate',
    owner: 'Both of you',
    ownerRole: 'owner',
    initials: 'R+A',
    due: 'This week',
    dueIsoDate: '2026-09-23',
    status: 'In progress',
    priority: 'Upcoming',
    type: 'guest',
    category: 'Guests',
    ceremony: 'All ceremonies',
    reason: 'Required to size catering buffers and hotel allocations accurately.',
    dependsOn: [],
    blocks: ['invitations'],
    notes: ['Kapoor family: 160 guests. Mehta family: 120 guests. Total target: 280.'],
  },
  {
    id: 'tasting',
    title: 'Schedule catering menu tasting session',
    owner: 'Arjun',
    ownerRole: 'co_owner',
    initials: 'A',
    due: '27 Sep',
    dueIsoDate: '2026-09-27',
    status: 'Not started',
    priority: 'Upcoming',
    type: 'food',
    category: 'Catering',
    ceremony: 'Reception',
    reason: 'Menu choices need to be locked before the catering agreement is signed.',
    dependsOn: ['venue'],
    blocks: ['catering-contract'],
    notes: ['Saffron Tables offered 6-course live counter tasting.'],
  },
  {
    id: 'decor',
    title: 'Finalize decor moodboard & stage designs',
    owner: 'Rhea',
    ownerRole: 'owner',
    initials: 'R',
    due: '06 Oct',
    dueIsoDate: '2026-10-06',
    status: 'Blocked',
    priority: 'Blocked',
    type: 'decor',
    category: 'Decor',
    ceremony: 'Sangeet',
    reason: 'Awaiting venue layout confirmation from The Roseate before floral sizing.',
    dependsOn: ['venue'],
    blocks: [],
    notes: ['Mogra & Co. submitted 2 concept drafts: Marigold Sunset & Royal Ivory.'],
  },
  {
    id: 'invitations',
    title: 'Approve digital & physical invitation proof',
    owner: 'Both of you',
    ownerRole: 'owner',
    initials: 'R+A',
    due: '12 Oct',
    dueIsoDate: '2026-10-12',
    status: 'Blocked',
    priority: 'Blocked',
    type: 'invites',
    category: 'Invitations',
    ceremony: 'All ceremonies',
    reason: 'Cannot print without venue name, address and finalized guest count.',
    dependsOn: ['venue', 'guest-list'],
    blocks: ['send-invites'],
    notes: ['Design drafts ready with handwritten calligraphy font.'],
  },
  {
    id: 'mehendi-artist',
    title: 'Lock bridal mehendi artist booking',
    owner: 'Rhea',
    ownerRole: 'owner',
    initials: 'R',
    due: '18 Oct',
    dueIsoDate: '2026-10-18',
    status: 'Not started',
    priority: 'Upcoming',
    type: 'artist',
    category: 'Artists',
    ceremony: 'Mehendi',
    reason: 'Top bridal artists book 4-5 months in advance during peak season.',
    dependsOn: [],
    blocks: [],
    notes: ['Shortlisted: Geeta Patel Mehendi & Henna Artistry.'],
  },
  {
    id: 'sangeet-track',
    title: 'Curate Sangeet family performance tracklist',
    owner: 'Arjun',
    ownerRole: 'co_owner',
    initials: 'A',
    due: '25 Oct',
    dueIsoDate: '2026-10-25',
    status: 'Not started',
    priority: 'Upcoming',
    type: 'sangeet',
    category: 'Entertainment',
    ceremony: 'Sangeet',
    reason: 'Choreographer needs songs 8 weeks prior for dance practice scheduling.',
    dependsOn: [],
    blocks: [],
    notes: ['4 group dances + 1 couple dance + finale.'],
  },
]

export const DEFAULT_VENDORS = [
  {
    id: 'v-roseate',
    name: 'The Roseate',
    category: 'Venue',
    state: 'Selected', // 'Discovered' | 'Shortlisted' | 'Contacted' | 'Quote received' | 'Selected' | 'Confirmed'
    owner: 'Rhea',
    action: 'Confirm contract',
    amount: '₹5,40,000',
    amountNumber: 540000,
    color: 'rose',
    holdDeadline: '2026-09-18',
    contactPerson: 'Vikram Singhania',
    phone: '+91 98290 12345',
    notes: 'Holding banquet + lawn for Feb 18. Token advance of 20% required.',
    relatedTaskId: 'venue',
  },
  {
    id: 'v-lenscraft',
    name: 'Lenscraft Studios',
    category: 'Photography',
    state: 'Selected',
    owner: 'Arjun',
    action: 'Review contract',
    amount: '₹1,20,000',
    amountNumber: 120000,
    color: 'blue',
    holdDeadline: '2026-09-22',
    contactPerson: 'Aakash Verma',
    phone: '+91 98111 88990',
    notes: 'Date hold expires 22 Sep. Includes drone cinematography and teaser reel.',
    relatedTaskId: 'photographer',
  },
  {
    id: 'v-saffron',
    name: 'Saffron Tables',
    category: 'Catering',
    state: 'Quote received',
    owner: 'Arjun',
    action: 'Book tasting',
    amount: '₹3,80,000',
    amountNumber: 380000,
    color: 'orange',
    holdDeadline: '2026-10-01',
    contactPerson: 'Chef Sanjeev Anand',
    phone: '+91 99200 44551',
    notes: 'Live Rajasthani + Awadhi stations. Tasting slotted for 6 guests.',
    relatedTaskId: 'tasting',
  },
  {
    id: 'v-mogra',
    name: 'Mogra & Co.',
    category: 'Decor',
    state: 'Shortlisted',
    owner: 'Rhea',
    action: 'Request moodboard',
    amount: '₹2,50,000',
    amountNumber: 250000,
    color: 'purple',
    holdDeadline: '2026-10-15',
    contactPerson: 'Pooja Bhatia',
    phone: '+91 98333 11229',
    notes: 'Awaiting venue layout blueprints from The Roseate before final quote.',
    relatedTaskId: 'decor',
  },
  {
    id: 'v-royal-stays',
    name: 'Royal Palace Suites',
    category: 'Accommodation',
    state: 'Contacted',
    owner: 'Mom',
    action: 'Follow up on group quote',
    amount: '₹4,00,000',
    amountNumber: 400000,
    color: 'amber',
    holdDeadline: '2026-09-24',
    contactPerson: 'Rajesh Mehra',
    phone: '+91 98292 77711',
    notes: '40 room block quotation pending manager sign-off.',
    relatedTaskId: 'accommodation',
  },
]

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Photographer hold expires in 4 days',
    description: 'Lenscraft Studios will release 18 Feb 2027 if the agreement is not signed by 22 Sep.',
    type: 'critical', // 'critical' | 'action' | 'waiting' | 'update'
    timestamp: '2 hours ago',
    read: false,
    taskId: 'photographer',
    targetRole: 'co_owner',
  },
  {
    id: 'notif-2',
    title: 'Mom is waiting on hotel quote',
    description: 'Royal Palace Suites sales manager has taken 48 hours. Consider a reminder.',
    type: 'waiting',
    timestamp: '5 hours ago',
    read: false,
    taskId: 'accommodation',
    targetRole: 'family_lead',
  },
  {
    id: 'notif-3',
    title: 'Invitations blocked by Venue',
    description: 'Design proofing cannot begin until venue details and address are confirmed.',
    type: 'action',
    timestamp: 'Yesterday',
    read: true,
    taskId: 'invitations',
    targetRole: 'owner',
  },
]

export const DEFAULT_ACTIVITY = [
  {
    id: 'act-1',
    text: 'ShaadiOS workspace initialized for Jaipur celebration',
    time: 'Yesterday',
    author: 'System',
  },
  {
    id: 'act-2',
    text: 'Site visit notes recorded for The Roseate',
    time: 'Yesterday',
    author: 'Rhea',
  },
  {
    id: 'act-3',
    text: 'Hotel block coordination delegated to Mom',
    time: '2 days ago',
    author: 'Rhea',
  },
]

export function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (isValidSavedState(parsed)) return parsed
    }
  } catch (e) {
    console.warn('Could not read saved wedding state, using defaults:', e)
  }
  return {
    wedding: DEFAULT_WEDDING,
    tasks: DEFAULT_TASKS,
    vendors: DEFAULT_VENDORS,
    people: DEFAULT_PEOPLE,
    notifications: DEFAULT_NOTIFICATIONS,
    activityLog: DEFAULT_ACTIVITY,
    activeRole: 'owner', // 'owner' | 'co_owner' | 'family_lead' | 'coordinator'
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    return false
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // ignore
  }
  return {
    wedding: DEFAULT_WEDDING,
    tasks: DEFAULT_TASKS,
    vendors: DEFAULT_VENDORS,
    people: DEFAULT_PEOPLE,
    notifications: DEFAULT_NOTIFICATIONS,
    activityLog: [
      {
        id: `act-${Date.now()}`,
        text: 'Reset plan to Jaipur baseline demonstration',
        time: 'Just now',
        author: 'System',
      },
      ...DEFAULT_ACTIVITY,
    ],
    activeRole: 'owner',
  }
}

// Local storage is untrusted input. Reject malformed snapshots rather than crashing the UI.
export function isValidSavedState(state) {
  const text = v => typeof v === 'string' && v.length <= 10000
  const fields = (item, keys) => item && keys.every(k => text(item[k]))
  const list = (value, predicate) => Array.isArray(value) && value.length <= 2000 && value.every(predicate)
  if (!state || !fields(state.wedding, ['couple', 'city', 'isoDate', 'date', 'guests', 'budget']) || !state.wedding.couple.trim() || !isValidDate(state.wedding.isoDate)) return false
  if (!list(state.wedding.ceremonies, text)) return false
  if (!list(state.tasks, t => fields(t, ['id', 'title', 'owner', 'ownerRole', 'status', 'category', 'ceremony', 'reason']) &&
    ['Not started', 'In progress', 'Waiting', 'Blocked', 'Done'].includes(t.status) &&
    list(t.dependsOn, text) && list(t.notes, text) && (!t.dueIsoDate || isValidDate(t.dueIsoDate)))) return false
  if (!list(state.vendors, v => fields(v, ['id', 'name', 'state', 'owner', 'category', 'action', 'amount']) && (!v.holdDeadline || isValidDate(v.holdDeadline)))) return false
  if (!list(state.people, p => fields(p, ['id', 'name', 'role', 'roleKey', 'initials'])) || !state.people.length) return false
  if (!list(state.notifications, n => fields(n, ['id', 'title', 'description', 'type', 'timestamp']))) return false
  if (!list(state.activityLog, a => fields(a, ['id', 'text', 'time', 'author']))) return false
  const ids = new Set(state.tasks.map(t => t.id))
  if (ids.size !== state.tasks.length || state.tasks.some(t => t.dependsOn.some(id => id === t.id || !ids.has(id)))) return false
  // Bound traversal and reject cycles, including cycles imported through devtools.
  const done = new Set(), visiting = new Set(), map = new Map(state.tasks.map(t => [t.id, t]))
  const visit = id => {
    if (visiting.has(id)) return false
    if (done.has(id)) return true
    visiting.add(id)
    if (!map.get(id).dependsOn.every(visit)) return false
    visiting.delete(id); done.add(id); return true
  }
  return state.tasks.every(t => visit(t.id))
}

export function createWeddingState(setup) {
  if (!isValidDate(setup.date) || setup.date < todayIso() || setup.date > '2100-12-31' || !setup.city.trim() || !setup.couple.trim() || !setup.ceremonies.length) {
    throw new Error('Add your names, city, a future date and at least one ceremony.')
  }
  const fresh = resetState()
  const names = setup.couple.split(/\s*(?:&|\band\b)\s*/i).filter(Boolean)
  const people = fresh.people.slice(0, 2).map((p, i) => ({ ...p, name: names[i] || 'Partner', initials: (names[i] || 'P')[0].toUpperCase(), email: '', phone: '' }))
  const bookedIds = { Venue: 'venue', Photography: 'photographer', Catering: 'tasting', Decor: 'decor', Makeup: 'makeup' }
  const tasks = DEFAULT_TASKS.filter(t => t.ceremony === 'All ceremonies' || setup.ceremonies.includes(t.ceremony)).map(t => {
    const person = people[t.ownerRole === 'co_owner' ? 1 : 0]
    const dueIsoDate = shiftDate(setup.date, daysBetween(DEFAULT_WEDDING.isoDate, t.dueIsoDate))
    return { ...t, owner: person.name, ownerId: person.id, ownerRole: person.roleKey, initials: person.initials,
      title: t.title.replace(' with The Roseate', '').replace(' from Lenscraft Studios', ''),
      dueIsoDate, due: formatIndianDate(dueIsoDate), notes: [], reason: `Coordinate ${t.category.toLowerCase()} for your celebration in ${setup.city.trim()}.`,
      status: (setup.booked || []).some(b => bookedIds[b] === t.id) ? 'Done' : 'Not started' }
  })
  tasks.push({ id: 'makeup', title: 'Confirm bridal hair & makeup artist', category: 'Artists', ceremony: setup.ceremonies[0], type: 'artist',
    owner: people[0].name, ownerId: people[0].id, ownerRole: 'owner', initials: people[0].initials,
    dueIsoDate: shiftDate(setup.date, -90), due: formatIndianDate(shiftDate(setup.date, -90)),
    status: (setup.booked || []).includes('Makeup') ? 'Done' : 'Not started', priority: 'Upcoming',
    reason: 'Arrange a trial and confirm your artist.', dependsOn: [], blocks: [], notes: [] })
  const ids = new Set(tasks.map(t => t.id))
  tasks.forEach(t => { t.dependsOn = t.dependsOn.filter(id => ids.has(id)); t.blocks = tasks.filter(x => x.dependsOn.includes(t.id)).map(x => x.id) })
  return {
    ...fresh, people, vendors: [], notifications: [], activityLog: [], hasStarted: true,
    wedding: { ...DEFAULT_WEDDING, couple: setup.couple.trim(), partner1: people[0].name, partner2: people[1].name,
      city: setup.city.trim(), isoDate: setup.date, date: formatIndianDate(setup.date), days: daysBetween(todayIso(), setup.date),
      guests: `${setup.guests} guests`, budget: `${setup.budget} budget`, ceremonies: [...setup.ceremonies] },
    tasks: synchronizeDependencies(tasks),
  }
}
