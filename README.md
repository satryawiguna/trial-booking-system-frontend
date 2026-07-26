# Trial Booking System — Frontend

Next.js frontend for the Trial Booking System: a **Parent View** (browse trial classes, book a trial, pay, view/cancel a booking) and an **Admin View** (dashboard, class list, participant roster). Built as a clean-architecture monorepo with a shared UI/data layer consumed by both apps.

This README is the entry point for running and understanding the codebase. For deeper detail, see:

- **`CLAUDE.md`** — project structure, responsibilities, and full development-command reference (source of truth for commands used below)
- **`PATTERNS.md`** — coding standards & patterns (component structure, API service pattern, hooks, error handling, testing conventions)
- **`AGENTS.md`** — agent role/coordination model for this repo
- **`docs/deployment.md`** — Docker containerization, CI/CD pipeline, environment variables, and deployment guidance
- **`../trial-booking-system-context/`** — the sibling context repo: product/domain/architecture/design/quality specs that are the source of truth for *what* to build. Read `../trial-booking-system-context/README.md` first if you're new to the project.

---

## Tech Stack

- **Next.js (App Router)** — two separate apps (`apps/web`, `apps/admin`), each with its own routes, `loading.tsx`, and `error.tsx` boundaries per route segment
- **TypeScript** — strict, shared types in `libs/shared/types`
- **Tailwind CSS** — design tokens centralized in `libs/shared/tailwind.config.base.js`, consumed by both apps' `tailwind.config.js`
- **Jest + React Testing Library** — unit/integration tests per workspace

---

## Repo Structure

```
trial-booking-system-frontend/
├── apps/
│   ├── web/            # Next.js — Parent View (trial classes, booking, payment, status)
│   └── admin/           # Next.js — Admin View (dashboard, classes, roster)
├── libs/
│   └── shared/           # Shared components, hooks, services, types, utils — NOT importable from apps/
├── docs/
│   └── api-contract-compliance.md   # Endpoint-by-endpoint verification against the API spec
├── CLAUDE.md / PATTERNS.md / AGENTS.md
└── package.json           # npm workspaces root
```

See `CLAUDE.md` for the full structure breakdown, route tables per app, and architecture rationale — not duplicated here.

---

## Setup

Requires Node.js ≥ 18.18 (see `package.json` → `engines`).

```bash
# From the repo root — installs and links all 3 workspaces (apps/web, apps/admin, libs/shared)
npm install
```

No further linking step is needed; npm workspaces resolves `@shared/*` imports across `apps/web`, `apps/admin`, and `libs/shared` automatically.

### Environment variables

Copy each app's `.env.example` to `.env.local` before running it:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

| App | Variable | Purpose | Default |
|---|---|---|---|
| `apps/web` | `NEXT_PUBLIC_API_URL` | Backend REST API base URL (see `architecture/api-design.md` — base path `/api/v1`) | `http://localhost:3000/api/v1` |
| `apps/web` | `NEXT_PUBLIC_ADMIN_URL` | Admin app URL, used by the Navbar's role switch for cross-app navigation | `http://localhost:3001` |
| `apps/admin` | `NEXT_PUBLIC_API_URL` | Backend REST API base URL (same contract as above) | `http://localhost:3000/api/v1` |
| `apps/admin` | `NEXT_PUBLIC_WEB_URL` | Parent View app URL, used by the Navbar's role switch | `http://localhost:3000` |

> **Port note:** `apps/web` defaults to port 3000 and the backend (per `trial-booking-system-backend/.env.example`) also defaults to port 3000 — see "Known Gaps & Open Items" #8 below before running the full stack locally.

---

## Running the Application

Exact scripts, verified against the root `package.json`:

```bash
# Parent View — http://localhost:3000
npm run dev:web

# Admin View — http://localhost:3001
npm run dev:admin
```

(Equivalent to `npm run dev --workspace=apps/web` / `--workspace=apps/admin`, or `cd apps/web && npm run dev`, per `CLAUDE.md`.)

```bash
# Production build (all workspaces)
npm run build

# Or per app:
npm run build:web
npm run build:admin

# Production start (after build)
npm run start:web
npm run start:admin
```

---

## Docker

Build and run both apps in containers:

