"use client";

// Page: Participants tab entry point — per design/navigation.md's Admin
// Navigation section, "Participants (Roster)" is a peer tab alongside
// Dashboard/Classes, but the only roster-bearing route the API supports is
// per-class (`GET /trial-classes/{id}/roster`, see
// architecture/api-design.md — there is no "all participants" endpoint).
//
// Resolution: this route resolves the "Participants" tab to the first
// trial class's roster (`/classes/{id}/roster`), which then exposes the
// "filter chips, one per class, to switch which class's roster is shown"
// behavior specced in design/pages/roster.md. This keeps "Participants" a
// distinct, working tab destination rather than aliasing it to the
// `/classes` list (which is a different screen — design/pages/admin-classes.md
// — with its own read-only class list + "View Participants" actions).
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ErrorMessage, Skeleton } from "@shared/components";
import { useTrialClasses } from "@shared/hooks";

export default function ParticipantsEntryPage() {
  const router = useRouter();
  const { trialClasses, isLoading, error, refetch } = useTrialClasses();

  useEffect(() => {
    if (!isLoading && !error && trialClasses.length > 0) {
      router.replace(`/classes/${trialClasses[0].id}/roster`);
    }
  }, [isLoading, error, trialClasses, router]);

  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <h1 className="text-h1 text-foreground">Participant Roster</h1>

      <div className="mt-8">
        {(isLoading || (!error && trialClasses.length > 0)) && (
          <Skeleton variant="card" className="h-64" />
        )}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && trialClasses.length === 0 && (
          <div className="rounded-card border border-border bg-surface-subtle px-6 py-16 text-center text-sm text-muted-foreground">
            No trial classes have been created yet, so there is no roster to
            show.
          </div>
        )}
      </div>
    </main>
  );
}
