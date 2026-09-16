import React from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import { detectRisks, calculateHealthScore } from '../core/riskEngine.js'
import { getNextBestActions } from '../core/actionEngine.js'
import { CameraIcon } from './Icons.jsx'

export function HomeView({
  wedding,
  tasks = [],
  vendors = [],
  people = [],
  onTask,
  onChangeDate,
  onTab,
  onResolveRisk,
  activeRole = 'owner',
}) {
  const risks = detectRisks({ wedding, tasks, vendors })
  const primaryRisk = risks.length > 0 ? risks[0] : null
  const health = calculateHealthScore(tasks, risks)

  const topActions = getNextBestActions({ wedding, tasks, vendors })

  const waitingItems = [
    ...tasks.filter((t) => t.status === 'Waiting').map((t) => ({
      id: t.id,
      name: t.owner,
      sub: t.reason,
      age: '2 days',
      avatar: t.initials || 'M',
      tint: 'soft',
      isVendor: false,
      task: t,
    })),
    ...vendors.filter((v) => v.state === 'Quote received' || v.state === 'Contacted').map((v) => ({
      id: v.id,
      name: v.name,
      sub: `${v.action} due`,
      age: 'Due soon',
      avatar: 'V',
      tint: v.color || 'blue',
      isVendor: true,
      vendor: v,
    })),
  ].slice(0, 3)

  const activePerson = people.find((p) => p.roleKey === activeRole) || people[0]
  const firstName = activePerson?.name ? activePerson.name.split(' ')[0] : 'Rhea'

  return (
    <div className="page home-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            {wedding.city.toUpperCase()} · {wedding.date.toUpperCase()} · {wedding.days} DAYS TO GO
          </p>
          <h1>Good morning, {firstName}.</h1>
          <p className="subtitle">
            Your celebration is <strong>{health.criticalCount > 0 ? 'asking for attention' : 'on track'}</strong> today. Here is the shortest path forward.
          </p>
        </div>
        <div className="health-chip">
          <span><CheckCircle2 size={18} /></span>
          <div>
            <strong>{health.score}% on track</strong>
            <small>
              {health.criticalCount > 0
                ? `${health.criticalCount} critical decision${health.criticalCount > 1 ? 's' : ''}`
                : 'Pacing cleanly against milestones'}
            </small>
          </div>
        </div>
      </div>

      {/* Weekly Focus */}
      <section className="weekly-focus">
        <div className="focus-head">
          <div>
            <span className="focus-icon"><Sparkles size={19} /></span>
            <div>
              <p>COMPUTED PRIORITY PATH</p>
              <h2>Focus on what unlocks the plan.</h2>
            </div>
          </div>
          <button className="link-button" onClick={() => onTab('planner')}>
            Ask coordinator <ArrowRight size={15} />
          </button>
        </div>

        <div className="priority-list">
          {topActions.length > 0 ? (
            topActions.map((task) => (
              <PriorityRow task={task} key={task.id} onClick={() => onTask(task)} />
            ))
          ) : (
            <div className="empty-priority-card">
              <CheckCircle2 size={24} />
              <p>All high-priority tasks completed! Explore timeline for upcoming stages.</p>
            </div>
          )}
        </div>
      </section>

      {/* Grid: Plan Watch & Waiting */}
      <div className="home-grid">
        {/* Dynamic Risk Card */}
        <section className="section-card risk-card">
          <div className="section-card-header">
            <div>
              <p className="section-label">PLAN WATCH & BOTTLENECKS</p>
              <h2>Risk intelligence</h2>
            </div>
            {primaryRisk ? (
              <span className={`risk-label ${primaryRisk.severity.toLowerCase()}`}>
                <CircleAlert size={15} /> {primaryRisk.severity}
              </span>
            ) : (
              <span className="risk-label low">
                <CheckCircle2 size={15} /> Low risk
              </span>
            )}
          </div>

          <div className="risk-body">
            <div className="risk-visual">
              <span className="risk-node top"></span>
              <span className="risk-node middle"></span>
              <span className="risk-node bottom"></span>
              <i></i>
              <i></i>
            </div>
            <div>
              {primaryRisk ? (
                <>
                  <h3>{primaryRisk.title}</h3>
                  <p>{primaryRisk.description}</p>
                  <button
                    className="inline-action"
                    onClick={() => {
                      const targetTask = tasks.find((t) => t.id === primaryRisk.targetTaskId)
                      if (targetTask) onTask(targetTask)
                      else if (onResolveRisk) onResolveRisk(primaryRisk)
                    }}
                  >
                    {primaryRisk.actionLabel} <ArrowRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <h3>No critical bottlenecks detected.</h3>
                  <p>All prerequisite paths for your venue, decor, and guest lists are flowing normally.</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Waiting On Others */}
        <section className="section-card waiting-card">
          <div className="section-card-header">
            <div>
              <p className="section-label">WAITING ON OTHERS</p>
              <h2>Active follow-ups</h2>
            </div>
            <button
              className="icon-button small"
              aria-label="View all waiting items"
              onClick={() => onTab('tasks')}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          {waitingItems.length > 0 ? (
            waitingItems.map((item) => (
              <div
                key={item.id}
                className="waiting-person clickable-waiting"
                onClick={() => {
                  if (item.task) onTask(item.task)
                  else if (item.isVendor) onTab('vendors')
                }}
              >
                <span className={`avatar soft ${item.tint}`}>{item.avatar}</span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.sub}</p>
                </div>
                <span className="waiting-age">
                  <Clock3 size={14} /> {item.age}
                </span>
              </div>
            ))
          ) : (
            <p className="quiet-note">No external blockers or waiting items right now.</p>
          )}

          <button className="quiet-note" onClick={() => onTab('planner')}>
            <Bell size={15} /> ShaadiOS alerts the owner when follow-up windows close.
          </button>
        </section>
      </div>

      {/* Bottom Grid: Milestones & Date Change */}
      <div className="bottom-grid">
        <section className="section-card timeline-preview">
          <div className="section-card-header">
            <div>
              <p className="section-label">UP NEXT</p>
              <h2>Upcoming timeline milestones</h2>
            </div>
            <button className="link-button" onClick={() => onTab('timeline')}>
              View timeline <ArrowRight size={15} />
            </button>
          </div>

          <div className="milestone-row">
            <span>SEP 22</span>
            <i></i>
            <div>
              <strong>Photographer hold expires</strong>
              <p>Lenscraft Studios agreement · Arjun</p>
            </div>
          </div>
          <div className="milestone-row">
            <span>SEP 27</span>
            <i></i>
            <div>
              <strong>Catering menu tasting</strong>
              <p>Saffron Tables 6-course selection · Arjun</p>
            </div>
          </div>
          <div className="milestone-row">
            <span>OCT 06</span>
            <i></i>
            <div>
              <strong>Decor moodboard review</strong>
              <p>Mogra & Co. concept review · Rhea</p>
            </div>
          </div>
        </section>

        <section className="change-prompt">
          <span><CalendarDays size={21} /></span>
          <p className="section-label">PLANS CHANGE</p>
          <h2>A different wedding date?</h2>
          <p>
            Simulate how a new date impacts every venue contract, photographer hold, and guest accommodation before anything updates.
          </p>
          <button className="secondary-button pale" onClick={onChangeDate}>
            Simulate date change <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <p className="progress-note">
        <CircleCheck size={17} /> You have completed{' '}
        <strong>{health.completedCount} of {tasks.length} core decisions</strong> so far. Steady progress every week.
      </p>
    </div>
  )
}

