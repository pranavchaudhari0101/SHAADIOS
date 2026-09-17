import React, { useState } from 'react'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  Lock,
  Plus,
  Send,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'

export function TaskModal({
  task,
  allTasks = [],
  people = [],
  onClose,
  onComplete,
  onStatusChange,
  onDelegate,
  onAddNote,
  onOpenPrerequisite,
}) {
  const [newNote, setNewNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [delegateOpen, setDelegateOpen] = useState(false)

  if (!task) return null

  const isDone = task.status === 'Done'
  const isBlocked = task.status === 'Blocked'
  const isWaiting = task.status === 'Waiting'

  // Look up parent dependency tasks
  const prerequisiteTasks = (task.dependsOn || []).map((id) =>
    allTasks.find((t) => t.id === id)
  ).filter(Boolean)

  // Look up downstream blocked tasks
  const downstreamTasks = allTasks.filter(t => t.dependsOn?.includes(task.id))

  const handleAddNote = () => {
    if (!newNote.trim()) return
    onAddNote(task.id, newNote.trim())
    setNewNote('')
    setShowNoteInput(false)
  }

  return (
    <div className="drawer-layer" role="dialog" aria-modal="true" aria-labelledby="task-title">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Close task detail" />
      <aside className="task-panel">
        <header>
          <button className="icon-button" onClick={onClose} aria-label="Close task detail">
            <X size={20} />
          </button>
          <span className={`status-badge ${(task.priority || '').toLowerCase()}`}>
            {task.priority || 'Upcoming'}
          </span>
        </header>

        <div className="task-panel-body">
          <p className="section-label">{task.category || 'WEDDING TASK'} · {task.ceremony || 'Ceremony'}</p>
          <h2 id="task-title">{task.title}</h2>
          <p className="task-summary">{task.reason}</p>

          {isBlocked && (
            <div className="blocked-alert-banner">
              <Lock size={18} />
              <div>
                <strong>Task is currently blocked</strong>
                <p>Prerequisite decisions must be resolved before this work can safely begin.</p>
              </div>
            </div>
          )}

          <section className="why-card">
            <span><Zap size={18} /></span>
            <div>
              <small>WHY THIS MATTERS</small>
              <p>
                {downstreamTasks.length > 0
                  ? `Completing this unlocks ${downstreamTasks.length} downstream ${
                      downstreamTasks.length === 1 ? 'task' : 'tasks'
                    } in your planning timeline.`
                  : 'This keeps the wedding moving forward without last-minute coordination rushes.'}
              </p>
            </div>
          </section>

          <dl className="task-facts">
            <div>
              <dt>Owner</dt>
              <dd>
                <span className="avatar tiny">{task.initials || 'U'}</span>
                {task.owner}
              </dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>
                <CalendarDays size={16} />
                {task.due}
              </dd>
            </div>
            <div>
              <dt>Current state</dt>
              <dd>
                {isDone ? (
                  <span className="state-tag done"><Check size={13} /> Completed</span>
                ) : isWaiting ? (
                  <span className="state-tag waiting"><Clock3 size={13} /> Waiting</span>
                ) : isBlocked ? (
                  <span className="state-tag blocked"><Lock size={13} /> Blocked</span>
                ) : (
                  <span className="state-tag active"><CircleDashed size={13} /> {task.status}</span>
                )}
              </dd>
            </div>
          </dl>

          {/* Connected Work & Dependencies */}
          <section className="dependency-section">
            <h3>Connected Work & Preconditions</h3>
            {prerequisiteTasks.length > 0 ? (
              <div className="dep-group">
                <span className="dep-label">Prerequisite Tasks (Must be done first):</span>
                {prerequisiteTasks.map((prereq) => (
                  <button
                    key={prereq.id}
                    className={`dep-item-button ${prereq.status === 'Done' ? 'done' : 'pending'}`}
                    onClick={() => onOpenPrerequisite(prereq)}
                  >
                    <span>
                      {prereq.status === 'Done' ? (
                        <CheckCircle2 size={15} className="text-sage" />
                      ) : (
                        <CircleAlert size={15} className="text-amber" />
                      )}
                      <strong>{prereq.title}</strong>
                      <small>({prereq.owner} · {prereq.status})</small>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="dep-none">✓ No prerequisite dependencies. Ready to execute.</p>
            )}

            {downstreamTasks.length > 0 && (
              <div className="dep-group mt-3">
                <span className="dep-label">Blocks Downstream:</span>
                {downstreamTasks.map((downstream) => (
                  <div key={downstream.id} className="dep-blocked-item">
                    <span>{downstream.title}</span>
                    <small>({downstream.owner})</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delegation Selector */}
          <section className="delegation-box">
            <div className="delegation-head">
              <h3>Collaborator Assignment</h3>
              <button
                className="text-button"
                onClick={() => setDelegateOpen(!delegateOpen)}
              >
                {delegateOpen ? 'Cancel' : 'Change owner'}
              </button>
            </div>
            {delegateOpen && (
              <div className="delegate-options">
                {people.map((p) => (
                  <button
                    key={p.id}
                    className={`delegate-person-btn ${task.owner === p.name.split(' ')[0] ? 'active' : ''}`}
                    onClick={() => {
                      onDelegate(task, p)
                      setDelegateOpen(false)
                    }}
                  >
                    <span className={`avatar tiny ${p.tint}`}>{p.initials}</span>
                    <span><strong>{p.name}</strong><small>{p.role}</small></span>
                    <UserCheck size={15} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Notes & Activity Log */}
          <section className="notes-section">
            <div className="notes-header-row">
              <h3>Context & Notes</h3>
              {!showNoteInput && (
                <button className="link-button" onClick={() => setShowNoteInput(true)}>
                  <Plus size={14} /> Add note
                </button>
              )}
            </div>

            {showNoteInput && (
              <div className="add-note-box">
                <textarea
                  aria-label="Task note" maxLength={2000}
                  placeholder="Record vendor quotes, meeting updates, or requirements..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="note-box-actions">
                  <button className="secondary-button compact" onClick={() => setShowNoteInput(false)}>
                    Cancel
                  </button>
                  <button className="primary-button compact" disabled={!newNote.trim()} onClick={handleAddNote}>
                    <Send size={14} /> Save note
                  </button>
                </div>
              </div>
            )}

            <div className="notes-stream">
              {(task.notes && task.notes.length > 0) ? (
                task.notes.map((note, index) => (
                  <div key={index} className="note-card">
                    <p>{note}</p>
                  </div>
                ))
              ) : (
                <p className="notes-empty">No notes recorded yet. Keep vendor discussions and agreements attached here.</p>
              )}
            </div>
          </section>
        </div>

        <footer className="task-panel-actions">
          {!isDone ? (
            <>
              {task.status !== 'In progress' && (
                <button
                  className="secondary-button"
                  disabled={isBlocked}
                  onClick={() => onStatusChange(task.id, 'In progress')}
                >
                  In progress
                </button>
              )}
              {task.status !== 'Waiting' && (
                <button
                  className="secondary-button"
                  disabled={isBlocked}
                  onClick={() => onStatusChange(task.id, 'Waiting')}
                >
                  Mark waiting
                </button>
              )}
              <button
                className="primary-button"
                disabled={isBlocked}
                onClick={() => onComplete(task)}
              >
                <Check size={17} /> Mark complete
              </button>
            </>
          ) : (
            <button
              className="secondary-button full"
              disabled={isBlocked}
                  onClick={() => onStatusChange(task.id, 'In progress')}
            >
              Reopen task
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}
