"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import { Button, ErrorMessage, Skeleton, StatusBadge, StepIndicator } from "@shared/components";
import { useBooking, useTrialClass } from "@shared/hooks";
import { ApiClientError } from "@shared/services/apiClient";
import { bookingService } from "@shared/services/bookingService";
import { BookingStatus } from "@shared/types";
import {
  BOOKING_STATUS_HEADING,
  formatDateTime,
  getErrorMessage,
  loadRegistrant,
} from "@shared/utils";

const PLACEHOLDER = "—";

function CheckCircleIcon() {
  return (
    <svg
      className="h-16 w-16 text-success-text"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      className="h-16 w-16 text-danger-text"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 6 6m0-6-6 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-16 w-16 text-pending-text"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </svg>
  );
}

const STATUS_ICON: Record<BookingStatus, () => ReactElement> = {
  [BookingStatus.CONFIRMED]: CheckCircleIcon,
  [BookingStatus.PAYMENT_FAILED]: XCircleIcon,
  [BookingStatus.CANCELLED]: XCircleIcon,
  [BookingStatus.PENDING_PAYMENT]: ClockIcon,
};

function StatusIcon({ status }: { status: BookingStatus }) {
  const Icon = STATUS_ICON[status];
  return <Icon />;
}

export function BookingStatusPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id;

  // Optional contextual message set by the Payment page when it redirects
  // here after a non-recoverable 409 (EC-004 last-seat race / EC-001
  // duplicate / booking already completed) — see
  // apps/web/src/app/booking/[id]/payment/page.tsx.
  const reasonCode = searchParams.get("reason");

  const { booking, isLoading, error, refetch } = useBooking(bookingId);
  const { trialClass } = useTrialClass(booking?.trialClassId ?? null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsCancelling(true);
    setActionError(null);
    try {
      await bookingService.cancel(bookingId);
      // Re-fetch rather than optimistically setting local state, so the
      // page always reflects the server's authoritative status — per
      // booking-status.md, "on success the page re-renders in the
      // cancelled state in place (no navigation)".
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to cancel this booking. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const storedRegistrant = loadRegistrant(bookingId);

  return (
    <main className="mx-auto max-w-page-status px-6 py-8">
      <div className="flex justify-center">
        <StepIndicator currentStep="all-done" />
      </div>

      <div className="mt-8">
        {isLoading && (
          <Skeleton
            variant="card"
            className="mx-auto h-[420px] max-w-page-status"
          />
        )}

        {!isLoading && error && <ErrorMessage message={error} onRetry={refetch} />}

        {!isLoading && !error && booking && (
          <div className="rounded-panel border border-border bg-surface p-card-lg text-center shadow-card">
            {/*
              aria-live="polite" (PATTERNS.md §13 / task 6.4): this booking's
              status can change in place without navigation (e.g. "Cancel
              Booking" below re-fetches and re-renders this same block as
              CANCELLED), so screen reader users need to be told about the
              update without having to move focus back here themselves.
            */}
            <div
              className="flex flex-col items-center gap-3"
              aria-live="polite"
              aria-atomic="true"
            >
              <StatusIcon status={booking.status} />
              <h1 className="text-h1 text-foreground">
                {BOOKING_STATUS_HEADING[booking.status]}
              </h1>

              {booking.status === BookingStatus.PAYMENT_FAILED && reasonCode && (
                <p className="text-sm text-danger-text">
                  {getErrorMessage(reasonCode)}
                </p>
              )}

              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Booking ID: {booking.bookingId}
                </span>
                <StatusBadge status={booking.status} />
              </div>
            </div>

            {trialClass && (
              <div className="mt-6 rounded-card border border-border bg-surface-subtle p-card-sm text-left">
                <h2 className="text-section-title text-foreground">
                  {trialClass.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(trialClass.startTime)}
                </p>
              </div>
            )}

            <div className="mt-4 rounded-card border border-border bg-surface-subtle p-card-sm text-left">
              <h2 className="text-eyebrow uppercase text-muted-foreground">
                Registration Details
              </h2>
              <dl className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Parent</dt>
                  <dd className="text-sm font-bold text-foreground">
                    {storedRegistrant?.parentName || PLACEHOLDER}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Student</dt>
                  <dd className="text-sm font-bold text-foreground">
                    {storedRegistrant?.studentName || PLACEHOLDER}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Grade</dt>
                  <dd className="text-sm font-bold text-foreground">
                    {storedRegistrant?.grade || PLACEHOLDER}
                  </dd>
                </div>
              </dl>
            </div>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-input bg-danger-bg px-4 py-3 text-sm text-danger-text"
              >
                {actionError}
              </div>
            )}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {booking.status === BookingStatus.CONFIRMED && (
                <Button
                  variant="outline"
                  isLoading={isCancelling}
                  onClick={handleCancel}
                >
                  Cancel Booking
                </Button>
              )}

              {booking.status === BookingStatus.PAYMENT_FAILED && (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/booking/${bookingId}/payment`)}
                >
                  Try Payment Again →
                </Button>
              )}

              <Button
                variant={
                  booking.status === BookingStatus.CONFIRMED ||
                  booking.status === BookingStatus.PAYMENT_FAILED
                    ? "text"
                    : "primary"
                }
                onClick={() => router.push("/")}
              >
                Browse More Classes
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
