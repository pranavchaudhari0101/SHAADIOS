import React, { useState } from 'react'
import {
  Bell,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react'

export function NotificationCenter({
  notifications = [],
  onClose,
  onMarkAllRead,
  onSelectTask,
}) {
  const [filter, setFilter] = useState('all')

  const filtered = notifications.filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'critical') return item.type === 'critical'
    if (filter === 'waiting') return item.type === 'waiting'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="drawer-layer" role="dialog" aria-modal="true" aria-labelledby="notif-title">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Close notifications" />
      <aside className="task-panel notification-drawer">
        <header>
          <div className="notif-header-title">
            <Bell size={20} className="notif-icon-lead" />
            <h2 id="notif-title">Notification Center</h2>
            {unreadCount > 0 && <span className="nav-count">{unreadCount} new</span>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close notifications">
            <X size={20} />
          </button>
        </header>

        <div className="task-panel-body">
          <div className="notif-filter-bar">
            <button
              className={`filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical
            </button>
            <button
              className={`filter ${filter === 'waiting' ? 'active' : ''}`}
              onClick={() => setFilter('waiting')}
            >
              Waiting
            </button>
          </div>

          <div className="notif-actions-row">
            <span className="notif-subtitle">Selective routing: only affected collaborators get pinged.</span>
            {unreadCount > 0 && (
              <button className="link-button" onClick={onMarkAllRead}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {filtered.length === 0 ? (
              <div className="empty-notifs">
                <CheckCircle2 size={32} />
                <p>All caught up! No notifications in this category.</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isCritical = item.type === 'critical'
                const isWaiting = item.type === 'waiting'

                return (
                  <article
                    key={item.id}
                    className={`notif-card ${!item.read ? 'is-unread' : ''} ${isCritical ? 'critical-border' : ''}`}
                  >
                    <div className="notif-card-header">
                      <span className={`notif-badge ${item.type}`}>
                        {isCritical ? <CircleAlert size={14} /> : isWaiting ? <Clock3 size={14} /> : <Sparkles size={14} />}
                        {item.type}
                      </span>
                      <span className="notif-time">{item.timestamp}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    {item.taskId && (
                      <button
                        className="notif-action-btn"
                        onClick={() => {
                          onSelectTask(item.taskId)
                          onClose()
                        }}
                      >
                        Inspect connected task <ArrowRight size={14} />
                      </button>
                    )}
                  </article>
                )
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
