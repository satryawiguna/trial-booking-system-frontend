// Shared constants per PATTERNS.md §8 (naming) and design specs referenced below.

import { BookingStatus } from "@shared/types";
import type { Grade } from "@shared/types";

/**
 * Student grade options for the Booking Form select field.
 * Source: design/components/booking-form.md ("Select grade..." — Grade 1–6).
 */
export const GRADE_OPTIONS: readonly Grade[] = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
] as const;

/**
 * Documented business invariant (INV-001, domain/invariants.md +
 * quality/edge-case-verification.md): "A trial class must never contain
 * more than four confirmed students."
 *
 * This is a reference value only — capacity enforcement is a backend
 * responsibility (BR-001/INV-001) and the authoritative capacity for a
 * given class always comes from `TrialClass.capacity` returned by the API,
 * not from this constant.
 */
export const DEFAULT_TRIAL_CLASS_CAPACITY = 4;

/**
 * Booking status badge labels, per design/pages/booking-status.md's States
 * table (badge column: "Confirmed" / "Payment Failed" / "Cancelled" /
 * "Pending").
 */
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  [BookingStatus.PENDING_PAYMENT]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.PAYMENT_FAILED]: "Payment Failed",
  [BookingStatus.CANCELLED]: "Cancelled",
};

/**
 * Booking status page headings, per design/pages/booking-status.md's States
 * table (icon/heading column).
 */
export const BOOKING_STATUS_HEADING: Record<BookingStatus, string> = {
  [BookingStatus.PENDING_PAYMENT]: "Pending Payment",
  [BookingStatus.CONFIRMED]: "Booking Confirmed!",
  [BookingStatus.PAYMENT_FAILED]: "Payment Failed",
  [BookingStatus.CANCELLED]: "Booking Cancelled",
};
