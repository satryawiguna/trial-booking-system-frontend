// Client-side validation helpers per PATTERNS.md §11.
//
// These are UX-only checks (format, required fields). Business validation
// (duplicate booking, capacity) is always enforced server-side — see
// architecture/api-design.md's Validation Rules section.

import type { BookingFormFields } from "@shared/types";

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Simple, permissive email format check — good enough for client-side UX. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Permissive phone number check: allows digits, spaces, parentheses, `+`
 * and `-`, requiring at least 7 digits overall. Matches the free-form
 * placeholder in design/components/booking-form.md ("e.g. +62 812 3456 7890").
 */
export function isValidPhone(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "");
  return /^[\d\s()+-]+$/.test(value.trim()) && digitsOnly.length >= 7;
}

/** Resource identifiers are UUIDs per api-design.md ("Resource Identifier: UUID"). */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export type BookingFormErrors = Partial<Record<keyof BookingFormFields, string>>;

/**
 * Validates the Booking Form fields per design/components/booking-form.md
 * ("all required"). Returns a map of field -> error message for any
 * invalid field; an empty object means the form is valid
 * (`formValid = all 5 fields non-empty`, plus basic email/phone format).
 */
export function validateBookingFormFields(
  fields: BookingFormFields,
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!isRequired(fields.parentName)) {
    errors.parentName = "Parent/Guardian name is required.";
  }
  if (!isRequired(fields.studentName)) {
    errors.studentName = "Student name is required.";
  }
  if (!isRequired(fields.phoneNumber)) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!isValidPhone(fields.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (!isRequired(fields.email)) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(fields.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!isRequired(fields.grade)) {
    errors.grade = "Student grade is required.";
  }

  return errors;
}