```bash
# Build Docker images
docker build -f apps/web/Dockerfile -t trial-booking-web:latest .
docker build -f apps/admin/Dockerfile -t trial-booking-admin:latest .

# Or use docker-compose (builds and starts both)
docker-compose up --build

# Access
# Parent View:  http://localhost:3002 (internal 3000)
# Admin View:   http://localhost:3001
```

**Important:** `NEXT_PUBLIC_*` environment variables are baked into the build, not injected at runtime. For environment-specific deployment, see **[`docs/deployment.md`](./docs/deployment.md)** → "Environment Variables" → "Implications for Docker".

---

## Testing, Linting, Formatting, Type-Checking

Exact root scripts (fan out to all 3 workspaces via `--workspaces --if-present`):

```bash
npm test              # run all tests once (24 suites / 129 tests as of Task 7)
npm run test:watch     # watch mode
npm run test:cov       # with coverage

npm run lint           # ESLint (next lint for apps/*, eslint for libs/shared)
npm run format          # Prettier — write
npm run format:check    # Prettier — check only, no write
npm run type-check      # tsc --noEmit across all 3 workspaces
```

To run a single test file, use the workspace's own Jest directly, e.g.:

```bash
npm test --workspace=apps/web -- src/app/page.test.tsx
```

---

## API Contract Compliance

