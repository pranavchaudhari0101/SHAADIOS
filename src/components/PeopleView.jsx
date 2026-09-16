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
          <Plus size={17} /> Invite collaborator
        </button>
      </div>

      {/* Role Perspective Switcher Bar */}
      <section className="role-perspective-bar">
        <div className="perspective-label">
          <Eye size={17} />
          <span>Simulate view as:</span>
        </div>
        <div className="perspective-chips">
          {people.map((p) => (
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
            <h2>One shared plan. Role-based views.</h2>
            <p>
              Private financial details stay with the couple. Family leads see tasks assigned to them; coordinators see vendor run-sheets.
            </p>
          </div>
        </div>
        <span className="trust-badge">
          <ShieldCheck size={16} /> Privacy-First Architecture
        </span>
      </section>

      {/* Collaborator Cards */}
      <div className="people-grid">
        {people.map((person) => {
          const personFirstName = person.name.split(' ')[0]
          const assignedTasks = tasks.filter(
            (t) => t.owner.includes(personFirstName) || (person.roleKey === 'owner' && t.owner === 'Both of you')
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
                  className="link-button"
                  onClick={() => {
                    const firstTask = assignedTasks[0]
                    if (firstTask) onTask(firstTask)
                  }}
                >
                  {person.roleKey === 'family_lead' ? 'View Mom’s work' : 'View tasks'} <ArrowRight size={15} />
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
              <h2>Mom is currently coordinating hotel accommodation.</h2>
              <p>
                She holds the room block specifications, deadline ({momTask.due}), and vendor context. The couple is only looped in if the quote exceeds parameters.
              </p>
            </div>
          </div>
          <button
            className="secondary-button pale"
            onClick={() => onTask(momTask)}
          >
            Inspect Mom's task
          </button>
        </section>
      )}
    </div>
  )
}
