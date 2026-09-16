import React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Brand } from './Brand.jsx'

export function InitialPlan({ wedding, tasks = [], onBack, onContinue }) {
  const topThree = tasks.slice(0, 3)

  return (
    <div className="plan-shell">
      <header className="onboarding-header">
        <Brand />
        <button onClick={onBack}>Adjust setup</button>
      </header>

      <main className="plan-main">
        <div className="plan-intro">
          <span className="plan-success">
            <CheckCircle2 size={20} />
          </span>
          <p className="eyebrow">YOUR PLAN IS READY</p>
          <h1>Here is where to begin.</h1>
          <p>
            We sequenced your celebration in {wedding.city}. You don't need to juggle everything simultaneously — just focus on these initial foundations.
          </p>
        </div>

        <div className="plan-grid">
          <section className="plan-priorities">
            <div className="section-heading">
              <div>
                <p>FIRST WEEK</p>
                <h2>Focus on these three decisions</h2>
              </div>
              <span className="plan-date">{wedding.date}</span>
            </div>

            {topThree.map((task, index) => (
              <article className="plan-task" key={task.id}>
                <span className={`priority-number ${index === 0 ? 'critical' : ''}`}>
                  0{index + 1}
                </span>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.reason}</p>
                  <small>
                    <span className="avatar tiny">{task.initials}</span> {task.owner} · {task.due}
                  </small>
                </div>
                <ChevronRight size={20} />
              </article>
            ))}
          </section>

          <aside className="plan-side">
            <div className="plan-stat">
              <p>YOUR CELEBRATION</p>
              <strong>{wedding.ceremonies?.length || 5} ceremonies</strong>
              <span>{wedding.guests} · {wedding.budget}</span>
            </div>

            <div className="plan-stat">
              <p>CONNECTED ARCHITECTURE</p>
              <strong>Live dependency monitoring</strong>
              <span>Downstream delays are caught weeks ahead of time.</span>
            </div>

            <div className="plan-note">
              <ShieldCheck size={19} />
              <p>
                <strong>You stay in control.</strong>
                <br />
                Major changes and vendor communication drafts require your explicit approval.
              </p>
            </div>
          </aside>
        </div>

        <button className="primary-button plan-cta" onClick={onContinue}>
          Open my wedding workspace <ArrowRight size={17} />
        </button>
      </main>
    </div>
  )
}