See **[`docs/api-contract-compliance.md`](./docs/api-contract-compliance.md)** for an endpoint-by-endpoint verification of every frontend service call (`trialClassService`, `bookingService`) against `../trial-booking-system-context/architecture/api-design.md` — method, path, request/response shape, and status-code handling, including the one known, flagged deviation (`POST /bookings` request payload — see Known Gaps #1 below).

---

## Known Gaps & Open Items

These are accumulated, intentionally-not-silently-guessed gaps between the documented specs and what the frontend can actually implement without a backend/design change. Each is fully documented in-line at the referenced file. None of these were fixed as part of this pass — they need Backend/Design/DevOps Agent coordination.

1. **`POST /bookings` payload assumption** — `CreateBookingInput` / `bookingService.create()` sends the full registrant payload (`parentName, studentName, phoneNumber, email, grade, trialClassId`) directly, since `api-design.md` only documents `{ studentId, trialClassId }` and no student-creation/lookup endpoint exists. See `libs/shared/types/booking.ts` and `libs/shared/types/student.ts`.
2. **`GET /bookings/{id}` has no registrant fields** — only returns `{ bookingId, status, studentId, trialClassId }`, no parent/student/grade/phone/email. Worked around via `libs/shared/utils/registrantStorage.ts` (sessionStorage bridge keyed by `bookingId`); a real fix would be the API returning this data directly.
3. **Undocumented backend error response schema** — `api-design.md` doesn't document an `errorCode` field/enum. `libs/shared/services/apiClient.ts` / `libs/shared/utils/errorMessages.ts` assume a `{ statusCode, errorCode, message }` shape defensively, with an `UNKNOWN_ERROR` fallback.
4. **No bookings-list/aggregate endpoint** — Admin Dashboard (`apps/admin/src/app/page.tsx`) can only derive a "Confirmed" stat by fetching every class's roster; Total/Pending/Cancelled/Payment-Failed stats show an explicit "Not available" state rather than fabricated numbers.
5. **Admin Dashboard/Classes pages have no `US-###` traceability** in the specs, per their own Scope Notes in `design/pages/admin-dashboard.md` / `admin-classes.md`.
6. **3 WCAG AA contrast failures in the design tokens** (design-token defects, not implementation bugs — left unfixed, out of scope for frontend to unilaterally change):
   - Primary button text (white on `oklch(0.62 0.17 48)`): 3.88:1, fails the 4.5:1 normal-text threshold.
   - Card/input border (`oklch(0.90 0.02 80)` on white): 1.35:1, fails the 3:1 UI-boundary threshold.
   - Outline/danger button border (`oklch(0.80 0.10 25)`): 1.94:1, fails 3:1.
7. **`payment.md` vs `payment-form.md` spec conflict** on failed-payment UX (inline error vs. always-navigate) — the implementation follows `payment.md` as the more detailed doc; documented in-line at `apps/web/src/app/booking/[id]/payment/page.tsx`.
8. **Local dev port collision (newly discovered, Task 9–10):** `apps/web` defaults to port 3000 (`apps/web/package.json` → `next dev -p 3000`), and the backend (`trial-booking-system-backend/.env.example` → `PORT=3000`) also defaults to port 3000. Running the full stack locally as documented (backend + `apps/web` simultaneously) will fail to bind one of the two processes. This is baked into the current architecture — `CLAUDE.md`, `PATTERNS.md`, and both `.env.example` files all consistently document `apps/web` on port 3000 — so it was **not** changed as part of this docs/QA pass (the fix would touch `CLAUDE.md` itself plus several other files, which is out of scope for a documentation task). **Flagged for Planner/DevOps Agent coordination**: either move `apps/web` to a different port (e.g. 3002) or document that the backend must be run on a non-default port for local full-stack development.

### Design-token compliance findings (Task 9–10)

A spot-check of `libs/shared/components/**` and both apps' pages against `../trial-booking-system-context/design/design-system.md`:

| Category | Result | Notes |
|---|---|---|
| Colors | **Pass** | All colors use `oklch()`. No raw hex/rgb found anywhere in `libs/shared/components`, `apps/web/src`, `apps/admin/src`. Arbitrary-value `oklch(...)` syntax (not a named Tailwind token) is used in a handful of places (`Button.tsx` disabled/outline/text-link states, `TrialCard.tsx`'s "Class is Full" pill, per-class `accentHue` header tint) — each one traces to an exact literal value documented in `design/components/button.md`, `design/components/trial-card.md`, or `design/design-system.md`'s "Category Accent" formula, not accidental drift. These values simply have no equivalent named token in `tailwind.config.base.js` yet (e.g. no general "muted/disabled" or "badge-radius" token) — a minor tokenization gap, not a compliance failure. |
| Typography | **Pass** | Nunito loaded via `next/font/google` with weights 400–900 (matches spec) in both `apps/web/src/app/layout.tsx` and `apps/admin/src/app/layout.tsx`, applied globally via `font-sans` on `<body>`. `text-h1` / `text-section-title` / `text-eyebrow` tokens (from `tailwind.config.base.js`, matching the spec's size/weight/letter-spacing values) are used consistently (23 usages across both apps + shared components) rather than ad-hoc font sizes. |
| Spacing | **Pass** | Page containers consistently use `px-6` (24px, matches "Page horizontal padding: 24px") and the `max-w-page-list` / `max-w-page-form` / `max-w-page-status` tokens correctly per page type. Card grids use `gap-5` (20px, matches "Gap between cards: 20px"). A couple of arbitrary pixel values (`px-[14px]`, `py-[15px]`) appear for exact button/input padding pulled directly from `design/components/button.md`; expected since `design-system.md`'s spacing section only defines page/card-level scale, not per-component paddings. |
| Border radius | **Pass** | `rounded-button` / `rounded-input` / `rounded-card` / `rounded-panel` tokens used throughout; no arbitrary radius values found. `StatusBadge` uses `rounded-full` instead of a literal "20px" value since no dedicated badge-radius token exists — documented in-line in `libs/shared/components/StatusBadge/StatusBadge.tsx` as the correct generalization, not a gap. |
| Shadows | **Pass** | `shadow-navbar` / `shadow-card` / `shadow-card-hover` tokens used exactly where documented (navbar, trial class cards, hover states); no arbitrary shadow values found. |
| Motion (bonus, not in the required 5 categories) | **Not implemented** | `design-system.md` documents a `fadeUp .2s ease` screen-transition token for "every screen/step change," but no keyframe/transition implementing it exists anywhere (`apps/web/src/app/globals.css` / `apps/admin/src/app/globals.css` only set base background/text color). Noted for completeness; out of scope to fix here. |

No systemic token gaps were fixed as part of this pass (per scope) — the "missing muted/disabled token" and "missing badge-radius token" observations above are consistent with, and do not add to, the gaps already noted during Task 3.

---

## Where to Go Next

- Adding a page → `CLAUDE.md` § "Adding a New Page"
- Adding a shared component → `CLAUDE.md` § "Adding a New Shared Component"
- Coding conventions (component structure, API service pattern, error handling, hooks, testing) → `PATTERNS.md`
- Agent roles and handoffs → `AGENTS.md`
- Product/domain/architecture/design/quality specs → `../trial-booking-system-context/`
