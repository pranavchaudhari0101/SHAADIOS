// ShaadiOS Action & Intelligence Engine
// Powers Next-Best-Action recommendations and dynamic context-aware answers for Planner.

import { rankTasks } from './priorityEngine.js'
import { detectRisks } from './riskEngine.js'

/**
 * Derives the top 3 highest leverage actions for the current wedding state.
 * @param {Object} state - { wedding, tasks, vendors }
 * @returns {Array} Top actions
 */
export function getNextBestActions(state) {
  const { tasks = [] } = state
  const ranked = rankTasks(tasks.filter(t => t.status !== 'Done'))
  return ranked.slice(0, 3)
}

/**
 * Intelligent context-aware Q&A evaluator for the Planner view.
 * @param {string} rawPrompt
 * @param {Object} state - { wedding, tasks, vendors, people }
 * @returns {Object} { answer: string, actionTaskId: string | null, actionLabel: string | null }
 */
export function queryPlanner(rawPrompt, state) {
  const query = (rawPrompt || '').trim().toLowerCase()
  const { wedding, tasks = [], vendors = [] } = state
  const risks = detectRisks(state)
  const openTasks = tasks.filter(t => t.status !== 'Done')
  const waitingTasks = tasks.filter(t => t.status === 'Waiting')
  const topActions = getNextBestActions(state)

  // Query 1: "What should I do this week / next?"
  if (query.includes('do this week') || query.includes('should i do') || query.includes('what next') || query.includes('focus')) {
    const taskList = topActions
      .map((t, idx) => `${idx + 1}. **${t.title}** (${t.owner} · Due ${t.due}): ${t.reason}`)
      .join('\n\n')

    const topTask = topActions[0]
    return {
      answer: `Here is the highest-leverage focus for your ${wedding.city} celebration this week:\n\n${taskList}\n\nResolving these clears bottlenecks for the rest of your team.`,
      actionTaskId: topTask ? topTask.id : null,
      actionLabel: topTask ? `Open: ${topTask.title}` : null,
    }
  }

  // Query 2: Date change impact
  if (query.includes('date change') || query.includes('different date') || query.includes('change date') || query.includes('postpone')) {
    const venue = vendors.find(v => v.category === 'Venue')
    const photo = vendors.find(v => v.category === 'Photography')
    return {
      answer: `A date change affects 5 interconnected pillars of your wedding:\n\n` +
        `• **Venue (${venue ? venue.name : 'Primary venue'})**: Must verify banquet & lawn availability before confirming any shift.\n` +
        `• **Photography (${photo ? photo.name : 'Lenscraft'})**: Existing date hold needs revision.\n` +
        `• **Accommodations**: Mom's group room block request at Royal Palace Suites must be retargeted.\n` +
        `• **Invitations**: Proofing and print schedule will automatically re-anchor.\n\n` +
        `You can use the **Change wedding date** button in the header anytime to run a risk simulation before committing.`,
      actionTaskId: 'venue',
      actionLabel: 'Review venue contract',
    }
  }

  // Query 3: Who is waiting on what?
  if (query.includes('waiting') || query.includes('who is waiting') || query.includes('pending') || query.includes('follow up')) {
    const waits = []
    waitingTasks.forEach(t => {
      waits.push(`• **${t.owner}**: ${t.reason} (Task: *${t.title}*)`)
    })
    vendors.filter(v => v.state === 'Quote received' || v.state === 'Contacted').forEach(v => {
      waits.push(`• **${v.name} (${v.category})**: Pending follow-up on ${v.action.toLowerCase()}`)
    })

    const topWait = waitingTasks[0]
    return {
      answer: `Here are the active wait states currently being monitored in your wedding:\n\n${waits.join('\n\n')}\n\nShaadiOS will notify the respective owner if any wait exceeds safe safety margins.`,
      actionTaskId: topWait ? topWait.id : null,
      actionLabel: topWait ? `Review ${topWait.owner}'s task` : null,
    }
  }

  // Query 4: Risks and bottlenecks
  if (query.includes('risk') || query.includes('blocked') || query.includes('problem') || query.includes('trouble') || query.includes('delay')) {
    if (risks.length === 0) {
      return {
        answer: `Great news! Your wedding in ${wedding.city} has **no critical risks** detected at this moment. You have ${openTasks.length} open tasks progressing smoothly.`,
        actionTaskId: null,
        actionLabel: null,
      }
    }

    const riskDescriptions = risks.map((r, i) => `**${i + 1}. [${r.severity.toUpperCase()}] ${r.title}**\n${r.description}`).join('\n\n')
    const primaryRisk = risks[0]
    return {
      answer: `ShaadiOS is currently monitoring **${risks.length} active risk${risks.length > 1 ? 's' : ''}**:\n\n${riskDescriptions}`,
      actionTaskId: primaryRisk.targetTaskId,
      actionLabel: primaryRisk.actionLabel,
    }
  }

  // Query 5: Budget and vendor spend
  if (query.includes('budget') || query.includes('cost') || query.includes('spend') || query.includes('money') || query.includes('vendor')) {
    const totalCommitted = vendors
      .filter(v => v.state === 'Confirmed' || v.state === 'Selected' || v.state === 'Contract pending')
      .reduce((sum, v) => sum + (v.amountNumber || 0), 0)

    const formattedCommitted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalCommitted)

    return {
      answer: `Your planned budget is **${wedding.budget}** for ${wedding.guests}.\n\n` +
        `• **Currently committed / in contract**: ${formattedCommitted} across ${vendors.length} vendors.\n` +
        `• **Top expense**: The Roseate Venue (${vendors.find(v => v.category === 'Venue')?.amount || '₹5.4L'}).\n` +
        `• **Status**: Within healthy range for Jaipur destination wedding guidelines.`,
      actionTaskId: 'venue',
      actionLabel: 'Inspect vendor allocations',
    }
  }

  // Generic fallback query with wedding intelligence context
  const topTask = topActions[0]
  return {
    answer: `Regarding your query: "${rawPrompt}"\n\n` +
      `Your wedding is set for **${wedding.date}** in **${wedding.city}** (${wedding.days} days to go). ` +
      `You currently have **${openTasks.length} active tasks** and **${risks.length} watch items**.\n\n` +
      `The most impactful step you can take right now is **${topTask ? topTask.title : 'reviewing your checklist'}** because ${topTask ? topTask.reason.toLowerCase() : 'it keeps momentum going'}.`,
    actionTaskId: topTask ? topTask.id : null,
    actionLabel: topTask ? `View: ${topTask.title}` : null,
  }
}
