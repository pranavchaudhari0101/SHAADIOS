import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Handshake,
  Home,
  Hotel,
  LayoutList,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Printer,
  RotateCcw,
  Sparkles,
  Upload,
  UsersRound,
  X,
} from 'lucide-react'

// Core Models & Engines
import {
  loadSavedState,
  saveState,
  resetState,
  exportStateAsJSON,
  DEFAULT_WEDDING,
  DEFAULT_TASKS,
  DEFAULT_PEOPLE,
  DEFAULT_VENDORS,
  DEFAULT_GUESTS,
  DEFAULT_ROOMS,
  DEFAULT_CONTINGENCY,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_ACTIVITY,
} from './core/weddingState.js'
import {
  cascadeTaskCompletion,
  synchronizeDependencies,
} from './core/dependencyEngine.js'
import { rankTasks } from './core/priorityEngine.js'
import { detectRisks, calculateHealthScore } from './core/riskEngine.js'
import { applyDateChange } from './core/changeEngine.js'
import { formatIndianDate } from './core/utils.js'

// Components
import { Brand } from './components/Brand.jsx'
import { Landing } from './components/Landing.jsx'
import { Onboarding } from './components/Onboarding.jsx'
import { InitialPlan } from './components/InitialPlan.jsx'
import { HomeView } from './components/HomeView.jsx'
import { TimelineView } from './components/TimelineView.jsx'
import { TasksView } from './components/TasksView.jsx'
import { PeopleView } from './components/PeopleView.jsx'
import { VendorsView } from './components/VendorsView.jsx'
import { GuestsView } from './components/GuestsView.jsx'
import { PlannerView } from './components/PlannerView.jsx'
import { TaskModal } from './components/TaskModal.jsx'
import { ChangeModal } from './components/ChangeModal.jsx'
import { ContingencyModal } from './components/ContingencyModal.jsx'
import { NotificationCenter } from './components/NotificationCenter.jsx'
import { FollowUpModal } from './components/FollowUpModal.jsx'
import { InviteModal } from './components/InviteModal.jsx'
import { AddTaskModal } from './components/AddTaskModal.jsx'
import { MasterRunSheetModal } from './components/MasterRunSheetModal.jsx'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: LayoutList },
  { id: 'vendors', label: 'Vendors', icon: Handshake },
  { id: 'guests', label: 'Guests & Rooms', icon: Hotel },
  { id: 'people', label: 'People', icon: UsersRound },
  { id: 'planner', label: 'Planner', icon: Sparkles },
]

