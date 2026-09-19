import React, { useState } from 'react'
import {
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Filter,
  Lock,
  Plus,
} from 'lucide-react'

export function TasksView({
  tasks = [],
  people = [],
  onTask,
  onOpenAddTask,
  activeRole = 'owner',
}) {
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'me' | 'waiting' | 'blocked'
  const [selectedCeremony, setSelectedCeremony] = useState('All')

  const activePerson = people.find((p) => p.roleKey === activeRole) || people[0]
  const activeFirstName = activePerson?.name ? activePerson.name.split(' ')[0] : 'Rhea'

  // Filter tasks based on selected mode.
  // Tasks tagged 'All ceremonies' apply to every ceremony filter.
  const filtered = tasks.filter((t) => {
    if (filterMode === 'me' && !t.owner.includes(activeFirstName) && t.owner !== 'Both of you') return false
    if (filterMode === 'waiting' && t.status !== 'Waiting') return false
    if (filterMode === 'blocked' && t.status !== 'Blocked') return false
    if (selectedCeremony !== 'All' && t.ceremony !== selectedCeremony && t.ceremony !== 'All ceremonies') return false
    return true
  })

  // Group into clean operational buckets
  const groups = [
    {
      title: 'Needs Attention',
      tasks: filtered.filter((t) => ['Critical', 'Important'].includes(t.priority) && t.status !== 'Done' && t.status !== 'Blocked'),
    },
    {
      title: 'Waiting on External Input',
      tasks: filtered.filter((t) => t.status === 'Waiting'),
    },
    {
      title: 'Blocked by Prerequisite Tasks',
      tasks: filtered.filter((t) => t.status === 'Blocked'),
    },
    {
      title: 'Coming Up',
      tasks: filtered.filter((t) => t.priority === 'Upcoming' && t.status !== 'Done' && t.status !== 'Blocked'),
    },
    {
      title: 'Completed',
      tasks: filtered.filter((t) => t.status === 'Done'),
    },
  ].filter((g) => g.tasks.length > 0)

  return (
    <div className="page">
      <div className="page-intro compact-intro">
        <div>
          <p className="eyebrow">OWNERSHIP AND FOLLOW THROUGH</p>
          <h1>Tasks</h1>
          <p className="subtitle">
            Every task connects to a clear owner, a clear reason, and prerequisite dependencies.
          </p>
        </div>
        <button className="primary-button compact" onClick={onOpenAddTask}>
          <Plus size={17} /> Add task
        </button>
      </div>

      <div className="task-toolbar">
        <div className="task-filter-group">
          <button
            className={`filter ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All tasks ({tasks.length})
          </button>
          <button
            className={`filter ${filterMode === 'me' ? 'active' : ''}`}
            onClick={() => setFilterMode('me')}
          >
            Assigned to {activeFirstName}
          </button>
          <button
            className={`filter ${filterMode === 'waiting' ? 'active' : ''}`}
            onClick={() => setFilterMode('waiting')}
          >
            Waiting
          </button>
          <button
            className={`filter ${filterMode === 'blocked' ? 'active' : ''}`}
            onClick={() => setFilterMode('blocked')}
          >
            Blocked
          </button>
        </div>

        <div className="ceremony-select-wrapper">
          <span>Filter ceremony: </span>
          <select
            value={selectedCeremony}
            onChange={(e) => setSelectedCeremony(e.target.value)}
            className="filter-select-mini"
          >
            <option value="All">All Ceremonies</option>
            <option value="Mehendi">Mehendi</option>
            <option value="Haldi">Haldi</option>
            <option value="Sangeet">Sangeet</option>
            <option value="Wedding">Wedding</option>
            <option value="Reception">Reception</option>
            <option value="All ceremonies">Cross-ceremony only</option>
          </select>
        </div>
      </div>

      <div className="task-groups">
        {groups.length === 0 ? (
          <div className="empty-filter-state">
            <p>No tasks match your selected filter.</p>
            <button
              className="link-button"
              onClick={() => {
                setFilterMode('all')
                setSelectedCeremony('All')
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          groups.map(({ title, tasks: groupTasks }) => (
            <section className="task-group" key={title}>
              <h2>
                {title} <span>{groupTasks.length}</span>
              </h2>
              {groupTasks.map((task) => {
                const isDone = task.status === 'Done'
                const isBlocked = task.status === 'Blocked'

                return (
                  <button
                    className={`task-list-row ${isBlocked ? 'is-blocked-row' : ''}`}
                    onClick={() => onTask(task)}
                    key={task.id}
                  >
                    <span
                      className={`task-state ${task.status.toLowerCase().replace(' ', '-')}`}
                    >
                      {isDone ? (
                        <Check size={14} />
                      ) : isBlocked ? (
                        <Lock size={13} />
                      ) : (
                        ''
                      )}
                    </span>
                    <span className="task-list-copy">
                      <strong>{task.title}</strong>
                      <small>{task.reason}</small>
                    </span>
                    <span className="task-list-owner">
                      <span className="avatar tiny">{task.initials}</span>
                      {task.owner}
                    </span>
                    <span className="task-list-date">{task.due}</span>
                    <ChevronRight size={17} />
                  </button>
                )
              })}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
