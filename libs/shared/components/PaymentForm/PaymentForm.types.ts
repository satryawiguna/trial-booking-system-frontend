import type { Grade } from "@shared/types";

/** Read-only registrant details shown on the Payment / Confirmation panel. */
export interface PaymentFormRegistrant {
  parentName: string;
  studentName: string;
  grade: Grade | string;
  phoneNumber: string;
  email: string;
}

export interface PaymentFormProps {
  registrant: PaymentFormRegistrant;
  /** Disables the CTA and shows a loading state while the mock payment attempt is in flight. */
  isSubmitting?: boolean;
  /** Triggers the mock payment attempt (`POST /bookings/{id}/payments`) — called by the parent page, not this component. */
  onSubmit: () => void;
  /** Defaults to "Confirm Registration →" per design/components/payment-form.md. */
  submitLabel?: string;
  className?: string;
}
