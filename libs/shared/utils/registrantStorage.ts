// Session-scoped storage for booking registrant details (Parent/Student/
// Grade/Phone/Email), keyed by bookingId.
//
// GAP (flagged, not silently invented): `GET /bookings/{id}` per
// api-design.md only returns `{ bookingId, status, studentId, trialClassId }`
// — no registrant/student detail fields (parentName, studentName, grade,
// phone, email), and there is no documented `GET /students/{id}` endpoint to
// look these up from `studentId` either. `design/pages/payment.md` +
// `design/components/payment-form.md` require a Payment page "review panel
// (registrant info: Parent, Student, Grade, Phone, Email)", and
// `design/pages/booking-status.md` shows a "registration-details block" too.
//
// Since there is no backend-documented way to fetch these fields from a
// booking id alone, this module persists the registrant fields entered on
// the Booking Form into `sessionStorage` (keyed by bookingId) immediately
// after a successful `POST /bookings`, so the Payment and Booking Status
// pages (same browser session/tab) can redisplay them without a dedicated
// backend endpoint. This is a frontend-only workaround, not a backend
// contract — it does not survive a fresh visit/reload with no prior Booking
// Form submission in this session (callers should fall back to placeholder
// values in that case). Should be confirmed with the Backend Agent —
// ideally `GET /bookings/{id}` would include (or reference) registrant
// details directly so this workaround can be removed.

import type { BookingFormFields } from "@shared/types";

function storageKey(bookingId: string): string {
  return `tbs:registrant:${bookingId}`;
}

export function saveRegistrant(
  bookingId: string,
  fields: BookingFormFields,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(bookingId), JSON.stringify(fields));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota exceeded)
    // — callers degrade gracefully to placeholder values in that case.
  }
}

export function loadRegistrant(bookingId: string): BookingFormFields | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(bookingId));
    if (!raw) return null;
    return JSON.parse(raw) as BookingFormFields;
  } catch {
    return null;
  }
}
