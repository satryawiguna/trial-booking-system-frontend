"use client";

// Page: Class Detail (US-002) — per design/pages/class-detail.md.
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button, ErrorMessage, Skeleton } from "@shared/components";
import { useTrialClass } from "@shared/hooks";
import {
  formatDate,
  formatSeatsAvailable,
  formatTime,
  getInitials,
  hashStringToHue,
  isTrialClassFull,
} from "@shared/utils";

function DetailSkeleton() {
  return (
    <div
      className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-surface p-card-sm shadow-card"
      role="status"
      aria-label="Loading class details"
    >
      <Skeleton variant="circle" className="h-14 w-14" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params.id;
  const { trialClass, isLoading, error, refetch } = useTrialClass(classId);

  const isFull = trialClass ? isTrialClassFull(trialClass) : false;

  const hue = trialClass ? hashStringToHue(trialClass.id || trialClass.title) : 0;
  const headerBg = `oklch(0.88 0.10 ${hue})`;
  const headerColor = `oklch(0.28 0.12 ${hue})`;

  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      <Link
        href="/"
        className="text-[15px] font-bold text-[oklch(0.55_0.16_48)] hover:text-[oklch(0.435_0.16_48)]"
      >
        ← Back to Classes
      </Link>

      {isLoading && <DetailSkeleton />}

      {!isLoading && error && (
        <div className="mt-6">
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      )}

      {!isLoading && !error && trialClass && (
        <article className="mt-6 overflow-hidden rounded-card bg-surface shadow-card">
          <div
            className="flex items-center gap-4 px-card-sm py-card-sm"
            style={{ backgroundColor: headerBg }}
          >
            <span
              aria-hidden="true"
              className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full text-xl font-extrabold"
              style={{ backgroundColor: headerBg, color: headerColor }}
            >
              {getInitials(trialClass.title)}
            </span>
            <h1
              className="text-h1"
              style={{ color: headerColor }}
            >
              {trialClass.title}
            </h1>
          </div>

          <div className="flex flex-col gap-6 p-card-sm">
            {/*
              DATA GAP (flagged, not fabricated): class-detail.md's layout
              calls for Teacher, Duration, and Room fields in this info
              grid, but `TrialClass` (per architecture/api-design.md) only
              exposes id/title/capacity/availableSeats/startTime — same gap
              already documented on `TrialCard`. Only the fields that
              actually exist on the API response are rendered below.
            */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow uppercase text-muted-foreground">
                  Date
                </dt>
                <dd className="text-sm font-bold text-foreground">
                  {formatDate(trialClass.startTime)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow uppercase text-muted-foreground">
                  Time
                </dt>
                <dd className="text-sm font-bold text-foreground">
                  {formatTime(trialClass.startTime)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-eyebrow uppercase text-muted-foreground">
                  Availability
                </dt>
                <dd className="text-sm font-bold text-foreground">
                  {formatSeatsAvailable(
                    trialClass.availableSeats,
                    trialClass.capacity,
                  )}
                </dd>
              </div>
            </dl>

            <Button
              variant="primary"
              fullWidth
              disabled={isFull}
              onClick={() => router.push(`/booking?classId=${trialClass.id}`)}
            >
              {isFull ? "Class is Full" : "Book This Class"}
            </Button>
          </div>
        </article>
      )}
    </main>
  );
}
