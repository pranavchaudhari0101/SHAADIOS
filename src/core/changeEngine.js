// Date changes affect internal planning dates, never external vendor agreements.
import { daysBetween, formatIndianDate, isValidDate, shiftDate, todayIso } from './utils.js'

export function simulateDateChange(wedding, tasks, vendors, newIsoDate) {
  const valid = isValidDate(newIsoDate) && newIsoDate >= todayIso() && newIsoDate <= '2100-12-31'
  const diffDays = valid ? daysBetween(wedding.isoDate, newIsoDate) : 0
  const affectedTasks = tasks.filter(t => t.status !== 'Done' && isValidDate(t.dueIsoDate))
  const affectedVendors = vendors.filter(v => v.state !== 'Discovered')
  const impacts = !valid || !diffDays ? [] : [
    ...affectedVendors.map(v => ({
      id: `vendor-${v.id}`, level: v.category === 'Venue' ? 'Critical' : 'High',
      title: `${v.name} · availability review`, category: v.category, owner: v.owner,
      body: `Confirm availability for ${formatIndianDate(newIsoDate)}. Existing hold deadlines and contracts stay unchanged until you contact this vendor.`,
    })),
    ...affectedTasks.map(t => ({
      id: `task-${t.id}`, level: 'Medium', title: t.title, category: t.category, owner: t.owner,
      body: `${formatIndianDate(t.dueIsoDate)} → ${formatIndianDate(shiftDate(t.dueIsoDate, diffDays))}. Internal planning deadline moves by ${Math.abs(diffDays)} days.`,
    })),
  ]
  return {
    valid, diffDays, impacts, affectedCount: impacts.length,
    error: !valid ? 'Choose a valid date from today through 2100.' : !diffDays ? 'Choose a date different from your current wedding date.' : '',
    direction: diffDays > 0 ? `later by ${diffDays} days` : `earlier by ${Math.abs(diffDays)} days`,
    formattedOld: formatIndianDate(wedding.isoDate), formattedNew: valid ? formatIndianDate(newIsoDate) : '',
    affectedCollaborators: [...new Set(impacts.map(i => i.owner))],
  }
}

export function applyDateChange(currentState, newIsoDate) {
  const { wedding, tasks, vendors = [], notifications = [], activityLog = [] } = currentState
  const report = simulateDateChange(wedding, tasks, vendors, newIsoDate)
  if (report.error) throw new Error(report.error)
  const updatedTasks = tasks.map(task => {
    if (task.status === 'Done' || !isValidDate(task.dueIsoDate)) return task
    const dueIsoDate = shiftDate(task.dueIsoDate, report.diffDays)
    return { ...task, dueIsoDate, due: formatIndianDate(dueIsoDate) }
  })
  // Reconfirmation is separate work: completed contracts retain their history.
  for (const vendor of vendors.filter(v => v.state !== 'Discovered')) {
    const linked = tasks.find(t => t.id === vendor.relatedTaskId)
    const id = `reconfirm-${vendor.id}`
    const review = {
      id, title: `Reconfirm ${vendor.name} for ${report.formattedNew}`,
      owner: vendor.owner, ownerRole: linked?.ownerRole || 'owner', initials: linked?.initials || vendor.owner[0],
      dueIsoDate: todayIso(), due: formatIndianDate(todayIso()), status: 'Not started', priority: 'Critical',
      category: vendor.category, ceremony: 'All ceremonies', type: 'vendor', dependsOn: [], blocks: [],
      reason: 'Contact the vendor before relying on the new date. No external reservation has been changed.', notes: [],
    }
    const existing = updatedTasks.findIndex(t => t.id === id)
    if (existing >= 0) updatedTasks[existing] = { ...review, notes: updatedTasks[existing].notes }
    else updatedTasks.push(review)
  }
  const roles = [...new Set(updatedTasks.filter(t => t.status !== 'Done').map(t => t.ownerRole))]
  return {
    ...currentState,
    wedding: { ...wedding, isoDate: newIsoDate, date: report.formattedNew, days: daysBetween(todayIso(), newIsoDate) },
    tasks: updatedTasks,
    notifications: [...roles.map((role, index) => ({
      id: `change-${Date.now()}-${index}`, title: `Wedding date updated to ${report.formattedNew}`,
      description: 'Internal deadlines moved. Review vendor availability tasks; external agreements are unchanged.',
      type: 'action', timestamp: 'Just now', read: false, targetRole: role,
    })), ...notifications].slice(0, 200),
    activityLog: [{ id: `act-${Date.now()}`, text: `Approved date change from ${wedding.date} to ${report.formattedNew}`, time: 'Just now', author: 'You' }, ...activityLog].slice(0, 200),
  }
}