export default function App() {
  // Initialize state from localStorage or seed
  const [initialData] = useState(() => loadSavedState())

  const [wedding, setWedding] = useState(initialData.wedding || DEFAULT_WEDDING)
  const [tasks, setTasks] = useState(initialData.tasks || DEFAULT_TASKS)
  const [vendors, setVendors] = useState(initialData.vendors || DEFAULT_VENDORS)
  const [people, setPeople] = useState(initialData.people || DEFAULT_PEOPLE)
  const [guests, setGuests] = useState(initialData.guests || DEFAULT_GUESTS)
  const [rooms, setRooms] = useState(initialData.rooms || DEFAULT_ROOMS)
  const [contingency, setContingency] = useState(initialData.contingency || DEFAULT_CONTINGENCY)
  const [notifications, setNotifications] = useState(initialData.notifications || DEFAULT_NOTIFICATIONS)
  const [activityLog, setActivityLog] = useState(initialData.activityLog || DEFAULT_ACTIVITY)
  const [activeRole, setActiveRole] = useState(initialData.activeRole || 'owner')

  // Navigation & UI States
  const [screen, setScreen] = useState('landing') // 'landing' | 'onboarding' | 'plan' | 'app'
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Modals & Drawers
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [changeOpen, setChangeOpen] = useState(false)
  const [changeStep, setChangeStep] = useState('edit')
  const [proposal, setProposal] = useState('2027-02-25')
  const [contingencyModalOpen, setContingencyModalOpen] = useState(false)
  const [notifCenterOpen, setNotifCenterOpen] = useState(false)
  const [followUpVendor, setFollowUpVendor] = useState(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false)
  const [runSheetOpen, setRunSheetOpen] = useState(false)

  const fileInputRef = useRef(null)

  // Onboarding setup state
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [setup, setSetup] = useState({
    date: '2027-02-18',
    season: 'February 2027 (Spring Festive)',
    city: 'Jaipur',
    couple: 'Rhea & Arjun',
    guests: '150–300',
    budget: '₹25–50L',
    templateId: 'north_indian',
    ceremonies: ['Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception'],
    booked: ['Venue'],
  })

  // Synchronize dependencies whenever tasks change
  const synchronizedTasks = useMemo(() => {
    return synchronizeDependencies(tasks)
  }, [tasks])

  // Save to localStorage on state changes
  useEffect(() => {
    saveState({
      wedding,
      tasks: synchronizedTasks,
      vendors,
      people,
      guests,
      rooms,
      contingency,
      notifications,
      activityLog,
      activeRole,
    })
  }, [wedding, synchronizedTasks, vendors, people, guests, rooms, contingency, notifications, activityLog, activeRole])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 4000)
  }

  // Selected Task lookup
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null
    return synchronizedTasks.find((t) => t.id === selectedTaskId) || null
  }, [selectedTaskId, synchronizedTasks])

  // Metrics
  const risks = useMemo(() => detectRisks({ wedding, tasks: synchronizedTasks, vendors }), [wedding, synchronizedTasks, vendors])
  const health = useMemo(() => calculateHealthScore(synchronizedTasks, risks), [synchronizedTasks, risks])
  const unreadNotifCount = notifications.filter((n) => !n.read).length

  // Backup & Export Handlers
  const handleExportBackup = () => {
    exportStateAsJSON({
      wedding,
      tasks: synchronizedTasks,
      vendors,
      people,
      guests,
      rooms,
      contingency,
      notifications,
      activityLog,
      activeRole,
    })
    notify('Master wedding backup JSON downloaded!')
  }

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed.wedding && parsed.tasks) {
          setWedding(parsed.wedding)
          setTasks(parsed.tasks)
          if (parsed.vendors) setVendors(parsed.vendors)
          if (parsed.people) setPeople(parsed.people)
          if (parsed.guests) setGuests(parsed.guests)
          if (parsed.rooms) setRooms(parsed.rooms)
          if (parsed.contingency) setContingency(parsed.contingency)
          if (parsed.notifications) setNotifications(parsed.notifications)
          if (parsed.activityLog) setActivityLog(parsed.activityLog)
          notify('✓ Wedding plan restored successfully from backup!')
        } else {
          notify('Invalid ShaadiOS backup file format.')
        }
      } catch (err) {
        notify('Failed to parse backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Guest & Room Handlers
  const handleUpdateGuest = (updatedGuest) => {
    setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)))
    notify(`Updated RSVP status for ${updatedGuest.name}.`)
  }

  const handleAddGuest = (newGuest) => {
    setGuests((prev) => [newGuest, ...prev])
  }

  const handleAssignRoom = (roomId, guestId, shouldAssign) => {
    const targetRoom = rooms.find((r) => r.id === roomId)

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const currentIds = r.assignedGuestIds || []
          const updated = shouldAssign
            ? [...new Set([...currentIds, guestId])]
            : currentIds.filter((id) => id !== guestId)
          return {
            ...r,
            assignedGuestIds: updated,
            status: updated.length > 0 ? 'Occupied' : 'Available',
          }
        }
        return r
      })
    )

    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            roomAssigned: shouldAssign ? targetRoom?.roomNumber : null,
          }
        }
        return g
      })
    )
  }

  const handleSaveContingency = (newContingency) => {
    setContingency(newContingency)
    notify('Contingency, 18% GST & hidden overheads calibrated!')
  }


  // Handlers
  const handleTaskComplete = (taskToComplete) => {
    const { updatedTasks, newlyUnblocked } = cascadeTaskCompletion(synchronizedTasks, taskToComplete.id)
    setTasks(updatedTasks)
    setSelectedTaskId(null)

    const unblockedNames = newlyUnblocked.map((t) => t.title)
    if (newlyUnblocked.length > 0) {
      notify(`✓ Completed ${taskToComplete.title}. Unblocked: ${unblockedNames.join(', ')}!`)
      setNotifications((prev) => [
        {
          id: `notif-unblock-${Date.now()}`,
          title: `Unblocked: ${newlyUnblocked[0].title}`,
          description: `Prerequisite "${taskToComplete.title}" completed. Work can now safely begin.`,
          type: 'action',
          timestamp: 'Just now',
          read: false,
          taskId: newlyUnblocked[0].id,
          targetRole: 'owner',
        },
        ...prev,
      ])
    } else {
      notify(`✓ ${taskToComplete.title} marked complete. Plan updated.`)
    }

    setActivityLog((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Marked "${taskToComplete.title}" as complete`,
        time: 'Just now',
        author: activeRole === 'owner' ? 'Rhea' : activeRole === 'co_owner' ? 'Arjun' : 'Mom',
      },
      ...prev,
    ])
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, priority: newStatus === 'Waiting' ? 'Waiting' : t.priority } : t))
    )
    if (newStatus === 'Waiting') {
      notify('Task marked as waiting. ShaadiOS will monitor external responses.')
    } else {
      notify(`Task status updated to ${newStatus}.`)
    }
  }

  const handleTaskDelegate = (task, targetPerson) => {
    const firstName = targetPerson.name.split(' ')[0]
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              owner: firstName,
              initials: targetPerson.initials,
              ownerRole: targetPerson.roleKey,
            }
          : t
      )
    )
    notify(`Task delegated to ${targetPerson.name} with deadline context preserved.`)
    setNotifications((prev) => [
      {
        id: `notif-del-${Date.now()}`,
        title: `Work assigned to ${targetPerson.name}`,
        description: `"${task.title}" is now managed by ${targetPerson.name}.`,
        type: 'update',
        timestamp: 'Just now',
        read: false,
        taskId: task.id,
        targetRole: targetPerson.roleKey,
      },
      ...prev,
    ])
  }

  const handleAddNote = (taskId, noteText) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, notes: [...(t.notes || []), `${noteText} — Added by ${activeRole === 'owner' ? 'Rhea' : 'Collaborator'}`] }
          : t
      )
    )
    notify('Note recorded in decision history.')
  }

  const handleVendorStageChange = (vendorId, newStage, newVendorObj = null) => {
    if (newVendorObj) {
      setVendors((prev) => [...prev, newVendorObj])
      return
    }

    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, state: newStage } : v))
    )

    const vendor = vendors.find((v) => v.id === vendorId)
    if (newStage === 'Confirmed') {
      notify(`🎉 ${vendor?.name} confirmed! Stage updated in wedding pipeline.`)
      // If linked to a task, complete the task
      if (vendor && vendor.relatedTaskId) {
        const linked = synchronizedTasks.find((t) => t.id === vendor.relatedTaskId)
        if (linked && linked.status !== 'Done') {
          handleTaskComplete(linked)
        }
      }
    } else {
      notify(`${vendor?.name} moved to "${newStage}".`)
    }
  }

  const handleSendFollowUp = (vendor, channel, message) => {
    setFollowUpVendor(null)
    notify(`Message prepared for ${vendor.name} via ${channel}. Draft logged.`)
    setActivityLog((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Prepared ${channel.toUpperCase()} follow-up for ${vendor.name} on ${vendor.action}`,
        time: 'Just now',
        author: 'Rhea',
      },
      ...prev,
    ])
  }

  const handleInvitePerson = (newPerson) => {
    setPeople((prev) => [...prev, newPerson])
    setInviteModalOpen(false)
    notify(`Invitation sent to ${newPerson.name} (${newPerson.role}).`)
    setNotifications((prev) => [
      {
        id: `notif-inv-${Date.now()}`,
        title: `${newPerson.name} joined as ${newPerson.role}`,
        description: 'New collaborator access granted.',
        type: 'update',
        timestamp: 'Just now',
        read: false,
        targetRole: 'owner',
      },
      ...prev,
    ])
  }

  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev])
    setAddTaskModalOpen(false)
    notify(`✓ Task "${newTask.title}" added to wedding plan.`)
  }

  const handleApplyDateChange = () => {
    const updatedState = applyDateChange(
      { wedding, tasks: synchronizedTasks, vendors, notifications, activityLog },
      proposal
    )
    setWedding(updatedState.wedding)
    setTasks(updatedState.tasks)
    setNotifications(updatedState.notifications)
    setActivityLog(updatedState.activityLog)
    setChangeStep('success')
    notify('Wedding plan recalculated! Downstream dates and selective alerts updated.')
  }

  const handleCreateWeddingFromOnboarding = () => {
    const formattedDate = formatIndianDate(setup.date) || setup.season || DEFAULT_WEDDING.date
    let budgetAmount = 2400000
    if (setup.budget?.includes('15L')) budgetAmount = 1500000
    else if (setup.budget?.includes('50L+')) budgetAmount = 6000000
    else if (setup.budget?.includes('25–50L')) budgetAmount = 3500000
    else if (setup.budget?.includes('15–25L')) budgetAmount = 2000000

    const updatedWedding = {
      ...DEFAULT_WEDDING,
      couple: setup.couple || 'Rhea & Arjun',
      city: setup.city || 'Jaipur',
      date: formattedDate,
      isoDate: setup.date || '2027-02-18',
      season: setup.season,
      guests: `${setup.guests} guests`,
      budget: `${setup.budget} budget`,
      budgetAmount,
      templateId: setup.templateId || 'north_indian',
      ceremonies: setup.ceremonies,
    }

    // Process pre-booked items from Step 4
    let adjustedTasks = [...DEFAULT_TASKS]
    const booked = setup.booked || []
    if (booked.includes('Venue')) {
      const { updatedTasks } = cascadeTaskCompletion(adjustedTasks, 'venue')
      adjustedTasks = updatedTasks
    }
    if (booked.includes('Photography')) {
      const { updatedTasks } = cascadeTaskCompletion(adjustedTasks, 'photographer')
      adjustedTasks = updatedTasks
    }

    setWedding(updatedWedding)
    setTasks(adjustedTasks)
    setScreen('plan')
  }

  const handleResetDemo = () => {
    const fresh = resetState()
    setWedding(fresh.wedding)
    setTasks(fresh.tasks)
    setVendors(fresh.vendors)
    setPeople(fresh.people)
    setGuests(fresh.guests)
    setRooms(fresh.rooms)
    setContingency(fresh.contingency)
    setNotifications(fresh.notifications)
    setActivityLog(fresh.activityLog)
    setActiveRole('owner')
    notify('Plan reset to Jaipur baseline demo.')
  }

  // Render Onboarding or Landing
  if (screen === 'landing') {
    return (
      <Landing
        onStart={() => {
          setOnboardingStep(1)
          setScreen('onboarding')
        }}
        onDemo={() => {
          setScreen('app')
          setActiveTab('home')
        }}
      />
    )
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        step={onboardingStep}
        setup={setup}
        setSetup={setSetup}
        onBack={() => {
          if (onboardingStep === 1) setScreen('landing')
          else setOnboardingStep((v) => v - 1)
        }}
        onContinue={() => {
          if (onboardingStep === 4) handleCreateWeddingFromOnboarding()
          else setOnboardingStep((v) => v + 1)
        }}
      />
    )
  }

  if (screen === 'plan') {
    return (
      <InitialPlan
        wedding={wedding}
        tasks={synchronizedTasks}
        onBack={() => setScreen('onboarding')}
        onContinue={() => {
          setScreen('app')
          setActiveTab('home')
        }}
      />
    )
  }

  // Active user representation
  const activeUser = people.find((p) => p.roleKey === activeRole) || people[0]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Hidden file input for JSON restore */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImportBackup}
      />

      {/* Navigation Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Wedding navigation">
        <div className="brand-row">
          <Brand />
          <button
            className="icon-button desktop-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse navigation"
          >
            <PanelLeftClose size={18} />
          </button>
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="wedding-switcher">
          <span className="mini-monogram">
            {wedding.couple.split(' ')[0][0] || 'R'}+{wedding.couple.split(' ')[2]?.[0] || 'A'}
          </span>
          <span>
            <strong>{wedding.couple}</strong>
            <small>{wedding.city} · {wedding.date}</small>
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <nav className="main-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id)
                setSidebarOpen(false)
              }}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
              {id === 'home' && health.criticalCount > 0 && (
                <span className="nav-count">{health.criticalCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="helper-card">
            <span className="helper-icon"><Sparkles size={17} /></span>
            <p>
              <strong>Need a second brain?</strong>
              <br />
              Ask coordinator what to do next.
            </p>
            <button onClick={() => setActiveTab('planner')}>
              Open planner <ArrowRight size={14} />
            </button>
          </div>

          <button
            className="profile-row"
            onClick={() => setActiveTab('people')}
            title="Switch collaborator view"
          >
            <span className={`avatar ${activeUser.tint}`}>{activeUser.initials}</span>
            <span>
              <strong>{activeUser.name}</strong>
              <small>{activeUser.role}</small>
            </span>
            <MoreHorizontal size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <button
        className="scrim"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <section className="app-main">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="mobile-title">
            <Brand />
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-tool-btn"
              onClick={() => setRunSheetOpen(true)}
              title="Print master wedding run-sheet"
            >
              <Printer size={15} /> <span className="desktop-text">Run-Sheet</span>
            </button>

            <button
              className="topbar-tool-btn"
              onClick={handleExportBackup}
              title="Download offline backup JSON"
            >
              <Download size={15} /> <span className="desktop-text">Backup</span>
            </button>

            <button
              className="topbar-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Restore from JSON backup"
            >
              <Upload size={15} /> <span className="desktop-text">Restore</span>
            </button>

            <button
              className="reset-state-button"
              onClick={handleResetDemo}
              title="Reset state to baseline demo"
            >
              <RotateCcw size={13} /> Reset
            </button>

            <button
              className="notification-button"
              onClick={() => setNotifCenterOpen(true)}
              aria-label="View notifications"
            >
              <Bell size={19} />
              {unreadNotifCount > 0 && <span aria-hidden="true">{unreadNotifCount}</span>}
            </button>

            <button
              className="date-change-button"
              onClick={() => {
                setChangeOpen(true)
                setChangeStep('edit')
              }}
            >
              <CalendarDays size={17} /> Change date
            </button>
          </div>
        </header>

        <main id="main-content" className="content" tabIndex="-1">
          {activeTab === 'home' && (
            <HomeView
              wedding={wedding}
              tasks={synchronizedTasks}
              vendors={vendors}
              people={people}
              activeRole={activeRole}
              onTask={(t) => setSelectedTaskId(t.id)}
              onChangeDate={() => {
                setChangeOpen(true)
                setChangeStep('edit')
              }}
              onTab={setActiveTab}
              onOpenContingency={() => setContingencyModalOpen(true)}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              tasks={synchronizedTasks}
              onTask={(t) => setSelectedTaskId(t.id)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={synchronizedTasks}
              people={people}
              wedding={wedding}
              activeRole={activeRole}
              onTask={(t) => setSelectedTaskId(t.id)}
              onOpenAddTask={() => setAddTaskModalOpen(true)}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              tasks={synchronizedTasks}
              onTask={(t) => setSelectedTaskId(t.id)}
              onStageChange={handleVendorStageChange}
              onOpenFollowUp={(v) => setFollowUpVendor(v)}
              onNotify={notify}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsView
              guests={guests}
              rooms={rooms}
              wedding={wedding}
              onUpdateGuest={handleUpdateGuest}
              onAddGuest={handleAddGuest}
              onAssignRoom={handleAssignRoom}
              onNotify={notify}
            />
          )}

          {activeTab === 'people' && (
            <PeopleView
              people={people}
              tasks={synchronizedTasks}
              wedding={wedding}
              activeRole={activeRole}
              onSwitchRole={setActiveRole}
              onOpenInvite={() => setInviteModalOpen(true)}
              onPrintMaster={() => setRunSheetOpen(true)}
              onTask={(t) => setSelectedTaskId(t.id)}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerView
              wedding={wedding}
              tasks={synchronizedTasks}
              vendors={vendors}
              people={people}
              onTask={(t) => setSelectedTaskId(t.id)}
            />
          )}
        </main>
      </section>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTab === id ? 'active' : ''}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          wedding={wedding}
          allTasks={synchronizedTasks}
          people={people}
          onClose={() => setSelectedTaskId(null)}
          onComplete={handleTaskComplete}
          onStatusChange={handleTaskStatusChange}
          onDelegate={handleTaskDelegate}
          onAddNote={handleAddNote}
          onOpenPrerequisite={(prereq) => setSelectedTaskId(prereq.id)}
        />
      )}

      {/* Master Run Sheet Printable Modal */}
      {runSheetOpen && (
        <MasterRunSheetModal
          wedding={wedding}
          tasks={synchronizedTasks}
          vendors={vendors}
          people={people}
          guests={guests}
          rooms={rooms}
          onClose={() => setRunSheetOpen(false)}
        />
      )}

      {/* Change Management Engine Modal */}
      {changeOpen && (
        <ChangeModal
          step={changeStep}
          setStep={setChangeStep}
          proposal={proposal}
          setProposal={setProposal}
          wedding={wedding}
          tasks={synchronizedTasks}
          vendors={vendors}
          onClose={() => setChangeOpen(false)}
          onApply={handleApplyDateChange}
        />
      )}

      {/* Contingency & Hidden Taxes Audit Modal */}
      {contingencyModalOpen && (
        <ContingencyModal
          wedding={wedding}
          vendors={vendors}
          contingency={contingency}
          onSave={handleSaveContingency}
          onClose={() => setContingencyModalOpen(false)}
        />
      )}

      {/* Notification Center Drawer */}
      {notifCenterOpen && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setNotifCenterOpen(false)}
          onMarkAllRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            notify('All notifications marked as read.')
          }}
          onSelectTask={(taskId) => {
            setSelectedTaskId(taskId)
            setNotifCenterOpen(false)
          }}
        />
      )}

      {/* Vendor Follow-Up Message Composer */}
      {followUpVendor && (
        <FollowUpModal
          vendor={followUpVendor}
          wedding={wedding}
          onClose={() => setFollowUpVendor(null)}
          onSent={handleSendFollowUp}
        />
      )}

      {/* Invite Collaborator Modal */}
      {inviteModalOpen && (
        <InviteModal
          wedding={wedding}
          onClose={() => setInviteModalOpen(false)}
          onInvite={handleInvitePerson}
        />
      )}

      {/* Add Task Modal */}
      {addTaskModalOpen && (
        <AddTaskModal
          people={people}
          allTasks={synchronizedTasks}
          onClose={() => setAddTaskModalOpen(false)}
          onAdd={handleAddTask}
        />
      )}

      {/* Toast Feedback */}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast('')} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
