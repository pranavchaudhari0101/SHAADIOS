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

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedCeremony !== 'All events' && t.ceremony !== selectedCeremony) return false
    if (selectedOwner !== 'All owners' && t.owner !== selectedOwner) return false
    if (selectedStatus === 'Open' && t.status === 'Done') return false
    if (selectedStatus === 'Blocked' && t.status !== 'Blocked') return false
    if (selectedStatus === 'Completed' && t.status !== 'Done') return false
    return true
  })

  // Group into chronological phases
  const timelineGroups = [
    {
      time: 'THIS WEEK & SEPTEMBER',
      title: 'Lock Core Foundations',
      description: 'Venue agreements and photography date holds unlock all secondary planning tracks.',
      tasks: filteredTasks.filter((t) => ['venue', 'photographer', 'accommodation', 'guest-list'].includes(t.id)),
    },
    {
      time: 'OCTOBER',
      title: 'Turn Decisions into Bookings',
      description: 'Tastings, decor direction, guest confirmations, and artist locks.',
      tasks: filteredTasks.filter((t) => ['tasting', 'decor', 'invitations', 'mehendi-artist', 'sangeet-track'].includes(t.id)),
    },
    {
      time: 'NOVEMBER & BEYOND',
      title: 'Guest Invites & Logistics',
      description: 'Physical card dispatch, RSVP collection, outfit trials, and rehearsals.',
      tasks: filteredTasks.filter((t) => !['venue', 'photographer', 'accommodation', 'guest-list', 'tasting', 'decor', 'invitations', 'mehendi-artist', 'sangeet-track'].includes(t.id)),
    },
  ].filter((group) => group.tasks.length > 0)

  const owners = ['All owners', ...Array.from(new Set(tasks.map((t) => t.owner)))]
  const ceremonies = ['All events', 'All ceremonies', 'Mehendi', 'Sangeet', 'Wedding', 'Reception']

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
