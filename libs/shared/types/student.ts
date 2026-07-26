// Booking form / registrant field types.
//
// AMBIGUITY / GAP (flagged, not silently guessed): `architecture/api-design.md`
// does not document a Student resource or a "create student" endpoint.
// `POST /bookings`'s documented request body is `{ studentId, trialClassId }`,
// implying a student already exists before booking creation.
//
// However, `design/pages/booking.md` + `design/components/booking-form.md`
// specify a Booking Form that collects Parent/Guardian Name, Student Name,
// Phone Number, Email Address, and Student Grade — none of which map onto
// that documented shape. There is no documented endpoint that accepts these
// fields and returns a `studentId`.
//
// RESOLUTION (Task 4 / Frontend Agent): `@shared/types/booking` ->
// `CreateBookingInput` was extended to accept these registrant fields
// directly (replacing `studentId`) and the Booking Form page
// (`apps/web/src/app/booking/page.tsx`) sends them straight to
// `POST /bookings` in one call, on the assumption the backend derives/
// creates the Student record from this payload. See the flagged comment on
// `CreateBookingInput` — this is a judgment call requiring Backend Agent
// confirmation, not a confirmed contract.
//
// `BookingFormFields` (below) remains the UI-facing shape used by the
// `BookingForm` component and `@shared/utils/validators`; it intentionally
// allows `grade: Grade | ""` (empty before a selection is made), whereas
// `CreateBookingInput.grade` requires a non-empty `Grade` once the form has
// passed client-side validation.

/** Student grade options per `design/components/booking-form.md` (Grade 1–6). */
export type Grade =
  | "Grade 1"
  | "Grade 2"
  | "Grade 3"
  | "Grade 4"
  | "Grade 5"
  | "Grade 6";

/** Field set captured by the Booking Form (`design/components/booking-form.md`). */
export interface BookingFormFields {
  parentName: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  grade: Grade | "";
}
