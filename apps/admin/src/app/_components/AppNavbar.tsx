"use client";

// AppNavbar — thin wrapper around the shared `Navbar` component for the
// Admin View app shell, per design/navigation.md's "App Shell" section.
// Mirrors apps/web/src/app/_components/AppNavbar.tsx.
//
// apps/web and apps/admin are two separate Next.js apps (different ports —
// 3000 and 3001 respectively, see apps/admin/package.json's `dev` script),
// not a single router, so switching to "Parent View" is a full cross-app
// navigation via a native <a> tag (not a client-side route change).
// Switching to "Admin View" while already in apps/admin routes home via <Link>,
// matching design/navigation.md's "Switching the role switch to Admin View
// always lands on Dashboard first".
//
// Uses the Navbar's **link mode** (`crossAppUrl`) to avoid hydration
// mismatches caused by browser extensions injecting attributes into <body>.
import { Navbar } from "@shared/components";

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export function AppNavbar() {
  return <Navbar currentRole="admin" crossAppUrl={WEB_APP_URL} />;
}
