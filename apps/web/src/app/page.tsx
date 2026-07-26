"use client";

// Page: Trial Class List (US-001) — per design/pages/trial-class-list.md.
import { useRouter } from "next/navigation";

import { ErrorMessage, Skeleton, TrialCard } from "@shared/components";
import { useTrialClasses } from "@shared/hooks";
import { isTrialClassFull } from "@shared/utils";

function ListSkeleton() {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-5"
      role="status"
      aria-label="Loading trial classes"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-64" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-border bg-surface-subtle px-6 py-16 text-center text-sm text-muted-foreground">
      No trial classes are available right now. Please check back later.
    </div>
  );
}

export default function TrialClassListPage() {
  const router = useRouter();
  const { trialClasses, isLoading, error, refetch } = useTrialClasses();

  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <h1 className="text-h1 text-foreground">Available Trial Classes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse upcoming trial classes and book a spot for your child.
      </p>

      <div className="mt-8">
        {isLoading && <ListSkeleton />}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && trialClasses.length === 0 && <EmptyState />}

        {!isLoading && !error && trialClasses.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-5">
            {trialClasses.map((trialClass) => {
              const isFull = isTrialClassFull(trialClass);
              return (
                <TrialCard
                  key={trialClass.id}
                  trialClass={trialClass}
                  onClick={
                    isFull
                      ? undefined
                      : () => router.push(`/trial-classes/${trialClass.id}`)
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
