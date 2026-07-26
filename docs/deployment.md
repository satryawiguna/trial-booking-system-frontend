# Deployment Guide — Trial Booking System Frontend

This guide covers Docker containerization, CI/CD pipeline, environment configuration, and deployment of the Trial Booking System frontend.

---

## Environment Variables

### Overview

The frontend uses environment variables to configure API endpoints and cross-app navigation URLs. **All variables prefixed with `NEXT_PUBLIC_` are baked into the JavaScript bundle at build time** — this is a fundamental Next.js behavior and has important implications for Docker deployment (see "Implications for Docker" below).

### Required Variables

#### apps/web (Parent View)

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL (endpoint prefix: `/api/v1`) | `http://localhost:3000/api/v1` or `https://api.trial-booking.com/api/v1` |
| `NEXT_PUBLIC_ADMIN_URL` | Admin View URL, used by the Navbar's role-switch button for cross-app navigation | `http://localhost:3001` or `https://admin.trial-booking.com` |

#### apps/admin (Admin View)

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL (same contract as above) | `http://localhost:3000/api/v1` or `https://api.trial-booking.com/api/v1` |
| `NEXT_PUBLIC_WEB_URL` | Parent View URL, used by the Navbar's role-switch button | `http://localhost:3000` or `https://booking.trial-booking.com` |

### Setup: Local Development

```bash
# Copy templates
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# Edit .env.local files as needed (defaults work for local development)
# .env.local files are git-ignored and should NEVER be committed
```

### Implications for Docker

**Critical:** Because `NEXT_PUBLIC_*` variables are baked into the build, **each environment requires a separate Docker image build** (or you must rebuild the image for each environment).

#### Option A: Environment-Specific Builds (Recommended for most cases)

```bash
# Build for local development
export NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
export NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
docker build -f apps/web/Dockerfile -t trial-booking-web:local .

# Build for staging
export NEXT_PUBLIC_API_URL=https://api-staging.trial-booking.com/api/v1
export NEXT_PUBLIC_ADMIN_URL=https://admin-staging.trial-booking.com
docker build -f apps/web/Dockerfile -t trial-booking-web:staging .

# Build for production
export NEXT_PUBLIC_API_URL=https://api.trial-booking.com/api/v1
export NEXT_PUBLIC_ADMIN_URL=https://admin.trial-booking.com
docker build -f apps/web/Dockerfile -t trial-booking-web:production .
```

Each build produces a separate image with URLs hardcoded.

#### Option B: Runtime Configuration (Advanced)

If you need a single image to work across environments, you can use a runtime config wrapper (e.g., a Node.js proxy that injects variables into the HTML before serving) — this is beyond the scope of this trial system and adds complexity. For now, **use Option A (environment-specific builds)**.

---

## Docker: Building Images

### Prerequisites

- Docker ≥ 20.10
- Build context: **repo root** (not the app subdirectory), since the build needs access to `libs/shared`

### Building Individual Apps

```bash
# Parent View (apps/web)
# Sets EXPOSE 3000 internally (external port depends on docker-compose or -p flag)
docker build -f apps/web/Dockerfile -t trial-booking-web:latest .

# Admin View (apps/admin)
# Sets EXPOSE 3001 internally (external port depends on docker-compose or -p flag)
docker build -f apps/admin/Dockerfile -t trial-booking-admin:latest .
```

### Build Output

Each Dockerfile uses a **multi-stage build** for efficiency:

1. **deps** — Node.js base + npm install of all workspace dependencies
2. **builder** — Copy monorepo, build the specific app with `output: 'standalone'` (Next.js 15+)
3. **runner** — Minimal alpine image, copy only the `.next/standalone` output + public assets

Result: ~200–250 MB images (vs. 600+ MB if including full `node_modules`).

### Monorepo Bundling

- `apps/web/next.config.js` and `apps/admin/next.config.js` include:
  ```js
  {
    output: 'standalone',
    transpilePackages: ['@shared'],
  }
  ```
- `transpilePackages` tells Next.js to transpile and bundle code from the `@shared` package (from `libs/shared` via TypeScript path alias) into the app bundle
- This allows the Docker image to run without needing `libs/shared` on disk in the runtime container

