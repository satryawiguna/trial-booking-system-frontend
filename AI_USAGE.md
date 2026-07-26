# AI_USAGE.md — Frontend Implementation

## Purpose

This document discloses how AI was used during the **frontend implementation phase** of the Trial Booking System. It covers work done in this repository (`trial-booking-system-frontend`) — the runnable Next.js monorepo with Parent View (`apps/web`), Admin View (`apps/admin`), and shared library (`libs/shared`).

The companion `AI_USAGE.md` files in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) and [`trial-booking-system-backend`](https://github.com/satryawiguna/trial-booking-system-backend) (branch `master`) cover the **specification phase** and **backend implementation phase** respectively. This document covers the frontend: pages, components, hooks, API integration, tests, Docker configuration, and design-token compliance.

---

## Which AI Tools I Used

- **GitHub Copilot (VS Code)** — inline code generation, auto-completion, and refactoring assistance directly in the editor. Used throughout the entire frontend implementation: scaffolding Next.js pages, shared components (`Button`, `TrialCard`, `StatusBadge`, `Navbar`, `BookingForm`, `PaymentForm`, `LoadingIndicator`, `ErrorMessage`, `RoleSwitch`), custom hooks (`useTrialClasses`, `useTrialClass`, `useBooking`, `useCreateBooking`, `useRoster`), API services (`apiClient`, `trialClassService`, `bookingService`), shared types/enums, utility functions, and all test files.
- **Claude Code (via VS Code Chat)** — task planning, multi-agent orchestration (Planner → Frontend → Tester → Reviewer → DevOps), batch scaffolding of the monorepo structure, and final consistency audits (API contract compliance checklist, design-token compliance spot-check, known-gaps documentation).
- **Claude Code Sub-agents** — defined in `.claude/agents/` (Planner, Frontend, Tester, Reviewer, DevOps). Agent roles guided every phase: Planner broke down the context repo's design/architecture specs into ordered task lists; Frontend implemented each task; Tester wrote and ran unit + integration tests; Reviewer performed final cross-checks (API contract compliance, design-token compliance, terminology audit, scope audit); DevOps set up Docker profiles and CI pipeline.

No external code generation services (ChatGPT API, Copilot Workspace, etc.) were used beyond what's listed above.

---

## What I Used AI For

- **Monorepo scaffolding** — Generating the full Next.js + npm workspaces structure: root `package.json` with workspace scripts, `tsconfig.json` with path aliases (`@shared/*` → `libs/shared/*`), ESLint, Prettier, Jest configs across all 3 workspaces (`apps/web`, `apps/admin`, `libs/shared`), and Tailwind CSS with a centralized `tailwind.config.base.js` consumed by both apps.
- **Page implementation** — All 8 pages across both apps were generated from the design specs in `../trial-booking-system-context/design/pages/`:
  - **Parent View (`apps/web`):** Trial Class List (`/`), Class Detail (`/trial-classes/[id]`), Booking Form (`/booking`), Payment (`/booking/[id]/payment`), Booking Status (`/booking/[id]/status`)
  - **Admin View (`apps/admin`):** Dashboard (`/`), Classes (`/classes`), Participant Roster (`/classes/[id]/roster`)
  - Each page includes `page.tsx`, `layout.tsx`, `loading.tsx` (skeleton/spinner), and `error.tsx` (error boundary) per the App Router convention.
- **Shared component library** — 9 reusable components in `libs/shared/components/` (Button, TrialCard, StatusBadge, Navbar, RoleSwitch, BookingForm, PaymentForm, LoadingIndicator, ErrorMessage), each with its own `*.tsx`, `*.types.ts`, `*.test.tsx`, and `index.ts` barrel export.
- **API integration layer** — `apiClient.ts` (fetch wrapper with error handling + `ApiClientError`), `trialClassService.ts` (3 endpoints), `bookingService.ts` (2 endpoints), all type-safe with request/response types defined in `libs/shared/types/`.
- **Custom hooks** — `useTrialClasses`, `useTrialClass`, `useBooking`, `useCreateBooking`, `useRoster`, each managing loading/error/success states and surfacing user-friendly messages via `libs/shared/utils/errorMessages.ts`.
- **Test generation** — 24 test suites / 129 tests across all 3 workspaces, covering: component unit tests (rendering, props, user interactions, edge cases), service unit tests (success/error paths, status codes), hook tests (loading → data → error lifecycle), page integration tests (full user workflows per `quality/test-scenarios.md`).
- **Design-token compliance** — A full audit of `oklch()` color usage, typography (`Nunito` via `next/font/google`), spacing tokens, border radius tokens, and shadow tokens across all components and pages against `../trial-booking-system-context/design/design-system.md`, with findings documented in `README.md` § "Design-token compliance findings."
- **API contract compliance checklist** — Endpoint-by-endpoint verification (`docs/api-contract-compliance.md`) of every frontend service call against `../trial-booking-system-context/architecture/api-design.md`, including one known, flagged deviation (`POST /bookings` request payload — documented as Known Gap #1).
- **Docker configuration** — 3-profile Docker Compose setup (local, development, production) with a unified multi-stage `Dockerfile` using `ARG APP=web|admin`, plus `docker-compose.local.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`.
- **CI pipeline** — GitHub Actions workflow (`.github/workflows/ci.yml`) covering install → lint → type-check → test → build across all workspaces.
- **Documentation** — This file, `README.md`, `CLAUDE.md`, `AGENTS.md`, `PATTERNS.md`, `docs/api-contract-compliance.md`, `docs/deployment.md`, and 5 sub-agent `.md` files were co-written with AI assistance.
- **Review & audit** — The Reviewer Agent performed cross-checks for: API contract compliance (endpoint-by-endpoint against `api-design.md`), design-token compliance (color, typography, spacing, radius, shadows against `design-system.md`), terminology consistency (against `discovery/glossary.md`), scope control (no out-of-scope features), and known-gaps documentation (8 gaps identified, all documented rather than silently guessed).

---

## One Place Where AI Helped Me Move Faster

**Scaffolding the entire monorepo with all App Router conventions in one pass.** The Next.js App Router pattern requires a specific file structure per route: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` — and this repo has 8 routes across 2 apps. Add to that: 9 shared components each with 4 files (component, types, test, barrel export), 5 custom hooks, 3 service modules, shared types/enums/utils, Jest configs for 3 workspaces, Tailwind configs with a shared base, ESLint/Prettier configs, path aliases, npm workspaces, and Docker + CI files. AI generated the skeleton for all of this at once — the correct folder structure, the right file names, the right import paths, the right `tsconfig.json` path aliases — so the implementation phase could focus on filling in the actual UI logic rather than manually setting up the scaffolding. Doing this by hand across ~150 files would have consumed most of the take-home time budget before a single component was even rendered.

---

## One Place Where I Disagreed With, Corrected, or Rejected AI Output

**The `POST /bookings` request payload shape.** The central API contract (`../trial-booking-system-context/architecture/api-design.md`) documents `POST /bookings` as accepting `{ studentId, trialClassId }` — implying a pre-existing `Student` resource. But the backend API has no `Student` resource, no "create student" endpoint, and no student-lookup endpoint anywhere. Meanwhile, the design specs (`design/pages/booking.md`, `design/components/booking-form.md`) specify a form that collects `parentName, studentName, phoneNumber, email, grade` — a full registrant payload, not a `studentId`.

The AI initially scaffolded `CreateBookingInput` with `{ studentId, trialClassId }` to match the API contract literally. I rejected that. The frontend cannot fabricate a `studentId` from thin air, and the design specs explicitly require collecting the full registrant information. I corrected `CreateBookingInput` to `{ parentName, studentName, phoneNumber, email, grade, trialClassId }` and documented the deviation as **Known Gap #1** in both `README.md` and `docs/api-contract-compliance.md`, with an explicit note that this is a judgment call requiring Backend Agent coordination — not a verified contract.

A second example: the AI initially wanted to make `PaymentForm` handle the failed-payment case by always navigating to `/booking/[id]/status` (per `design/components/payment-form.md`), but the more detailed page spec (`design/pages/payment.md`) specifies an inline error message instead. The AI followed the component spec because it was referenced first in the task list. I corrected it to follow `payment.md` as the more detailed spec, and documented the spec conflict as **Known Gap #7** with a pointer to the exact line in `PaymentForm` where the decision lives.

---

## What I Would Change About My AI Workflow If I Did This Again

1. **Verify API contracts against actual backend behavior before implementing.** The `POST /bookings` payload mismatch was caught during implementation, not before. Next time: run a quick contract verification pass (read `api-design.md` side-by-side with the backend's actual controllers/DTOs) before writing any frontend service code, to catch mismatches that the Backend Agent may have introduced.
2. **Resolve design spec conflicts before coding.** The `payment.md` vs `payment-form.md` conflict on failed-payment UX was discovered mid-implementation, requiring a re-read of both specs and a judgment call. Next time: surface spec conflicts to the Design Agent during the Planner phase, not during Frontend implementation.
3. **Run the full stack integration earlier.** Port collision (`apps/web` on port 3000 vs backend on port 3000 — Known Gap #8) was only discovered during the final documentation/QA pass. Running `npm run dev:web` alongside the backend early in implementation would have caught this infrastructure issue when it was cheaper to fix.
4. **Audit design tokens before writing components, not after.** The 3 WCAG AA contrast failures (Known Gap #6) were design-token defects present in the imported prototype, not implementation bugs — but they were only discovered during the final design-token compliance audit. Next time: run the token audit before component implementation starts, so the Design Agent can fix the tokens first and components inherit correct values from the start.

---

## How I Verified the Final Implementation

- **API Contract Compliance Checklist** (`docs/api-contract-compliance.md`) — Endpoint-by-endpoint verification of all 4 API endpoints (`GET /trial-classes`, `GET /trial-classes/{id}`, `GET /trial-classes/{id}/roster`, `POST /bookings`) against `../trial-booking-system-context/architecture/api-design.md`. Method, path, request shape, response shape, and status-code handling checked for each. 3 endpoints fully compliant; 1 endpoint has a documented, flagged deviation (Known Gap #1).
- **Design-token compliance spot-check** (`README.md` § "Design-token compliance findings") — 5 categories verified (colors, typography, spacing, border radius, shadows) against `../trial-booking-system-context/design/design-system.md`. All pass; 3 WCAG AA contrast failures identified as design-token defects (not implementation bugs), documented as Known Gap #6.
- **Unit tests** — 24 test suites / 129 tests passing across all 3 workspaces. Component tests verify rendering, props, user interactions, and edge cases. Service tests verify success/error paths and status-code handling. Hook tests verify loading → data → error lifecycle.
- **TypeScript strict mode** — `npm run type-check` passes with zero errors across all 3 workspaces.
- **ESLint + Prettier** — `npm run lint` and `npm run format:check` pass with zero errors across all 3 workspaces.
- **Terminology audit** — All entity names, enum values, component names, and page titles checked against `../trial-booking-system-context/discovery/glossary.md`. Consistent usage of "Trial Class" (not "Session"/"Course"), "Confirmed Booking" (not "Reserved Seat"), etc.
- **Scope audit** — No out-of-scope features found (no JWT, no real payment gateway, no notifications, no student management CRUD). Admin Dashboard and Classes pages have explicit "Scope Note" comments referencing their out-of-scope-but-present status per the design specs.
- **Known gaps documentation** — 8 gaps identified between specs and implementation, all documented in `README.md` § "Known Gaps & Open Items" with exact file references rather than silently guessed or ignored.

---

## What AI Did Not Do

- **Write the original design specs** — All page specs (`design/pages/`), component specs (`design/components/`), design tokens (`design/design-system.md`), and navigation flows (`design/navigation.md`) were authored in the context repo by the Design Agent. This repo's AI consumed them as immutable contracts.
- **Make API contract decisions** — The API shape (`architecture/api-design.md`) was decided by the Architect and Backend Agents. This repo's AI only consumed the contract; the one deviation (Known Gap #1) was flagged, not silently changed.
- **Decide what pages/screens exist** — The route table and information architecture were pre-decided in `design/navigation.md` and `design/pages/`. No screens were invented.
- **Make design-token decisions** — Color values, typography, spacing, radius, and shadow tokens were defined in `design/design-system.md`. This repo's AI only applied them, and flagged compliance issues (WCAG contrast, missing tokens) without changing the spec.
- **Bypass the review process** — Every implementation task was followed by a Tester + Reviewer Agent pass. API contract compliance, design-token compliance, terminology, and scope were all cross-checked.
- **Write `README.md` or `AI_USAGE.md` without human direction** — These files were generated under explicit instructions (contents specified by the human author, AI drafted based on those instructions).

---

## Disclosure Summary

- **Built by:** GitHub Copilot (VS Code) + Claude Code, under continuous human direction.
- **Directed by:** Satrya (human author) — made all scope, domain, and architecture decisions; AI executed implementation, testing, and review based on those decisions.
- **Specs from:** [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) — design specs, API contract, design tokens, test scenarios.
- **Verification:** API contract compliance checklist (4 endpoints, 1 documented deviation); design-token compliance audit (5 categories, all pass); 24 test suites / 129 tests passing; TypeScript strict mode + ESLint + Prettier clean; 8 known gaps documented.
- **Specs vs. code gap:** Zero unacknowledged discrepancies. All 8 gaps between specs and implementation are explicitly documented in `README.md` with exact file references and recommended resolution paths.

---

## References

- `AI_USAGE.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) — AI usage disclosure for the specification phase
- `AI_USAGE.md` in [`trial-booking-system-backend`](https://github.com/satryawiguna/trial-booking-system-backend) (master) — AI usage disclosure for the backend implementation phase
- `../trial-booking-system-context/AGENTS.md` — Master agent catalog (all roles: Product, Domain, Architect, Design, Backend, Frontend, Quality, DevOps, Reviewer)
- `../trial-booking-system-context/design/` — Page & component specs, design tokens (source of truth for UI)
- `../trial-booking-system-context/architecture/api-design.md` — API contract (source of truth for service layer)
- `../trial-booking-system-context/quality/test-scenarios.md` — Test scenarios (source of truth for test coverage)
- `README.md` — Submission README (this repo)
- `CLAUDE.md` — Operating rules for this repo
- `AGENTS.md` — Agent roles and workflow for this repo
- `PATTERNS.md` — Coding standards & patterns
- `.claude/agents/` — Sub-agent definitions (Planner, Frontend, Tester, Reviewer, DevOps)
- `docs/api-contract-compliance.md` — Endpoint-by-endpoint contract verification
- `docs/deployment.md` — Docker containerization and CI/CD guidance
