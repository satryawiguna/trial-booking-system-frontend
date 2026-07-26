"use client";

// AppNavbar — thin wrapper around the shared `Navbar` component for the
// Parent View app shell, per design/navigation.md's "App Shell" section.
//
// apps/web and apps/admin are two separate Next.js apps (different ports —
// 3000 and 3001 respectively, see apps/admin/package.json's `dev` script),
// not a single router, so switching to "Admin View" is a full cross-app
// navigation via a native <a> tag (not a client-side route change).
// Switching to "Parent View" while already in apps/web routes home via <Link>.
//
// Uses the Navbar's **link mode** (`crossAppUrl`) to avoid hydration
// mismatches caused by browser extensions injecting attributes into <body>.
import { Navbar } from "@shared/components";

const ADMIN_APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

export function AppNavbar() {
  return <Navbar currentRole="parent" crossAppUrl={ADMIN_APP_URL} />;
}
