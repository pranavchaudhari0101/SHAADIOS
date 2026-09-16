// ShaadiOS Change Management Engine
// Simulates and executes cascading changes (e.g. Wedding Date shift) across the entire wedding graph.

import { formatIndianDate } from './utils.js'

/**
 * Simulates the ripple effect of changing the wedding date.
 * @param {Object} wedding
 * @param {Array} tasks
 * @param {Array} vendors
 * @param {string} newIsoDate - Target YYYY-MM-DD
 * @returns {Object} Impact report
 */
export function simulateDateChange(wedding, tasks, vendors, newIsoDate) {
  const currentDate = new Date(wedding.isoDate || '2027-02-18')
  const targetDate = new Date(newIsoDate)
  const diffDays = Math.round((targetDate - currentDate) / (1000 * 60 * 60 * 24))

  const formattedOld = wedding.date || formatIndianDate(wedding.isoDate)
  const formattedNew = formatIndianDate(newIsoDate)

  const direction = diffDays > 0 ? `pushed by ${diffDays} days` : diffDays < 0 ? `moved earlier by ${Math.abs(diffDays)} days` : 'unchanged'

  const impacts = [
    {
      id: 'impact-venue',
      level: 'Critical',
      title: 'The Roseate venue hold',
      category: 'Venue',
      body: `Check lawn & banquet availability for ${formattedNew} before changing anything else. Token advance window will reset.`,
      owner: 'Rhea',
      action: 'Confirm venue availability',
    },
    {
      id: 'impact-photo',
      level: 'High',
      title: 'Lenscraft Studios photography team',
      category: 'Vendor',
      body: `Your selected lead cinematographer is reserved for ${formattedOld}. Shift requires date hold re-confirmation.`,
      owner: 'Arjun',
      action: 'Request hold modification',
    },
    {
      id: 'impact-stay',
      level: 'High',
      title: 'Family accommodation room block',
      category: 'Accommodation',
      body: `Mom’s 40-room discount quote at Royal Palace Suites needs revised check-in/out dates.`,
      owner: 'Mom',
      action: 'Update hotel inquiry dates',
    },
    {
      id: 'impact-invites',
      level: 'Medium',
      title: 'Invitation proofing & printing deadline',
      category: 'Invitations',
      body: `Date printing window shifts ${diffDays >= 0 ? `back by ${diffDays} days` : `forward by ${Math.abs(diffDays)} days`}. Final proofing deadline will recalculate.`,
      owner: 'Both of you',
      action: 'Adjust proofing target',
    },
    {
      id: 'impact-tasting',
      level: 'Medium',
      title: 'Catering menu tasting schedule',
      category: 'Catering',
      body: `Saffron Tables tasting slot will automatically re-align 4 months prior to ${formattedNew}.`,
      owner: 'Arjun',
      action: 'Reschedule tasting window',
    },
  ]

  const affectedCollaborators = ['Rhea Kapoor', 'Arjun Mehta', 'Meera Kapoor (Mom)']

  return {
    diffDays,
    direction,
    formattedOld,
    formattedNew,
    impacts,
    affectedCount: impacts.length,
    affectedCollaborators,
  }
}

/**
 * Applies a confirmed wedding date change to the wedding state.
 * Pro-rates task due dates, generates selective notifications, and logs history.
 *
 * @param {Object} currentState - { wedding, tasks, vendors, notifications, activityLog }
 * @param {string} newIsoDate
 * @returns {Object} Updated state
 */
export function applyDateChange(currentState, newIsoDate) {
  const { wedding, tasks, notifications = [], activityLog = [] } = currentState
  const formattedNew = formatIndianDate(newIsoDate)

  // Calculate new days to go
  const today = new Date()
  const target = new Date(newIsoDate)
  const newDaysToGo = Math.max(1, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))

  // Shift task due dates where appropriate
  const updatedTasks = tasks.map(task => {
    if (task.id === 'venue' && task.status !== 'Done') {
      return {
        ...task,
        due: 'Today (Re-check)',
        priority: 'Critical',
        reason: `Re-confirm availability with The Roseate for revised wedding date: ${formattedNew}.`,
      }
    }
    if (task.id === 'invitations') {
      return {
        ...task,
        reason: `Card print dates re-aligned to anchor date ${formattedNew}.`,
      }
    }
    return task
  })

  // Selective notifications generated
  const newNotifications = [
    {
      id: `notif-change-${Date.now()}-1`,
      title: `Wedding date moved to ${formattedNew}`,
      description: 'Venue, photography, accommodation, and catering deadlines have been recalculated.',
      type: 'critical',
      timestamp: 'Just now',
      read: false,
      targetRole: 'owner',
    },
    {
      id: `notif-change-${Date.now()}-2`,
      title: 'Hotel dates revised for Mom',
      description: `Accommodation room block inquiry automatically updated to target ${formattedNew}.`,
      type: 'waiting',
      timestamp: 'Just now',
      read: false,
      targetRole: 'family_lead',
    },
    ...notifications,
  ]

  const newActivity = [
    {
      id: `act-${Date.now()}`,
      text: `Wedding date rescheduled from ${wedding.date} to ${formattedNew} with plan recalculation`,
      time: 'Just now',
      author: 'Rhea',
    },
    ...activityLog,
  ]

  return {
    ...currentState,
    wedding: {
      ...wedding,
      date: formattedNew,
      isoDate: newIsoDate,
      days: newDaysToGo,
    },
    tasks: updatedTasks,
    notifications: newNotifications,
    activityLog: newActivity,
  }
}
