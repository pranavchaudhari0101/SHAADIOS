# ShaadiOS Security Audit

**Date:** 2026-10-07 · **Scope:** frontend (`src/`), backend (`backend/`), git history, dependencies
**Verdict: 3 Critical · 4 High · 5 Medium · 4 Low.** No frontend XSS sinks found. The backend has systemic broken access control and the git history contains live production credentials.

---

## CRITICAL

### C1. Production database credentials committed to git
- **Where:** `BACKEND_DEPLOYMENT_GUIDE.md` (twice), `VERCEL_ENVIRONMENT_VARIABLES.txt`, `DEPLOYMENT_COMPLETE.md`
- **What leaked:** The full Neon PostgreSQL connection string with password (`the Neon connection string with password`) and a JWT secret (`the hardcoded JWT secret`).
- **Impact:** Anyone who can see the repo can connect to the production database and read/modify every user, wedding, guest phone number, and budget. The JWT secret means anyone can forge valid session tokens.
- **Difficulty to fix: Easy (30 minutes).** Difficulty to undo: the credential must be treated as burned.
- **Fix:**
  1. Log in to Neon → reset the `neondb_owner` password. The old string is dead history.
  2. Generate a new JWT secret (`openssl rand -base64 48`) in Vercel env vars.
  3. Rotate every secret in those files. Never paste real secrets into docs again.
  4. If the repo is public, also contact GitHub Support to purge the blobs from cached history (a `git filter-repo` rewrite alone doesn't clear GitHub caches).

### C2. Broken access control — mass assignment + IDOR in the API
Every route in the backend trusts client-supplied data as authorization input:

| Endpoint | Vulnerability |
|---|---|
| `PATCH /api/tasks/:id` | **Mass assignment:** `data: { ...req.body }` — a client can set `weddingId` to move their task into another user's wedding, overwrite `dependsOn`, `completedAt`, anything. |
| `PATCH /api/guests/:id` | Same: unvalidated `...req.body` spread, **and no ownership check at all** — any authenticated user can edit any guest row by ID. |
| `DELETE /api/guests/:id` | No ownership check — any authenticated user can delete any guest. |
| `PATCH /api/vendors/:id/stage` | `state` comes from the request body unvalidated → arbitrary enum/state injection; also updates a `relatedTaskId` without checking it belongs to the same wedding. |
| `PATCH /api/rooms/:id/assign` | No wedding-ownership check on either the room or the guest; arbitrary `guestId` accepted. |
| `POST /api/vendors`, `POST /api/guests`, `POST /api/rooms`, `POST /api/tasks` | No Zod schema — raw body fields flow into Prisma (`amount` as string, `events` as string instead of array, etc.). |
| `GET /api/vendors/wedding/:weddingId`, `GET /api/guests/...`, `GET /api/rooms/...`, `GET /api/notifications/...` | No access check — any authenticated user can read another wedding's vendors/guests/rooms if they can guess the wedding UUID. |
| `GET /api/tasks/:id`, `PATCH /api/tasks/:id` | IDOR: fetch by bare `id` first, check access *after* — the record is loaded cross-tenant before the gate. |

- **Impact:** Full cross-tenant read/write/delete. This is the OWASP #1 (A01:2021 Broken Access Control) class.
- **Difficulty to fix: Medium (2–3 days of focused work).** The pattern is repetitive, so one shared helper fixes most of it.
- **Fix:** Create `assertWeddingAccess(userId, weddingId, minRole)` in one module and call it as the *first* statement in every route. Replace every `...req.body` spread with a Zod schema (`.strict()`). Look up resources through a scoped query (`findFirst({ where: { id, wedding: { ownerId/collaborators } } })`) instead of fetch-then-check.

### C3. Two authentication systems, both broken; the frontend talks to neither
- **Where:** `backend/src/middleware/auth.middleware.ts` (Clerk) vs `backend/src/middleware/clerk.auth.ts` (duplicate Clerk) vs `backend/src/lib/auth.ts` (bcrypt + JWT helpers) — while `auth.routes.ts` imports `requireClerkAuth` from `clerk.auth.js`. The seed data (`rhea@example.com / Demo@123`) and `.env.example` still reference a password/JWT flow that **no route implements**: there is no `/api/auth/register` or `/api/auth/login` endpoint, but `src/lib/api.js` in the frontend still calls both.
- **Impact:** The backend cannot actually authenticate any seeded user; `req.user` resolution depends on a `CLERK_SECRET_KEY` that isn't in any env template. Password hashes in seed are dead weight. Login from the frontend would 404.
- **Difficulty to fix: Medium (1–2 days).**
- **Fix:** Pick one system. Either (a) go full Clerk: add `CLERK_SECRET_KEY` to env templates, delete `lib/auth.ts` and the seed password hashes, or (b) go JWT: implement `/api/auth/register|login|me` with the existing bcrypt helpers and delete both Clerk middleware files. Update `src/lib/api.js` to match. (For a capstone, JWT is the lower-lift path.)

---

## HIGH

### H1. Frontend stores wedding data (guest names, phone numbers, budgets) in localStorage
- **Where:** `src/core/weddingState.js` (`STORAGE_KEY`, `BACKUP_STORAGE_KEY`), JSON export via data-URL.
- **Impact:** Any XSS in any future dependency exfiltrates everything; data survives on shared computers; no server-side truth.
- **Difficulty: Hard to fully fix (it's an architectural decision — the MVP is client-only by design).**
- **Mitigations now:** add a "Clear my data" button; document the shared-computer risk; medium-term, move to the (once-fixed) backend.

### H2. Rate limit is a single global bucket (100 req / 15 min per IP)
- **Where:** `backend/src/index.ts` — one `express-rate-limit` on `/api/`.
- **Impact:** One heavy page load (a wedding with many resources can easily make 10+ calls) burns the whole bucket; attackers rotate IPs anyway. No stricter limit on auth endpoints (no auth endpoints exist yet — see C3).
- **Difficulty: Easy (1 hour).** Fix: per-route limiter, much tighter on credential endpoints; keyed by user ID after auth, not just IP.

### H3. CORS allows credentials with a `FRONTEND_URL`/`CORS_ORIGIN` env that defaults to localhost
- **Where:** `backend/src/index.ts` (`credentials: true`, origin from env).
- **Impact:** Misconfiguration risk when deploying (guide tells users to paste `https://your-frontend-url.vercel.app` placeholders — easy to forget, leaving the default).
- **Difficulty: Easy (30 min).** Fix: fail fast at boot if `CORS_ORIGIN` is unset in production; never default to localhost when `NODE_ENV=production`.

### H4. No account lockout / brute-force protection, no password reset flow
- **Where:** auth system overall (C3). `PasswordResetToken` table exists in the Prisma schema but no route uses it.
- **Impact:** Once real auth exists, credential stuffing is unthrottled.
- **Difficulty: Medium.** Fix: per-email + per-IP limiter on login; exponential lockout; implement the reset flow the schema already anticipates.

---

## MEDIUM

| # | Finding | Where | Fix | Difficulty |
|---|---|---|---|---|
| M1 | `verifyToken(..., { authorizedParties: ['http://localhost:3001', 'https://shaadios-backend.vercel.app'] })` — hardcoded, backend's own origin as authorized party (nonsensical), won't match the real frontend | both Clerk middlewares | read `authorizedParties` from env | Easy |
| M2 | Two `new PrismaClient()` instances created ad-hoc in `auth.middleware.ts` and `clerk.auth.ts`, bypassing the shared Neon-adapter client; `clerk.auth.ts` also calls `createClerkClient` **at module import time** — crashes the whole server at boot if `CLERK_SECRET_KEY` is unset | middleware files | import the shared `prisma`; lazy-init Clerk clients | Easy |
| M3 | Unhandled async routes: `throw` inside async handlers without a wrapper → unhandled rejections crash the process (Express 4 doesn't catch async throws) | all route files | add a small `asyncHandler(fn)` wrapper, or `express-async-errors` | Easy |
| M4 | Export endpoint leaks: wedding export includes `users.email/phone` of collaborators; no auth on JSON restore file format beyond `wedding`+`tasks` keys | `wedding.routes.ts` export, `App.jsx` import | strip PII from exports, validate/sanitize imported JSON | Medium |
| M5 | No security logging/alerting: auth failures, 403s, and DB errors only hit `console.error` | error middleware | structured logging (pino), alert on auth-failure spikes | Medium |

---

## LOW

| # | Finding | Fix |
|---|---|---|
| L1 | `uuid` <11.1.1 moderate advisory (buffer bounds in v3/v5/v6 paths) — `npm audit` flagged it in backend. Likely unused at runtime. | `npm audit fix --force` (uuid@14) or drop the dependency |
| L2 | `console.log` banners print env/port at boot | remove or gate behind dev flag |
| L3 | `.gitignore` misses `.env.*` variants in root (`backend` has its own `.gitignore` — root does not cover `.env.local`, `.env.production`) | add `.env*` to root `.gitignore` |
| L4 | Helmet defaults only — no CSP, no `Referrer-Policy` tuning for an API that also serves an SPA later | add a CSP when the API serves frontend assets |

---

## What is NOT broken (verified)

- **No XSS sinks in `src/`** — zero uses of `dangerouslySetInnerHTML` / `innerHTML` / `eval`. All React-rendered. WhatsApp links use `encodeURIComponent` and open with `noopener,noreferrer`. ✔
- **Prisma usage is parameterized throughout** — no raw SQL string building. ✔
- **Helmet, Zod on write-routes (wedding/auth), bcrypt cost 12, JWT 7-day expiry** where used. ✔
- **Root `npm audit`: 0 vulnerabilities.** Backend: 1 moderate (uuid). ✔
- **`.env` itself is NOT tracked in git** (only the docs leaked it) — `backend/.gitignore` correctly excludes it. ✔

---

## Priority order (do this sequence)

1. **Rotate everything in the leaked docs** (C1) — today, before anything else.
2. **One access-control helper + Zod everywhere** (C2) — kills most of the IDOR/mass-assignment table.
3. **Collapse auth to one system, wire the frontend to it** (C3).
4. Route-scoped rate limits + CORS fail-fast (H2, H3).
5. asyncHandler + shared Prisma client (M2, M3) — 1 hour, prevents boot crashes.
6. The rest in spare cycles.

**The one-sentence summary:** the frontend is clean, the backend trusts the client everywhere it shouldn't, and the git history is holding live database keys — rotate first, then fix access control.