---

## Docker: Running Images

### Docker Run

```bash
# Parent View on port 3002 (external) → 3000 (container internal)
# Make sure backend API is accessible at http://localhost:3000/api/v1
docker run -p 3002:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  -e NEXT_PUBLIC_ADMIN_URL=http://localhost:3001 \
  trial-booking-web:latest

# Admin View on port 3001
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  -e NEXT_PUBLIC_WEB_URL=http://localhost:3002 \
  trial-booking-admin:latest
```

**Note:** Environment variables passed at runtime (via `-e` or in docker-compose `environment`) **do NOT** override `NEXT_PUBLIC_*` values that were baked in at build time. Use environment-specific builds (Option A above) instead.

### Docker Compose

```bash
# Build and start both apps
docker-compose up --build

# In another terminal, verify:
curl http://localhost:3002  # Parent View (web)
curl http://localhost:3001  # Admin View (admin)
```

Environment variables for docker-compose can be set via a `.env` file at the repo root:

```bash
# .env (in repo root, not .env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3002
```

For production, substitute actual domain names:

```bash
NEXT_PUBLIC_API_URL=https://api.trial-booking.com/api/v1
NEXT_PUBLIC_ADMIN_URL=https://admin.trial-booking.com
NEXT_PUBLIC_WEB_URL=https://booking.trial-booking.com
```

---

## Port Collision Handling

### The Issue

- `apps/web` (Parent View) internally runs on port 3000
- The backend (`trial-booking-system-backend`, if running locally) also defaults to port 3000
- Running both locally will fail to bind — the second process can't claim port 3000

### Solutions

#### Local Development (Without Docker)

Run the backend on a different port:

```bash
# Backend repo
PORT=3001 npm run start:dev

# Frontend repo
npm run dev:web   # runs on 3000
npm run dev:admin # runs on 3001
```

Or in the backend's `.env.local`:

```
PORT=3001
```

Then in frontend's `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

#### Docker Compose

This repo's `docker-compose.yml` maps the web app to port **3002** externally, internal 3000:

```yaml
services:
  web:
    ports:
      - "3002:3000"  # External:Internal
```

You can run the backend separately (or add its docker-compose service) on port 3000:

```bash
# Terminal 1: Backend (in trial-booking-system-backend/)
cd ../trial-booking-system-backend
docker-compose -f docker/docker-compose.local.yml up

# Terminal 2: Frontend (in trial-booking-system-frontend/)
docker-compose up
```

Access:
- Parent View: http://localhost:3002
- Admin View: http://localhost:3001
- Backend API: http://localhost:3000

Update `NEXT_PUBLIC_API_URL` in frontend's `.env` (for docker-compose):

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Or set it when building the Docker image (Option A above).

---

## CI/CD Pipeline

### GitHub Actions Workflow

`.github/workflows/ci.yml` runs on push and pull request (branches: `main`, `develop`).

**Steps:**
1. Checkout code
2. Setup Node.js 18.18.0 (from `package.json` → `engines`)
3. npm ci (install from lock file)
4. `npm run type-check` — TypeScript across all workspaces
5. `npm run lint` — ESLint across all workspaces
6. `npm run test` — Jest across all workspaces (24 suites / 129 tests)
7. `npm run build` — Build all apps (produces `.next/standalone`)
8. Verify `.next/standalone` exists for both apps (Docker compatibility)
9. Build Docker images (optional, for testing)

**Status:** Automatically gates pull requests; fails if any step fails. Does not auto-deploy (deployment is manual or would require additional configuration).

### Running CI Locally

```bash
# Simulate what GitHub Actions runs:
npm ci
npm run type-check
npm run lint
npm run test
npm run build

# Verify Docker compatibility:
[ -d "apps/web/.next/standalone" ] && echo "✓ web standalone OK"
[ -d "apps/admin/.next/standalone" ] && echo "✓ admin standalone OK"

# Build Docker images:
docker build -f apps/web/Dockerfile -t trial-booking-web:latest .
docker build -f apps/admin/Dockerfile -t trial-booking-admin:latest .
```

