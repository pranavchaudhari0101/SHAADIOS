// ShaadiOS Priority Engine
// Dynamically computes task priority based on urgency, dependency impact, and status.

import { countTransitiveDownstream } from './dependencyEngine.js'

/**
 * Calculates days remaining from today until an ISO date string (YYYY-MM-DD).
 * @param {string} isoDate
 * @returns {number}
 */
export function getDaysRemaining(isoDate) {
  if (!isoDate) return 999
  const now = new Date()
  const target = new Date(isoDate)
  const diffTime = target.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Computes dynamic priority string for a single task.
 * @param {Object} task
 * @param {Array} allTasks
 * @returns {'Critical' | 'Important' | 'Upcoming' | 'Waiting' | 'Blocked' | 'Done'}
 */
export function computeTaskPriority(task, allTasks) {
  if (task.status === 'Done') return 'Done'
  if (task.status === 'Blocked') return 'Blocked'
  if (task.status === 'Waiting') return 'Waiting'

  const downstreamCount = countTransitiveDownstream(task.id, allTasks)
  const daysLeft = task.dueIsoDate ? getDaysRemaining(task.dueIsoDate) : 10
  const isDueSoon = daysLeft <= 2 || task.due?.toLowerCase() === 'today' || task.due?.toLowerCase()?.includes('today')

  if (downstreamCount >= 2 && isDueSoon) {
    return 'Critical'
  }
  if (downstreamCount >= 1 || isDueSoon || daysLeft <= 5) {
    return 'Important'
  }
  return 'Upcoming'
}

/**
 * Computes numeric ranking score for task prioritization.
 * Higher score = higher priority on Home and Focus views.
 * @param {Object} task
 * @param {Array} allTasks
 * @returns {number}
 */
export function getTaskPriorityScore(task, allTasks) {
  if (task.status === 'Done') return -1000
  if (task.status === 'Blocked') return -500
  if (task.status === 'Waiting') return 50

  const downstreamCount = countTransitiveDownstream(task.id, allTasks)
  const daysLeft = task.dueIsoDate ? getDaysRemaining(task.dueIsoDate) : 10

  let base = 100
  if (task.priority === 'Critical') base = 500
  if (task.priority === 'Important') base = 300

  return base + (downstreamCount * 40) - (Math.max(0, daysLeft) * 8)
}

/**
 * Returns tasks annotated with dynamically computed priorities and sorted by rank.
 * @param {Array} tasks
 * @returns {Array}
 */
export function rankTasks(tasks) {
  return tasks
    .map(t => ({
      ...t,
      computedPriority: computeTaskPriority(t, tasks),
      transitiveBlocks: countTransitiveDownstream(t.id, tasks),
    }))
    .sort((a, b) => getTaskPriorityScore(b, tasks) - getTaskPriorityScore(a, tasks))
}
