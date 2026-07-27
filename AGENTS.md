# AGENTS.md — Agent Coordination for Frontend Work

This file coordinates which AI agent roles are responsible for which parts of the Trial Booking System frontend.

**Read this first:** [AGENTS.md](https://github.com/satryawiguna/trial-booking-system-context/blob/master/AGENTS.md) (branch `master`, via MCP Server GitHub) — The master agent catalog.

---

## Your Role

You are the **Frontend Agent** in the larger project. Your responsibility:

- **Read:** All specs in the [context repo](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`, via MCP Server GitHub): `design/`, `architecture/`, `quality/`
- **Produce:** Next.js implementation using shared components, hooks, and services
- **Coordinate with:** Backend Agent (via shared API contracts in `architecture/api-design.md`)
- **Verify against:** Quality Agent (test scenarios in `quality/test-scenarios.md`)
- **Report to:** Reviewer Agent (final consistency check)

---

## What Frontend Owns

| Responsibility    | Owns                      | Reads                                           |
| ----------------- | ------------------------- | ----------------------------------------------- |
| Parent View pages | `apps/web/src/app/`       | `design/pages/`                                 |
| Admin View pages  | `apps/admin/src/app/`     | `design/pages/`                                 |
| Shared components | `libs/shared/components/` | `design/components/`, `design/design-system.md` |
| API integration   | `libs/shared/services/`   | `architecture/api-design.md`                    |
| Custom hooks      | `libs/shared/hooks/`      | `architecture/api-design.md`                    |
| Shared types      | `libs/shared/types/`      | `domain/domain-model.md`                        |
| Tests             | Unit + integration tests  | `quality/test-scenarios.md`                     |

---

## What Frontend Does NOT Own

- **Backend API** — Backend Agent's responsibility
- **Specs/Product Decisions** — Context Repo (Product/Domain Agents)
- **Business Rules** — Domain Agent; frontend only displays results
- **Database/Infrastructure** — Backend/DevOps Agents
- **Deployment** — DevOps Agent's responsibility

---

## Typical Workflow for a New Frontend Feature

```
1. Product Agent → Updates [context repo](https://github.com/satryawiguna/trial-booking-system-context) `product/` (branch `master`, via MCP Server GitHub)
2. Domain Agent → Updates [context repo](https://github.com/satryawiguna/trial-booking-system-context) `domain/` (branch `master`, via MCP Server GitHub)
3. Architect → Updates [context repo](https://github.com/satryawiguna/trial-booking-system-context) `architecture/` (branch `master`, via MCP Server GitHub)
4. Design Agent → Updates [context repo](https://github.com/satryawiguna/trial-booking-system-context) `design/` (branch `master`, via MCP Server GitHub)
5. Backend Agent → Implements API in sibling repo
6. Frontend Agent (you) → Implements in this repo
   - Create pages in apps/{web|admin}/src/app/
   - Create or reuse shared components
   - Wire up API services
   - Write tests per quality spec
7. Quality Agent → Verifies edge cases
8. Reviewer Agent → Final consistency check
```

---

## Before You Start Any Feature

**Always check:**

1. ✅ **Is it in scope?** — Check [project-scope.md](https://github.com/satryawiguna/trial-booking-system-context/blob/master/discovery/project-scope.md) (branch `master`, via MCP Server GitHub)
2. ✅ **Is the design spec complete?** — Check the relevant page in `design/pages/`
3. ✅ **Is the API ready?** — Check `architecture/api-design.md` for the endpoint contract
4. ✅ **Do you have the ID?** — e.g., `US-001` (parent books trial), `US-007` (view roster)
5. ✅ **Are you implementing or inventing?** — If it's not in the spec, ask before building it

---

## Communication with Other Agents

### With Backend Agent

- **API Contract:** Both read `architecture/api-design.md` and keep it as source of truth
- **If you need a different endpoint:** Discuss with Architect first, then both implement
- **Error Handling:** Match error response format from backend (`errorCode`, `message`)

### With Quality Agent

- **Test Scenarios:** Quality writes `quality/test-scenarios.md`; you implement tests to match
- **Edge Cases:** If you discover a UI edge case not in the spec, flag it to Quality Agent

### With Reviewer Agent

- **Final Check:** Before marking feature complete, Reviewer checks:
  - All IDs are traced end-to-end
  - No scope creep
  - Terminology is consistent (see `glossary.md`)
  - Design specs match implementation

---

## What Frontend Repo Owns — All Technical Roles

| Agent        | Responsibility                                             | File                         |
| ------------ | ---------------------------------------------------------- | ---------------------------- |
| **Planner**  | Baca specs → breakdown task implementasi                   | `.claude/agents/planner.md`  |
| **Frontend** | Implementasi Next.js code (pages, components, services)    | `.claude/agents/frontend.md` |
| **Tester**   | Unit, integration, e2e tests                               | `.claude/agents/tester.md`   |
| **Reviewer** | Final consistency check — traceability, terminology, scope | `.claude/agents/reviewer.md` |
| **DevOps**   | Docker, deployment, environment, env vars                  | `.claude/agents/devops.md`   |

## Typical Workflow

```
Prompt Masuk
    ↓
1. Planner → Baca context repo + PATTERNS.md → Task list
    ↓
2. Frontend → Implementasi kode per task
    ↓
3. Tester → Tulis & jalankan tests (unit, integration, e2e)
    ↓
4. Reviewer → Final consistency check
```

---

## Reference

- [AGENTS.md](https://github.com/satryawiguna/trial-booking-system-context/blob/master/AGENTS.md) — Master catalog (branch `master`, via MCP Server GitHub)
- [frontend.md](https://github.com/satryawiguna/trial-booking-system-context/blob/master/.claude/agents/frontend.md) — Detailed frontend agent role (branch `master`, via MCP Server GitHub)
- `CLAUDE.md` — This repo's operating rules
- `PATTERNS.md` — Coding standards & patterns
