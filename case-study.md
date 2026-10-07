# ShaadiOS — PM Case Study

**Product:** ShaadiOS — The Wedding Planning Operating System
**Market:** India-first · BRD + Functional PRD + Workflow Blueprint v1.0
**Sources:** Master Product Specification (54 sections), `gap_analysis.md`, shipped codebase
**Arc:** Problem → Understand → Research → Users → Insights → Experiment → Solution → Trade-offs → Improved Experience → Metrics → Build AI Product

> **How to read this:** Sections 2 and 3 explicitly mark primary research and metrics that do not
> exist yet instead of presenting invented evidence. Those are the gaps to close before the deck
> can claim results.

**Snapshot:** 5 intelligence engines · ~40% MVP coverage at baseline audit · 10 BRD workflows in scope · 0 analytics events instrumented

---

## 1. PROBLEM STATEMENT

**Product:** ShaadiOS — The Wedding Planning Operating System (India-first)

### Problem Statement

Indian wedding planning is not a checklist problem — it is a coordination problem. A wedding is a
connected system of ceremonies, people, vendors, guests, budgets, commitments and deadlines, and a
change in one element affects many others. The products couples use today store tasks, show
checklists, list vendors and send reminders — but none of them understand why a task matters, what it
blocks, or what a change breaks. The result is that one person holds the entire wedding in their head
and runs it over WhatsApp, spreadsheets and phone calls.

### Goal

Turn one wedding into a single connected, continuously updated plan that understands dependencies,
priorities, people and changes — and tells the right person what to do next.

**Primary business outcome:** increase the percentage of critical wedding milestones completed on time.

### Current benchmark

| Dimension | Baseline |
|---|---|
| MVP requirement coverage (visual) | ~40% |
| Functional PRD (22 requirements) | ~35% implemented |
| End-to-end workflows (10) | ~25% implemented |
| Intelligence model | Hardcoded, not computed |
| Funnel / analytics instrumentation | None |
| North Star observability | **Unknown — instrument first** |

The honest benchmark is that the North Star cannot be observed at all today: there is no analytics
layer in the codebase.

### Timeline

| Date | Milestone | Reference |
|---|---|---|
| Sep 2026 | BRD + Functional PRD + End-to-End Workflow Blueprint v1.0 locked (54 sections) | Master Product Specification |
| 16 Sep 2026 | Intelligence engines and the full 12-screen OS shipped | commit `9247e19` |
| 19 Sep 2026 | Dynamic timeline grouping, vendor-hold urgency, planner history, ceremony filters | commit `05cb0a2` |
| 04 Oct 2026 | Guest & room management, contingency & GST audit, master run-sheet, PWA offline | commit `0ba74f2` |
| Next | Instrument the activation funnel; MVP exit signal = users repeatedly act on next-best-action recommendations | BRD §15 |

---

## 2. UNDERSTAND & DEFINE

### Story & About

ShaadiOS is an India-first wedding coordination system. The beachhead is urban Indian couples
planning medium-to-large weddings — 100–500+ guests, 2–6 ceremonies, a 6–12 month horizon, mid-market
to premium spend — without a full-service wedding planner.

The product thesis is that a wedding is a system, not a list, so the product has to be an operating
system over that system.

**Core promise:** keep the wedding on track by understanding dependencies, priorities, people and changes.
**AI posture:** AI proposes; humans approve important decisions.
**Long-term direction:** expand the planning OS into a wedding super app (vendor transactions, guest
logistics, payments, travel, shopping, wedding-day operations).

### Secondary Research

**The competitive wedge — what existing products do vs. what ShaadiOS must own:**

| Existing wedding products generally do | ShaadiOS must own |
|---|---|
| Store tasks | Understand why tasks matter |
| Show checklists | Prioritize the next best action |
| List vendors | Track vendor commitments and dependencies |
| Show calendars | Rebuild the plan when something changes |
| Send reminders | Detect risk before a deadline is missed |
| Enable collaboration | Coordinate responsibility across couple, family and vendors |

**Jobs to be done (BRD §7):**

| Job | Desired outcome |
|---|---|
| Functional | Keep my entire wedding plan on track without manually remembering everything. |
| Coordination | Make it obvious who owns what and when it is due. |
| Change management | When something changes, tell me what else is affected and what I should do first. |
| Risk management | Warn me before a delay becomes a wedding problem. |
| Emotional | Give me confidence that important things are not being missed. |

### Primary Research

> **Status: NOT YET CONDUCTED.** No interviews, diary studies or surveys exist for this project.
> Any deck presenting invented interview quotes or percentages would be fabricating evidence.

**Proposed protocol:**

- 12–15 semi-structured interviews: 8 couples 6–12 months out with no full planner, 3 parents /
  family leads who own delegated work, 2 independent coordinators, 2 vendors.
