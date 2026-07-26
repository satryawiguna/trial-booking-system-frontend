"use client";

// Page: Participant Roster (US-007) — per design/pages/roster.md.
//
// BR-011 / INV-007 (roster = confirmed bookings only): `GET
// /trial-classes/{id}/roster`'s documented response already restricts its
// `participants` array to confirmed bookings ("Business Rules: Only
// confirmed bookings are included.", architecture/api-design.md), so this
// page renders `roster.participants` as returned rather than re-filtering
// by a status field the response doesn't even include — there is no
// business logic being duplicated client-side here, only display of an
// already-filtered response (see `@shared/hooks/useRoster`'s file header).
//
// DATA GAP (flagged, not fabricated): roster.md's table layout calls for
// No. / Student / Grade / Parent/Guardian / Phone / Booked At columns, but
// `TrialClassRosterParticipant` (per architecture/api-design.md) only
// exposes `studentId` and `studentName` — no grade, guardian, phone, or
// booked-at timestamp is in the documented roster response. Only the
// columns that actually exist on the API response are rendered, per the
// same "omit rather than fabricate" precedent already established on
// TrialCard/Class Detail (`libs/shared/components/TrialCard/TrialCard.tsx`,
// `apps/web/src/app/trial-classes/[id]/page.tsx`).
import { useParams, useRouter } from "next/navigation";

import { Button, ErrorMessage, Skeleton } from "@shared/components";
import { useRoster, useTrialClass, useTrialClasses } from "@shared/hooks";
import { formatDateTime, getInitials, hashStringToHue } from "@shared/utils";

function RosterSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-card bg-surface shadow-card"
      role="status"
      aria-label="Loading participant roster"
    >
      <Skeleton variant="card" className="h-24 rounded-none" />
      <div className="flex flex-col gap-3 p-card-sm">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-border bg-surface-subtle px-6 py-16 text-center text-sm text-muted-foreground">
      No confirmed participants yet.
    </div>
  );
}

export default function ParticipantRosterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params.id;

  // Used to render the "one chip per class" filter row (roster.md), not
  // for the roster content itself.
  const { trialClasses } = useTrialClasses();

  const {
    trialClass,
    isLoading: isClassLoading,
    error: classError,
    refetch: refetchClass,
  } = useTrialClass(classId);
  const {
    roster,
    isLoading: isRosterLoading,
    error: rosterError,
    refetch: refetchRoster,
  } = useRoster(classId);

  const isLoading = isClassLoading || isRosterLoading;
  const error = classError ?? rosterError;
  const refetch = () => {
    refetchClass();
    refetchRoster();
  };

  const participants = roster?.participants ?? [];

  const hue = trialClass
    ? hashStringToHue(trialClass.id || trialClass.title)
    : 0;
  const headerBg = `oklch(0.88 0.10 ${hue})`;
  const headerColor = `oklch(0.28 0.12 ${hue})`;

  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <h1 className="text-h1 text-foreground">Participant Roster</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirmed students for each trial class.
      </p>

      {trialClasses.length > 0 && (
        <div
          className="mt-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by class"
        >
          {trialClasses.map((tc) => (
            <Button
              key={tc.id}
              variant="chip"
              isActive={tc.id === classId}
              onClick={() => router.push(`/classes/${tc.id}/roster`)}
            >
              {tc.title}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {isLoading && <RosterSkeleton />}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && trialClass && (
          <div className="overflow-hidden rounded-card bg-surface shadow-card">
            <div
              className="flex flex-wrap items-center justify-between gap-4 px-card-sm py-card-sm"
              style={{ backgroundColor: headerBg }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-lg font-extrabold"
                  style={{ backgroundColor: headerBg, color: headerColor }}
                >
                  {getInitials(trialClass.title)}
                </span>
                <div className="flex flex-col">
                  <h2
                    className="text-section-title"
                    style={{ color: headerColor }}
                  >
                    {trialClass.title}
                  </h2>
                  <span className="text-sm" style={{ color: headerColor }}>
                    {formatDateTime(trialClass.startTime)}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-success-bg px-3 py-1 text-[11px] font-bold text-success-text">
                {participants.length} Confirmed
              </span>
            </div>

            <div className="p-card-sm">
              {participants.length === 0 ? (
                <EmptyState />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-eyebrow uppercase text-muted-foreground">
                      <th className="py-2 pr-4">No.</th>
                      <th className="py-2">Student</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr
                        key={participant.studentId}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 pr-4 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="py-3 font-bold text-foreground">
                          {participant.studentName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
