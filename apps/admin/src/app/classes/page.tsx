"use client";

// Page: Admin Classes — per design/pages/admin-classes.md. Read-only list of
// every trial class with a "View Participants" action per row that jumps to
// that class's roster (design/navigation.md: "'View Participants' on a
// class → jumps to Participants tab, filtered to that class").
import { useRouter } from "next/navigation";

import { Button, ErrorMessage, Skeleton, TrialCard } from "@shared/components";
import { useTrialClasses } from "@shared/hooks";

function RowSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4"
      role="status"
      aria-label="Loading trial classes"
    >
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="h-[52px] w-[52px]" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-8 w-full sm:ml-auto sm:w-40" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-border bg-surface-subtle px-6 py-16 text-center text-sm text-muted-foreground">
      No trial classes have been created yet.
    </div>
  );
}

export default function AdminClassesPage() {
  const router = useRouter();
  const { trialClasses, isLoading, error, refetch } = useTrialClasses();

  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <h1 className="text-h1 text-foreground">Trial Classes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every trial class and its current fill level. Read-only — classes are
        not created, edited, or deleted here.
      </p>

      <div className="mt-8">
        {isLoading && <ListSkeleton />}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && trialClasses.length === 0 && <EmptyState />}

        {!isLoading && !error && trialClasses.length > 0 && (
          <div className="flex flex-col gap-4">
            {trialClasses.map((trialClass) => (
              <div
                key={trialClass.id}
                // RESPONSIVE NOTE (6.1): the row's avatar + title + seat bar
                // + "View Participants" button don't all fit on one line at
                // narrow (~320px) widths without overflowing. Below `sm`,
                // the row stacks into two lines (TrialCard row content on
                // top, full-width action button below) instead of clipping
                // or overflowing horizontally.
                className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4"
              >
                {/*
                  TrialCard's `row` variant only reuses the avatar tint + seat
                  indicator sub-pattern (see TrialCard.tsx's "VARIANT NOTE").
                  Its own box shadow/background/padding are cancelled here
                  (via twMerge-deduped overrides) so it renders seamlessly
                  inside this page's own row card alongside the
                  "View Participants" action, per design/pages/admin-classes.md.
                */}
                <TrialCard
                  trialClass={trialClass}
                  variant="row"
                  className="flex-1 bg-transparent p-0 shadow-none"
                />
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    router.push(`/classes/${trialClass.id}/roster`)
                  }
                >
                  View Participants
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