- 3-week diary study across 2 live weddings.
- Artifact collection: the spreadsheets, WhatsApp threads and checklist apps they already use.
- Measures captured: number of coordination channels in play, hours per week spent chasing,
  incidents where a milestone slipped, and who the group considers the holder of the plan.

### User Segmentation & User Persona

**Segment definition:**

| Attribute | Beachhead segment |
|---|---|
| Geography | Urban India |
| Wedding size | 100–500+ guests |
| Planning horizon | 6–12 months |
| Complexity | 2–6 ceremonies / multiple events |
| Spend | Mid-market to premium |
| Planner usage | DIY or partial planner support |
| Coordination style | Heavy WhatsApp + spreadsheets + calls |

**Personas:**

| Persona | Primary need | Product role |
|---|---|---|
| Primary couple | Stay on track and reduce mental load | Account owner and decision maker |
| Partner | See shared priorities and own tasks | Co-owner |
| Parent / family lead | Handle assigned family responsibilities | Collaborator |
| Coordinator / planner | Keep operations moving | Operational collaborator |
| Vendor | Know commitments, deadlines and event details | External participant |

**Design consequence:** the operational user is a group, not one account holder — which is why
role-scoped views and owner-routed notifications are requirements, not polish.

### Findings

**Workflow implementation coverage at baseline audit** (% of workflow implemented · Source:
`gap_analysis.md` · 10 BRD workflows):

```
New wedding setup          ████████████████████████  60%
Booking a vendor            ████                      10%
Assigning family work       ████████████              30%
Risk detection              ██                         5%
Wedding date change         ████████████████           40%
"What should I do?"         ████                       10%
Vendor follow-up            ██                          5%
Guest management (V1)       ·                           0%
Wedding week mode (V2)      ·                           0%
Wedding day command (V2)    ·                           0%
```

| # | Finding | Evidence | Severity |
|---|---|---|---|
| 1 | Pages were built, connections were not | Every MVP screen existed as a visual shell, but functional PRD was ~35% implemented and workflows ~25%. | Critical |
| 2 | Priority was a label, not a computation | Priority was a hardcoded string; nothing derived it from deadline, downstream block count or risk. | High |
| 3 | Change impact was theatre | The date-change modal always returned the same five impacts regardless of what actually changed. | Critical |
| 4 | Dependencies were display text | "Blocks: N items" was a string; completing a task unblocked nothing. | Critical |
| 5 | Risk was a static card | One hardcoded risk sat on the dashboard; no detection rules existed. | High |
| 6 | Collaboration was cosmetic | Invite showed a toast, roles were display labels, no permission model. | High |
| 7 | There was no measurement layer | Zero funnel or analytics events, so the North Star could not be observed at all. | High |
| 8 | After the rebuild: engines compute, two paths remain partly authored | Dependency cascade, priority scoring, risk rules, next-best-action and change-apply are now computed; the date-change impact list is still authored and Planner matches 5 keyword intents. | Medium |

### Experiment

Experiment backlog carried in BRD §45, with honest build status:

| Experiment | Hypothesis | Primary metric | Status |
|---|---|---|---|
| "Top 3 next actions" vs full checklist | Prioritization improves activation | First action completed | Not runnable — no instrumentation |
| Reason shown vs no reason | Explanation improves trust | Recommendation acceptance | Reason is always rendered by default; needs a control to test |
| Partner invitation during onboarding vs later | Early collaboration improves retention | Weekly active wedding | Not runnable — no accounts or events |
| Weekly digest vs daily reminders | Less noise improves retention | 7-day return rate | Not runnable — digest mode not built |
| Change-impact preview | Visible consequence mapping increases trust | Major change completion | Flow built; needs instrumentation |

---

## 3. SOLUTIONS & METRICS

### Recommendations

| # | Recommendation | Rationale / current state |
|---|---|---|
| R1 | Build the intelligence engine, not more screens | Sequenced Phase 1 Wedding State Engine → Phase 2 Intelligence Layer → Phase 3 Change Management. Five engines now exist: dependency, priority, risk, action, change. |
| R2 | Make every priority explain itself | Each card carries its reason plus computed rank: `base urgency + 40 per downstream blocker − 8 per remaining day`. |
| R3 | Preview before you apply | High-impact changes require explicit approval; external messages are prepared but never auto-sent (BRD §33). |
| R4 | Route to the owner, not the whole group | Notifications carry a `targetRole` so the family lead is pinged about their own work instead of the couple being broadcast to. |
| R5 | Use WhatsApp as the collaboration transport | The beachhead already coordinates there. Deep-linked composed messages for task reminders, vendor follow-ups, invites, RSVPs and room allocation ship without building an inbox first. |
| R6 | Instrument before you optimize | No metric can move until events exist. Funnel instrumentation is the first post-MVP engineering task. |

### Trade-offs & Pitfalls

