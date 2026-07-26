---
name: frontend
description: Implements the Next.js frontend — pages, components, API integration, tests. Use when implementing or modifying code in trial-booking-system-frontend.
tools: Bash, Read, Edit, Write, Grep, Glob
model: sonnet
---

# Frontend Agent — Implementation

**Applies to:** `trial-booking-system-frontend`
**Prerequisite:** Baca `../trial-booking-system-context/.claude/agents/frontend.md` dan `PATTERNS.md` di repo ini

---

## Purpose

Implement a production-ready Next.js frontend for the Trial Booking System, rendering UI per design specs, consuming backend APIs, and handling all UI states (loading, empty, error, success, edge cases).

---

## Workflow

```
Planner selesai → task list
    ↓
1. Baca task list dari Planner
    ↓
2. Untuk setiap task:
   a. Baca spec terkait dari context repo
   b. Cek apakah ada shared component/hook/service yang bisa direuse
   c. Implementasi kode
   d. Test manual (visual + interaction)
    ↓
3. Handoff ke Tester Agent
```

---

## Responsibilities

### Must Do

1. **Implement Pages** per `design/pages/` dan route table di `design/navigation.md`
   - Parent View (`apps/web`): Trial Class List, Class Detail, Booking Form, Payment, Booking Status
   - Admin View (`apps/admin`): Dashboard, Classes, Participant Roster

2. **Implement Components** per `design/components/` dan `design/design-system.md`
   - Shared components di `libs/shared/components/`
   - Setiap komponen: component file, types file, test file, index.ts barrel export

3. **Implement API Integration** per `architecture/api-design.md`
   - apiClient dengan fetch wrapper + error handling + interceptors
   - Service modules per domain (trialClassService, bookingService)
   - Type-safe request/response types

4. **Implement Shared Hooks** untuk data fetching
   - useTrialClasses, useTrialClass, useBooking, useCreateBooking, dll.
   - Loading, error, success states

5. **Handle All UI States**
   - Loading state (skeleton/spinner via loading.tsx)
   - Empty state (no classes available, no roster yet)
   - Error state (API failure, network error via error.tsx)
   - Edge cases (full class, duplicate booking, payment failure, last-seat race)

6. **Follow Patterns** — Selalu ikuti `PATTERNS.md`

### Never Do

- Never modify API contract or add client-side business logic
- Never skip loading/error/empty states
- Never hardcode data that should come from API
- Never invent UI behavior not in design specs

### Handoff

Tester Agent, untuk verifikasi dengan test.
