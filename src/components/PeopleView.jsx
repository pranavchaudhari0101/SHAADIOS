import React from 'react'
import {
  ArrowRight,
  Eye,
  HeartHandshake,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from 'lucide-react'

export function PeopleView({
  people = [],
  tasks = [],
  onOpenInvite,
  onTask,
  activeRole = 'owner',
  onSwitchRole,
}) {
  const momTask = tasks.find((t) => t.owner === 'Mom' || t.id === 'accommodation')

  return (
    <div className="page">
      <div className="page-intro compact-intro">
        <div>
          <p className="eyebrow">YOUR WEDDING TEAM & COLLABORATORS</p>
          <h1>People</h1>
          <p className="subtitle">
            Give every person exactly the information and responsibility they need without group-chat confusion.
          </p>
        </div>
        <button className="primary-button compact" onClick={onOpenInvite}>
          <Plus size={17} /> Add person
        </button>
      </div>

      {/* Role Perspective Switcher Bar */}
      <section className="role-perspective-bar">
        <div className="perspective-label">
          <Eye size={17} />
          <span>Role preview:</span>
        </div>
        <div className="perspective-chips">
          {people.filter((p, index) => people.findIndex(other => other.roleKey === p.roleKey) === index).map((p) => (
            <button
              key={p.id}
              className={`perspective-chip ${activeRole === p.roleKey ? 'active' : ''}`}
              onClick={() => onSwitchRole(p.roleKey)}
            >
              <span className={`avatar tiny ${p.tint}`}>{p.initials}</span>
              <span>{p.name.split(' ')[0]} ({p.role})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Access Philosophy Banner */}
      <section className="role-summary">
        <div>
          <UsersRound size={21} />
          <div>
            <h2>One shared plan. Clear responsibilities.</h2>
            <p>
              Role previews organize work; they are not access controls. All data is local to this browser, with no remote collaboration or private accounts.
            </p>
          </div>
        </div>
        <span className="trust-badge">
          <ShieldCheck size={16} /> Local planning workspace
        </span>
      </section>

      {/* Collaborator Cards */}
      <div className="people-grid">
        {people.map((person) => {
          const personFirstName = person.name.split(' ')[0]
          const assignedTasks = tasks.filter(
            (t) => t.ownerId ? t.ownerId === person.id : t.owner.includes(personFirstName) || (person.roleKey === 'family_lead' && t.owner === 'Mom') || (['owner', 'co_owner'].includes(person.roleKey) && t.owner === 'Both of you')
          )
          const waitingCount = assignedTasks.filter((t) => t.status === 'Waiting').length

          return (
            <article className="person-card" key={person.id}>
              <div className="person-top">
                <span className={`avatar large ${person.tint}`}>{person.initials}</span>
                <span className="role-pill">{person.role}</span>
              </div>
              <h2>{person.name}</h2>
              <p className="person-contact-line">
                {person.email || person.phone || 'Contact on file'}
              </p>
              <p className="person-work-count">
                <strong>{assignedTasks.length}</strong> tasks assigned
                {waitingCount > 0 && ` · ${waitingCount} waiting`}
              </p>

              <div className="person-card-actions">
                <button
                  className="link-button" disabled={!assignedTasks.length}
                  onClick={() => {
                    const firstTask = assignedTasks[0]
                    if (firstTask) onTask(firstTask)
                  }}
                >
                  {assignedTasks.length ? 'View assigned task' : 'No tasks assigned'} <ArrowRight size={15} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Family Workflow Highlight */}
      {momTask && (
        <section className="assignment-callout">
          <div>
            <span><HeartHandshake size={20} /></span>
            <div>
              <p className="section-label">FAMILY DELEGATION PIPELINE</p>
              <h2>{momTask.owner} is coordinating accommodation.</h2>
              <p>
                Keep the room block specifications, deadline ({momTask.due}), and vendor context together in one task.
              </p>
            </div>
          </div>
          <button
            className="secondary-button pale"
            onClick={() => onTask(momTask)}
          >
            View accommodation task
          </button>
        </section>
      )}
    </div>
  )
}
