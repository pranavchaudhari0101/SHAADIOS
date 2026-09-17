import { StrictMode, Component, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

class RecoveryBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="recovery-panel"><h1>Let’s get your plan back.</h1><p>This view could not load. Your saved data has not been removed.</p><button className="primary-button" onClick={() => window.location.reload()}>Reload safely</button></main>
    return this.props.children
  }
}

// Covers dialogs mounted anywhere in the app, including nested vendor forms.
function DialogAccessibility() {
  useEffect(() => {
    let active = null, release = () => {}
    const update = () => {
      const dialog = [...document.querySelectorAll('[role="dialog"]')].at(-1) || null
      if (dialog === active) return
      release(); active = dialog
      if (!dialog) return
      const previous = document.activeElement, overflow = document.body.style.overflow
      const inerted = []
      let branch = dialog
      while (branch.parentElement && branch !== document.body) {
        for (const sibling of branch.parentElement.children) {
          if (sibling !== branch && !sibling.inert) { sibling.inert = true; inerted.push(sibling) }
        }
        branch = branch.parentElement
      }
      document.body.style.overflow = 'hidden'
      dialog.tabIndex = -1
      const focusables = () => [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')].filter(el => !el.disabled && !el.className.includes('backdrop') && el.getClientRects().length)
      const first = focusables()[0] || dialog
      first.focus()
      const keydown = event => {
        if (event.key === 'Escape') { event.preventDefault(); dialog.querySelector('button[class*="backdrop"]')?.click() }
        if (event.key !== 'Tab') return
        const controls = focusables(), first = controls[0] || dialog, last = controls.at(-1) || dialog
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
      }
      document.addEventListener('keydown', keydown)
      release = () => {
        inerted.forEach(el => { el.inert = false })
        document.body.style.overflow = overflow
        document.removeEventListener('keydown', keydown)
        if (previous?.isConnected) previous.focus()
      }
    }
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    update()
    return () => { observer.disconnect(); release() }
  }, [])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoveryBoundary><App /><DialogAccessibility /></RecoveryBoundary>
  </StrictMode>,
)
