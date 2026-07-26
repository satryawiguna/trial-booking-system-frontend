// Maps backend `errorCode` values to user-friendly messages, per
// PATTERNS.md §5 (Error Message Mapping) and §14 (API Error Codes
// Reference).
//
// AMBIGUITY (flagged): architecture/api-design.md documents HTTP status
// codes and prose descriptions per error (e.g. "409 Class is full — no
// seats available", "409 Booking already completed", "409 Booking already
// cancelled", "422 Business validation failed"), but does not define a
// canonical `errorCode` string enum. The codes below come from PATTERNS.md
// §14's reference table (CAPACITY_EXCEEDED, DUPLICATE_BOOKING,
// PAYMENT_REQUIRED, INVALID_TRANSITION, VALIDATION_ERROR, NOT_FOUND), which
// this repo's conventions doc treats as the intended contract. A few extra
// codes are added below to cover scenarios described in api-design.md that
// aren't in the PATTERNS.md table (booking already completed/cancelled) —
// these are best-effort guesses and should be confirmed with the Backend
// Agent once real error codes are implemented.

export const ERROR_MESSAGES: Record<string, string> = {
  CAPACITY_EXCEEDED:
    "This class is already full. Please choose another class.",
  DUPLICATE_BOOKING: "You have already booked this class.",
  PAYMENT_REQUIRED: "Payment is required to confirm your booking.",
  PAYMENT_FAILED: "Your payment could not be processed. Please try again.",
  INVALID_TRANSITION:
    "This action is not allowed for the current booking status.",
  VALIDATION_ERROR: "Please check the form and try again.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  // Extra codes inferred from api-design.md's prose error descriptions,
  // not explicitly named as errorCode values there — see note above.
  BOOKING_ALREADY_COMPLETED:
    "This booking has already been completed and cannot be changed.",
  BOOKING_ALREADY_CANCELLED: "This booking has already been cancelled.",
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your connection.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}
