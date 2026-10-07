import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  Clock3,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Brand } from './Brand.jsx'

gsap.registerPlugin(ScrollTrigger)

const REDUCED = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Landing({ onStart, onDemo }) {
  const rootRef = useRef(null)
  const navRef = useRef(null)
  const visualRef = useRef(null)
  const progressRef = useRef(null)
  const stepsLineRef = useRef(null)

  // --------------------------------------------
  // Scroll-aware glass nav + scroll progress
  // --------------------------------------------
  useEffect(() => {
    const nav = navRef.current
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // --------------------------------------------
  // GSAP choreography
  // --------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (REDUCED) {
        gsap.set('[data-reveal]', { opacity: 1, y: 0 })
        return
      }

      /* Scroll progress bar */
      gsap.fromTo(progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
        },
      )

      /* Hero entrance timeline */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
      tl.from('.hero-v2 .eyebrow-pill', { y: 18, opacity: 0, duration: 0.5 })
        .from('.hero-v2 .h1-line > *', { yPercent: 115, duration: 0.85, stagger: 0.055, ease: 'power4.out' }, '-=0.2')
        .from('.hero-v2 .hero-sub', { y: 22, opacity: 0, duration: 0.6 }, '-=0.45')
        .from('.hero-v2 .hero-actions > *', { y: 18, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.35')
        .from('.hero-v2 .trust-line span', { y: 12, opacity: 0, duration: 0.45, stagger: 0.07 }, '-=0.3')
        .from('.hero-visual-stack', { y: 42, opacity: 0, rotate: 3, duration: 0.9 }, '-=0.85')
        .from('.hero-visual-stack .float-chip', { scale: 0.6, opacity: 0, duration: 0.55, stagger: 0.14, ease: 'back.out(1.8)' }, '-=0.35')

      /* Gentle perpetual float on chips */
      gsap.to('.float-chip.fc-1', { y: -9, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.float-chip.fc-2', { y: 8, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4 })

      /* Hero visual parallax on scroll */
      gsap.to('.hero-visual-stack', {
        yPercent: -7,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-v2', start: 'top top', end: 'bottom top', scrub: true },
      })

      /* Mouse tilt on the mockup */
      const card = visualRef.current
      if (card && window.matchMedia('(pointer: fine)').matches) {
        gsap.set(card, { transformPerspective: 950 })
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.55, ease: 'power3' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.55, ease: 'power3' })
        const onMove = (e) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          ry(px * 7)
          rx(py * -6)
        }
        const onLeave = () => { rx(0); ry(0) }
        card.addEventListener('mousemove', onMove)
        card.addEventListener('mouseleave', onLeave)
      }

      /* Generic reveal for section headers and cards */
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 34,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        })
      })

      /* Staggered card grids */
      gsap.utils.toArray('[data-stagger]').forEach((wrap) => {
        gsap.from(wrap.children, {
          y: 30,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: wrap, start: 'top 84%', once: true },
        })
      })

      /* Marquee band edge fade-in */
      gsap.from('.ribbon-band', {
        opacity: 0,
        scrollTrigger: { trigger: '.ribbon-band', start: 'top 92%', once: true },
      })

      /* Animated counters */
      gsap.utils.toArray('.stat-num').forEach((el) => {
        const target = parseFloat(el.dataset.value || '0')
        const state = { v: 0 }
        gsap.to(state, {
          v: target,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => { el.textContent = Math.round(state.v) },
        })
      })

      /* Steps connector line draws as you scroll */
      gsap.fromTo(stepsLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: { trigger: '.steps-band', start: 'top 70%', end: 'bottom 75%', scrub: true },
        },
      )

      /* Cascade rows in the dark change band, sequenced */
      gsap.from('.change-band .cascade-row', {
        x: -26,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: { trigger: '.change-band', start: 'top 62%', once: true },
      })

      ScrollTrigger.refresh()
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const templates = [
    { icon: '🪕', name: 'North Indian Grand', tag: 'Sangeet · Baarat' },
    { icon: '🪷', name: 'South Indian Muhurtham', tag: 'Morning rituals' },
    { icon: '🏰', name: 'Royal Destination', tag: 'Palace weekend' },
    { icon: '🥁', name: 'Gujarati · Marwari', tag: 'Garba · Mameru' },
    { icon: '✨', name: 'Intimate Modern', tag: 'Curated 120' },
    { icon: '🌊', name: 'Beach Intimate', tag: 'Goa · Sundowner' },
  ]

  const steps = [
    {
      n: '01',
      icon: Target,
      title: 'Tell us the wedding',
      body: 'Date, city, ceremonies, guest range and budget — four short steps, under two minutes. Anything already booked carries straight into the plan.',
    },
    {
      n: '02',
      icon: Zap,
      title: 'Get a plan that thinks',
      body: 'Every task arrives with an owner, a reason and its dependencies. Priorities, risks and blockers are computed from your dates — not copied from a checklist.',
    },
    {
      n: '03',
      icon: MessageCircle,
      title: 'Run it with everyone',
      body: 'Family leads and coordinators get structured WhatsApp briefings and printable run-sheets. Move the date and the whole plan recalculates.',
    },
  ]

  const principles = [
    {
      icon: Target,
      title: 'What needs to happen now?',
      body: 'The priority engine weighs deadline urgency against everything a task unlocks downstream, then surfaces the top three — so you act on leverage, not noise.',
      link: 'Inspect the priority queue',
    },
    {
      icon: Zap,
      title: 'What is blocked or at risk?',
      body: 'The dependency graph cascades completion and blockage in real time. Vendor hold expiring inside six days becomes a High-severity risk with an action link.',
      link: 'See the risk engine',
    },
    {
      icon: ShieldCheck,
      title: 'Who owns the next move?',
      body: 'Notifications carry a target role, so Mom hears about her hotel block — not a group broadcast. Every external message is drafted for review, never auto-sent.',
      link: 'Understand role routing',
    },
  ]

  return (
    <div className="landing landing-v2" ref={rootRef}>
      {/* Scroll progress */}
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress-fill" ref={progressRef} />
      </div>

      {/* Navigation */}
      <header className="landing-nav v2" ref={navRef}>
        <div className="landing-nav-inner">
          <Brand />
          <nav className="nav-links" aria-label="Marketing navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#architecture">Architecture</a>
            <a href="#change">Change engine</a>
          </nav>
          <div className="landing-nav-actions">
            <button className="text-button" onClick={onDemo}>View live demo</button>
            <button className="primary-button pill" onClick={onStart}>
              Create my plan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="hero-v2">
          <div className="hero-grid-bg" aria-hidden="true" />
          <div className="hero-glow hg-1" aria-hidden="true" />
          <div className="hero-glow hg-2" aria-hidden="true" />

          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow-pill" data-anim>
                <span className="pulse-dot" aria-hidden="true" />
                The operating system for Indian weddings
              </span>

              <h1 className="hero-h1">
                <span className="h1-line"><span>Stop</span> <span>holding</span> <span>your</span></span>
                <span className="h1-line"><em className="grad-ink">wedding</em> <span>in</span> <span>your</span></span>
                <span className="h1-line"><span>head.</span></span>
              </h1>

              <p className="hero-sub" data-anim>
                A wedding is not a checklist — it is a connected system of ceremonies, people,
                vendors and deadlines. ShaadiOS turns it into one live plan that knows what blocks
                what, tells the right person what to do next, and shows exactly what breaks before
                anything changes.
              </p>

              <div className="hero-actions" data-anim>
                <button className="primary-button pill lg" onClick={onStart}>
                  Build my wedding plan <ArrowRight size={17} />
                </button>
                <button className="secondary-button pill lg" onClick={onDemo}>
                  <Sparkles size={17} /> Explore the interactive demo
                </button>
              </div>

              <div className="trust-line" data-anim>
                <span><Check size={14} /> Built for multi-event celebrations</span>
                <span><Check size={14} /> 1-click WhatsApp coordination</span>
                <span><Check size={14} /> Real dependency recalculation</span>
              </div>
            </div>

            {/* Hero visual — layered product mockup with tilt */}
            <div className="hero-visual-stack" aria-hidden="true">
              <div className="hero-mockup" ref={visualRef}>
                <div className="mockup-head">
                  <span className="mockup-brand">Shaadi<em>OS</em></span>
                  <span className="mockup-days">156 days to go</span>
                </div>

                <div className="mockup-health">
                  <div className="health-ring">
                    <svg viewBox="0 0 44 44" width="46" height="46">
                      <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3.5" />
                      <circle className="ring-fill" cx="22" cy="22" r="19" fill="none" stroke="#e693a4" strokeWidth="3.5"
                        strokeLinecap="round" strokeDasharray="119.4" strokeDashoffset="12" transform="rotate(-90 22 22)" />
                    </svg>
                    <strong>94%</strong>
                  </div>
                  <div>
                    <small>ON TRACK</small>
                    <span>2 decisions need you today</span>
                  </div>
                </div>

                <div className="mockup-task urgent">
                  <span className="mt-icon"><CircleAlert size={17} /></span>
                  <span className="mt-copy">
                    <strong>Confirm The Roseate contract</strong>
                    <small>Unlocks invitations · accommodation · decor</small>
                  </span>
                  <span className="mt-tag">Critical</span>
                </div>

                <div className="mockup-task">
                  <span className="mt-icon"><FileText size={17} /></span>
                  <span className="mt-copy">
                    <strong>Review photographer agreement</strong>
                    <small>Date hold expires in 4 days</small>
                  </span>
                  <span className="mt-tag soft">Important</span>
                </div>

                <div className="mockup-foot">
                  <span><Clock3 size={13} /> Mom is waiting on the hotel quote</span>
                  <span><MessageCircle size={13} /> Follow-up drafted for review</span>
                </div>
              </div>

              {/* Floating chips */}
              <div className="float-chip fc-1">
                <CircleCheck size={15} />
                <span>Date moved → 14 deadlines recalculated</span>
              </div>
              <div className="float-chip fc-2">
                <Zap size={15} />
                <span>Venue confirmed → 3 tasks unblocked</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TEMPLATE MARQUEE ================= */}
        <section className="ribbon-band" aria-label="Regional wedding templates">
          <p className="ribbon-eyebrow">Authentic regional blueprints</p>
          <div className="marquee">
            <div className="marquee-track">
              {[...templates, ...templates].map((t, i) => (
                <button className="ribbon-pill" key={`${t.name}-${i}`} onClick={onStart}>
                  <span className="rp-icon">{t.icon}</span>
                  <span className="rp-copy">
                    <strong>{t.name}</strong>
                    <small>{t.tag}</small>
                  </span>
                  <ArrowRight size={14} className="rp-arrow" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PROBLEM STRIP ================= */}
        <section className="problem-v2">
          <div className="band-inner">
            <p className="problem-statement" data-reveal>
              Wedding plans rarely fail because there is no checklist.
              They fail because <strong>one change affects ten decisions</strong> —
              and no one has the complete picture.
            </p>
            <div className="stat-row" data-stagger>
              <div className="stat">
                <span className="stat-num" data-value="1">0</span>
                <span className="stat-label">connected source of truth</span>
              </div>
              <div className="stat">
                <span className="stat-num" data-value="3">0</span>
                <span className="stat-label">prioritized actions, computed daily</span>
              </div>
              <div className="stat">
                <span className="stat-num" data-value="0">0</span>
                <span className="stat-label">surprise blockers</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="steps-band">
          <div className="band-inner">
            <div className="band-head-row" data-reveal>
              <p className="eyebrow">How it works</p>
              <h2 className="band-head">Set it up once.<br />It stays <em>connected</em> after that.</h2>
            </div>

            <div className="steps-track">
              <div className="steps-line" ref={stepsLineRef} aria-hidden="true" />
              <div className="steps" data-stagger>
                {steps.map((s) => (
                  <article className="step-card" key={s.n}>
                    <div className="step-top">
                      <b>{s.n}</b>
                      <span className="step-icon"><s.icon size={19} /></span>
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= ARCHITECTURE / PRINCIPLES ================= */}
        <section id="architecture" className="principles-v2">
          <div className="band-inner">
            <div className="principles-head" data-reveal>
              <p className="eyebrow">The intelligence layer</p>
              <h2 className="band-head">Everything that matters,<br /><em>connected.</em></h2>
              <p className="principles-sub">
                Five deterministic engines sit on top of one wedding graph — dependency, priority,
                risk, action and change. Every recommendation explains itself, because the answer
                is computed, not guessed.
              </p>
            </div>

            <div className="principle-grid" data-stagger>
              {principles.map((p) => (
                <article className="principle-card" key={p.title}>
                  <span className="pc-icon"><p.icon size={20} /></span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <button className="pc-link" onClick={onDemo}>
                    {p.link} <ArrowRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CHANGE ENGINE (dark polarity flip) ================= */}
        <section id="change" className="change-band">
          <div className="band-inner change-grid">
            <div className="change-copy" data-reveal>
              <p className="eyebrow light">The change engine</p>
              <h2>Move the date.<br /><em>Watch everything recalculate.</em></h2>
              <p className="change-sub">
                Editing the anchor date previews every affected contract, hold and deadline.
                Nothing updates until you approve — then timelines, due dates and role-routed
                notifications follow automatically.
              </p>
              <button className="primary-button pill on-dark" onClick={onDemo}>
                Try it in the demo <ArrowRight size={16} />
              </button>
            </div>

            <div className="cascade-demo" aria-hidden="true">
              <div className="date-shift">
                <span className="ds-chip old">18 Feb 2027</span>
                <span className="ds-arrow"><ArrowRight size={16} /></span>
                <span className="ds-chip new">25 Feb 2027</span>
              </div>
              <div className="cascade-row">
                <CircleAlert size={15} />
                <span><strong>Venue hold</strong> — re-confirm availability for the new date</span>
                <em className="cr-level critical">Critical</em>
              </div>
              <div className="cascade-row">
                <FileText size={15} />
                <span><strong>Photographer hold</strong> — modification drafted for Arjun</span>
                <em className="cr-level high">High</em>
              </div>
              <div className="cascade-row">
                <MessageCircle size={15} />
                <span><strong>Mom's room block</strong> — hotel inquiry retargeted</span>
                <em className="cr-level high">High</em>
              </div>
              <div className="cascade-row">
                <Check size={15} />
                <span><strong>Invitation print window</strong> — proofing deadline recalculated</span>
                <em className="cr-level medium">Medium</em>
              </div>
              <p className="cascade-note"><ShieldCheck size={13} /> External messages are prepared, never auto-sent.</p>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="cta-band-v2">
          <div className="band-inner cta-inner" data-reveal>
            <h2>Your wedding, held together<br />by <em>one connected plan.</em></h2>
            <p>Two minutes of setup. A planning system that keeps every ceremony, person and vendor in sync until the day itself.</p>
            <div className="hero-actions center">
              <button className="primary-button pill lg" onClick={onStart}>
                Create my plan <ArrowRight size={17} />
              </button>
              <button className="ghost-button pill lg" onClick={onDemo}>
                Explore the demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer v2">
        <div className="band-inner footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>The operating system for Indian weddings.</p>
          </div>
          <div className="footer-meta">
            <span>India first · Designed for couples and families</span>
            <span>100% private · Your data never leaves your device</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
