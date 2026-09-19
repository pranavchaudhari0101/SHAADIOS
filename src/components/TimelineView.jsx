import React, { useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Lock,
} from 'lucide-react'

export function TimelineView({ tasks = [], onTask }) {
  const [selectedCeremony, setSelectedCeremony] = useState('All events')
  const [selectedOwner, setSelectedOwner] = useState('All owners')
  const [selectedStatus, setSelectedStatus] = useState('All status')

  // A task tagged 'All ceremonies' applies to every ceremony filter.
  const matchesCeremony = (taskCeremony, selected) => {
    if (selected === 'All events' || selected === 'All ceremonies') return true
    if (taskCeremony === selected) return true
    if (taskCeremony === 'All ceremonies') return true
    return false
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (!matchesCeremony(t.ceremony, selectedCeremony)) return false
    if (selectedOwner !== 'All owners' && t.owner !== selectedOwner) return false
    if (selectedStatus === 'Open' && t.status === 'Done') return false
    if (selectedStatus === 'Blocked' && t.status !== 'Blocked') return false
    if (selectedStatus === 'Completed' && t.status !== 'Done') return false
    return true
  })

  // Group dynamically by due month so new tasks and date changes recalculate.
  const getDueTime = (t) => {
    if (!t.dueIsoDate) return Number.POSITIVE_INFINITY
    const time = new Date(t.dueIsoDate).getTime()
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
  }

  const getMonthLabel = (isoDate) => {
    try {
      const d = new Date(isoDate)
      const month = d.toLocaleString('en-IN', { month: 'long' }).toUpperCase()
      return `${month} ${d.getFullYear()}`
    } catch (e) {
      return 'UNSCHEDULED'
    }
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => getDueTime(a) - getDueTime(b))

  const groupMap = new Map()
  for (const task of sortedTasks) {
    const key = task.status === 'Done' ? 'COMPLETED' : task.dueIsoDate ? getMonthLabel(task.dueIsoDate) : 'UNSCHEDULED'
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key).push(task)
  }

  // Keep COMPLETED group last even though completed tasks may have early dates.
  const timelineGroups = Array.from(groupMap.entries())
    .sort(([keyA], [keyB]) => {
      if (keyA === 'COMPLETED') return 1
      if (keyB === 'COMPLETED') return -1
      if (keyA === 'UNSCHEDULED') return 1
      if (keyB === 'UNSCHEDULED') return -1
      return new Date(keyA) - new Date(keyB)
    })
    .map(([key, groupTasks]) => ({
      time: key,
      title: key === 'COMPLETED' ? 'Completed work' : key === 'UNSCHEDULED' ? 'To be scheduled' : `Due ${key.charAt(0) + key.slice(1).toLowerCase()}`,
      description:
        key === 'COMPLETED'
          ? 'Finished tasks stay visible so downstream work keeps its context.'
          : `${groupTasks.length} task${groupTasks.length === 1 ? '' : 's'} due in this window, sorted by deadline.`,
      tasks: groupTasks,
    }))
    .filter((group) => group.tasks.length > 0)

  const owners = ['All owners', ...Array.from(new Set(tasks.map((t) => t.owner)))]
  const ceremonies = ['All events', 'All ceremonies', 'Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception']

  return (
    <div className="page">
      <div className="page-intro compact-intro">
        <div>
          <p className="eyebrow">THE PLAN OVER TIME</p>
          <h1>Wedding timeline</h1>
          <p className="subtitle">
            A dynamic, connected view of what becomes executable as upstream decisions resolve.
          </p>
        </div>

        {/* Working filter controls */}
        <div className="filter-controls">
          <label className="filter-select-wrapper">
            <select
              value={selectedCeremony}
              onChange={(e) => setSelectedCeremony(e.target.value)}
              className="filter-select"
            >
              {ceremonies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="filter-arrow" />
          </label>

          <label className="filter-select-wrapper">
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="filter-select"
            >
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="filter-arrow" />
          </label>

          <label className="filter-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All status">All status</option>
              <option value="Open">Open only</option>
              <option value="Blocked">Blocked only</option>
              <option value="Completed">Completed only</option>
            </select>
            <ChevronDown size={14} className="filter-arrow" />
          </label>
        </div>
      </div>

      <div className="timeline-wrap">
        {timelineGroups.length === 0 ? (
          <div className="empty-filter-state">
            <p>No tasks match your selected filters.</p>
            <button
              className="link-button"
              onClick={() => {
                setSelectedCeremony('All events')
                setSelectedOwner('All owners')
                setSelectedStatus('All status')
              }}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          timelineGroups.map((group, index) => (
            <section className="timeline-group" key={group.time}>
              <div className="timeline-time">
                <span>{group.time}</span>
                <i></i>
              </div>
              <div className="timeline-content">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <div className="timeline-task-grid">
                  {group.tasks.map((task) => {
                    const isDone = task.status === 'Done'
                    const isBlocked = task.status === 'Blocked'

                    return (
                      <button
                        key={task.id}
                        className={`timeline-task ${isBlocked ? 'blocked' : ''} ${isDone ? 'done' : ''}`}
                        onClick={() => onTask(task)}
                      >
                        <span
                          className={`status-indicator ${task.status.toLowerCase().replace(' ', '-')}`}
                        >
                          {isDone ? <Check size={12} /> : isBlocked ? <Lock size={12} /> : null}
                        </span>
                        <span>
                          <strong>{task.title}</strong>
                          <small>
                            {task.owner} · {task.due}
                            {isBlocked && ' · (Blocked by dependencies)'}
                          </small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    )
                  })}
                </div>
              </div>
              {index !== timelineGroups.length - 1 && <div className="timeline-divider"></div>}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
