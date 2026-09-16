import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

export function AddTaskModal({ people = [], allTasks = [], onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Venue')
  const [ceremony, setCeremony] = useState('Wedding')
  const [owner, setOwner] = useState(people[0]?.name?.split(' ')[0] || 'Rhea')
  const [due, setDue] = useState('Next week')
  const [reason, setReason] = useState('')
  const [dependsOnId, setDependsOnId] = useState('')

  const categories = [
    'Venue',
    'Photography',
    'Catering',
    'Decor',
    'Invitations',
    'Accommodation',
    'Artists',
    'Entertainment',
    'Attire & Jewelry',
    'Logistics',
  ]

  const ceremonies = ['All ceremonies', 'Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const selectedPerson = people.find((p) => p.name.startsWith(owner)) || people[0]
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      owner,
      ownerRole: selectedPerson?.roleKey || 'owner',
      initials: selectedPerson?.initials || owner[0],
      due: due.trim() || 'Upcoming',
      status: dependsOnId ? 'Blocked' : 'Not started',
      priority: dependsOnId ? 'Blocked' : 'Upcoming',
      type: category.toLowerCase().slice(0, 5),
      category,
      ceremony,
      reason: reason.trim() || 'Required for smooth celebration execution.',
      dependsOn: dependsOnId ? [dependsOnId] : [],
      blocks: [],
      notes: [],
    }

    onAdd(newTask)
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close add task modal" />
      <section className="change-modal add-task-modal">
        <header>
          <div>
            <p className="eyebrow">WORKFLOW & ACCOUNTABILITY</p>
            <h2 id="add-task-title">Create Wedding Task</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close add task modal">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-fields">
              <label>
                <span>Task Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Sangeet sound-check rehearsal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <div className="form-row-2">
                <label>
                  <span>Category</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Ceremony</span>
                  <select value={ceremony} onChange={(e) => setCeremony(e.target.value)}>
                    {ceremonies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Assigned Owner</span>
                  <select value={owner} onChange={(e) => setOwner(e.target.value)}>
                    {people.map((p) => {
                      const firstName = p.name.split(' ')[0]
                      return (
                        <option key={p.id} value={firstName}>
                          {p.name} ({p.role})
                        </option>
                      )
                    })}
                  </select>
                </label>

                <label>
                  <span>Due Window / Deadline</span>
                  <input
                    type="text"
                    placeholder="e.g. Next week or 15 Oct"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Why this matters (Context for owner)</span>
                <input
                  type="text"
                  placeholder="e.g. Ensures DJ has technical rider 2 weeks prior"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>

              <label>
                <span>Prerequisite Task (Optional Dependency)</span>
                <select value={dependsOnId} onChange={(e) => setDependsOnId(e.target.value)}>
                  <option value="">None — Can start immediately</option>
                  {allTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      Depends on: {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={!title.trim()}>
              <Plus size={16} /> Add to wedding plan
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
