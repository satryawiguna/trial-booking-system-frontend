// Booking domain types.
//
// BookingStatus values match `domain/booking-lifecycle.md` states exactly
// (Pending Payment, Confirmed, Payment Failed, Cancelled) and align with the
// enum shown in PATTERNS.md §9.
//
// Field names/shapes for request & response bodies match
// `architecture/api-design.md` exactly:
//   POST /bookings                 -> CreateBookingInput / CreateBookingResult
//   GET  /bookings/{id}            -> Booking
//   POST /bookings/{id}/payments   -> PaymentResult (no request body)
//   POST /bookings/{id}/cancel     -> CancelBookingResult (no request body)
//
// NOTE: api-design.md's response bodies use `bookingId` (not `id`) as the
// booking identifier field, which differs from the illustrative `Booking`
// example in PATTERNS.md §9 (`id: string`). This module follows
// api-design.md since it is the authoritative API contract.

import type { Grade } from "./student";

export enum BookingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

/** Response shape of GET /bookings/{id}. */
export interface Booking {
  bookingId: string;
  status: BookingStatus;
  studentId: string;
  trialClassId: string;
}

/**
 * Request body of POST /bookings.
 *
 * ASSUMPTION — FLAGGED FOR BACKEND AGENT CONFIRMATION (Task 4 / Frontend
 * Agent): `architecture/api-design.md` documents this endpoint's request
 * body as strictly `{ studentId, trialClassId }`, implying a Student
 * resource already exists before a booking is created. However, no Student
 * resource, no "create student" endpoint, and no `GET /students` lookup
 * exists anywhere in api-design.md. Meanwhile `design/pages/booking.md` +
 * `design/components/booking-form.md` specify a Booking Form that collects
 * Parent/Guardian Name, Student Name, Phone Number, Email Address, and
 * Student Grade — none of which map onto a pre-existing `studentId`.
 *
 * Resolution (Task 4): the Booking Form page
 * (`apps/web/src/app/booking/page.tsx`) sends the full registrant payload
 * directly to `POST /bookings` in a single call, on the assumption the
 * backend will create (or find-or-create) the Student record from these
 * fields as part of handling the request, rather than the caller supplying
 * a pre-existing `studentId`. This is a judgment call, NOT a confirmed
 * contract — the documented `{ studentId, trialClassId }` shape was treated
 * as under-specified rather than final. It must be verified with the
 * Backend Agent; if the backend instead expects a `studentId` obtained from
 * a separate (currently undocumented) endpoint, this type and its one call
 * site need to change together.
 */
export interface CreateBookingInput {
  parentName: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  grade: Grade;
  trialClassId: string;
}

/** Response shape of POST /bookings. */
export interface CreateBookingResult {
  bookingId: string;
  status: BookingStatus;
}

/**
 * Response shape of POST /bookings/{id}/payments.
 *
 * NOTE: api-design.md is explicit that this endpoint takes "No request
 * body" — the backend determines the mock payment outcome internally. There
 * is no `PaymentInput` (e.g. card details/amount) in the documented
 * contract, unlike the illustrative `PaymentInput` type in PATTERNS.md §9.
 * `bookingService.submitPayment()` therefore takes no payload.
 */
export interface PaymentResult {
  paymentAttemptId: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

/** Response shape of POST /bookings/{id}/cancel. */
export interface CancelBookingResult {
  bookingId: string;
  status: BookingStatus;
}
