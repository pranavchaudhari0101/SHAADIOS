// ShaadiOS Dependency Engine
// Manages directed dependencies, blocked task detection, and cascading completion updates.

/**
 * Checks if a task is currently blocked by incomplete prerequisite tasks.
 * @param {Object} task
 * @param {Array} allTasks
 * @returns {boolean}
 */
export function isTaskBlocked(task, allTasks) {
  if (!task.dependsOn || task.dependsOn.length === 0) return false
  const taskMap = new Map(allTasks.map(t => [t.id, t]))
  return task.dependsOn.some(parentKey => {
    const parent = taskMap.get(parentKey)
    return parent && parent.status !== 'Done'
  })
}

/**
 * Returns list of incomplete prerequisite task objects for a given task.
 * @param {Object} task
 * @param {Array} allTasks
 * @returns {Array}
 */
export function getBlockedPrerequisites(task, allTasks) {
  if (!task.dependsOn || task.dependsOn.length === 0) return []
  const taskMap = new Map(allTasks.map(t => [t.id, t]))
  return task.dependsOn
    .map(parentId => taskMap.get(parentId))
    .filter(parent => parent && parent.status !== 'Done')
}

/**
 * Calculates total transitive downstream tasks that depend on this task.
 * @param {string} taskId
 * @param {Array} allTasks
 * @returns {number}
 */
export function countTransitiveDownstream(taskId, allTasks) {
  const visited = new Set()
  const queue = [taskId]

  while (queue.length > 0) {
    const currentId = queue.shift()
    for (const t of allTasks) {
      if (t.dependsOn && t.dependsOn.includes(currentId) && !visited.has(t.id)) {
        visited.add(t.id)
        queue.push(t.id)
      }
    }
  }

  return visited.size
}

/**
 * Evaluates and cascades state updates across the dependency graph.
 * When a task is completed, downstream tasks check if all their dependencies are resolved.
 * If resolved, their status transitions from 'Blocked' to 'Not started'.
 *
 * @param {Array} tasks
 * @param {string} completedTaskId
 * @returns {{ updatedTasks: Array, newlyUnblocked: Array }}
 */
export function cascadeTaskCompletion(tasks, completedTaskId) {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]))
  const newlyUnblocked = []

  // Ensure completed task is marked Done
  const completedTask = taskMap.get(completedTaskId)
  if (completedTask) {
    completedTask.status = 'Done'
    completedTask.priority = 'Done'
  }

  // Evaluate every task in the system
  for (const [id, task] of taskMap.entries()) {
    if (task.status === 'Done') continue

    const stillBlocked = isTaskBlocked(task, Array.from(taskMap.values()))

    if (task.status === 'Blocked' && !stillBlocked) {
      task.status = 'Not started'
      task.priority = 'Upcoming'
      newlyUnblocked.push(task)
    } else if (task.status !== 'Blocked' && stillBlocked) {
      task.status = 'Blocked'
      task.priority = 'Blocked'
    }
  }

  return {
    updatedTasks: Array.from(taskMap.values()),
    newlyUnblocked,
  }
}

/**
 * Re-evaluates blocked status for all tasks based on dependencies.
 * @param {Array} tasks
 * @returns {Array}
 */
export function synchronizeDependencies(tasks) {
  return tasks.map(task => {
    if (task.status === 'Done') return task
    const blocked = isTaskBlocked(task, tasks)
    if (blocked && task.status !== 'Blocked') {
      return { ...task, status: 'Blocked', priority: 'Blocked' }
    }
    if (!blocked && task.status === 'Blocked') {
      return { ...task, status: 'Not started', priority: 'Upcoming' }
    }
    return task
  })
}
