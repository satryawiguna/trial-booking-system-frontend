"use client";

// AdminTabBar — horizontal tab bar (Dashboard / Classes / Participants), per
// design/navigation.md's "Admin Navigation" section:
//
//   Admin View
//    ├── Dashboard      (default tab)
//    ├── Classes
//    │     └── "View Participants" on a class → jumps to Participants tab,
//    │         filtered to that class
//    └── Participants (Roster)
//          └── filter chips, one per class, to switch which class's roster
//              is shown
//
// Styling follows design/components/button.md's "Text / Back Link" variant
// ("Used for ... admin tab items"), with the active tab picking up the
// Primary color per design-system.md's Primary token usage note ("Primary
// buttons, active tab, focus border, links, logo mark"). Implemented with
// `next/link` (not the shared `Button`, which only renders a `<button>`)
// since these are true page navigations, matching how
// apps/web's Class Detail page implements its "← Back to Classes" link.
//
// ROUTE NOTE: the "Participants" tab has no single canonical URL of its own
// — the only roster-bearing route is `/classes/{id}/roster` (per
// architecture/api-design.md, roster is always scoped to one trial class).
// It routes to `/participants`, a small redirect page that resolves to the
// first trial class's roster (see `apps/admin/src/app/participants/page.tsx`),
// and is also treated as "active" whenever the current route is a resolved
// `/classes/{id}/roster` page (reached either via that redirect or via
// "View Participants" on the Classes tab).
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@shared/utils";

interface AdminTab {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

const isRosterPath = (pathname: string): boolean =>
  pathname.startsWith("/classes/") && pathname.endsWith("/roster");

const TABS: AdminTab[] = [
  {
    href: "/",
    label: "Dashboard",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/classes",
    label: "Classes",
    isActive: (pathname) => pathname === "/classes",
  },
  {
    href: "/participants",
    label: "Participants",
    isActive: (pathname) =>
      pathname === "/participants" || isRosterPath(pathname),
  },
];

export function AdminTabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Admin sections"
      className="w-full border-b border-border bg-surface"
    >
      {/*
        RESPONSIVE NOTE (6.1): "Dashboard" + "Classes" + "Participants"
        (plus gaps/padding) don't reliably fit on one row at ~320px width.
        Rather than clip or force an unstyled overflow, the tab row itself
        scrolls horizontally below `sm` (`overflow-x-auto` +
        `whitespace-nowrap`) — a standard, low-risk pattern for tab bars —
        while gap/padding also shrink slightly at the smallest sizes.
      */}
      <div className="mx-auto flex max-w-page-list items-center gap-4 overflow-x-auto whitespace-nowrap px-4 sm:gap-6 sm:overflow-visible sm:px-6">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 border-transparent px-1 py-3 text-sm font-bold transition-colors sm:py-4 sm:text-[15px]",
                active
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
