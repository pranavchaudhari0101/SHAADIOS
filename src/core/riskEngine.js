// ShaadiOS Risk Engine
// Detects real-time risks across deadlines, vendor holds, dependency locks, and waiting bottlenecks.

import { getDaysRemaining } from './priorityEngine.js'

/**
 * Evaluates full wedding state and returns active detected risks.
 * @param {Object} params - { wedding, tasks, vendors, people }
 * @returns {Array} Array of structured risk cards
 */
export function detectRisks({ wedding, tasks, vendors }) {
  const risks = []

  // Risk 1: Unconfirmed Venue blocking downstream invitations & accommodations
  const venueTask = tasks.find(t => t.id === 'venue' || t.category === 'Venue')
  const invitationsTask = tasks.find(t => t.id === 'invitations')
  if (venueTask && venueTask.status !== 'Done') {
    risks.push({
      id: 'risk-venue-invitations',
      severity: 'Medium',
      title: 'Invitations may slip if venue approval waits.',
      description: 'Invitation design needs the venue details. Printing typically takes 7 days, and your current design window begins in 10 days.',
      impact: 'Blocks 4 planning decisions including decor and guest stay allocations.',
      actionLabel: 'Resolve the venue decision',
      targetTaskId: venueTask.id,
      category: 'Dependency Lock',
    })
  }

  // Risk 2: Vendor hold deadline expiring soon
  if (vendors && vendors.length > 0) {
    for (const vendor of vendors) {
      if (vendor.holdDeadline && vendor.state !== 'Confirmed') {
        const daysLeft = getDaysRemaining(vendor.holdDeadline)
        if (daysLeft >= 0 && daysLeft <= 6) {
          risks.push({
            id: `risk-vendor-hold-${vendor.id}`,
            severity: 'High',
            title: `${vendor.name} date hold expires in ${daysLeft === 0 ? 'less than 24 hours' : `${daysLeft} days`}.`,
            description: `The studio is holding your date until ${vendor.holdDeadline}. After this window, the slot opens to other couples.`,
            impact: 'Risk losing preferred vendor and having to restart photography discovery.',
            actionLabel: `Review ${vendor.name} contract`,
            targetTaskId: vendor.relatedTaskId || 'photographer',
            category: 'Vendor Expiry',
          })
        }
      }
    }
  }

  // Risk 3: Family member waiting on hotel quote
  const waitingTasks = tasks.filter(t => t.status === 'Waiting')
  for (const wt of waitingTasks) {
    risks.push({
      id: `risk-waiting-${wt.id}`,
      severity: 'Low',
      title: `${wt.owner} is waiting on ${wt.category.toLowerCase()} response.`,
      description: wt.reason,
      impact: 'May compress subsequent negotiation and room booking timeline.',
      actionLabel: `View ${wt.title}`,
      targetTaskId: wt.id,
      category: 'Waiting Bottleneck',
    })
  }

  return risks
}

/**
 * Calculates current overall on-track health score (0 - 100%).
 * @param {Array} tasks
 * @param {Array} risks
 * @returns {{ score: number, criticalCount: number, completedCount: number, label: string }}
 */
export function calculateHealthScore(tasks, risks) {
  const total = tasks.length || 1
  const completed = tasks.filter(t => t.status === 'Done').length
  const critical = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Done').length
  const blocked = tasks.filter(t => t.status === 'Blocked').length

  let score = Math.round((completed / total) * 30) + 70
  if (critical > 0) score -= critical * 8
  if (blocked > 0) score -= blocked * 4
  score = Math.max(50, Math.min(98, score))

  return {
    score,
    criticalCount: critical,
    completedCount: completed,
    label: critical > 0 ? `${score}% on track` : `${score}% on track`,
  }
}
