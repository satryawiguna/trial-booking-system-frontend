"use client";

// Page: Payment (Mock) (US-004) — per design/pages/payment.md. See that
// page's "Adaptation from Prototype (important)" section before changing
// the branching logic below.
import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorMessage, PaymentForm, Skeleton, StepIndicator } from "@shared/components";
import { useBooking, useTrialClass } from "@shared/hooks";
import { ApiClientError } from "@shared/services/apiClient";
import { bookingService } from "@shared/services/bookingService";
import { BookingStatus, PaymentStatus } from "@shared/types";
import { getErrorMessage, loadRegistrant } from "@shared/utils";
import type { PaymentFormRegistrant } from "@shared/components";

import { ClassSummaryCard } from "../../../_components/ClassSummaryCard";

const PLACEHOLDER = "—";

function PaymentSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 md:flex-row"
      role="status"
      aria-label="Loading payment details"
    >
      <Skeleton variant="card" className="h-96 flex-1" />
      <Skeleton variant="card" className="h-40 md:w-[260px]" />
    </div>
  );
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params.id;

  const { booking, isLoading, error, refetch } = useBooking(bookingId);
  const { trialClass } = useTrialClass(booking?.trialClassId ?? null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>();

  // If this booking has already reached a terminal state that isn't
  // "awaiting a payment attempt" (CONFIRMED or CANCELLED), the payment step
  // no longer applies — send the parent straight to the status page rather
  // than showing a payment CTA that can't succeed.
  useEffect(() => {
    if (
      booking &&
      (booking.status === BookingStatus.CONFIRMED ||
        booking.status === BookingStatus.CANCELLED)
    ) {
      router.replace(`/booking/${bookingId}/status`);
    }
  }, [booking, bookingId, router]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setPaymentError(undefined);
    try {
      const result = await bookingService.submitPayment(bookingId);

      if (
        result.paymentStatus === PaymentStatus.SUCCESS &&
        result.bookingStatus === BookingStatus.CONFIRMED
      ) {
        router.push(`/booking/${bookingId}/status`);
        return;
      }

      // ── Recoverable failure branch (EC-003, mock payment declined) ────
      // SPEC CONFLICT (flagged for Backend Agent confirmation):
      // design/pages/payment.md describes this outcome as "the booking
      // stays PENDING_PAYMENT" so the parent can retry immediately on this
      // page. But architecture/api-design.md's documented 200 response for
      // a failed mock payment always returns `bookingStatus:
      // "PAYMENT_FAILED"` — there is no response shape matching
      // payment.md's "stays pending" narrative. This branch is triggered on
      // `paymentStatus === "FAILED"` alone (regardless of the returned
      // `bookingStatus`), matching payment.md's UX intent: show an inline
      // decline message and re-enable the CTA so the parent can retry
      // without leaving this page. If the booking has in fact already
      // moved to a terminal state server-side, the next `submitPayment`
      // call is expected to surface as a thrown 409 (caught below), which
      // correctly falls through to the non-recoverable branch instead.
      if (result.paymentStatus === PaymentStatus.FAILED) {
        setPaymentError("Payment was declined. You can try again.");
        return;
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        // Non-recoverable failure (EC-004 last-seat race / EC-001
        // duplicate / booking already completed): the backend has already
        // moved the booking to a terminal state within its own atomic
        // transaction. Navigate to Booking Status — it re-fetches the
        // booking fresh and renders the correct terminal state + actions.
        // Pass the error code through as `reason` so the status page can
        // show a contextual message, per payment.md ("This class just
        // filled up." / "You already have a confirmed booking...").
        router.push(
          `/booking/${bookingId}/status?reason=${encodeURIComponent(err.errorCode)}`,
        );
        return;
      }
      setPaymentError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Something went wrong while processing payment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const storedRegistrant = loadRegistrant(bookingId);
  const registrant: PaymentFormRegistrant = {
    parentName: storedRegistrant?.parentName || PLACEHOLDER,
    studentName: storedRegistrant?.studentName || PLACEHOLDER,
    grade: storedRegistrant?.grade || PLACEHOLDER,
    phoneNumber: storedRegistrant?.phoneNumber || PLACEHOLDER,
    email: storedRegistrant?.email || PLACEHOLDER,
  };

  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      {/*
        Visually hidden per design/pages/payment.md's layout (which doesn't
        call for a visible page title here), but every page should still
        expose exactly one <h1> for the document outline / screen readers
        (PATTERNS.md §13, WCAG 2.4.6).
      */}
      <h1 className="sr-only">Payment</h1>
      <Link
        href={
          booking ? `/trial-classes/${booking.trialClassId}` : "/"
        }
        className="text-[15px] font-bold text-[oklch(0.55_0.16_48)] hover:text-[oklch(0.435_0.16_48)]"
      >
        ← Back to Details
      </Link>

      <div className="mt-6">
        <StepIndicator currentStep="payment" />
      </div>

      <div className="mt-8">
        {isLoading && <PaymentSkeleton />}

        {!isLoading && error && <ErrorMessage message={error} onRetry={refetch} />}

        {!isLoading && !error && booking && (
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex-1 rounded-card border border-border bg-surface p-card-sm shadow-card">
              {paymentError && (
                <div
                  role="alert"
                  className="mb-4 rounded-input bg-danger-bg px-4 py-3 text-sm text-danger-text"
                >
                  {paymentError}
                </div>
              )}
              <PaymentForm
                registrant={registrant}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
            {trialClass && <ClassSummaryCard trialClass={trialClass} />}
          </div>
        )}
      </div>
    </main>
  );
}
