// StepIndicator — 3-step circular indicator used across
// Booking -> Payment -> Status, per design-system.md's "Step Indicator"
// pattern:
//   pending -> circle bg oklch(0.88 0.02 80), text muted
//   active  -> circle bg primary, text white
//   done    -> circle bg success, text white
// connected by a line that fills success-colored once the step is done.
import { cn } from "@shared/utils";

import type { BookingStepKey, StepIndicatorProps } from "./StepIndicator.types";

type StepState = "pending" | "active" | "done";

const STEPS: { key: BookingStepKey; label: string; number: number }[] = [
  { key: "details", label: "Details", number: 1 },
  { key: "payment", label: "Payment", number: 2 },
  { key: "confirmed", label: "Confirmed", number: 3 },
];

const CIRCLE_STYLES: Record<StepState, string> = {
  pending: "bg-border text-muted-foreground",
  active: "bg-primary text-white",
  done: "bg-success-text text-white",
};

function getStepState(
  index: number,
  currentStep: StepIndicatorProps["currentStep"],
): StepState {
  if (currentStep === "all-done") return "done";
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep);
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "active";
  return "pending";
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  return (
    <ol
      className={cn("flex items-center", className)}
      aria-label="Booking progress"
    >
      {STEPS.map((step, index) => {
        const state = getStepState(index, currentStep);
        const isLastStep = index === STEPS.length - 1;

        return (
          <li
            key={step.key}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <span
                aria-current={state === "active" ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold",
                  CIRCLE_STYLES[state],
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  state === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLastStep && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-2 h-[2px] flex-1",
                  state === "done" ? "bg-success-text" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
