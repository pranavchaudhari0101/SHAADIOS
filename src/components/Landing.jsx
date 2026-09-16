import React from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleDashed,
  FileText,
  HeartHandshake,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Brand } from './Brand.jsx'

export function Landing({ onStart, onDemo }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <div className="landing-nav-actions">
          <a href="#how-it-works">How it works</a>
          <button className="text-button" onClick={onDemo}>
            View demo
          </button>
          <button className="primary-button compact" onClick={onStart}>
            Create my plan <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span></span> A WEDDING COORDINATOR IN YOUR CORNER
            </p>
            <h1>
              Stop holding your <em>wedding</em> in your head.
            </h1>
            <p className="hero-body">
              ShaadiOS understands what your wedding depends on, surfaces the next best action, and keeps every family member and vendor moving in the same direction.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={onStart}>
                Build my wedding plan <ArrowRight size={17} />
              </button>
              <button className="secondary-button" onClick={onDemo}>
                <CircleDashed size={18} /> Explore interactive demo
              </button>
            </div>
            <div className="trust-line">
              <span><Check size={14} /> Purpose-built for multi-event Indian weddings</span>
              <span><Check size={14} /> You approve all changes</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Preview of ShaadiOS showing wedding priorities">
            <div className="glow glow-one"></div>
            <div className="glow glow-two"></div>
            <div className="visual-header">
              <span className="visual-brand">Shaadi<span>OS</span></span>
              <span className="date-pill">156 days to go</span>
            </div>
            <p className="visual-overline">YOUR WEDDING THIS WEEK</p>
            <h2>Two things need you.</h2>
            <div className="visual-task urgent">
              <span className="task-symbol">
                <CircleAlert size={18} />
              </span>
              <span>
                <strong>Confirm venue contract</strong>
                <small>It unlocks 4 planning decisions.</small>
              </span>
            </div>
            <div className="visual-task">
              <span className="task-symbol gold">
                <FileText size={18} />
              </span>
              <span>
                <strong>Review photographer contract</strong>
                <small>Hold expires in 4 days</small>
              </span>
            </div>
            <div className="visual-rule"></div>
            <div className="visual-change">
              <span><Sparkles size={18} /></span>
              <p>
                <strong>Your plan recalculates when things change.</strong>
                <br />
                Venue, guests, vendors, dates — we map the impact before you act.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="problem-strip">
          <p>
            Wedding plans rarely fail because there is no checklist. They fail because <strong>one change affects ten decisions</strong>, and no one has the complete picture.
          </p>
          <div className="strip-stats">
            <span><b>1</b> connected truth</span>
            <span><b>3</b> top actions</span>
            <span><b>0</b> surprise blockers</span>
          </div>
        </section>

        <section className="principles">
          <div>
            <p className="eyebrow">BUILT FOR COORDINATION</p>
            <h2>
              Everything that matters,<br />
              <em>connected.</em>
            </h2>
          </div>
          <div className="principle-list">
            <article>
              <span><Target size={20} /></span>
              <div>
                <h3>What needs to happen now?</h3>
                <p>We turn an overwhelming list into the three actions that truly move your celebration forward.</p>
              </div>
            </article>
            <article>
              <span><Zap size={20} /></span>
              <div>
                <h3>What is blocked or at risk?</h3>
                <p>Dependencies make risks visible before contracts expire or printing delays occur.</p>
              </div>
            </article>
            <article>
              <span><HeartHandshake size={20} /></span>
              <div>
                <h3>Who owns the next move?</h3>
                <p>Couple, family, coordinator, and vendor responsibilities stay crystal clear without WhatsApp chases.</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <span>The operating system for Indian weddings.</span>
        <span>India first · Designed for couples and families</span>
      </footer>
    </div>
  )
}