| Decision | Trade-off accepted | Pitfall if left unaddressed |
|---|---|---|
| Deterministic rule engines instead of an LLM for priority and risk | Explainable, testable, zero-latency, no invented facts — but narrow: three risk rules only | Calling three if-statements "AI"; the product loses credibility on the sixth edge case |
| Planner as 5 keyword intents instead of a state-aware model | Predictable answers grounded in stored state; no hallucinated vendor facts | Users ask the sixth question and hit the generic fallback |
| Date-change impact list authored rather than graph-traversed | Design control — the narrative is always sensible | The product claims one change cascades while the cascade is scripted; this breaks the core thesis |
| Client-only state in localStorage | Ships fast, offline-capable PWA, no backend | No accounts, no multi-device, no analytics, no real collaboration — the multi-user story is unprovable |
| WhatsApp deep links instead of in-app chat | Zero friction, meets users where they already are | Sends are not observable, so the collaboration growth loop cannot be measured |
| Marketplace deliberately excluded from MVP | Protects the orchestration wedge | BRD flags "vendor marketplace too early" as a top business risk — it distracts from the core problem |

### Improved User Flow / Journey Assessment

| Before — WhatsApp + spreadsheet + one person's memory | After — ShaadiOS, one connected plan |
|---|---|
| Date changes: every downstream deadline re-derived by hand | Edit date → impact preview (venue, photography, accommodation, invitations, catering) → explicit approval → recalculated due dates, role-routed notifications, activity-log entry |
| Priorities: whoever shouted last, or the top row of the sheet | Priority computed from deadline × downstream block count; every card states its reason |
| Family work: assigned in a chat message, no state, no waiting tracking | Delegation moves ownership with context; Waiting is a tracked state that can nudge the owner without messaging the couple |
| Vendor promises: live in a phone's sent folder, expiry discovered late | Vendor hold expiry inside 6 days raises a High-severity risk with an action link |
| Risk: discovered after the milestone has already slipped | Risk engine flags venue uncertainty against the invitation print window before the deadline |
| "Where are we?": rebuilt from four different places every time | One wedding state powers home, timeline, tasks, people, vendors, guests and planner |

**Journey assessment to run:** count steps from plan generation to first accepted recommendation, and
time-to-first-plan during onboarding.

### Metrics

| Metric | Definition | Instrumentation status |
|---|---|---|
| **North Star** — % of critical milestones completed on time | Measures actual wedding reliability | Not instrumented |
| Activation — % of signups who create a wedding plan | Core value creation | Not instrumented; state is local-only |
| Aha — % who act on the first recommendation | Tests orchestration value | Not instrumented |
| Collaboration — % who invite at least one collaborator | Tests multi-user utility | Partially observable: invite opens WhatsApp, the send is not tracked |
| Orchestration — recommendation acceptance / completion rate | Tests intelligence quality | Not instrumented |
| Retention — weekly active wedding rate | Tests the ongoing planning habit | Not instrumented |
| Risk prevention — % of detected risks resolved before deadline | Tests proactive value | Rules exist; no event emitted |

> **Sequencing consequence:** six of seven metrics cannot be computed today. Instrumentation is not a
> reporting afterthought — it is the gate that decides whether any of the experiment backlog can be
> run at all.

---

## Final / Project Theme — Build AI Product

The build is the intelligence layer sitting on top of a wedding graph, with a human holding the
decision rights.

| Layer | What it is | State today |
|---|---|---|
| **1. Substrate — wedding graph** | Objects (Wedding, Event, Task, Person, Vendor, Commitment, Dependency, Risk, Recommendation, Document) with typed relationships | Objects modeled in a single state module; dependency edges exist between tasks |
| **2. Retrieval — role-scoped context** | Serialize only the state a viewer is allowed to see: couple, family lead, coordinator, vendor | Roles are labels; permissions not enforced |
| **3. Model — planner over the graph** | LLM that ranks next-best actions with rationale, traverses the graph for date-change impact, reports waiting states, drafts vendor follow-ups | Replaced by 5 keyword intents over live state; deterministic, safe, narrow |
| **4. Guardrails** | Never invent vendor facts or prices; show confidence; never send high-stakes messages or move a critical milestone without approval; keep change history; allow override plus reason | Approval gate and change log are built; confidence signalling is not |
| **5. Evaluation** | Golden set of wedding states asserting that impact lists traverse correctly, priorities reorder as deadlines approach, and every answer cites stored facts | **Absent — the single biggest blocker to trusting model output** |
| **6. Instrumentation** | Events at the seven funnel stages: visit, signup, wedding created, plan generated, first action, collaborator invited, recurring use | Absent |

**MVP exit signal:** users repeatedly act on next-best-action recommendations.

The honest build order is **graph traversal → evaluation harness → model swap → instrumentation** —
because a model placed on top of a scripted impact list would only make the central claim more
convincing while it stays untrue.
