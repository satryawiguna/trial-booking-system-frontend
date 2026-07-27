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
 * Confirmed backend contract (per `create-booking.dto.ts`):
 * strictly `{ studentId, trialClassId }` — both UUIDs.
 *
 * Flow: the Booking Form page first calls `POST /students` to create (or
 * find) a Student record from the registrant fields, then calls
 * `POST /bookings` with the returned `studentId` and the selected
 * `trialClassId`. See `CreateStudentInput` in `student.ts`.
 */
export interface CreateBookingInput {
  studentId: string;
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
