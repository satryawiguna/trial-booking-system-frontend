# CLAUDE.md — Trial Booking System Frontend

This file provides guidance to Claude Code (claude.ai/code) when working on the **frontend implementation** of the Trial Booking System.

---

## Project Overview

**Project Name:** Trial Booking System Frontend  
**Purpose:** Next.js frontend for booking trial science/math classes — Parent-facing booking flow and Admin dashboard/roster.  
**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS  
**Source of Truth:** `../trial-booking-system-context/` — Read CLAUDE.md and AGENTS.md there first.

---

## Core Responsibility

You are implementing the **Frontend Agent** role (see `../trial-booking-system-context/.claude/agents/frontend.md`). Your focus:

- ✅ Implement pages and components per `design/pages/` and `design/components/`
- ✅ Consume backend API exactly as specified in `architecture/api-design.md`
- ✅ Implement navigation and information architecture per `design/navigation.md`
- ✅ Handle user interactions as specified in design specs
- ✅ Write integration tests covering user workflows in `quality/test-scenarios.md`
- ✅ Implement responsive design and accessibility per design tokens
- ✅ Follow coding patterns in `PATTERNS.md` at all times
- ❌ Don't modify API contract without coordinating with Backend Agent
- ❌ Don't add client-side business logic that belongs server-side
- ❌ Don't create new feature specs — those live in context repo

---

## Project Structure (Clean Architecture Monorepo)

```
trial-booking-system-frontend/
├── .claude/agents/          # Sub-agents: planner, frontend, tester, reviewer, devops
├── .vscode/mcp.json         # MCP Server GitHub
├── apps/
│   ├── web/                 # Next.js — Parent View
│   │   └── src/app/         # App Router: trial-classes/, booking/, payment/, booking-status/
│   └── admin/               # Next.js — Admin View
│       └── src/app/         # App Router: dashboard/, classes/, roster/
├── docker/                  # Docker configuration (all profiles)
│   ├── Dockerfile           # Unified multi-stage Dockerfile (ARG APP=web|admin)
│   ├── docker-compose.local.yml   # Profile: Local (hot reload, npm run dev)
│   ├── docker-compose.dev.yml     # Profile: Development (hot reload, external API)
│   └── docker-compose.prod.yml    # Profile: Production (standalone build)
├── libs/
│   └── shared/              # Shared library (tidak boleh import dari apps/)
│       ├── components/      # UI components — Navbar, RoleSwitch, TrialCard, Button, LoadingIndicator, ErrorMessage
│       ├── hooks/           # Shared hooks — useApi, useBooking, useTrialClasses
│       ├── services/        # API client — apiClient, bookingService, trialClassService
│       ├── types/           # Shared TypeScript types & enums
│       └── utils/           # Utilities — formatters, validators, constants
├── .env.example             # Environment variables template
├── CLAUDE.md                # This file
├── AGENTS.md                # Agent coordination
└── PATTERNS.md              # Coding standards & patterns
```

### Dependency Direction

```
apps/web ─┐
          ├──> libs/shared
apps/admin ┘
```

> **Important:** `libs/shared` MUST NOT import from `apps/*`. Dependencies flow inward only.

---

## Two Role Views

| View            | App          | Screens                                                               |
| --------------- | ------------ | --------------------------------------------------------------------- |
| **Parent View** | `apps/web`   | Trial Class List, Class Detail, Booking Form, Payment, Booking Status |
| **Admin View**  | `apps/admin` | Dashboard, Classes, Participant Roster                                |

Both apps share design tokens, components, hooks, types, and utilities from `libs/shared`.

---

## Development Commands

### Setup

```bash
# Install dependencies (from repo root or per app)
npm install

# Or if using workspaces:
npm install -w apps/web -w apps/admin
```

### Running the Application

```bash
# Run Parent View (default port 3000)
npm run dev --workspace=apps/web

# Run Admin View (default port 3001)
npm run dev --workspace=apps/admin

# Or from app directory:
cd apps/web && npm run dev
cd apps/admin && npm run dev

# Production build
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- src/path/to/test.spec.ts

# Run tests with coverage
npm run test:cov
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Docker — Deployment Profiles

The project supports three deployment profiles per `../trial-booking-system-context/deployment/environment-configuration.md`. All Docker files live in `docker/`.

| Profile     | Compose File                      | Hot Reload            | Purpose                                           |
| ----------- | --------------------------------- | --------------------- | ------------------------------------------------- |
| Local       | `docker/docker-compose.local.yml` | ✅ (`npm run dev`)    | Local development on developer machine            |
| Development | `docker/docker-compose.dev.yml`   | ✅ (`npm run dev`)    | Shared dev server, external backend API           |
| Production  | `docker/docker-compose.prod.yml`  | ❌ (`node server.js`) | Production deployment, optimized standalone build |

#### Environment Setup

```bash
# Copy and configure environment variables
cp .env.example .env

# Required variables:
#   NEXT_PUBLIC_API_URL  — Backend API base URL (default: http://localhost:3000/api/v1)
#   NEXT_PUBLIC_ADMIN_URL — Admin app URL (default: http://localhost:3001)
#   NEXT_PUBLIC_WEB_URL   — Parent app URL (default: http://localhost:3002)
```

#### Running with Docker

```bash
# Local profile — hot reload, port 3002 (web) + 3001 (admin)
docker compose -f docker/docker-compose.local.yml up

