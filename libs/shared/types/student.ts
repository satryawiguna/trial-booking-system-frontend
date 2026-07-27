// Booking form / registrant field types.
//
// RESOLUTION (Option 2 — two-step flow):
//   1. POST /students  → CreateStudentInput  → { studentId }
//   2. POST /bookings  → CreateBookingInput   → { bookingId }
//
// This separates student registration from booking creation per the
// backend's actual API contract (`create-booking.dto.ts` only accepts
// `{ studentId, trialClassId }`).
//
// `BookingFormFields` (below) remains the UI-facing shape used by the
// `BookingForm` component and `@shared/utils/validators`; it intentionally
// allows `grade: Grade | ""` (empty before a selection is made).

/** Student grade options per `design/components/booking-form.md` (Grade 1–6). */
export type Grade =
  "Grade 1" | "Grade 2" | "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6";

/** Request body of POST /students — creates (or finds) a Student record. */
export interface CreateStudentInput {
  parentName: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  grade: Grade;
}

/** Response shape of POST /students. */
export interface CreateStudentResult {
  studentId: string;
}

/** Field set captured by the Booking Form (`design/components/booking-form.md`). */
export interface BookingFormFields {
  parentName: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  grade: Grade | "";
}