---

## Deployment

### To Vercel (Recommended for Next.js)

Vercel natively supports Next.js monorepos with workspaces. For each app:

1. **Add to Vercel:**
   - Import project from GitHub
   - Root directory: `apps/web` (or `apps/admin`)
   - Environment variables: set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ADMIN_URL` / `NEXT_PUBLIC_WEB_URL` per app
   - Vercel builds each app with the environment variables baked in (handles Option A automatically)

2. **Custom domain:**
   - Parent View: `booking.trial-booking.com` → points to Vercel URL for `apps/web`
   - Admin View: `admin.trial-booking.com` → points to Vercel URL for `apps/admin`

3. **Branches:**
   - `main` → Production
   - `develop` → Staging (separate project or preview deployment)

### To Container Registry (e.g., Docker Hub, ECR, GCR)

For production Kubernetes or similar:

```bash
# Build with environment variables baked in
export NEXT_PUBLIC_API_URL=https://api.trial-booking.com/api/v1
export NEXT_PUBLIC_ADMIN_URL=https://admin.trial-booking.com
docker build -f apps/web/Dockerfile -t docker.io/myorg/trial-booking-web:1.0.0 .

# Tag and push
docker push docker.io/myorg/trial-booking-web:1.0.0

# Deploy (e.g., via docker-compose, Kubernetes, ECS, etc.)
# Environment variables set at runtime are for logging/config only, not `NEXT_PUBLIC_*`
```

### To a Traditional Server (VPS, etc.)

1. Clone repo
2. Install Node.js ≥ 18.18
3. Set environment variables (e.g., in `.env.local` or shell):
   ```bash
   export NEXT_PUBLIC_API_URL=https://api.trial-booking.com/api/v1
   export NEXT_PUBLIC_ADMIN_URL=https://admin.trial-booking.com
   ```
4. Build and start:
   ```bash
   npm install
   npm run build:web
   npm run start:web  # runs on port 3000
   
   npm run build:admin
   npm run start:admin  # runs on port 3001
   ```
5. Use a reverse proxy (nginx, Apache) to expose ports 3000 and 3001 as `https://booking.trial-booking.com` and `https://admin.trial-booking.com`

---

## Troubleshooting

### Docker build fails with "module not found: @shared"

**Cause:** Build context doesn't include `libs/shared`, or `transpilePackages` is missing from `next.config.js`.

**Fix:**
- Ensure build context is repo root: `docker build -f apps/web/Dockerfile -t trial-booking-web .` (note the `.` for repo root, not `apps/web`)
- Verify `apps/web/next.config.js` has `transpilePackages: ['@shared']`

### Environment variables not taking effect in Docker

**Cause:** `NEXT_PUBLIC_*` variables are baked at build time, not runtime.

**Fix:**
- Rebuild the image with the correct variables:
  ```bash
  export NEXT_PUBLIC_API_URL=...
  docker build -f apps/web/Dockerfile -t trial-booking-web:latest .
  ```
- Or use docker-compose with `.env` file and rebuild: `docker-compose up --build`

### Port collision (3000 already in use)

**Cause:** Backend is also running on port 3000.

**Fix:**
- See "Port Collision Handling" section above
- In docker-compose, web already maps to external port 3002; ensure backend runs on 3000 or a different port

### Tests fail in CI

**Cause:** Dependencies not fully installed, or a workspace's lint/type-check failed.

**Fix:**
- Run `npm ci` to ensure lock-file consistency
- Run each step locally: `npm run type-check`, `npm run lint`, `npm run test`
- Check recent commits to `PATTERNS.md` or component changes for violations

---

## Next Steps

- **Local dev:** `npm run dev:web` / `npm run dev:admin` (no Docker needed for daily development)
- **Docker:** `docker-compose up` (pre-built images for demos or staging)
- **CI:** Push to GitHub → automatic type-check, lint, test, build via GitHub Actions
- **Deployment:** Connect app repos to Vercel, or build Docker images and deploy to your chosen platform

For full architecture and design context, see `../trial-booking-system-context/`.
