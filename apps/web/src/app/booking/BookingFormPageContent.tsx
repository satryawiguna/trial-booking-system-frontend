"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  BookingForm,
  ErrorMessage,
  Skeleton,
  StepIndicator,
} from "@shared/components";
import { useTrialClass } from "@shared/hooks";
import { ApiClientError } from "@shared/services/apiClient";
import { bookingService } from "@shared/services/bookingService";
import { studentService } from "@shared/services/studentService";
import type { BookingFormFields, Grade } from "@shared/types";
import {
  getErrorMessage,
  saveRegistrant,
  validateBookingFormFields,
} from "@shared/utils";
import type { BookingFormErrors } from "@shared/utils";

import { ClassSummaryCard } from "../_components/ClassSummaryCard";

// Mirrors this page's own field-stack + summary-card layout (per PATTERNS.md
// §6, "Skeleton harus mirror layout konten yang akan tampil") for the hook's
// own `isLoading` state — this is a client component, so route-level
// `loading.tsx` only fires on route-segment transitions, not while this
// component is already mounted and (re)fetching `trialClass` client-side.
function BookingFormContentSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 md:flex-row md:items-start"
      role="status"
      aria-label="Loading booking form"
    >
      <div className="flex-1 rounded-card border border-border bg-surface p-card-sm shadow-card">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
      <Skeleton variant="card" className="h-40 md:w-[260px]" />
    </div>
  );
}

const EMPTY_FIELDS: BookingFormFields = {
  parentName: "",
  studentName: "",
  phoneNumber: "",
  email: "",
  grade: "",
};

export function BookingFormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const { trialClass, isLoading, error, refetch } = useTrialClass(classId);

  const [values, setValues] = useState<BookingFormFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof BookingFormFields, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError(undefined);
  };

  const handleSubmit = async () => {
    if (!classId) return;

    const fieldErrors = validateBookingFormFields(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      // Two-step flow (Option 2 — confirmed backend contract):
      //   1. POST /students  → get studentId from registrant fields
      //   2. POST /bookings  → create booking with { studentId, trialClassId }
      //
      // The backend CreateBookingDto only accepts { studentId, trialClassId }
      // (both UUIDs), so we must obtain a studentId before creating the booking.

      const grade = values.grade as Grade;

      const { studentId } = await studentService.create({
        parentName: values.parentName,
        studentName: values.studentName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        grade,
      });

      const result = await bookingService.create({
        studentId,
        trialClassId: classId,
      });

      // See libs/shared/utils/registrantStorage.ts — GET /bookings/{id}
      // does not return registrant details, so they're carried forward via
      // sessionStorage for the Payment / Booking Status pages to display.
      saveRegistrant(result.bookingId, values);

      router.push(`/booking/${result.bookingId}/payment`);
    } catch (err) {
      // EC-001 (duplicate booking) and any other business-rule failure from
      // POST /bookings surface here as an inline banner above the form —
      // per design/pages/booking.md, the parent stays on this page and
      // nothing navigates to Payment.
      setSubmitError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Something went wrong while creating your booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!classId) {
    return (
      <main className="mx-auto max-w-page-form px-6 py-16">
        <ErrorMessage
          heading="No class selected"
          message="Please choose a trial class before starting a booking."
        />
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-[15px] font-bold text-[oklch(0.55_0.16_48)] hover:text-[oklch(0.435_0.16_48)]"
          >
            ← Back to Classes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      {/*
        Visually hidden per design/pages/booking.md's layout (which doesn't
        call for a visible page title here), but every page should still
        expose exactly one <h1> for the document outline / screen readers
        (PATTERNS.md §13, WCAG 2.4.6).
      */}
      <h1 className="sr-only">Book This Class</h1>
      <Link
        href={`/trial-classes/${classId}`}
        className="text-[15px] font-bold text-[oklch(0.55_0.16_48)] hover:text-[oklch(0.435_0.16_48)]"
      >
        ← Back to Class Details
      </Link>

      <div className="mt-6">
        <StepIndicator currentStep="details" />
      </div>

      <div className="mt-8">
        {isLoading && <BookingFormContentSkeleton />}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && trialClass && (
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex-1 rounded-card border border-border bg-surface p-card-sm shadow-card">
              <BookingForm
                values={values}
                errors={errors}
                submitError={submitError}
                isSubmitting={isSubmitting}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            </div>
            <ClassSummaryCard trialClass={trialClass} />
          </div>
        )}
      </div>
    </main>
  );
}
