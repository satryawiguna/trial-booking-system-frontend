// Navbar — App Shell per design/navigation.md:
//   - Sticky, 64px tall, white background, `navbar` box-shadow.
//   - Left: 38x38 rounded-square primary-color logo mark with the letter
//     "T", plus a two-line "Trial Booking" / "System" product name lockup.
//   - Right: segmented Parent View / Admin View role switch — active button
//     gets a white pill background + subtle shadow, inactive is transparent.
//
// The role switch supports two modes:
//   1. Button mode (legacy): pass `onRoleChange` callback.
//   2. Link mode: pass `crossAppUrl`. The active role renders as a
//      client-side <Link href="/"> and the inactive role renders as a
//      cross-app <a href={crossAppUrl}>. This avoids hydration mismatches
//      caused by browser extensions injecting attributes into <body>.
import Link from "next/link";

import { cn } from "@shared/utils";

import type { AppRole, NavbarProps } from "./Navbar.types";

const ROLES: { key: AppRole; label: string }[] = [
  { key: "parent", label: "Parent View" },
  { key: "admin", label: "Admin View" },
];

const pillClass = (isActive: boolean) =>
  cn(
    "rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:py-2 sm:text-sm",
    isActive
      ? "bg-white text-foreground shadow-card"
      : "bg-transparent text-muted-foreground hover:text-foreground",
  );

export function Navbar({
  currentRole,
  onRoleChange,
  crossAppUrl,
  className,
}: NavbarProps) {
  const useLinks = !onRoleChange && crossAppUrl !== undefined;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-surface shadow-navbar",
        className,
      )}
    >
      {/*
        RESPONSIVE NOTE (6.1): at very narrow viewports (~320px) the logo
        wordmark + both role-switch pills don't fit on a single 64px-tall
        row without overflowing horizontally. Below `sm`, the row is allowed
        to wrap onto two lines (fixed height relaxed to `h-auto`) and the
        role-switch pills shrink their padding/type size, rather than
        clipping or introducing horizontal scroll. At `sm` and up this
        renders identically to the original fixed 64px single-row layout.
      */}
      <div className="mx-auto flex max-w-page-list flex-wrap items-center justify-between gap-y-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-primary text-lg font-extrabold text-white sm:h-[38px] sm:w-[38px]"
          >
            T
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-extrabold text-foreground sm:text-sm">
              Trial Booking
            </span>
            <span className="text-xs font-extrabold text-foreground sm:text-sm">
              System
            </span>
          </span>
        </div>

        <div
          role="group"
          aria-label="Switch view"
          className="flex items-center gap-1 rounded-full bg-surface-subtle p-1"
        >
          {ROLES.map((role) => {
            const isActive = role.key === currentRole;

            if (useLinks) {
              // Link mode — active role uses <Link> (client-side),
              // inactive role uses <a> (cross-app navigation).
              return isActive ? (
                <Link
                  key={role.key}
                  href="/"
                  aria-pressed="true"
                  className={pillClass(true)}
                >
                  {role.label}
                </Link>
              ) : (
                <a
                  key={role.key}
                  href={crossAppUrl}
                  aria-pressed="false"
                  className={pillClass(false)}
                >
                  {role.label}
                </a>
              );
            }

            // Button mode (legacy).
            return (
              <button
                key={role.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => onRoleChange?.(role.key)}
                className={pillClass(isActive)}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
