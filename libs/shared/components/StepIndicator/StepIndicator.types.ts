// Step Indicator — per design-system.md's "Step Indicator (booking flow)"
// pattern: 1 Details -> 2 Payment -> 3 Confirmed.

export type BookingStepKey = "details" | "payment" | "confirmed";

export type StepIndicatorState = BookingStepKey | "all-done";

export interface StepIndicatorProps {
  /**
   * Which step is currently active. Steps before it render as "done" and
   * steps after it render as "pending".
   *
   * Pass `"all-done"` for the Booking Status page, where the spec calls for
   * all three steps to render as done (not "confirmed" as merely active) —
   * see design/pages/booking-status.md ("3-step indicator (all done)").
   */
  currentStep: StepIndicatorState;
  className?: string;
}
