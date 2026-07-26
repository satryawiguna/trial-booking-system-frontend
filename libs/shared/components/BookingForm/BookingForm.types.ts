import type { BookingFormFields } from "@shared/types";
import type { BookingFormErrors } from "@shared/utils";

export interface BookingFormProps {
  values: BookingFormFields;
  /** Field-level validation errors (format/required), e.g. from `validateBookingFormFields`. */
  errors?: BookingFormErrors;
  /**
   * Backend-error banner slot, e.g. "This student already has a confirmed
   * booking for this class." (duplicate booking, BR-004). Rendered above the
   * field stack per design/components/booking-form.md's "Error State".
   * This component never calls a service directly — the error string is
   * always supplied by the caller.
   */
  submitError?: string;
  /** Disables the form and shows a loading state on the submit button. */
  isSubmitting?: boolean;
  onChange: (field: keyof BookingFormFields, value: string) => void;
  onSubmit: () => void;
  /** Defaults to "Continue to Payment →" per design/pages/booking.md. */
  submitLabel?: string;
  className?: string;
}