# Development profile — hot reload, points to external backend API
docker compose -f docker/docker-compose.dev.yml up

# Production profile — optimized standalone build
docker compose -f docker/docker-compose.prod.yml up

# Build without cache (clean rebuild)
docker compose -f docker/docker-compose.prod.yml build --no-cache

# Stop and remove containers
docker compose -f docker/docker-compose.local.yml down
```

#### Building Individual Images

```bash
# Build Parent View image
docker build -f docker/Dockerfile --build-arg APP=web -t trial-booking-web:latest .

# Build Admin View image
docker build -f docker/Dockerfile --build-arg APP=admin -t trial-booking-admin:latest .
```

#### Access After Startup

| App         | URL                   |
| ----------- | --------------------- |
| Parent View | http://localhost:3002 |
| Admin View  | http://localhost:3001 |

> **Note:** Port 3002 is used for the Parent View to avoid collision with the backend API which defaults to port 3000.

---

## Architecture & Structure

### High-Level Architecture

```
Browser Request
    ↓
Next.js App Router (page.tsx → layout.tsx → loading.tsx → error.tsx)
    ↓
Shared Components (libs/shared/components)
    ↓
Custom Hooks (libs/shared/hooks — data fetching, state management)
    ↓
API Services (libs/shared/services — fetch wrapper, typed API calls)
    ↓
Backend REST API (http://localhost:3000/api/v1)
```

### Key Modules in libs/shared

- **components/** — Reusable UI components (Navbar, TrialCard, BookingForm, PaymentForm, LoadingIndicator, ErrorMessage, etc.)
- **hooks/** — Custom React hooks for data fetching and state (useTrialClasses, useBooking, useApi)
- **services/** — Typed API client layer (apiClient with interceptors, bookingService, trialClassService)
- **types/** — Shared TypeScript types, interfaces, enums (Booking, TrialClass, BookingStatus, PaymentStatus)
- **utils/** — Pure utility functions (formatDate, formatCurrency, validators, constants)

### Pages per App

#### apps/web (Parent View)

| Route                   | Page             | Reads                     | Writes                         |
| ----------------------- | ---------------- | ------------------------- | ------------------------------ |
| `/`                     | Trial Class List | `GET /trial-classes`      | —                              |
| `/trial-classes/[id]`   | Class Detail     | `GET /trial-classes/{id}` | —                              |
| `/booking`              | Booking Form     | `GET /trial-classes/{id}` | `POST /bookings`               |
| `/booking/[id]/payment` | Payment          | —                         | `POST /bookings/{id}/payments` |
| `/booking/[id]/status`  | Booking Status   | `GET /bookings/{id}`      | `POST /bookings/{id}/cancel`   |

#### apps/admin (Admin View)

| Route                  | Page                | Reads                                | Writes |
| ---------------------- | ------------------- | ------------------------------------ | ------ |
| `/`                    | Dashboard (default) | `GET /trial-classes`, aggregate data | —      |
| `/classes`             | Admin Classes       | `GET /trial-classes`                 | —      |
| `/classes/[id]/roster` | Participant Roster  | `GET /trial-classes/{id}/roster`     | —      |

---

## Development Workflow

### Before Starting Work

1. **Read the specs** — Start with `../trial-booking-system-context/README.md`, then the relevant design docs
2. **Understand the IDs** — Every feature has an ID (`US-###`, `AC-###`, `TS-###`, etc.). Know which IDs you're implementing
3. **Check API contracts** — Read `../trial-booking-system-context/architecture/api-design.md`
4. **Check page specs** — Read the relevant page in `../trial-booking-system-context/design/pages/`
5. **Check component specs** — Read the relevant component in `../trial-booking-system-context/design/components/`
6. **Know design tokens** — Read `../trial-booking-system-context/design/design-system.md`
7. **Follow PATTERNS.md** — Always follow the patterns in `PATTERNS.md`

### Common Development Patterns

#### Adding a New Page

1. **Check spec** — Find the page in `design/pages/` (e.g., `trial-class-list.md`)
2. **Create route** — Add folder under `apps/{web|admin}/src/app/{route}/`
   - `page.tsx` — Main page component
   - `layout.tsx` — Layout wrapper (optional)
   - `loading.tsx` — Loading skeleton
   - `error.tsx` — Error boundary
3. **Use shared components** — Import from `@app/shared/components`
4. **Use shared hooks** — Import from `@app/shared/hooks`
5. **Call API** — Use service from `@app/shared/services`
6. **Test** — Write integration test per `quality/test-scenarios.md`

#### Adding a New Shared Component

1. **Check spec** — Find the component in `design/components/`
2. **Create folder** — `libs/shared/components/{ComponentName}/`
   - `{ComponentName}.tsx` — Component implementation
   - `{ComponentName}.types.ts` — Props interface
   - `{ComponentName}.test.tsx` — Unit test
   - `index.ts` — Barrel export
3. **Use design tokens** — Reference colors, typography, spacing from design system
4. **Test** — Write component test with React Testing Library
