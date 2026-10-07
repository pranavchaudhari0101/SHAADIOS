import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Layers,
  Palette,
  Code2,
  Check,
  ExternalLink,
  Sliders,
  Eye,
  Zap,
  Shield,
  Compass,
} from 'lucide-react'
import {
  Link000,
  Link001,
  Link002,
  Link003,
  Link004,
  Link005,
} from './ui/skiper40.jsx'
import { ThreeLuxeCanvas } from './ui/ThreeLuxeCanvas.jsx'

export function DesignStudioModal({ onClose, currentTheme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('tokens') // 'tokens' | 'components' | 'systems' | 'skills'
  const [selectedSystem, setSelectedSystem] = useState('shaadios')

  // Analyzed Design Systems from design-md/
  const designSystems = {
    shaadios: {
      name: 'ShaadiOS Luxe',
      origin: 'Custom Royal Wedding Architecture',
      tagline: 'Deep velvet charcoal, gold stardust & rose silk with ThreeUI 3D depth',
      palette: [
        { name: 'Rose Velvet', hex: '#9e1b46', role: 'Brand Core / Primary Accent' },
        { name: 'Royal Gold', hex: '#c59b27', role: 'Auspicious Metallic Tone' },
        { name: 'Warm Silk', hex: '#fcfaf7', role: 'Canvas Background' },
        { name: 'Midnight Charcoal', hex: '#0c0b0f', role: 'Luxe Dark Canvas' },
        { name: 'Emerald Sage', hex: '#2d6a4f', role: 'Success / Completed State' },
      ],
      typography: {
        display: 'Playfair Display (600/700, -2.5px tracking)',
        body: 'DM Sans (400/500/700, clean geometric sans)',
      },
      rules: [
        'Hairline specular borders with 18% gold opacity',
        'Multi-layer luminous drop shadows with rose atmospheric glow',
        'Glassmorphic backdrop blur (24px saturate 180%)',
        'ThreeUI WebGL particle constellation field as living backdrop',
      ],
    },
    linear: {
      name: 'Linear.app',
      origin: 'design-md/linear.app/DESIGN.md',
      tagline: 'Deepest near-black canvas (#010102) with lavender accent (#5e6ad2)',
      palette: [
        { name: 'Canvas', hex: '#010102', role: 'Deep Dark Background' },
        { name: 'Surface 1', hex: '#0f1011', role: 'Card Panel Surface' },
        { name: 'Linear Lavender', hex: '#5e6ad2', role: 'Chromatic Focus & Brand' },
        { name: 'Ink Primary', hex: '#f7f8f8', role: 'High-contrast Display Text' },
        { name: 'Hairline', hex: '#23252a', role: 'Microscopic Card Borders' },
      ],
      typography: {
        display: 'SF Pro Display / Linear Display (600, -3.0px)',
        body: 'Linear Text (400/500, tabular numbers)',
      },
      rules: [
        'Cards live as charcoal panels with hairline borders',
        'Negative letter tracking on headline sizes',
        'Single lavender chromatic accent, never used decoratively',
      ],
    },
    stripe: {
      name: 'Stripe',
      origin: 'design-md/stripe/DESIGN.md',
      tagline: 'Electric indigo (#533afd), deep navy ink (#0d253d), and atmospheric gradients',
      palette: [
        { name: 'Primary Indigo', hex: '#533afd', role: 'Signature Financial Brand' },
        { name: 'Navy Ink', hex: '#0d253d', role: 'Display Headline Tone' },
        { name: 'Canvas Soft', hex: '#f6f9fc', role: 'Clean SaaS Surface' },
        { name: 'Hairline Blue', hex: '#e3e8ee', role: 'Subtle Table & Input Dividers' },
      ],
      typography: {
        display: 'Sohne Display (300 weight, -1.4px tracking)',
        body: 'Tabular-figure body type for financials',
      },
      rules: [
        'Atmospheric gradient mesh occupying the upper third',
        'Tight-radius pill buttons with active depth states',
        'Editorial light-weight typography with tight kerning',
      ],
    },
    airbnb: {
      name: 'Airbnb',
      origin: 'design-md/airbnb/DESIGN.md',
      tagline: 'Warm consumer hospitality anchored by Rausch (#ff385c) and generous whitespace',
      palette: [
        { name: 'Rausch Red', hex: '#ff385c', role: 'Primary Action & Rating Dot' },
        { name: 'Deep Ink', hex: '#222222', role: 'Editorial Body & Title' },
        { name: 'Soft Surface', hex: '#f7f7f7', role: 'Warm Hospitality Background' },
        { name: 'Hairline', hex: '#dddddd', role: 'Property Card Dividers' },
      ],
      typography: {
        display: 'Airbnb Cereal VF (500/700, generous line-height)',
        body: 'Human-friendly rounded text with zero harsh edges',
      },
      rules: [
        'Pill-shaped search bars and 32px rounded button radii',
        'Generous whitespace over heavy typography muscle',
        'Photography-first card architecture',
      ],
    },
  }

  const currentSys = designSystems[selectedSystem]

  return (
    <div className="design-studio-overlay" role="dialog" aria-modal="true">
      <div className="design-studio-modal">
        {/* Header */}
        <header className="design-studio-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c59b27, #9e1b46)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  ShaadiOS Design Intelligence & Token Studio
                </h3>
                <span className="luxe-pill luxe-pill-gold">Analyzed design.md</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>
                Powered by design-md tokens, @designcodeio/threeui WebGL, and Skiper40 interactions
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onToggleTheme}
              className="secondary-button compact"
              title="Toggle Luxe Dark / Silk Cream Theme"
            >
              <Palette size={16} /> Theme: {currentTheme === 'luxe-dark' ? 'Luxe Dark' : 'Silk Cream'}
            </button>
            <button
              onClick={onClose}
              className="icon-button"
              aria-label="Close design studio"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 28px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          {[
            { id: 'tokens', label: 'Design Tokens & Palette', icon: Palette },
            { id: 'components', label: 'Skiper40 & ThreeUI Playground', icon: Layers },
            { id: 'systems', label: 'design-md Catalog Analysis', icon: Compass },
            { id: 'skills', label: 'Ponytail & Architecture Rules', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`secondary-button compact ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  background: activeTab === tab.id ? 'var(--rose-pale)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--rose)' : 'var(--ink-soft)',
                  borderColor: activeTab === tab.id ? 'var(--rose)' : 'transparent',
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="design-studio-content">
          {/* TAB 1: DESIGN TOKENS */}
          {activeTab === 'tokens' && (
            <div style={{ display: 'grid', gap: 24 }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>
                  Active System: {currentSys.name}
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                  {currentSys.tagline} · Source: <code>{currentSys.origin}</code>
                </p>

                {/* Color Swatches Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14,
                  }}
                >
                  {currentSys.palette.map((c) => (
                    <div
                      key={c.name}
                      className="luxe-card"
                      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                      <div
                        style={{
                          height: 54,
                          borderRadius: 8,
                          background: c.hex,
                          border: '1px solid rgba(0,0,0,0.1)',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: 13, display: 'block' }}>{c.name}</strong>
                        <code style={{ fontSize: 12, color: 'var(--gold)' }}>{c.hex}</code>
                        <small
                          style={{
                            display: 'block',
                            fontSize: 11,
                            color: 'var(--ink-soft)',
                            marginTop: 2,
                          }}
                        >
                          {c.role}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Spacing Blueprint */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div className="luxe-card" style={{ padding: 20 }}>
                  <h5 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
                    Typographic Scale Blueprint
                  </h5>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <small style={{ color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                        Display Serif
                      </small>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontFamily: 'var(--serif)',
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {currentSys.typography.display}
                      </p>
                    </div>
                    <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />
                    <div>
                      <small style={{ color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                        Body & Metadata Sans
                      </small>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontFamily: 'var(--sans)',
                          fontSize: 15,
                          fontWeight: 500,
                        }}
                      >
                        {currentSys.typography.body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="luxe-card" style={{ padding: 20 }}>
                  <h5 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
                    Synthesized Architecture Rules
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--ink-soft)' }}>
                    {currentSys.rules.map((rule, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKIPER40 & THREEUI PLAYGROUND */}
          {activeTab === 'components' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* Skiper40 Animated Links Section */}
              <div className="luxe-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
                      Skiper40 Animated CSS Links (@skiper-ui/skiper40)
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
                      Lightweight, GPU-accelerated micro-interactions inspired by Cursor.com and modern craft design
                    </p>
                  </div>
                  <span className="luxe-pill luxe-pill-rose">CSS-Only Hover FX</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link000 · Smooth Slide Underline</small>
                    <Link000 href="#demo">Explore Wedding Timeline</Link000>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link001 · Underline + Arrow Shift</small>
                    <Link001 href="#demo">WhatsApp Coordinator Protocol</Link001>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link002 · Bi-directional Rose-Gold Gradient</small>
                    <Link002 href="#demo">Recalculate Budget Impact</Link002>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link003 · Center Expand Underline</small>
                    <Link003 href="#demo">Master Hospitality Directory</Link003>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link004 · Capsule Invert Fill</small>
                    <Link004 href="#demo" style={{ color: 'var(--rose)' }}>
                      Download Run-Sheet PDF
                    </Link004>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      background: 'var(--surface-soft)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <small style={{ color: 'var(--ink-faint)' }}>Link005 · Gold Stardust Glow Underline</small>
                    <Link005 href="#demo">Instant Date Recalculation</Link005>
                  </div>
                </div>
              </div>

              {/* ThreeUI 3D Canvas Preview */}
              <div className="luxe-card" style={{ padding: 24, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
                      ThreeUI 3D WebGL Constellation Canvas (@designcodeio/threeui)
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
                      Interactive 3D particle constellation rendering with additive blending, camera sway, and mouse tracking
                    </p>
                  </div>
                  <span className="luxe-pill luxe-pill-gold">Live Three.js Canvas</span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    height: 240,
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#0c0b10',
                    border: '1px solid rgba(197, 155, 39, 0.25)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <ThreeLuxeCanvas interactive={true} className="three-canvas-interactive" />
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      textAlign: 'center',
                      pointerEvents: 'none',
                      padding: 20,
                    }}
                  >
                    <span className="luxe-pill luxe-pill-gold" style={{ marginBottom: 10 }}>
                      Interactive Orbit
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 22,
                        color: '#fff',
                        fontFamily: 'var(--serif)',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Hover and move your mouse across this canvas
                    </h3>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      Simulating real-time dependency connections across events, venues, and families
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN-MD CATALOG ANALYSIS */}
          {activeTab === 'systems' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)' }}>
                Comparing design token depth across 74 extracted systems in <code>c:\Users\Admin\Desktop\Shaadios\design-md</code>:
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.keys(designSystems).map((sysKey) => (
                  <button
                    key={sysKey}
                    onClick={() => setSelectedSystem(sysKey)}
                    className="secondary-button compact"
                    style={{
                      borderColor: selectedSystem === sysKey ? 'var(--gold)' : 'var(--border)',
                      background: selectedSystem === sysKey ? 'var(--gold-pale)' : 'var(--surface)',
                      color: selectedSystem === sysKey ? 'var(--gold)' : 'var(--ink)',
                      fontWeight: 700,
                    }}
                  >
                    {designSystems[sysKey].name}
                  </button>
                ))}
              </div>

              <div className="luxe-card" style={{ padding: 24 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>
                  Detailed Analysis: {currentSys.name}
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                  {currentSys.tagline}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  {currentSys.palette.map((p) => (
                    <div
                      key={p.name}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: 'var(--surface-soft)',
                        borderLeft: `4px solid ${p.hex}`,
                      }}
                    >
                      <strong style={{ fontSize: 13 }}>{p.name}</strong>
                      <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{p.hex}</div>
                      <small style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{p.role}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PONYTAIL & AGENTSKILLS RULES */}
          {activeTab === 'skills' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div className="luxe-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Zap size={22} style={{ color: 'var(--gold)' }} />
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Installed Skills & Architectural Principles
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                  Skills active in <code>.agents/skills/</code>: <b>ponytail</b> (efficiency & minimal code ladder), <b>graphify</b> (codebase knowledge graph), and <b>agentskills</b> specification.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    {
                      rung: '1. Does this need to exist at all?',
                      desc: 'YAGNI: Avoid speculative code and superficial wrappers. Build real connected loops.',
                    },
                    {
                      rung: '2. Already in this codebase?',
                      desc: 'Reuse existing dependency engine, priority engine, and risk computation models.',
                    },
                    {
                      rung: '3. Native platform features first',
                      desc: 'Use hardware-accelerated CSS animations (Skiper40) over heavy JS animation loops.',
                    },
                    {
                      rung: '4. Root-cause fixes over superficial patches',
                      desc: 'State recalculates cascade throughout wedding plan rather than static string swaps.',
                    },
                  ].map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: 'var(--surface-soft)',
                        borderLeft: '4px solid var(--rose)',
                      }}
                    >
                      <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{r.rung}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>
                        {r.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 28px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              ShaadiOS Design System v2.0 · Ready for Production
            </span>
          </div>
          <button className="primary-button compact" onClick={onClose}>
            Apply Design & Return to App <Check size={16} />
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DesignStudioModal
