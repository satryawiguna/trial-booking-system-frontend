# =============================================================================
# Multi-stage Dockerfile — Trial Booking System Frontend
# =============================================================================
# Build context: repo root (includes apps/web, apps/admin, libs/shared)
#
# Usage:
#   docker build -f docker/Dockerfile --build-arg APP=web  -t trial-booking-web:latest   .
#   docker build -f docker/Dockerfile --build-arg APP=admin -t trial-booking-admin:latest .
#
# Stages:
#   1. deps    — Install npm dependencies (workspace-aware)
#   2. builder — Compile TypeScript, run next build (standalone output)
#   3. runner  — Minimal production image with non-root user
# =============================================================================

ARG APP=web

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy package files for the entire monorepo
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/admin/package*.json ./apps/admin/
COPY libs/shared/package*.json ./libs/shared/

# Install dependencies (npm workspaces will resolve automatically)
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: Build the target application
# ---------------------------------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

ARG APP
ENV APP=${APP}

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy monorepo root config
COPY package*.json ./
COPY tsconfig.json ./

# Copy both apps and shared lib (build may resolve cross-references)
COPY apps ./apps
COPY libs/shared ./libs/shared

# Build the target app with output: 'standalone' (configured in next.config.js)
# This generates .next/standalone with minimal dependencies
WORKDIR /app/apps/${APP}
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Minimal production runner
# ---------------------------------------------------------------------------
FROM node:18-alpine AS runner

ARG APP
ENV APP=${APP}

WORKDIR /app/apps/${APP}

RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Copy the standalone output from builder
# The standalone output includes:
#   - .next/standalone/{node_modules, ...}
#   - public/ (if exists)
#   - package.json
COPY --from=builder --chown=appuser:appgroup /app/apps/${APP}/.next/standalone ./

# Copy static assets if they exist
COPY --from=builder --chown=appuser:appgroup /app/apps/${APP}/public ./public 2>/dev/null || true

# Switch to non-root user
USER appuser

# Environment: production
ENV NODE_ENV=production

# Next.js port:
#   apps/web   → 3000
#   apps/admin → 3001
# Map to external port via docker run -p or docker-compose
ARG PORT=3000
EXPOSE ${PORT}

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the app
# The standalone output includes its own Node modules
CMD ["node", "server.js"]
