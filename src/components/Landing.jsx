import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleDashed,
  Compass,
  FileText,
  HeartHandshake,
  Layers,
  MessageCircle,
  Palette,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Brand } from './Brand.jsx'
import {
  Link000,
  Link001,
  Link002,
  Link003,
  Link005,
} from './ui/skiper40.jsx'

export function Landing({ onStart, onDemo, onOpenDesignStudio }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    // immediateRender:false keeps content visible until the trigger fires —
    // a reveal that never runs must never cost us the content.
    gsap.from('.hero-visual', {
      duration: 0.6,
      y: 48,
      opacity: 0,
      rotate: 5,
      ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top center',
        once: true,
      }
    })

    // Section entrance — 450ms, the corpus ceiling for entrance motion
    gsap.utils.toArray('.principles article, .step-card').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
        opacity: 0,
        x: -16,
        duration: 0.45,
        ease: 'power2.out',
        immediateRender: false,
      })
    })
  }, [])

  const templates = [
    { title: 'North Indian Grand', tag: 'Sangeet & Baarat', icon: '🪕' },
    { title: 'South Indian Muhurtham', tag: 'Auspicious Rituals', icon: '🪷' },
    { title: 'Royal Destination', tag: 'Palace Weekend', icon: '🏰' },
    { title: 'Gujarati / Marwari', tag: 'Garba & Mameru', icon: '🥁' },
    { title: 'Intimate Modern', tag: 'Curated Elegance', icon: '✨' },
  ]

  const steps = [
    {
      n: '01',
      icon: Compass,
      title: 'Tell us the wedding',
      body: 'Date, city, ceremonies, guest range and budget — four short steps, under two minutes. Anything you have already booked carries straight into the plan.',
    },
    {
      n: '02',
      icon: Layers,
      title: 'Get a plan that thinks',
      body: 'Every task arrives with an owner, a reason and its dependencies. Priorities, risks and blockers are computed from your dates, not copied from a checklist.',
    },
    {
      n: '03',
      icon: MessageCircle,
      title: 'Run it with everyone',
      body: 'Family leads and coordinators get structured WhatsApp briefings and printable run-sheets. Move the date and the whole plan recalculates.',
    },
  ]

  return (
    <div className="landing">
      {/* Top Banner with Skiper Link */}
      <div className="landing-top-banner">
        <span>
          ✨ Over 2,400+ Indian celebrations planned across Delhi, Jaipur, Udaipur & Bengaluru
        </span>
        <button onClick={onDemo} className="banner-link">
          Explore Jaipur Royal Demo →
        </button>
      </div>

      {/* Main Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Brand />
          <div className="landing-nav-actions">
            <Link000 href="#how-it-works" className="nav-skiper-link">
              How it works
            </Link000>
            <Link001 href="#principles" className="nav-skiper-link">
              Architecture
            </Link001>
            {onOpenDesignStudio && (
              <button
                className="secondary-button compact"
                onClick={onOpenDesignStudio}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Palette size={15} /> Design Studio
              </button>
            )}
            <button className="text-button" onClick={onDemo}>
              View live demo
            </button>
            <button className="primary-button compact" onClick={onStart}>
              Create my plan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>

          {/* Hero Copy */}
          <div className="hero-copy" style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-copy-inner">
              <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)' }} />
                AN OPERATING SYSTEM IN YOUR CORNER · POWERED BY REAL DESIGN DEPTH
              </p>
              <h1>
                Stop holding your <em>wedding</em> in your head.
              </h1>
              <p className="hero-body">
                ShaadiOS turns complex multi-day Indian celebrations into a live connected graph. Surface next-best actions, simulate date & venue impacts before you commit, and coordinate seamlessly via 1-click WhatsApp.
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
                <span>
                  <Check size={14} /> Purpose-built for multi-event Indian weddings
                </span>
                <span>
                  <Check size={14} /> 1-Click WhatsApp coordination
                </span>
                <span>
                  <Check size={14} /> Real-time dependency recalculation
                </span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card (Linear & Stripe depth inspired) */}
          <div
            className="hero-visual"
            aria-label="Preview of ShaadiOS showing wedding priorities"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div className="glow glow-one" />
            <div className="glow glow-two" />

            <div className="visual-header">
              <span className="visual-brand">
                Shaadi<span>OS</span>
              </span>
              <span
                className="date-pill"
                style={{ background: 'rgba(230, 90, 112, .22)', color: '#ffc7d1' }}
              >
                156 days to go · 94% Health Score
              </span>
            </div>

            <p className="visual-overline">Your wedding this week</p>
            <h2>Two decisions need you.</h2>

            <div className="visual-task urgent">
              <span className="task-symbol">
                <CircleAlert size={18} />
              </span>
              <span>
                <strong>Confirm Taj Jai Mahal Palace contract</strong>
                <small>Blocks: Muhurtham decor, catering count & room block</small>
              </span>
            </div>

            <div className="visual-task">
              <span className="task-symbol">
                <FileText size={18} />
              </span>
              <span>
                <strong>Review royal photographer agreement</strong>
                <small>Price lock expires in 4 days</small>
              </span>
            </div>

            <div className="visual-rule" />

            <div className="visual-change">
              <span>
                <Sparkles size={18} />
              </span>
              <div>
                <strong>Connected Intelligence Engine:</strong>
                <p>
                  Shift the wedding date or ceremony order — your timeline, vendors, and guests automatically recalculate.
                </p>
                <div className="visual-change-link">
                  <Link005 href="#demo" onClick={onDemo}>
                    Simulate Date Change in Demo →
                  </Link005>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Templates Showcase Ribbon */}
        <section className="regional-ribbon">
          <div className="band-inner">
            <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 14 }}>
              Authentic regional wedding blueprints
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
          </div>
        </section>

        {/* Problem Strip */}
        <section className="problem-strip">
          <div className="band-inner">
            <p>
              Wedding plans rarely fail because there is no checklist. They fail because <strong>one change affects ten decisions</strong>, and no one has the complete picture.
            </p>
            <div className="strip-stats">
              <span>
                <b>1</b> connected source of truth
              </span>
              <span>
                <b>3</b> prioritized actions
              </span>
              <span>
                <b>0</b> surprise blockers
              </span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="band band-white">
          <div className="band-inner">
            <p className="eyebrow">How it works</p>
            <h2 className="band-head">
              Set it up once. It stays <em>connected</em> after that.
            </h2>
            <div className="steps">
              {steps.map((s) => (
                <article key={s.n} className="step-card">
                  <b>{s.n}</b>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Core Principles Section */}
        <section id="principles" className="principles">
          <div>
            <p className="eyebrow">Built for coordination & real design craft</p>
            <h2>
              Everything that matters,<br />
              <em>connected.</em>
            </h2>
          </div>
          <div className="principle-list">
            <article>
              <span>
                <Target size={20} />
              </span>
              <div>
                <h3>What needs to happen now?</h3>
                <p>
                  We filter out noise to surface the top three actions that genuinely move your celebration forward without family stress.
                </p>
                <Link001 href="#demo" onClick={onDemo} className="principle-link">
                  View priority queue
                </Link001>
              </div>
            </article>

            <article>
              <span>
                <Zap size={20} />
              </span>
              <div>
                <h3>What is blocked or at risk?</h3>
                <p>
                  Our dependency cascade highlights bottlenecks before vendor holds expire or printed invitations are compromised.
                </p>
                <Link002 href="#demo" onClick={onDemo} className="principle-link">
                  Inspect risk engine
                </Link002>
              </div>
            </article>

            <article>
              <span>
                <HeartHandshake size={20} />
              </span>
              <div>
                <h3>Who owns the next move?</h3>
                <p>
                  Family leads, coordinators, and vendors stay aligned with structured WhatsApp briefings and printable run-sheets.
                </p>
                <Link003 href="#demo" onClick={onDemo} className="principle-link">
                  Hospitality & directory
                </Link003>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <Brand />
          <span>The operating system for Indian weddings.</span>
          <span>India first · Designed for couples and families · 100% Private</span>
          {onOpenDesignStudio && (
            <Link005 href="#design" onClick={onOpenDesignStudio} className="footer-link">
              Inspect design-md tokens & 3D WebGL Studio
            </Link005>
          )}
        </div>
      </footer>
    </div>
  )
}

export default Landing
