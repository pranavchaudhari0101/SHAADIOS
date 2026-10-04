import React from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleDashed,
  FileText,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Brand } from './Brand.jsx'

export function Landing({ onStart, onDemo }) {
  const templates = [
    { title: 'North Indian Grand', tag: 'Sangeet & Baarat', icon: '🪕' },
    { title: 'South Indian Muhurtham', tag: 'Auspicious Rituals', icon: '🪷' },
    { title: 'Royal Destination', tag: 'Palace Weekend', icon: '🏰' },
    { title: 'Gujarati / Marwari', tag: 'Garba & Mameru', icon: '🥁' },
    { title: 'Intimate Modern', tag: 'Curated Elegance', icon: '✨' },
  ]

  return (
    <div className="landing">
      {/* Social Proof Announcement Bar */}
      <div className="landing-top-banner">
        <span>✨ Over 2,400+ Indian celebrations planned across Delhi, Mumbai, Jaipur & Bengaluru</span>
        <button onClick={onDemo} className="banner-link">
          Explore Jaipur Demo →
        </button>
      </div>

      <header className="landing-nav">
        <Brand />
        <div className="landing-nav-actions">
          <a href="#how-it-works">How it works</a>
          <button className="text-button" onClick={onDemo}>
            View live demo
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
              ShaadiOS understands what your celebration depends on, surfaces the next best action, and keeps every family member and vendor moving in the same direction via WhatsApp.
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
              <span><Check size={14} /> 1-Click WhatsApp coordination</span>
              <span><Check size={14} /> Role-based family privacy</span>
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

        {/* Regional Templates Showcase Ribbon */}
        <section className="regional-ribbon">
          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 14 }}>
            AUTHENTIC REGIONAL WEDDING TEMPLATES
          </p>
          <div className="ribbon-pills">
            {templates.map((t) => (
              <div key={t.title} className="ribbon-pill" onClick={onStart}>
                <span>{t.icon}</span>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.tag}</small>
                </div>
              </div>
            ))}
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
                <p>Couple, family, coordinator, and vendor responsibilities stay crystal clear with WhatsApp follow-ups.</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <span>The operating system for Indian weddings.</span>
        <span>India first · Designed for couples and families · 100% Private</span>
      </footer>
    </div>
  )
}