function PriorityRow({ task, onClick }) {
  const isCritical = task.priority === 'Critical'
  const isWaiting = task.priority === 'Waiting'
  const isBlocked = task.status === 'Blocked'

  return (
    <button
      className={`priority-row ${isCritical ? 'is-critical' : ''} ${isBlocked ? 'is-blocked' : ''}`}
      onClick={onClick}
    >
      <span className={`priority-dot ${(task.priority || 'upcoming').toLowerCase()}`}>
        {isCritical ? (
          <CircleAlert size={18} />
        ) : isWaiting ? (
          <Clock3 size={17} />
        ) : (
          <CircleDashed size={17} />
        )}
      </span>
      <span className="priority-content">
        <span className="priority-title-line">
          <strong>{task.title}</strong>
          <span className={`status-badge ${(task.priority || 'upcoming').toLowerCase()}`}>
            {task.priority || 'Upcoming'}
          </span>
        </span>
        <small>{task.reason}</small>
        <span className="priority-meta">
          <span className="avatar tiny">{task.initials}</span>
          {task.owner}
          <i></i>
          {task.due}
          {task.blocks && task.blocks.length > 0 && (
            <>
              <i></i>
              <span>Unlocks {task.blocks.length} {task.blocks.length === 1 ? 'task' : 'tasks'}</span>
            </>
          )}
        </span>
      </span>
      <ChevronRight size={19} className="row-chevron" aria-hidden="true" />
    </button>
  )
}
