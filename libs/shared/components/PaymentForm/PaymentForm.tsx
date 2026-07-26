// PaymentForm — review-and-confirm panel per design/components/payment-form.md
// and design/pages/payment.md's "Adaptation from Prototype" section.
//
// This component only "collects confirmation, submits, and lets the caller
// navigate" (per payment-form.md's Result Handling note) — it does not call
// bookingService.submitPayment() itself, nor does it render success/failure
// outcomes inline; those are handled by the Booking Status page in a later
// task.
//
// COLOR CHOICE (flagged): design-system.md defines only success/pending/
// danger semantic colors, no distinct "info" color. The info banner here
// uses the "pending" (amber) semantic, since it represents a neutral,
// in-progress action, closer to that meaning than success (implies a good
// outcome, which isn't guaranteed) or danger.
import { cn } from "@shared/utils";

import { Button } from "../Button";
import type { PaymentFormProps } from "./PaymentForm.types";

const REGISTRANT_ROWS: {
  key: keyof PaymentFormProps["registrant"];
  label: string;
}[] = [
  { key: "parentName", label: "Parent" },
  { key: "studentName", label: "Student" },
  { key: "grade", label: "Grade" },
  { key: "phoneNumber", label: "Phone" },
  { key: "email", label: "Email" },
];

function InfoIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-pending-text"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}

export function PaymentForm({
  registrant,
  isSubmitting = false,
  onSubmit,
  submitLabel = "Confirm Registration →",
  className,
}: PaymentFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-start gap-3 rounded-input bg-pending-bg px-4 py-4 text-pending-text">
        <InfoIcon />
        <div className="flex flex-col gap-1">
          <span className="font-extrabold">Mock Payment</span>
          <span className="text-sm">
            This is a simulated payment for demo purposes. Click below to
            process it.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-card-sm">
        <h3 className="text-section-title text-foreground">
          Registrant Information
        </h3>
        <dl className="flex flex-col gap-2">
          {REGISTRANT_ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4"
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-bold text-foreground">
                {registrant[row.key]}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
